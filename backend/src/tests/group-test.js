const mongoose = require('mongoose');
const http = require('http');
const dotenv = require('dotenv');

process.env.NODE_ENV = 'test';
dotenv.config();

const app = require('../app');
const User = require('../models/User');
const Group = require('../models/Group');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

let server;
let port = 5098;
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

const runGroupTests = async () => {
  console.log('🚀 Starting Group Management Module Test Suite...\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, failureDetail = '') => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${failureDetail}`);
      if (failureDetail) console.error('     Detail:', JSON.stringify(failureDetail));
      failed++;
    }
  };

  let mongoServer;

  try {
    // 1. Connect to isolated MongoDB Server for tests
    let testMongoUri;
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      testMongoUri = mongoServer.getUri();
    } catch (e) {
      testMongoUri = process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017/company_workspace_group_test';
    }

    await mongoose.connect(testMongoUri);
    await User.deleteMany({});
    await Group.deleteMany({});
    await ActivityLog.deleteMany({});
    await Notification.deleteMany({});

    // Start HTTP server
    server = app.listen(port);
    await new Promise((r) => setTimeout(r, 500));

    // 2. Setup Seed Users: Admin 1, Founder A, Founder B, Employee 1, Employee 2, Employee 3
    console.log('--- TEST GROUP 1: User Setup & Authentication ---');
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@company.com',
      phone: '1000000000',
      password: 'AdminPassword123!',
      role: 'admin',
      isActive: true
    });

    const founderA = await User.create({
      name: 'Founder A',
      email: 'founder.a@company.com',
      phone: '2000000001',
      password: 'FounderPassword123!',
      role: 'founder',
      isActive: true
    });

    const founderB = await User.create({
      name: 'Founder B',
      email: 'founder.b@company.com',
      phone: '2000000002',
      password: 'FounderPassword123!',
      role: 'founder',
      isActive: true
    });

    const emp1 = await User.create({
      name: 'Employee One',
      email: 'emp1@company.com',
      phone: '3000000001',
      password: 'EmpPassword123!',
      role: 'employee',
      isActive: true
    });

    const emp2 = await User.create({
      name: 'Employee Two',
      email: 'emp2@company.com',
      phone: '3000000002',
      password: 'EmpPassword123!',
      role: 'employee',
      isActive: true
    });

    const emp3 = await User.create({
      name: 'Employee Three',
      email: 'emp3@company.com',
      phone: '3000000003',
      password: 'EmpPassword123!',
      role: 'employee',
      isActive: true
    });

    // Obtain Cookies
    const getCookie = async (email, password) => {
      const res = await makeRequest('POST', '/api/auth/login', { email, password });
      return res.cookies.find((c) => c.includes('token=')).split(';')[0];
    };

    const adminCookie = await getCookie('admin@company.com', 'AdminPassword123!');
    const founderACookie = await getCookie('founder.a@company.com', 'FounderPassword123!');
    const emp1Cookie = await getCookie('emp1@company.com', 'EmpPassword123!');
    const emp2Cookie = await getCookie('emp2@company.com', 'EmpPassword123!');

    assert(adminCookie && founderACookie && emp1Cookie, 'Seed users logged in successfully');

    console.log('\n--- TEST GROUP 2: Group Creation & Founder Auto-Membership ---');
    // Test 2.1: Non-Admin attempts creation -> 403
    const empCreateRes = await makeRequest('POST', '/api/groups', { name: 'Dev Team' }, emp1Cookie);
    assert(empCreateRes.statusCode === 403, 'Employee cannot create group (403)');

    const founderCreateRes = await makeRequest('POST', '/api/groups', { name: 'Dev Team' }, founderACookie);
    assert(founderCreateRes.statusCode === 403, 'Founder cannot create group (403)');

    // Test 2.2: Admin creates group -> 201
    const createGroupRes = await makeRequest(
      'POST',
      '/api/groups',
      {
        name: 'Development Team',
        description: 'MERN stack core team'
      },
      adminCookie
    );
    assert(createGroupRes.statusCode === 201, 'Admin can create group (201)');
    const groupId = createGroupRes.body.data.id || createGroupRes.body.data._id;
    const groupData = createGroupRes.body.data;

    // Test 2.3: Verify createdBy = Admin, members = [Founder A, Founder B], Admin NOT in members
    assert(groupData.createdBy === admin._id.toString(), 'createdBy matches Admin ID');
    assert(groupData.members.length === 2, 'Group members array automatically includes all 2 active founders');
    assert(groupData.members.includes(founderA._id.toString()), 'Founder A is in members');
    assert(groupData.members.includes(founderB._id.toString()), 'Founder B is in members');
    assert(!groupData.members.includes(admin._id.toString()), 'Admin is NOT automatically added to members');

    // Test 2.4: Mass Assignment Protection on creation
    const massAssignRes = await makeRequest(
      'POST',
      '/api/groups',
      {
        name: 'Secured Group',
        createdBy: emp1._id.toString(),
        members: [emp1._id.toString()],
        isActive: false
      },
      adminCookie
    );
    assert(massAssignRes.statusCode === 201, 'Group creation ignores illegal req.body fields');
    assert(massAssignRes.body.data.createdBy === admin._id.toString(), 'createdBy was forced to req.user._id');
    assert(massAssignRes.body.data.isActive === true, 'isActive was forced to true');

    // Test 2.5: Duplicate Active Group Name -> 409
    const dupNameRes = await makeRequest('POST', '/api/groups', { name: 'Development Team' }, adminCookie);
    assert(dupNameRes.statusCode === 409, 'Duplicate active group name returns 409 Conflict');

    console.log('\n--- TEST GROUP 3: Member Management (Add & Bulk Add) ---');
    // Test 3.1: Non-Admin attempts adding member -> 403
    const empAddRes = await makeRequest('POST', `/api/groups/${groupId}/members`, { userId: emp1._id.toString() }, emp1Cookie);
    assert(empAddRes.statusCode === 403, 'Employee cannot add members (403)');

    // Test 3.2: Admin manually tries adding Founder -> 400
    const addFounderRes = await makeRequest('POST', `/api/groups/${groupId}/members`, { userId: founderA._id.toString() }, adminCookie);
    assert(addFounderRes.statusCode === 400, 'Admin cannot manually add Founder (400)');

    // Test 3.3: Admin manually tries adding Admin -> 400
    const addAdminRes = await makeRequest('POST', `/api/groups/${groupId}/members`, { userId: admin._id.toString() }, adminCookie);
    assert(addAdminRes.statusCode === 400, 'Admin cannot manually add Admin (400)');

    // Test 3.4: Admin adds Employee 1 -> 200
    const addEmp1Res = await makeRequest('POST', `/api/groups/${groupId}/members`, { userId: emp1._id.toString() }, adminCookie);
    assert(addEmp1Res.statusCode === 200, 'Admin adds employee to group (200)');

    // Test 3.5: Duplicate Employee Add -> 409
    const dupEmpAddRes = await makeRequest('POST', `/api/groups/${groupId}/members`, { userId: emp1._id.toString() }, adminCookie);
    assert(dupEmpAddRes.statusCode === 409, 'Adding duplicate employee returns 409 Conflict');

    // Test 3.6: Bulk Add Employees
    const bulkAddRes = await makeRequest(
      'POST',
      `/api/groups/${groupId}/members/bulk`,
      {
        userIds: [emp1._id.toString(), emp2._id.toString(), emp3._id.toString(), 'invalid-id']
      },
      adminCookie
    );
    assert(bulkAddRes.statusCode === 200, 'Bulk add returns 200');
    assert(bulkAddRes.body.data.added === 2, 'Bulk add added 2 new employees');
    assert(bulkAddRes.body.data.alreadyMembers === 1, 'Bulk add correctly identified 1 existing member');
    assert(bulkAddRes.body.data.failed === 1, 'Bulk add counted 1 failed item');

    // Test 3.7: Verify Notification sent to added employees
    const notifCount = await Notification.countDocuments({ recipient: emp2._id });
    assert(notifCount > 0, 'In-app notification created for added employee');

    console.log('\n--- TEST GROUP 4: Removal & Founder Protection ---');
    // Test 4.1: Admin tries removing Founder -> MUST FAIL (400)
    const removeFounderRes = await makeRequest('DELETE', `/api/groups/${groupId}/members/${founderA._id}`, null, adminCookie);
    assert(removeFounderRes.statusCode === 400, 'Admin removing Founder fails (400)');
    assert(removeFounderRes.body.message.includes('Founder must remain'), 'Error message states Founder protection rule');

    // Test 4.2: Non-Admin tries removing employee -> 403
    const empRemoveRes = await makeRequest('DELETE', `/api/groups/${groupId}/members/${emp1._id}`, null, emp1Cookie);
    assert(empRemoveRes.statusCode === 403, 'Employee cannot remove members (403)');

    // Test 4.3: Admin removes Employee 1 -> 200
    const removeEmp1Res = await makeRequest('DELETE', `/api/groups/${groupId}/members/${emp1._id}`, null, adminCookie);
    assert(removeEmp1Res.statusCode === 200, 'Admin removes employee from group (200)');

    console.log('\n--- TEST GROUP 5: Admin Join & Leave ---');
    // Test 5.1: Admin joins group -> 200
    const adminJoinRes = await makeRequest('POST', `/api/groups/${groupId}/join`, null, adminCookie);
    assert(adminJoinRes.statusCode === 200, 'Admin voluntarily joins group (200)');

    // Test 5.2: Admin joins twice -> 409
    const adminJoinDupRes = await makeRequest('POST', `/api/groups/${groupId}/join`, null, adminCookie);
    assert(adminJoinDupRes.statusCode === 409, 'Admin joining twice returns 409 Conflict');

    // Test 5.3: Non-Admin attempts join endpoint -> 403
    const empJoinRes = await makeRequest('POST', `/api/groups/${groupId}/join`, null, emp1Cookie);
    assert(empJoinRes.statusCode === 403, 'Employee cannot use join endpoint (403)');

    // Test 5.4: Admin leaves group -> 200
    const adminLeaveRes = await makeRequest('DELETE', `/api/groups/${groupId}/leave`, null, adminCookie);
    assert(adminLeaveRes.statusCode === 200, 'Admin leaves group voluntarily (200)');

    // Test 5.5: Admin leaves when not member -> 400
    const adminLeaveDupRes = await makeRequest('DELETE', `/api/groups/${groupId}/leave`, null, adminCookie);
    assert(adminLeaveDupRes.statusCode === 400, 'Admin leaving non-joined group returns 400 Bad Request');

    // Test 5.6: Founder attempts leave endpoint -> 403
    const founderLeaveRes = await makeRequest('DELETE', `/api/groups/${groupId}/leave`, null, founderACookie);
    assert(founderLeaveRes.statusCode === 403, 'Founder cannot use leave endpoint (403)');

    console.log('\n--- TEST GROUP 6: Role Transition (Employee promoted to Founder) ---');
    // Promote Employee 1 to Founder
    const promoteRes = await makeRequest('PATCH', `/api/users/${emp1._id}/role`, { role: 'founder' }, adminCookie);
    assert(promoteRes.statusCode === 200, 'Admin promotes Employee 1 to Founder');

    // Verify Employee 1 (now Founder) was automatically added to ALL active groups
    const targetGroup = await Group.findById(groupId);
    assert(targetGroup.members.includes(emp1._id.toString()), 'Newly promoted Founder automatically added to active groups');

    console.log('\n--- TEST GROUP 7: Visibility Scoping & Permission Matrix ---');
    // Employee 2 is member of Development Team. Employee 1 is Founder.
    // Create group 2 with NO employees initially
    const group2Res = await makeRequest('POST', '/api/groups', { name: 'Executive Council' }, adminCookie);
    const group2Id = group2Res.body.data.id || group2Res.body.data._id;

    // Test 7.1: Employee 2 list groups (/api/groups) -> returns only Development Team
    const emp2GroupsRes = await makeRequest('GET', '/api/groups', null, emp2Cookie);
    assert(emp2GroupsRes.statusCode === 200, 'Employee list groups returns 200');
    assert(emp2GroupsRes.body.data.groups.length === 1 && emp2GroupsRes.body.data.groups[0].name === 'Development Team', 'Employee sees only joined groups');

    // Test 7.2: Founder list groups -> sees all active groups (2 groups)
    const founderGroupsRes = await makeRequest('GET', '/api/groups', null, founderACookie);
    assert(founderGroupsRes.statusCode === 200 && founderGroupsRes.body.data.groups.length === 3, 'Founder sees all active groups');

    // Test 7.3: Admin list groups -> sees all active groups
    const adminGroupsRes = await makeRequest('GET', '/api/groups', null, adminCookie);
    assert(adminGroupsRes.statusCode === 200 && adminGroupsRes.body.data.groups.length === 3, 'Admin sees all active groups');

    // Test 7.4: Employee 2 accesses non-joined group (Executive Council) -> 403
    const emp2AccessDeniedRes = await makeRequest('GET', `/api/groups/${group2Id}`, null, emp2Cookie);
    assert(emp2AccessDeniedRes.statusCode === 403, 'Employee accessing non-joined group details receives 403 Forbidden');
    assert(emp2AccessDeniedRes.body.message.includes('You are not a member of this group.'), 'Contains member check failure message');

    console.log('\n--- TEST GROUP 8: Group CRUD, Status Toggle & Reactivation Flow ---');
    // Test 8.1: Update Group (Admin) -> 200
    const updateRes = await makeRequest('PUT', `/api/groups/${groupId}`, { name: 'Core Engineering', description: 'Updated desc' }, adminCookie);
    assert(updateRes.statusCode === 200 && updateRes.body.data.name === 'Core Engineering', 'Admin updates group name & description');

    // Test 8.2: Mass assignment attempt on update ignored
    const massUpdateRes = await makeRequest('PUT', `/api/groups/${groupId}`, { name: 'Core Engineering', isActive: false }, adminCookie);
    assert(massUpdateRes.body.data.isActive === true, 'PUT update ignores isActive payload');

    // Test 8.3: Deactivate Group (Admin) -> 200
    const deactRes = await makeRequest('PATCH', `/api/groups/${groupId}/status`, { isActive: false }, adminCookie);
    assert(deactRes.statusCode === 200 && deactRes.body.data.isActive === false, 'Admin deactivates group status');

    // Deactivated group hidden from employee list
    const emp2GroupsPostDeact = await makeRequest('GET', '/api/groups', null, emp2Cookie);
    assert(emp2GroupsPostDeact.body.data.groups.length === 0, 'Deactivated group hidden from employee group list');

    // Test 8.4: Reactivate Group (Admin) -> 200 and auto-ensures all active founders present
    const reactRes = await makeRequest('PATCH', `/api/groups/${groupId}/status`, { isActive: true }, adminCookie);
    assert(reactRes.statusCode === 200 && reactRes.body.data.isActive === true, 'Admin reactivates group');

    console.log(`\n====================================================`);
    console.log(`GROUP MODULE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`====================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Group Test Suite Error:', err);
    process.exit(1);
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
    if (mongoServer) await mongoServer.stop();
  }
};

runGroupTests();
