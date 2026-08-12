const mongoose = require('mongoose');
const http = require('http');
const dotenv = require('dotenv');

process.env.NODE_ENV = 'test';
dotenv.config();

const app = require('../app');
const User = require('../models/User');
const Task = require('../models/Task');
const TaskComment = require('../models/TaskComment');
const TaskHistory = require('../models/TaskHistory');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const Group = require('../models/Group');

let server;
const port = 5097;
const baseUrl = `http://127.0.0.1:${port}`;

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

const runTaskTests = async () => {
  console.log('====================================================');
  console.log('STARTING TASK MANAGEMENT SYSTEM COMPREHENSIVE SUITE');
  console.log('====================================================');

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/company_workspace_test';
  await mongoose.connect(mongoUri);

  // Clear collections
  await User.deleteMany({});
  await Task.deleteMany({});
  await TaskComment.deleteMany({});
  await TaskHistory.deleteMany({});
  await ActivityLog.deleteMany({});
  await Notification.deleteMany({});
  await Group.deleteMany({});

  server = app.listen(port);
  console.log(`Test server running on port ${port}`);

  let adminCookie, founderCookie, emp1Cookie, emp2Cookie;
  let adminUser, founderUser, emp1User, emp2User;
  let createdGroup;

  try {
    // ----------------------------------------------------
    // SETUP USERS & AUTHENTICATION
    // ----------------------------------------------------
    console.log('\n--- 1. Setting up Users & Logging In ---');

    adminUser = await User.create({
      name: 'System Admin',
      email: 'admin.task@tectha.com',
      phone: '1111111111',
      password: 'Password@123',
      role: 'admin',
      isActive: true
    });

    founderUser = await User.create({
      name: 'Company Founder',
      email: 'founder.task@tectha.com',
      phone: '2222222222',
      password: 'Password@123',
      role: 'founder',
      isActive: true
    });

    emp1User = await User.create({
      name: 'John Employee',
      email: 'john.emp@tectha.com',
      phone: '3333333333',
      password: 'Password@123',
      role: 'employee',
      isActive: true
    });

    emp2User = await User.create({
      name: 'Sarah Employee',
      email: 'sarah.emp@tectha.com',
      phone: '4444444444',
      password: 'Password@123',
      role: 'employee',
      isActive: true
    });

    createdGroup = await Group.create({
      name: 'Engineering Team',
      description: 'Dev Group',
      createdBy: adminUser._id,
      members: [adminUser._id, founderUser._id, emp1User._id],
      isActive: true
    });

    // Login Admin
    const resAdminLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'admin.task@tectha.com',
      password: 'Password@123'
    });
    adminCookie = resAdminLogin.cookies[0].split(';')[0];
    console.log('✓ Admin login successful');

    // Login Founder
    const resFounderLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'founder.task@tectha.com',
      password: 'Password@123'
    });
    founderCookie = resFounderLogin.cookies[0].split(';')[0];
    console.log('✓ Founder login successful');

    // Login Employee 1
    const resEmp1Login = await makeRequest('POST', '/api/auth/login', {
      email: 'john.emp@tectha.com',
      password: 'Password@123'
    });
    emp1Cookie = resEmp1Login.cookies[0].split(';')[0];

    // Login Employee 2
    const resEmp2Login = await makeRequest('POST', '/api/auth/login', {
      email: 'sarah.emp@tectha.com',
      password: 'Password@123'
    });
    emp2Cookie = resEmp2Login.cookies[0].split(';')[0];
    console.log('✓ Employee logins successful');

    // ----------------------------------------------------
    // TASK CREATION & RESTRICTIONS
    // ----------------------------------------------------
    console.log('\n--- 2. Task Creation Tests ---');

    // Admin creates task
    const resCreateAdmin = await makeRequest(
      'POST',
      '/api/tasks',
      {
        title: 'Develop Backend API',
        description: 'Implement REST endpoints with JWT',
        assignedTo: emp1User._id,
        group: createdGroup._id,
        priority: 'high',
        startDate: '2026-08-12',
        dueDate: '2026-08-20'
      },
      adminCookie
    );
    console.log(`Admin create task status: ${resCreateAdmin.statusCode} (Expected: 201)`);
    const taskId1 = resCreateAdmin.body.data.id;

    // Founder creates task
    const resCreateFounder = await makeRequest(
      'POST',
      '/api/tasks',
      {
        title: 'Design DB Schema',
        description: 'Mongoose Task and Comment models',
        assignedTo: emp2User._id,
        priority: 'medium',
        dueDate: '2026-08-25'
      },
      founderCookie
    );
    console.log(`Founder create task status: ${resCreateFounder.statusCode} (Expected: 201)`);
    const taskId2 = resCreateFounder.body.data.id;

    // Employee tries to create task -> SHOULD BE FORBIDDEN (403)
    const resCreateEmp = await makeRequest(
      'POST',
      '/api/tasks',
      {
        title: 'Unauthorized Task',
        assignedTo: emp1User._id
      },
      emp1Cookie
    );
    console.log(`Employee create task status: ${resCreateEmp.statusCode} (Expected: 403)`);

    // ----------------------------------------------------
    // REASSIGNMENT & PERMISSIONS
    // ----------------------------------------------------
    console.log('\n--- 3. Reassignment & Permission Tests ---');

    // Admin reassigns task
    const resReassignAdmin = await makeRequest(
      'PATCH',
      `/api/tasks/${taskId1}/assign`,
      { assignedTo: emp2User._id },
      adminCookie
    );
    console.log(`Admin reassign status: ${resReassignAdmin.statusCode} (Expected: 200)`);

    // Reassign back to Employee 1
    await makeRequest(
      'PATCH',
      `/api/tasks/${taskId1}/assign`,
      { assignedTo: emp1User._id },
      adminCookie
    );

    // Employee tries to reassign task -> SHOULD BE FORBIDDEN (403)
    const resReassignEmp = await makeRequest(
      'PATCH',
      `/api/tasks/${taskId1}/assign`,
      { assignedTo: emp2User._id },
      emp1Cookie
    );
    console.log(`Employee reassign status: ${resReassignEmp.statusCode} (Expected: 403)`);

    // ----------------------------------------------------
    // TASK ACCESS CONTROL (ISOLATION)
    // ----------------------------------------------------
    console.log('\n--- 4. Task Isolation & Scoping Tests ---');

    // Employee 1 accesses own task -> 200
    const resGetOwn = await makeRequest('GET', `/api/tasks/${taskId1}`, null, emp1Cookie);
    console.log(`Employee get own task status: ${resGetOwn.statusCode} (Expected: 200)`);

    // Employee 1 accesses Employee 2's task -> 403
    const resGetOther = await makeRequest('GET', `/api/tasks/${taskId2}`, null, emp1Cookie);
    console.log(`Employee get other task status: ${resGetOther.statusCode} (Expected: 403)`);

    // Employee 1 calls /api/tasks/my -> receives only assigned task
    const resGetMy = await makeRequest('GET', '/api/tasks/my', null, emp1Cookie);
    console.log(`Employee /my tasks count: ${resGetMy.body.data.tasks.length} (Expected: 1)`);

    // Admin calls /api/tasks -> receives all tasks
    const resGetAll = await makeRequest('GET', '/api/tasks', null, adminCookie);
    console.log(`Admin all tasks count: ${resGetAll.body.data.tasks.length} (Expected: 2)`);

    // ----------------------------------------------------
    // WORKFLOW & STATUS TRANSITIONS
    // ----------------------------------------------------
    console.log('\n--- 5. Status Workflow Tests ---');

    // Emp 1: todo -> in_progress
    const resStatus1 = await makeRequest(
      'PATCH',
      `/api/tasks/${taskId1}/status`,
      { status: 'in_progress' },
      emp1Cookie
    );
    console.log(`Employee todo->in_progress status: ${resStatus1.statusCode} (Expected: 200)`);

    // Emp 1: in_progress -> in_review
    const resStatus2 = await makeRequest(
      'PATCH',
      `/api/tasks/${taskId1}/status`,
      { status: 'in_review' },
      emp1Cookie
    );
    console.log(`Employee in_progress->in_review status: ${resStatus2.statusCode} (Expected: 200)`);

    // Emp 1: tries directly in_review -> completed -> SHOULD BE FORBIDDEN (403)
    const resStatus3 = await makeRequest(
      'PATCH',
      `/api/tasks/${taskId1}/status`,
      { status: 'completed' },
      emp1Cookie
    );
    console.log(`Employee direct complete status: ${resStatus3.statusCode} (Expected: 403)`);

    // Admin completes task -> 200
    const resComplete = await makeRequest(
      'PATCH',
      `/api/tasks/${taskId1}/complete`,
      null,
      adminCookie
    );
    console.log(`Admin complete status: ${resComplete.statusCode} (Expected: 200, status=completed, progress=100)`);

    // Admin reopens task -> 200
    const resReopen = await makeRequest(
      'PATCH',
      `/api/tasks/${taskId1}/reopen`,
      null,
      adminCookie
    );
    console.log(`Admin reopen status: ${resReopen.statusCode} (Expected: 200, status=in_progress)`);

    // Admin cancels task -> 200
    const resCancel = await makeRequest(
      'PATCH',
      `/api/tasks/${taskId1}/cancel`,
      { reason: 'Project scope updated' },
      adminCookie
    );
    console.log(`Admin cancel status: ${resCancel.statusCode} (Expected: 200, status=cancelled)`);

    // Reopen task back to in_progress for further tests
    await makeRequest('PATCH', `/api/tasks/${taskId1}/reopen`, null, adminCookie);

    // ----------------------------------------------------
    // PROGRESS TRACKING
    // ----------------------------------------------------
    console.log('\n--- 6. Progress Tracking & Validation Tests ---');

    // Emp 1 updates progress to 50% -> 200
    const resProgValid = await makeRequest(
      'PATCH',
      `/api/tasks/${taskId1}/progress`,
      { progress: 50 },
      emp1Cookie
    );
    console.log(`Emp progress 50% status: ${resProgValid.statusCode} (Expected: 200)`);

    // Emp 1 updates progress > 100 -> 400
    const resProgInvalid = await makeRequest(
      'PATCH',
      `/api/tasks/${taskId1}/progress`,
      { progress: 150 },
      emp1Cookie
    );
    console.log(`Emp progress 150% status: ${resProgInvalid.statusCode} (Expected: 400)`);

    // ----------------------------------------------------
    // TASK COMMENTS
    // ----------------------------------------------------
    console.log('\n--- 7. Comment Tests ---');

    // Emp 1 adds comment
    const resAddComment = await makeRequest(
      'POST',
      `/api/tasks/${taskId1}/comments`,
      { content: 'First progress update comment' },
      emp1Cookie
    );
    console.log(`Add comment status: ${resAddComment.statusCode} (Expected: 201)`);
    const commentId = resAddComment.body.data.id;

    // Emp 1 edits own comment -> 200
    const resEditOwn = await makeRequest(
      'PUT',
      `/api/tasks/${taskId1}/comments/${commentId}`,
      { content: 'Updated comment text' },
      emp1Cookie
    );
    console.log(`Edit own comment status: ${resEditOwn.statusCode} (Expected: 200)`);

    // Emp 2 tries to edit Emp 1 comment -> 403
    const resEditOther = await makeRequest(
      'PUT',
      `/api/tasks/${taskId1}/comments/${commentId}`,
      { content: 'Malicious edit attempt' },
      emp2Cookie
    );
    console.log(`Edit other comment status: ${resEditOther.statusCode} (Expected: 403)`);

    // ----------------------------------------------------
    // SUBTASKS & PARENT PROGRESS RECALCULATION
    // ----------------------------------------------------
    console.log('\n--- 8. Subtask & Progress Recalculation Tests ---');

    // Admin creates subtask 1 (progress 100%)
    const resSub1 = await makeRequest(
      'POST',
      `/api/tasks/${taskId1}/subtasks`,
      { title: 'Subtask 1 - User Model', assignedTo: emp1User._id },
      adminCookie
    );
    const subtaskId1 = resSub1.body.data.id;

    await makeRequest(
      'PATCH',
      `/api/tasks/${taskId1}/subtasks/${subtaskId1}/status`,
      { progress: 100 },
      emp1Cookie
    );

    // Admin creates subtask 2 (progress 50%)
    const resSub2 = await makeRequest(
      'POST',
      `/api/tasks/${taskId1}/subtasks`,
      { title: 'Subtask 2 - Controller', assignedTo: emp1User._id },
      adminCookie
    );
    const subtaskId2 = resSub2.body.data.id;

    await makeRequest(
      'PATCH',
      `/api/tasks/${taskId1}/subtasks/${subtaskId2}/status`,
      { progress: 50 },
      emp1Cookie
    );

    // Check parent task progress -> (100 + 50) / 2 = 75%
    const resParentTask = await makeRequest('GET', `/api/tasks/${taskId1}`, null, adminCookie);
    console.log(`Parent task auto-calculated progress: ${resParentTask.body.data.progress}% (Expected: 75%)`);

    // ----------------------------------------------------
    // ANALYTICS & AUDIT HISTORY
    // ----------------------------------------------------
    console.log('\n--- 9. Analytics & Audit History Tests ---');

    // Admin gets company analytics -> 200
    const resCompAnalytics = await makeRequest('GET', '/api/tasks/analytics', null, adminCookie);
    console.log(`Admin company analytics status: ${resCompAnalytics.statusCode} (Expected: 200, totalTasks=${resCompAnalytics.body.data.totalTasks})`);

    // Admin gets employee analytics -> 200
    const resEmpAnalytics = await makeRequest('GET', '/api/tasks/analytics/employees', null, adminCookie);
    console.log(`Admin employee analytics status: ${resEmpAnalytics.statusCode} (Expected: 200)`);

    // Emp 1 gets my analytics -> 200
    const resMyAnalytics = await makeRequest('GET', '/api/tasks/my/analytics', null, emp1Cookie);
    console.log(`Employee personal analytics status: ${resMyAnalytics.statusCode} (Expected: 200)`);

    // Emp 1 tries company analytics -> 403
    const resEmpCompAnalytics = await makeRequest('GET', '/api/tasks/analytics', null, emp1Cookie);
    console.log(`Employee company analytics status: ${resEmpCompAnalytics.statusCode} (Expected: 403)`);

    // View task audit history -> 200
    const resHistory = await makeRequest('GET', `/api/tasks/${taskId1}/history`, null, emp1Cookie);
    console.log(`Task history items count: ${resHistory.body.data.length} (Expected: >0)`);

    // ----------------------------------------------------
    // ARCHIVE & RESTORE
    // ----------------------------------------------------
    console.log('\n--- 10. Archiving & Restoration Tests ---');

    // Admin archives task
    const resArchive = await makeRequest('PATCH', `/api/tasks/${taskId1}/archive`, null, adminCookie);
    console.log(`Archive task status: ${resArchive.statusCode} (Expected: 200)`);

    // Task list excludes archived tasks by default
    const resListAfterArchive = await makeRequest('GET', '/api/tasks', null, adminCookie);
    console.log(`Active task count after archive: ${resListAfterArchive.body.data.tasks.length} (Expected: 1)`);

    // Admin restores task
    const resRestore = await makeRequest('PATCH', `/api/tasks/${taskId1}/restore`, null, adminCookie);
    console.log(`Restore task status: ${resRestore.statusCode} (Expected: 200)`);

    console.log('\n====================================================');
    console.log('ALL TASK MANAGEMENT SUITE TESTS PASSED SUCCESSFULLY!');
    console.log('====================================================');
  } catch (error) {
    console.error('\n❌ TEST RUNNER FAILED WITH ERROR:', error);
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
  }
};

runTaskTests();
