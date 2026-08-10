const mongoose = require('mongoose');
const http = require('http');
const dotenv = require('dotenv');

process.env.NODE_ENV = 'test';
dotenv.config();

const app = require('../app');
const User = require('../models/User');

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
    await User.deleteMany({}); // Clean test collection

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

    // Test 2.1: Valid Primary Email + Password Login
    const adminLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@company.com',
      password: 'AdminPassword123!'
    });
    assert(adminLogin.statusCode === 200, 'Primary email login succeeds (200)');
    assert(adminLogin.cookies.some((c) => c.includes('token=')), 'HTTP-only cookie returned on login');

    // Extract cookie for admin session
    const adminCookie = adminLogin.cookies.find((c) => c.includes('token=')).split(';')[0];

    // Test 2.2: Secondary Email Login MUST FAIL
    const secEmailLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'admin.recovery@personal.com',
      password: 'AdminPassword123!'
    });
    assert(secEmailLogin.statusCode === 401, 'Login with Secondary Email fails (401)');

    // Test 2.3: Phone Login MUST FAIL
    const phoneLogin = await makeRequest('POST', '/api/auth/login', {
      email: '1234567890',
      password: 'AdminPassword123!'
    });
    assert([400, 401].includes(phoneLogin.statusCode), 'Login with Phone fails (400/401)');

    // Test 2.4: Name Login MUST FAIL
    const nameLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'Test Admin',
      password: 'AdminPassword123!'
    });
    assert([400, 401].includes(nameLogin.statusCode), 'Login with Name fails (400/401)');

    console.log('\n--- TEST GROUP 3: Profile (/api/auth/me) & Security ---');
    const meRes = await makeRequest('GET', '/api/auth/me', null, adminCookie);
    assert(meRes.statusCode === 200, 'GET /api/auth/me returns 200 with valid cookie');
    assert(meRes.body.user && meRes.body.user.email === 'admin@company.com', 'User profile matches admin');
    assert(meRes.body.user.password === undefined, 'Password field is NOT exposed in response');
    assert(meRes.body.user.passwordResetToken === undefined, 'Password reset token is NOT exposed');

    console.log('\n--- TEST GROUP 4: Employee Creation & Role Authorization ---');
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
    const empId = createEmpRes.body.data.user.id || createEmpRes.body.data.user._id;

    // Login as Employee
    const empLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'john@company.com',
      password: 'EmployeePass123!'
    });
    assert(empLogin.statusCode === 200, 'Employee can login successfully');
    const empCookie = empLogin.cookies.find((c) => c.includes('token=')).split(';')[0];

    // Test 4.2: Employee attempting to create a user MUST FAIL (403)
    const empCreateUserRes = await makeRequest(
      'POST',
      '/api/users',
      {
        name: 'Unauthorized User',
        email: 'unauth@company.com',
        phone: '5555555555',
        password: 'Pass12345!',
        role: 'employee'
      },
      empCookie
    );
    assert(empCreateUserRes.statusCode === 403, 'Employee creation attempt by Employee returns 403 Forbidden');

    // Test 4.3: Prevent duplicate email, secondaryEmail, phone
    const dupEmailRes = await makeRequest(
      'POST',
      '/api/users',
      {
        name: 'Dup Employee',
        email: 'john@company.com', // duplicate primary email
        phone: '1111111111',
        password: 'Pass12345!',
        role: 'employee'
      },
      adminCookie
    );
    assert(dupEmailRes.statusCode === 400, 'Duplicate primary email creation fails (400)');

    console.log('\n--- TEST GROUP 5: User Status & Account Deactivation ---');
    // Deactivate Employee
    const deactRes = await makeRequest('PATCH', `/api/users/${empId}/status`, { isActive: false }, adminCookie);
    assert(deactRes.statusCode === 200, 'Admin can deactivate user status');

    // Attempt employee login while deactivated -> MUST FAIL (401)
    const deactLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'john@company.com',
      password: 'EmployeePass123!'
    });
    assert(deactLogin.statusCode === 401, 'Deactivated user login fails with 401');

    // Reactivate Employee
    await makeRequest('PATCH', `/api/users/${empId}/status`, { isActive: true }, adminCookie);

    console.log('\n--- TEST GROUP 6: Password Recovery (Forgot & Reset Password) ---');
    // Test 6.1: Forgot Password
    const forgotRes = await makeRequest('POST', '/api/auth/forgot-password', {
      email: 'john@company.com'
    });
    assert(forgotRes.statusCode === 200, 'Forgot password returns 200 generic message');

    // Retrieve hashed reset token directly from DB for verification test
    const userInDb = await User.findOne({ email: 'john@company.com' }).select('+password +passwordResetToken +passwordResetExpires');
    assert(userInDb.passwordResetToken !== undefined, 'Password reset token stored in database');

    // We generate valid reset token from user instance
    const rawResetToken = userInDb.createPasswordResetToken();
    await userInDb.save();

    // Test 6.2: Reset Password with token
    const resetRes = await makeRequest('POST', `/api/auth/reset-password/${rawResetToken}`, {
      password: 'NewEmployeePass123!'
    });
    assert(resetRes.statusCode === 200, 'Reset password succeeds with valid token');

    // Login with NEW password
    const newPassLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'john@company.com',
      password: 'NewEmployeePass123!'
    });
    assert(newPassLogin.statusCode === 200, 'Employee login succeeds with NEW password');

    // Test 6.3: Token single-use invalidation
    const reuseResetRes = await makeRequest('POST', `/api/auth/reset-password/${rawResetToken}`, {
      password: 'AnotherPassword123!'
    });
    assert(reuseResetRes.statusCode === 400, 'Reset token cannot be reused (400)');

    console.log('\n--- TEST GROUP 7: Change Password ---');
    const newEmpCookie = newPassLogin.cookies.find((c) => c.includes('token=')).split(';')[0];
    const changePassRes = await makeRequest(
      'POST',
      '/api/auth/change-password',
      {
        currentPassword: 'NewEmployeePass123!',
        newPassword: 'FinalPass12345!'
      },
      newEmpCookie
    );
    assert(changePassRes.statusCode === 200, 'Change password succeeds when current password is valid');

    console.log('\n--- TEST GROUP 8: Logout ---');
    const logoutRes = await makeRequest('POST', '/api/auth/logout', null, newEmpCookie);
    assert(logoutRes.statusCode === 200, 'Logout succeeds');
    assert(logoutRes.cookies.some((c) => c.includes('token=none')), 'Cookie token is cleared');

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
