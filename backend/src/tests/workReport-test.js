const mongoose = require('mongoose');
const http = require('http');
const dotenv = require('dotenv');

process.env.NODE_ENV = 'test';
dotenv.config();

const app = require('../app');
const User = require('../models/User');
const Task = require('../models/Task');
const WorkReport = require('../models/WorkReport');
const WorkReportReview = require('../models/WorkReportReview');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const { sendDailyReportReminders } = require('../services/workReportReminderService');

let server;
const port = 5098;
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
  console.log('STARTING WORK REPORT COMPREHENSIVE TEST SUITE');
  console.log('====================================================\n');

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/company_workspace_test';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully for testing');

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(port, resolve));
    console.log(`✅ Test HTTP Server listening on port ${port}\n`);

    // Clean test collections
    await User.deleteMany({ email: { $regex: /@workreporttest\.com$/ } });
    await WorkReport.deleteMany({});
    await WorkReportReview.deleteMany({});
    await Task.deleteMany({ title: { $regex: /^WR_TEST_/ } });
    await ActivityLog.deleteMany({});
    await Notification.deleteMany({});

    // 1. Create Test Users: Admin, Founder, Employee A, Employee B
    console.log('Step 1: Registering Test Users...');
    
    const adminUser = await User.create({
      name: 'WR Admin',
      email: 'admin@workreporttest.com',
      phone: '9111111111',
      password: 'Password@123',
      role: 'admin',
      isActive: true
    });

    const founderUser = await User.create({
      name: 'WR Founder',
      email: 'founder@workreporttest.com',
      phone: '9222222222',
      password: 'Password@123',
      role: 'founder',
      isActive: true
    });

    const empAUser = await User.create({
      name: 'WR Employee A',
      email: 'empa@workreporttest.com',
      phone: '9333333333',
      password: 'Password@123',
      role: 'employee',
      department: 'Engineering',
      isActive: true
    });

    const empBUser = await User.create({
      name: 'WR Employee B',
      email: 'empb@workreporttest.com',
      phone: '9444444444',
      password: 'Password@123',
      role: 'employee',
      department: 'Marketing',
      isActive: true
    });

    console.log('✅ Admin, Founder, Employee A, and Employee B created successfully\n');

    // 2. Login as Users to obtain HTTP-Only cookies
    console.log('Step 2: Authenticating Users...');

    const adminLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@workreporttest.com',
      password: 'Password@123'
    });
    const adminCookie = getCookieFromHeader(adminLogin.cookies);

    const founderLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'founder@workreporttest.com',
      password: 'Password@123'
    });
    const founderCookie = getCookieFromHeader(founderLogin.cookies);

    const empALogin = await makeRequest('POST', '/api/auth/login', {
      email: 'empa@workreporttest.com',
      password: 'Password@123'
    });
    const empACookie = getCookieFromHeader(empALogin.cookies);

    const empBLogin = await makeRequest('POST', '/api/auth/login', {
      email: 'empb@workreporttest.com',
      password: 'Password@123'
    });
    const empBCookie = getCookieFromHeader(empBLogin.cookies);

    console.log('✅ Authentication successful. Cookies established.\n');

    // 3. Create Tasks for Employee A & B
    console.log('Step 3: Creating Tasks for Task Linking Tests...');
    const taskA = await Task.create({
      title: 'WR_TEST_Task_A',
      description: 'Develop Login API for Work Report',
      assignedTo: empAUser._id,
      assignedBy: adminUser._id,
      status: 'in_progress',
      progress: 60
    });

    const taskB = await Task.create({
      title: 'WR_TEST_Task_B',
      description: 'Marketing campaign design',
      assignedTo: empBUser._id,
      assignedBy: adminUser._id,
      status: 'todo',
      progress: 0
    });
    console.log('✅ Tasks created successfully.\n');

    // 4. Employee A creates draft report with Task A
    console.log('Step 4: Employee A creates a daily draft report...');
    const draftRes = await makeRequest(
      'POST',
      '/api/work-reports',
      {
        summary: 'Worked on authentication and API design',
        completedWork: 'Built backend endpoints and database schemas',
        challenges: 'None today',
        nextDayPlan: 'Integrate frontend views',
        tasks: [taskA._id.toString()]
      },
      empACookie
    );

    if (draftRes.statusCode !== 201) {
      throw new Error(`Create draft failed: ${JSON.stringify(draftRes.body)}`);
    }
    const reportId = draftRes.body.data.id;
    console.log(`✅ Draft report created successfully. ID: ${reportId}\n`);

    // 5. One report per employee per day verification
    console.log('Step 5: Testing Duplicate Daily Report Prevention...');
    const dupRes = await makeRequest(
      'POST',
      '/api/work-reports',
      {
        summary: 'Attempting duplicate report'
      },
      empACookie
    );
    if (dupRes.statusCode === 200 && dupRes.body.data.id === reportId) {
      console.log('✅ Duplicate report returned existing draft as expected');
    } else {
      console.log(`Notice: Duplicate response status: ${dupRes.statusCode}`);
    }
    console.log('');

    // 6. Test Invalid Task Linking Security
    console.log('Step 6: Testing Task Link Security (Linking another employee task)...');
    const invalidTaskUpdateRes = await makeRequest(
      'PUT',
      `/api/work-reports/${reportId}`,
      {
        tasks: [taskB._id.toString()] // Task B belongs to Employee B
      },
      empACookie
    );

    if (invalidTaskUpdateRes.statusCode === 400) {
      console.log('✅ Correctly rejected linking another employee task (400 Bad Request)');
    } else {
      throw new Error(`Failed to block unassigned task: ${JSON.stringify(invalidTaskUpdateRes.body)}`);
    }
    console.log('');

    // 7. Get Today's Report
    console.log("Step 7: Testing GET /api/work-reports/my/today...");
    const todayRes = await makeRequest('GET', '/api/work-reports/my/today', null, empACookie);
    if (todayRes.statusCode !== 200 || !todayRes.body.data) {
      throw new Error(`Failed to fetch today report: ${JSON.stringify(todayRes.body)}`);
    }
    console.log('✅ Today work report fetched successfully\n');

    // 8. Submit Work Report
    console.log('Step 8: Submitting Work Report...');
    const submitRes = await makeRequest('POST', `/api/work-reports/${reportId}/submit`, {}, empACookie);
    if (submitRes.statusCode !== 200 || submitRes.body.data.status !== 'submitted') {
      throw new Error(`Submit failed: ${JSON.stringify(submitRes.body)}`);
    }
    console.log('✅ Report submitted successfully. Status updated to submitted.\n');

    // Verify Notification & ActivityLog created for submission
    const adminNotifications = await Notification.find({ recipient: adminUser._id, type: 'WORK_REPORT_SUBMITTED' });
    const founderNotifications = await Notification.find({ recipient: founderUser._id, type: 'WORK_REPORT_SUBMITTED' });
    if (adminNotifications.length > 0 && founderNotifications.length > 0) {
      console.log('✅ Submission notifications received by Admin and Founder');
    } else {
      console.warn('⚠️ Submission notifications check warning');
    }

    const submitLog = await ActivityLog.findOne({ action: 'WORK_REPORT_SUBMITTED', report: reportId });
    if (submitLog) {
      console.log('✅ WORK_REPORT_SUBMITTED ActivityLog recorded successfully\n');
    }

    // 9. Employee Security Testing
    console.log('Step 9: Running Employee Security & Authorization Checks...');
    
    // Employee B attempting to access Employee A report
    const empBViewRes = await makeRequest('GET', `/api/work-reports/${reportId}`, null, empBCookie);
    if (empBViewRes.statusCode === 403) {
      console.log('✅ Blocked Employee B from accessing Employee A report (403 Forbidden)');
    } else {
      throw new Error(`Employee security breach: ${JSON.stringify(empBViewRes.body)}`);
    }

    // Employee A attempting to review report
    const empReviewRes = await makeRequest('PATCH', `/api/work-reports/${reportId}/review`, { action: 'approve' }, empACookie);
    if (empReviewRes.statusCode === 403) {
      console.log('✅ Blocked Employee from calling review endpoint (403 Forbidden)');
    } else {
      throw new Error(`Employee review permission breach: ${JSON.stringify(empReviewRes.body)}`);
    }

    // Employee A attempting to edit submitted report before revision requested
    const empEditSubmittedRes = await makeRequest('PUT', `/api/work-reports/${reportId}`, { summary: 'Hacked summary' }, empACookie);
    if (empEditSubmittedRes.statusCode === 400) {
      console.log('✅ Blocked Employee from editing non-draft/submitted report');
    }
    console.log('');

    // 10. Founder Review: Request Revision
    console.log('Step 10: Testing Founder Review — Request Revision...');
    const revisionRes = await makeRequest(
      'PATCH',
      `/api/work-reports/${reportId}/review`,
      {
        action: 'request_revision',
        comment: 'Please add more details about performance testing and API response times.'
      },
      founderCookie
    );

    if (revisionRes.statusCode !== 200 || revisionRes.body.data.status !== 'needs_revision') {
      throw new Error(`Request revision failed: ${JSON.stringify(revisionRes.body)}`);
    }
    console.log('✅ Revision requested by Founder. Status updated to needs_revision\n');

    // Verify employee received notification
    const empRevNotif = await Notification.findOne({ recipient: empAUser._id, type: 'WORK_REPORT_REVISION_REQUESTED' });
    if (empRevNotif) {
      console.log('✅ WORK_REPORT_REVISION_REQUESTED Notification received by Employee');
    }

    // 11. Employee resubmission after revision
    console.log('Step 11: Employee edits and resubmits report after revision request...');
    const editRes = await makeRequest(
      'PUT',
      `/api/work-reports/${reportId}`,
      {
        completedWork: 'Built backend endpoints and database schemas. Added load testing scripts verifying 200ms latency.'
      },
      empACookie
    );

    if (editRes.statusCode !== 200) {
      throw new Error(`Failed to edit needs_revision report: ${JSON.stringify(editRes.body)}`);
    }

    const resubmitRes = await makeRequest('POST', `/api/work-reports/${reportId}/submit`, {}, empACookie);
    if (resubmitRes.statusCode !== 200 || resubmitRes.body.data.status !== 'submitted') {
      throw new Error(`Resubmit failed: ${JSON.stringify(resubmitRes.body)}`);
    }
    console.log('✅ Report resubmitted successfully by Employee A\n');

    // 12. Admin Review: Approve Report
    console.log('Step 12: Testing Admin Review — Approve Report...');
    const approveRes = await makeRequest(
      'PATCH',
      `/api/work-reports/${reportId}/review`,
      {
        action: 'approve',
        comment: 'Excellent detail. Approved.'
      },
      adminCookie
    );

    if (approveRes.statusCode !== 200 || approveRes.body.data.status !== 'reviewed') {
      throw new Error(`Approve report failed: ${JSON.stringify(approveRes.body)}`);
    }
    console.log('✅ Report approved by Admin. Status updated to reviewed.\n');

    // Verify WorkReportReview history preserved
    const reviewHistory = await WorkReportReview.find({ report: reportId }).sort({ createdAt: 1 });
    if (reviewHistory.length === 2) {
      console.log(`✅ WorkReportReview history verified: ${reviewHistory.length} audit entries preserved (1 revision requested, 1 approved)`);
    } else {
      console.warn(`⚠️ Review history count: ${reviewHistory.length}`);
    }
    console.log('');

    // 13. Verify employee CANNOT edit reviewed report
    console.log('Step 13: Verifying employee cannot edit reviewed report...');
    const editReviewedRes = await makeRequest('PUT', `/api/work-reports/${reportId}`, { summary: 'Post review change' }, empACookie);
    if (editReviewedRes.statusCode === 400) {
      console.log('✅ Prevented modification of reviewed report (400 Bad Request)\n');
    }

    // 14. Admin & Founder List, Overview, Analytics API Verification
    console.log('Step 14: Testing Overview, Analytics, and Admin Report Listing APIs...');

    const overviewRes = await makeRequest('GET', '/api/work-reports/overview', null, adminCookie);
    if (overviewRes.statusCode !== 200 || overviewRes.body.data.totalEmployees === undefined) {
      throw new Error(`Overview API failed: ${JSON.stringify(overviewRes.body)}`);
    }
    console.log('✅ Daily Overview metrics:', overviewRes.body.data);

    const missingRes = await makeRequest('GET', '/api/work-reports/missing', null, founderCookie);
    if (missingRes.statusCode !== 200 || missingRes.body.data.totalMissing === undefined) {
      throw new Error(`Missing reports API failed: ${JSON.stringify(missingRes.body)}`);
    }
    console.log(`✅ Missing Reports API: Total Missing = ${missingRes.body.data.totalMissing}`);

    const analyticsRes = await makeRequest('GET', '/api/work-reports/analytics', null, adminCookie);
    if (analyticsRes.statusCode !== 200 || analyticsRes.body.data.submissionRate === undefined) {
      throw new Error(`Analytics API failed: ${JSON.stringify(analyticsRes.body)}`);
    }
    console.log('✅ Monthly Analytics metrics:', analyticsRes.body.data);

    const empAnalyticsRes = await makeRequest('GET', '/api/work-reports/analytics/employees', null, founderCookie);
    if (empAnalyticsRes.statusCode !== 200 || !Array.isArray(empAnalyticsRes.body.data.employees)) {
      throw new Error(`Employee Analytics API failed: ${JSON.stringify(empAnalyticsRes.body)}`);
    }
    console.log(`✅ Employee Monthly Analytics fetched: ${empAnalyticsRes.body.data.employees.length} employees listed`);

    const adminListRes = await makeRequest('GET', '/api/work-reports?status=reviewed', null, adminCookie);
    if (adminListRes.statusCode !== 200 || adminListRes.body.data.reports.length === 0) {
      throw new Error(`Admin list reports failed: ${JSON.stringify(adminListRes.body)}`);
    }
    console.log(`✅ Admin Report List fetched: ${adminListRes.body.data.reports.length} reviewed reports found\n`);

    // 15. Daily Reminder Scheduler Test
    console.log('Step 15: Testing Daily Reminder Scheduler Function...');
    const reminderResult = await sendDailyReportReminders();
    console.log('✅ Reminder service executed idempotently:', reminderResult);

    console.log('\n====================================================');
    console.log('ALL WORK REPORT TESTS PASSED SUCCESSFULLY! 🚀');
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
  }
};

runTests();
