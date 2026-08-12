const mongoose = require('mongoose');
const http = require('http');
const dotenv = require('dotenv');

process.env.NODE_ENV = 'test';
dotenv.config();

const app = require('../app');
const User = require('../models/User');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

let server;
const port = 5099;
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

const getCookieFromHeader = (cookieHeaders) => {
  if (!cookieHeaders || cookieHeaders.length === 0) return null;
  return cookieHeaders.map((c) => c.split(';')[0]).join('; ');
};

const runTests = async () => {
  console.log('====================================================');
  console.log('STARTING LEAVE MANAGEMENT COMPREHENSIVE TEST SUITE');
  console.log('====================================================\n');

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/company_workspace_test';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully for testing');

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(port, resolve));
    console.log(`✅ Test HTTP Server listening on port ${port}\n`);

    // Clean test collections
    await User.deleteMany({ email: { $regex: /@leavetest\.com$/ } });
    await Leave.deleteMany({});
    await Attendance.deleteMany({});
    await ActivityLog.deleteMany({});
    await Notification.deleteMany({});

    // 1. Create Test Users: Admin, Founder, Employee A, Employee B
    console.log('Step 1: Registering Test Users...');
    
    const adminUser = await User.create({
      name: 'Leave Admin',
      email: 'admin@leavetest.com',
      phone: '9811111111',
      password: 'Password@123',
      role: 'admin',
      isActive: true
    });

    const founderUser = await User.create({
      name: 'Leave Founder',
      email: 'founder@leavetest.com',
      phone: '9822222222',
      password: 'Password@123',
      role: 'founder',
      isActive: true
    });

    const empAUser = await User.create({
      name: 'Leave Employee A',
      email: 'empa@leavetest.com',
      phone: '9833333333',
      password: 'Password@123',
      role: 'employee',
      department: 'Engineering',
      isActive: true
    });

    const empBUser = await User.create({
      name: 'Leave Employee B',
      email: 'empb@leavetest.com',
      phone: '9844444444',
      password: 'Password@123',
      role: 'employee',
      department: 'Sales',
      isActive: true
    });

    console.log('✅ Admin, Founder, Employee A, and Employee B created successfully\n');

    // 2. Authenticate Users to get HTTP-only cookies
    console.log('Step 2: Authenticating Users...');

    const adminLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@leavetest.com',
      password: 'Password@123'
    });
    const adminCookie = getCookieFromHeader(adminLogin.cookies);

    const founderLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'founder@leavetest.com',
      password: 'Password@123'
    });
    const founderCookie = getCookieFromHeader(founderLogin.cookies);

    const empALogin = await makeRequest('POST', '/api/auth/login', {
      email: 'empa@leavetest.com',
      password: 'Password@123'
    });
    const empACookie = getCookieFromHeader(empALogin.cookies);

    const empBLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'empb@leavetest.com',
      password: 'Password@123'
    });
    const empBCookie = getCookieFromHeader(empBLogin.cookies);

    console.log('✅ Authentication successful. Cookies established.\n');

    // 3. Employee A applies for leave
    console.log('Step 3: Employee A applies for casual leave (2026-08-18 to 2026-08-20)...');
    const applyRes = await makeRequest(
      'POST',
      '/api/leaves',
      {
        leaveType: 'casual',
        startDate: '2026-08-18',
        endDate: '2026-08-20',
        reason: 'Personal family emergency and relocation work'
      },
      empACookie
    );

    if (applyRes.statusCode !== 201 || !applyRes.body.success) {
      throw new Error(`Apply leave failed: ${JSON.stringify(applyRes.body)}`);
    }
    const leaveAId = applyRes.body.data.id;
    console.log(`✅ Leave request created successfully. ID: ${leaveAId}, Status: ${applyRes.body.data.status}\n`);

    // Verify Founder notification and ActivityLog
    const founderNotif = await Notification.findOne({ recipient: founderUser._id, type: 'LEAVE_SUBMITTED' });
    if (founderNotif) {
      console.log('✅ Founder received LEAVE_SUBMITTED notification');
    }

    const createLog = await ActivityLog.findOne({ action: 'LEAVE_CREATED', leave: leaveAId });
    if (createLog) {
      console.log('✅ LEAVE_CREATED ActivityLog entry recorded\n');
    }

    // 4. Prevent Duplicate Request
    console.log('Step 4: Testing Duplicate Leave Request Prevention...');
    const dupRes = await makeRequest(
      'POST',
      '/api/leaves',
      {
        leaveType: 'casual',
        startDate: '2026-08-18',
        endDate: '2026-08-20',
        reason: 'Duplicate application test'
      },
      empACookie
    );

    if (dupRes.statusCode === 409) {
      console.log('✅ Correctly prevented duplicate leave request (409 Conflict)');
    } else {
      throw new Error(`Failed to block duplicate request: ${JSON.stringify(dupRes.body)}`);
    }
    console.log('');

    // 5. Prevent Overlapping Leave
    console.log('Step 5: Testing Overlapping Leave Request Prevention...');
    const overlapRes = await makeRequest(
      'POST',
      '/api/leaves',
      {
        leaveType: 'sick',
        startDate: '2026-08-19',
        endDate: '2026-08-22',
        reason: 'Overlapping request test'
      },
      empACookie
    );

    if (overlapRes.statusCode === 409) {
      console.log('✅ Correctly prevented overlapping leave request (409 Conflict)');
    } else {
      throw new Error(`Failed to block overlapping request: ${JSON.stringify(overlapRes.body)}`);
    }
    console.log('');

    // 6. Employee A updates pending leave
    console.log('Step 6: Employee A updates pending leave details...');
    const updateRes = await makeRequest(
      'PUT',
      `/api/leaves/${leaveAId}`,
      {
        reason: 'Updated reason for personal family work and relocation'
      },
      empACookie
    );

    if (updateRes.statusCode !== 200 || updateRes.body.data.reason !== 'Updated reason for personal family work and relocation') {
      throw new Error(`Update pending leave failed: ${JSON.stringify(updateRes.body)}`);
    }
    console.log('✅ Pending leave updated successfully\n');

    // 7. Employee A cancels pending leave
    console.log('Step 7: Employee A cancels pending leave...');
    const cancelRes = await makeRequest('PATCH', `/api/leaves/${leaveAId}/cancel`, {}, empACookie);
    if (cancelRes.statusCode !== 200 || cancelRes.body.data.status !== 'cancelled') {
      throw new Error(`Cancel leave failed: ${JSON.stringify(cancelRes.body)}`);
    }
    console.log('✅ Pending leave cancelled successfully. Status updated to cancelled.\n');

    // 8. Employee B applies for a new leave request
    console.log('Step 8: Employee B applies for sick leave (2026-08-22 to 2026-08-23)...');
    const applyResB = await makeRequest(
      'POST',
      '/api/leaves',
      {
        leaveType: 'sick',
        startDate: '2026-08-22',
        endDate: '2026-08-23',
        reason: 'High fever and doctor advice to rest'
      },
      empBCookie
    );

    if (applyResB.statusCode !== 201) {
      throw new Error(`Employee B apply leave failed: ${JSON.stringify(applyResB.body)}`);
    }
    const leaveBId = applyResB.body.data.id;
    console.log(`✅ Employee B leave request created successfully. ID: ${leaveBId}\n`);

    // 9. ADMIN RESTRICTION TESTING (ADMIN MUST NOT APPROVE OR REJECT)
    console.log('Step 9: Testing Admin Restrictions (Admin MUST NOT approve or reject)...');
    
    const adminApproveRes = await makeRequest('PATCH', `/api/leaves/${leaveBId}/approve`, { comment: 'Admin approval attempt' }, adminCookie);
    if (adminApproveRes.statusCode === 403 && adminApproveRes.body.message === 'Only Founder can approve leave requests.') {
      console.log('✅ Admin approval correctly blocked with 403 Forbidden: "Only Founder can approve leave requests."');
    } else {
      throw new Error(`Admin approval security failure: ${JSON.stringify(adminApproveRes.body)}`);
    }

    const adminRejectRes = await makeRequest('PATCH', `/api/leaves/${leaveBId}/reject`, { comment: 'Admin rejection attempt' }, adminCookie);
    if (adminRejectRes.statusCode === 403 && adminRejectRes.body.message === 'Only Founder can reject leave requests.') {
      console.log('✅ Admin rejection correctly blocked with 403 Forbidden: "Only Founder can reject leave requests."');
    } else {
      throw new Error(`Admin rejection security failure: ${JSON.stringify(adminRejectRes.body)}`);
    }
    console.log('');

    // 10. EMPLOYEE SECURITY TESTING
    console.log('Step 10: Testing Employee Cross-Access Restrictions...');
    const empAViewBRes = await makeRequest('GET', `/api/leaves/${leaveBId}`, null, empACookie);
    if (empAViewBRes.statusCode === 403) {
      console.log('✅ Prevented Employee A from viewing Employee B leave request (403 Forbidden)');
    } else {
      throw new Error(`Employee cross-view security breach: ${JSON.stringify(empAViewBRes.body)}`);
    }

    const empAApproveRes = await makeRequest('PATCH', `/api/leaves/${leaveBId}/approve`, {}, empACookie);
    if (empAApproveRes.statusCode === 403) {
      console.log('✅ Prevented Employee from calling approve endpoint (403 Forbidden)');
    }
    console.log('');

    // 11. FOUNDER PROTECTION TESTING (FOUNDER CANNOT APPROVE OWN LEAVE)
    console.log('Step 11: Testing Founder Self-Leave Protection...');
    const founderLeaveRes = await makeRequest(
      'POST',
      '/api/leaves',
      {
        leaveType: 'annual',
        startDate: '2026-08-30',
        endDate: '2026-08-31',
        reason: 'Founder annual leave request'
      },
      founderCookie
    );

    if (founderLeaveRes.statusCode !== 201) {
      throw new Error(`Founder create leave failed: ${JSON.stringify(founderLeaveRes.body)}`);
    }
    const founderLeaveId = founderLeaveRes.body.data.id;

    const founderSelfApproveRes = await makeRequest('PATCH', `/api/leaves/${founderLeaveId}/approve`, {}, founderCookie);
    if (founderSelfApproveRes.statusCode === 400 && founderSelfApproveRes.body.message === 'Founder cannot approve their own leave request.') {
      console.log('✅ Correctly blocked Founder from self-approving leave request (400 Bad Request)');
    } else {
      throw new Error(`Founder self-approval protection failure: ${JSON.stringify(founderSelfApproveRes.body)}`);
    }
    console.log('');

    // 12. FOUNDER REJECTION TESTING
    console.log('Step 12: Testing Founder Rejection Flow...');
    const rejectNoCommentRes = await makeRequest('PATCH', `/api/leaves/${leaveBId}/reject`, {}, founderCookie);
    if (rejectNoCommentRes.statusCode === 400) {
      console.log('✅ Correctly rejected rejection without required review comment (400 Bad Request)');
    } else {
      throw new Error(`Missing comment check failed: ${JSON.stringify(rejectNoCommentRes.body)}`);
    }

    const rejectRes = await makeRequest(
      'PATCH',
      `/api/leaves/${leaveBId}/reject`,
      { comment: 'Project deadline requires presence' },
      founderCookie
    );
    if (rejectRes.statusCode !== 200 || rejectRes.body.data.status !== 'rejected') {
      throw new Error(`Founder rejection failed: ${JSON.stringify(rejectRes.body)}`);
    }
    console.log('✅ Leave request rejected by Founder with comment. Status updated to rejected.\n');

    // 13. FOUNDER APPROVAL & ATTENDANCE INTEGRATION TESTING
    console.log('Step 13: Testing Founder Approval & Attendance Integration...');
    const applyResA2 = await makeRequest(
      'POST',
      '/api/leaves',
      {
        leaveType: 'annual',
        startDate: '2026-08-25',
        endDate: '2026-08-26',
        reason: 'Annual vacation leave'
      },
      empACookie
    );

    if (applyResA2.statusCode !== 201) {
      throw new Error(`Employee A apply leave 2 failed: ${JSON.stringify(applyResA2.body)}`);
    }
    const leaveA2Id = applyResA2.body.data.id;

    const approveRes = await makeRequest(
      'PATCH',
      `/api/leaves/${leaveA2Id}/approve`,
      { comment: 'Approved. Enjoy your vacation!' },
      founderCookie
    );

    if (approveRes.statusCode !== 200 || approveRes.body.data.status !== 'approved') {
      throw new Error(`Founder approve leave failed: ${JSON.stringify(approveRes.body)}`);
    }
    console.log('✅ Leave request approved by Founder. Status updated to approved.');

    // Verify Attendance records created/updated with 'leave' status
    const { getStartOfDay } = require('../utils/dateUtils');
    const att25 = await Attendance.findOne({ employee: empAUser._id, date: getStartOfDay('2026-08-25') });
    const att26 = await Attendance.findOne({ employee: empAUser._id, date: getStartOfDay('2026-08-26') });

    if (att25 && att25.morning.status === 'leave' && att25.evening.status === 'leave') {
      console.log('✅ Attendance record for 2026-08-25 successfully marked as morning: leave, evening: leave');
    } else {
      throw new Error(`Attendance 2026-08-25 verification failed: ${JSON.stringify(att25)}`);
    }
    if (att26 && att26.morning.status === 'leave' && att26.evening.status === 'leave') {
      console.log('✅ Attendance record for 2026-08-26 successfully marked as morning: leave, evening: leave\n');
    } else {
      throw new Error(`Attendance 2026-08-26 verification failed: ${JSON.stringify(att26)}`);
    }

    // 14. ADMIN & FOUNDER READ-ONLY LIST, SEARCH, FILTER & ANALYTICS APIs
    console.log('Step 14: Testing List, Search, Filters, and Analytics APIs...');

    const adminListRes = await makeRequest('GET', '/api/leaves?search=Employee', null, adminCookie);
    if (adminListRes.statusCode !== 200 || !Array.isArray(adminListRes.body.data.leaves)) {
      throw new Error(`Admin list leaves failed: ${JSON.stringify(adminListRes.body)}`);
    }
    console.log(`✅ Admin search leaves fetched: ${adminListRes.body.data.leaves.length} leaves matched search query 'Employee'`);

    const pendingListRes = await makeRequest('GET', '/api/leaves/pending', null, founderCookie);
    if (pendingListRes.statusCode !== 200 || pendingListRes.body.data.leaves === undefined) {
      throw new Error(`Founder pending leaves failed: ${JSON.stringify(pendingListRes.body)}`);
    }
    console.log(`✅ Pending leaves endpoint returned: ${pendingListRes.body.data.leaves.length} pending leave requests`);

    const analyticsRes = await makeRequest('GET', '/api/leaves/analytics?month=2026-08', null, adminCookie);
    if (analyticsRes.statusCode !== 200 || analyticsRes.body.data.totalRequests === undefined) {
      throw new Error(`Leave Analytics API failed: ${JSON.stringify(analyticsRes.body)}`);
    }
    console.log('✅ Leave Analytics metrics:', analyticsRes.body.data);

    const empAnalyticsRes = await makeRequest('GET', '/api/leaves/analytics/employees?month=2026-08', null, founderCookie);
    if (empAnalyticsRes.statusCode !== 200 || !Array.isArray(empAnalyticsRes.body.data.employees)) {
      throw new Error(`Employee Leave Analytics API failed: ${JSON.stringify(empAnalyticsRes.body)}`);
    }
    console.log(`✅ Employee Leave Analytics fetched: ${empAnalyticsRes.body.data.employees.length} employee records aggregated\n`);

    console.log('====================================================');
    console.log('ALL LEAVE MANAGEMENT TESTS PASSED SUCCESSFULLY! 🚀');
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n❌ LEAVE TEST SUITE FAILED:', error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
  }
};

runTests();
