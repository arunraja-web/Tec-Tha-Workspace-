const mongoose = require('mongoose');
const http = require('http');
const dotenv = require('dotenv');

process.env.NODE_ENV = 'test';
dotenv.config();

const app = require('../app');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

let server;
let port = 5099;
let baseUrl = `http://127.0.0.1:${port}`;

const makeRequest = (method, path, body = null, cookie = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = {
      'Content-Type': 'application/json'
    };
    if (cookie) {
      headers['Cookie'] = cookie;
    }

    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      const responseCookies = res.headers['set-cookie'] || [];

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        let parsedData = {};
        try {
          if (data) parsedData = JSON.parse(data);
        } catch (e) {
          parsedData = { raw: data };
        }

        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          cookies: responseCookies,
          body: parsedData
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('🚀 Starting Backend Authentication & User Management Test Suite...\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, failureDetail = '') => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${failureDetail}`);
      failed++;
    }
  };

  let mongoServer;

  try {
    // 1. Connect to isolated In-Memory MongoDB Server for tests
    let testMongoUri;
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      testMongoUri = mongoServer.getUri();
    } catch (e) {
      testMongoUri = process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017/company_workspace_test';
    }

    await mongoose.connect(testMongoUri);
    await User.deleteMany({});
    await ActivityLog.deleteMany({});

    // 2. Start HTTP server
    server = app.listen(port);
    await new Promise((r) => setTimeout(r, 500));

    console.log('--- TEST GROUP 1: Health Check ---');
    const health = await makeRequest('GET', '/api/health');
    assert(health.statusCode === 200 && health.body.success === true, 'Health check operational');

    console.log('\n--- TEST GROUP 2: Seed & Login Rules ---');
    // Create initial admin manually in DB
    const admin = await User.create({
      name: 'Test Admin',
      email: 'admin@company.com',
      secondaryEmail: 'admin.recovery@personal.com',
      phone: '1234567890',
      password: 'AdminPassword123!',
      role: 'admin',
      isActive: true
    });
    const adminId = admin._id.toString();

    // Test 2.1: Valid Primary Email + Password Login
    const adminLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@company.com',
      password: 'AdminPassword123!'
    });
    assert(adminLogin.statusCode === 200, 'Primary email login succeeds (200)');
    assert(adminLogin.cookies.some((c) => c.includes('token=')), 'HTTP-only cookie returned on login');

    const adminCookie = adminLogin.cookies.find((c) => c.includes('token=')).split(';')[0];

    // Test 2.2: Secondary Email Login MUST FAIL
    const secEmailLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'admin.recovery@personal.com',
      password: 'AdminPassword123!'
    });
    assert(secEmailLogin.statusCode === 401, 'Login with Secondary Email fails (401)');

    console.log('\n--- TEST GROUP 3: Profile (/api/auth/me) & Security ---');
    const meRes = await makeRequest('GET', '/api/auth/me', null, adminCookie);
    assert(meRes.statusCode === 200, 'GET /api/auth/me returns 200 with valid cookie');
    assert(meRes.body.user && meRes.body.user.email === 'admin@company.com', 'User profile matches admin');
    assert(meRes.body.user.password === undefined, 'Password field is NOT exposed in response');

    console.log('\n--- TEST GROUP 4: Admin CRUD Operations & Validation ---');
    // Test 4.1: Admin creates an employee
    const createEmpRes = await makeRequest(
      'POST',
      '/api/users',
      {
        name: 'John Employee',
        email: 'john@company.com',
        secondaryEmail: 'john.personal@gmail.com',
        phone: '9876543210',
        password: 'EmployeePass123!',
        role: 'employee'
      },
      adminCookie
    );
    assert(createEmpRes.statusCode === 201, 'Admin can create an employee (201)');
    assert(createEmpRes.body.success === true, 'Response follows success standard');
    const empId = createEmpRes.body.data.user.id || createEmpRes.body.data.user._id;

    // Test 4.2: Duplicate primary email check
    const dupEmailRes = await makeRequest(
      'POST',
      '/api/users',
      {
        name: 'Dup Employee',
        email: 'john@company.com',
        phone: '1111111111',
        password: 'Pass12345!',
        role: 'employee'
      },
      adminCookie
    );
    assert(dupEmailRes.statusCode === 400, 'Duplicate primary email creation fails (400)');

    // Test 4.3: Primary === Secondary Email check
    const sameEmailRes = await makeRequest(
      'POST',
      '/api/users',
      {
        name: 'Same Email User',
        email: 'same@company.com',
        secondaryEmail: 'same@company.com',
        phone: '2222222222',
        password: 'Pass12345!',
        role: 'employee'
      },
      adminCookie
    );
    assert(sameEmailRes.statusCode === 400, 'Primary === Secondary email creation fails (400)');

    // Test 4.4: Secondary Email duplicate check across users
    const dupSecRes = await makeRequest(
      'POST',
      '/api/users',
      {
        name: 'Dup Sec Email User',
        email: 'another@company.com',
        secondaryEmail: 'john.personal@gmail.com', // used as secondary by John
        phone: '3333333333',
        password: 'Pass12345!',
        role: 'employee'
      },
      adminCookie
    );
    assert(dupSecRes.statusCode === 400, 'Duplicate secondary email creation fails (400)');

    console.log('\n--- TEST GROUP 5: Search, Filter, Pagination, Sorting ---');
    // Create founder user
    await makeRequest(
      'POST',
      '/api/users',
      {
        name: 'Alice Founder',
        email: 'alice@company.com',
        phone: '8888888888',
        password: 'FounderPass123!',
        role: 'founder'
      },
      adminCookie
    );

    // Search Test
    const searchRes = await makeRequest('GET', '/api/users?search=john', null, adminCookie);
    assert(searchRes.statusCode === 200 && searchRes.body.data.users.length === 1, 'Search by keyword john returns 1 matching user');

    // Filter Test
    const filterRes = await makeRequest('GET', '/api/users?role=founder&status=active', null, adminCookie);
    assert(filterRes.statusCode === 200 && filterRes.body.data.users.length === 1, 'Filter by role=founder & status=active returns founder user');

    // Pagination & Sorting Test
    const pageRes = await makeRequest('GET', '/api/users?page=1&limit=2&sortBy=name&sortOrder=asc', null, adminCookie);
    assert(pageRes.statusCode === 200 && pageRes.body.data.pagination.limit === 2, 'Pagination returns limit 2 and pagination meta');

    console.log('\n--- TEST GROUP 6: Single User GET, UPDATE & Validation ---');
    // Invalid ObjectId Test
    const invalidIdRes = await makeRequest('GET', '/api/users/invalid-id-123', null, adminCookie);
    assert(invalidIdRes.statusCode === 400, 'Invalid ObjectId returns 400 Bad Request');

    // Non-existent ID Test
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const notFoundRes = await makeRequest('GET', `/api/users/${nonExistentId}`, null, adminCookie);
    assert(notFoundRes.statusCode === 404, 'Non-existent user ID returns 404 Not Found');

    // Update user
    const updateRes = await makeRequest(
      'PUT',
      `/api/users/${empId}`,
      {
        name: 'John Updated Employee'
      },
      adminCookie
    );
    assert(updateRes.statusCode === 200 && updateRes.body.data.user.name === 'John Updated Employee', 'Admin can update user profile');

    console.log('\n--- TEST GROUP 7: Admin Self-Lockout & Last-Admin Protections ---');
    // Test 7.1: Admin self role demotion -> MUST FAIL
    const selfDemoteRes = await makeRequest('PATCH', `/api/users/${adminId}/role`, { role: 'employee' }, adminCookie);
    assert(selfDemoteRes.statusCode === 400, 'Admin self demotion fails (400)');

    // Test 7.2: Admin self deactivation -> MUST FAIL
    const selfDeactRes = await makeRequest('PATCH', `/api/users/${adminId}/status`, { isActive: false }, adminCookie);
    assert(selfDeactRes.statusCode === 400, 'Admin self deactivation fails (400)');

    // Test 7.3: Admin self deletion -> MUST FAIL
    const selfDelRes = await makeRequest('DELETE', `/api/users/${adminId}`, null, adminCookie);
    assert(selfDelRes.statusCode === 400, 'Admin self deletion fails (400)');

    // Test 7.4: Last Active Admin protection by a second admin
    const createAdmin2Res = await makeRequest(
      'POST',
      '/api/users',
      {
        name: 'Admin Two',
        email: 'admin2@company.com',
        phone: '7777777777',
        password: 'Admin2Pass123!',
        role: 'admin'
      },
      adminCookie
    );
    const admin2Id = createAdmin2Res.body.data.user.id || createAdmin2Res.body.data.user._id;

    // Login as Admin 2
    const admin2Login = await makeRequest('POST', '/api/auth/login', {
      email: 'admin2@company.com',
      password: 'Admin2Pass123!'
    });
    const admin2Cookie = admin2Login.cookies.find((c) => c.includes('token=')).split(';')[0];

    // Admin 2 deactivates Admin 1 -> should succeed since 2 active admins exist
    const deactAdmin1 = await makeRequest('PATCH', `/api/users/${adminId}/status`, { isActive: false }, admin2Cookie);
    assert(deactAdmin1.statusCode === 200, 'Admin 2 can deactivate Admin 1 when 2 active admins exist');

    // Now Admin 2 tries to deactivate themselves (the last active admin) -> MUST FAIL
    const lastAdminDeact = await makeRequest('PATCH', `/api/users/${admin2Id}/status`, { isActive: false }, admin2Cookie);
    assert(lastAdminDeact.statusCode === 400, 'Deactivating last active admin fails (400)');

    // Reactivate Admin 1
    await makeRequest('PATCH', `/api/users/${adminId}/status`, { isActive: true }, admin2Cookie);

    console.log('\n--- TEST GROUP 8: Soft Delete & Activity Logging ---');
    // Soft Delete Employee
    const delEmpRes = await makeRequest('DELETE', `/api/users/${empId}`, null, adminCookie);
    assert(delEmpRes.statusCode === 200, 'Soft deleting user returns 200');

    const softDeletedEmp = await User.findById(empId);
    assert(softDeletedEmp.isActive === false && softDeletedEmp.deletedAt !== null, 'Deleted user has isActive=false and non-null deletedAt timestamp');

    // Verify ActivityLog entries were created
    const activityCount = await ActivityLog.countDocuments({});
    assert(activityCount > 0, 'Activity log records stored in DB for admin operations');

    console.log('\n--- TEST GROUP 9: Meeting Module CRUD & Permissions ---');

    // Setup Test Users: Founder and Employee 2
    const emp2LoginRes = await makeRequest(
      'POST',
      '/api/users',
      {
        name: 'Jane Employee',
        email: 'jane@company.com',
        phone: '4444444444',
        password: 'JanePass123!',
        role: 'employee'
      },
      adminCookie
    );
    const emp2Id = emp2LoginRes.body.data.user.id || emp2LoginRes.body.data.user._id;

    const emp2Login = await makeRequest('POST', '/api/auth/login', {
      email: 'jane@company.com',
      password: 'JanePass123!'
    });
    const emp2Cookie = emp2Login.cookies.find((c) => c.includes('token=')).split(';')[0];

    const founderLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'alice@company.com',
      password: 'FounderPass123!'
    });
    const founderCookie = founderLogin.cookies.find((c) => c.includes('token=')).split(';')[0];

    // 9.1 Unauthenticated Request -> 401
    const unauthMeetRes = await makeRequest('GET', '/api/meetings');
    assert(unauthMeetRes.statusCode === 401, 'Unauthenticated GET /api/meetings returns 401');

    // 9.2 Validation Errors on Create
    const missingTitleRes = await makeRequest('POST', '/api/meetings', { meetingLink: 'https://meet.google.com/abc' }, emp2Cookie);
    assert(missingTitleRes.statusCode === 400, 'Create meeting with missing title returns 400');

    const invalidTitleRes = await makeRequest('POST', '/api/meetings', { title: 'hi', meetingLink: 'https://meet.google.com/abc' }, emp2Cookie);
    assert(invalidTitleRes.statusCode === 400, 'Create meeting with title < 3 chars returns 400');

    const invalidLinkRes = await makeRequest('POST', '/api/meetings', { title: 'Valid Title', meetingLink: 'javascript:alert(1)' }, emp2Cookie);
    assert(invalidLinkRes.statusCode === 400, 'Create meeting with invalid URL protocol returns 400');

    // 9.3 Admin, Founder, Employee creates meeting -> 201
    const emp2MeetingRes = await makeRequest('POST', '/api/meetings', {
      title: 'Employee Standup',
      description: 'Daily team sync',
      meetingLink: 'https://meet.google.com/emp-sync-123'
    }, emp2Cookie);
    assert(emp2MeetingRes.statusCode === 201, 'Employee can create a meeting (201)');
    const emp2MeetingId = emp2MeetingRes.body.data.id || emp2MeetingRes.body.data._id;

    const founderMeetingRes = await makeRequest('POST', '/api/meetings', {
      title: 'Founder Strategy Session',
      meetingLink: 'https://meet.google.com/founder-strat'
    }, founderCookie);
    assert(founderMeetingRes.statusCode === 201, 'Founder can create a meeting without optional description (201)');

    const adminMeetingRes = await makeRequest('POST', '/api/meetings', {
      title: 'Admin Quarterly Review',
      description: 'Review performance',
      meetingLink: 'https://meet.google.com/admin-rev'
    }, adminCookie);
    assert(adminMeetingRes.statusCode === 201, 'Admin can create a meeting (201)');
    const adminMeetingId = adminMeetingRes.body.data.id || adminMeetingRes.body.data._id;

    // 9.4 GET all active meetings & Search, Pagination, Sorting
    const allMeetingsRes = await makeRequest('GET', '/api/meetings', null, emp2Cookie);
    assert(allMeetingsRes.statusCode === 200 && allMeetingsRes.body.data.meetings.length === 3, 'GET /api/meetings returns active meetings');

    const searchMeetingsRes = await makeRequest('GET', '/api/meetings?search=Standup', null, emp2Cookie);
    assert(searchMeetingsRes.statusCode === 200 && searchMeetingsRes.body.data.meetings.length === 1, 'Search meeting by keyword returns matching item');

    const pageMeetingsRes = await makeRequest('GET', '/api/meetings?page=1&limit=2&sortOrder=asc', null, emp2Cookie);
    assert(pageMeetingsRes.statusCode === 200 && pageMeetingsRes.body.data.meetings.length === 2, 'Pagination and sorting on meetings works correctly');

    // 9.5 GET single active meeting
    const getSingleRes = await makeRequest('GET', `/api/meetings/${emp2MeetingId}`, null, founderCookie);
    assert(getSingleRes.statusCode === 200 && getSingleRes.body.data.title === 'Employee Standup', 'GET single meeting by ID returns meeting details');

    // 9.6 Update Meeting: Creator vs Non-Creator
    // Employee tries to update Admin's meeting -> 403
    const empUpdateAdminRes = await makeRequest('PUT', `/api/meetings/${adminMeetingId}`, { title: 'Hacked Title' }, emp2Cookie);
    assert(empUpdateAdminRes.statusCode === 403, 'Employee updating another user meeting fails (403)');

    // Creator updates own meeting -> 200
    const empUpdateOwnRes = await makeRequest('PUT', `/api/meetings/${emp2MeetingId}`, { title: 'Employee Standup Updated' }, emp2Cookie);
    assert(empUpdateOwnRes.statusCode === 200 && empUpdateOwnRes.body.data.title === 'Employee Standup Updated', 'Creator can update own meeting');

    // Admin updates another user's meeting -> 200 (Admin override)
    const adminUpdateEmpRes = await makeRequest('PUT', `/api/meetings/${emp2MeetingId}`, { title: 'Employee Standup Admin Override' }, adminCookie);
    assert(adminUpdateEmpRes.statusCode === 200 && adminUpdateEmpRes.body.data.title === 'Employee Standup Admin Override', 'Admin can update any meeting (Admin override)');

    // 9.7 Status Toggle Validation
    const stringBooleanRes = await makeRequest('PATCH', `/api/meetings/${emp2MeetingId}/status`, { isActive: 'false' }, emp2Cookie);
    assert(stringBooleanRes.statusCode === 400, 'Status update with string boolean "false" fails validation (400)');

    // Employee deactivates own meeting -> 200
    const empDeactRes = await makeRequest('PATCH', `/api/meetings/${emp2MeetingId}/status`, { isActive: false }, emp2Cookie);
    assert(empDeactRes.statusCode === 200 && empDeactRes.body.data.isActive === false, 'Creator can deactivate own meeting status');

    // Single GET on deactivated meeting -> 404
    const getDeactRes = await makeRequest('GET', `/api/meetings/${emp2MeetingId}`, null, emp2Cookie);
    assert(getDeactRes.statusCode === 404, 'GET single inactive meeting returns 404 Not Found');

    // Employee reactivates own meeting -> 200
    const empReactRes = await makeRequest('PATCH', `/api/meetings/${emp2MeetingId}/status`, { isActive: true }, emp2Cookie);
    assert(empReactRes.statusCode === 200 && empReactRes.body.data.isActive === true, 'Creator can reactivate own meeting status');

    // 9.8 Soft Delete (DELETE /api/meetings/:id)
    // Non-creator employee tries to delete -> 403
    const empDelAdminRes = await makeRequest('DELETE', `/api/meetings/${adminMeetingId}`, null, emp2Cookie);
    assert(empDelAdminRes.statusCode === 403, 'Unauthorized user deleting another meeting fails (403)');

    // Creator soft-deletes own meeting -> 200
    const empDelOwnRes = await makeRequest('DELETE', `/api/meetings/${emp2MeetingId}`, null, emp2Cookie);
    assert(empDelOwnRes.statusCode === 200, 'Creator soft-deletes own meeting');

    // Admin soft-deletes another meeting -> 200
    const adminDelRes = await makeRequest('DELETE', `/api/meetings/${adminMeetingId}`, null, adminCookie);
    assert(adminDelRes.statusCode === 200, 'Admin can soft-delete any meeting');

    console.log(`\n====================================================`);
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`====================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test Suite Error:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
    if (mongoServer) await mongoServer.stop();
  }
};

runTests();
