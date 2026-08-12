const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const AttendanceExport = require('../models/AttendanceExport');

const { getStartOfDay, getEndOfDay, getMonthRange, formatDateToYYYYMMDD } = require('../utils/dateUtils');
const { calculateAttendancePercentage, getMonthlyAnalytics, getDepartmentAnalytics } = require('../services/attendanceAnalyticsService');
const { markAttendance, bulkMarkAttendance, getDailyAttendance, getEmployeeMonthlyCalendar } = require('../services/attendanceService');
const { generateAttendanceExcelReport } = require('../utils/excelGenerator');
const { archiveAndDeleteMonth } = require('../services/attendanceArchiveService');
const attendanceExportService = require('../services/attendanceExportService');

let mongoServer;

const runAttendanceTests = async () => {
  console.log('=== STARTING ATTENDANCE MANAGEMENT MODULE VERIFICATION TESTS ===\n');

  process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'test_cloud';
  process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '123456';
  process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'secret';

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  let passedTests = 0;
  let failedTests = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failedTests++;
    }
  };

  try {
    // --------------------------------------------------------------------
    // TEST 1: Seed Users (Admin, Founder, Employee 1, Employee 2)
    // --------------------------------------------------------------------
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@test.com',
      phone: '1111111111',
      password: 'Password@123',
      role: 'admin',
      isActive: true
    });

    const founder = await User.create({
      name: 'Company Founder',
      email: 'founder@test.com',
      phone: '2222222222',
      password: 'Password@123',
      role: 'founder',
      isActive: true
    });

    const emp1 = await User.create({
      name: 'John Employee',
      email: 'john@test.com',
      phone: '3333333333',
      password: 'Password@123',
      role: 'employee',
      isActive: true
    });

    const emp2 = await User.create({
      name: 'Alice Employee',
      email: 'alice@test.com',
      phone: '4444444444',
      password: 'Password@123',
      role: 'employee',
      isActive: true
    });

    assert(admin && founder && emp1 && emp2, '1. Seed System Users (Admin, Founder, Employees)');

    // --------------------------------------------------------------------
    // TEST 2: Timezone & Date Normalization
    // --------------------------------------------------------------------
    const dateStr = '2026-08-11';
    const startOfDay = getStartOfDay(dateStr);
    const endOfDay = getEndOfDay(dateStr);
    assert(startOfDay < endOfDay, '2. Timezone startOfDay is earlier than endOfDay');
    assert(formatDateToYYYYMMDD(startOfDay) === '2026-08-11', '2b. formatDateToYYYYMMDD returns YYYY-MM-DD');

    // --------------------------------------------------------------------
    // TEST 3: Admin Mark Single Attendance & Unique Compound Index
    // --------------------------------------------------------------------
    const rec1 = await markAttendance({
      employeeId: emp1._id,
      date: '2026-08-11',
      session: 'morning',
      status: 'present',
      markedBy: admin._id
    });

    assert(rec1 && rec1.morning.status === 'present', '3. Mark Morning Attendance for Employee 1');

    // Update evening status on same day (Must update existing document, not duplicate)
    const rec1Updated = await markAttendance({
      employeeId: emp1._id,
      date: '2026-08-11',
      session: 'evening',
      status: 'present',
      markedBy: admin._id
    });

    const emp1Count = await Attendance.countDocuments({ employee: emp1._id, date: startOfDay });
    assert(emp1Count === 1, '3b. Compound unique index enforces exactly ONE document per employee per day');
    assert(rec1Updated.morning.status === 'present' && rec1Updated.evening.status === 'present', '3c. Single document retains morning and evening sessions');

    // --------------------------------------------------------------------
    // TEST 4: Bulk Mark Attendance
    // --------------------------------------------------------------------
    const bulkResult = await bulkMarkAttendance({
      date: '2026-08-12',
      session: 'morning',
      attendance: [
        { employeeId: emp1._id, status: 'present' },
        { employeeId: emp2._id, status: 'absent' }
      ],
      markedBy: admin._id
    });

    assert(bulkResult.successful === 2 && bulkResult.failed === 0, '4. Bulk Mark Morning Attendance for multiple employees');

    // --------------------------------------------------------------------
    // TEST 5: Get Daily Attendance API Service
    // --------------------------------------------------------------------
    const dailyData = await getDailyAttendance('2026-08-12');
    assert(dailyData.employees.length === 2, '5. Daily Attendance returns all active employees');
    assert(dailyData.employees[0].morning.status !== null, '5b. Daily Attendance returns session status');

    // --------------------------------------------------------------------
    // TEST 6: Attendance Percentage Calculation
    // Formula: (Present / (Present + Absent)) * 100 (Holidays & Leaves excluded)
    // --------------------------------------------------------------------
    const pct1 = calculateAttendancePercentage(10, 0); // 100%
    const pct2 = calculateAttendancePercentage(9, 1); // 90%
    assert(pct1 === 100, '6. 10 present, 0 absent = 100%');
    assert(pct2 === 90, '6b. 9 present, 1 absent = 90%');

    // --------------------------------------------------------------------
    // TEST 7: Monthly & Department Analytics
    // --------------------------------------------------------------------
    const analytics = await getMonthlyAnalytics('2026-08');
    assert(analytics.summary.totalEmployees === 2, '7. Monthly Analytics calculates active employee count');
    assert(analytics.employees.length === 2, '7b. Monthly Analytics provides individual breakdown');

    const deptAnalytics = await getDepartmentAnalytics('2026-08');
    assert(deptAnalytics.departments.length >= 1, '7c. Department Analytics returns department grouping');

    // --------------------------------------------------------------------
    // TEST 8: Employee Monthly Calendar
    // --------------------------------------------------------------------
    const cal = await getEmployeeMonthlyCalendar(emp1._id, '2026-08');
    assert(cal.length === 31, '8. Employee Monthly Calendar returns all days of August (31 days)');

    // --------------------------------------------------------------------
    // TEST 9: Excel Generation
    // --------------------------------------------------------------------
    const excelBuffer = await generateAttendanceExcelReport({
      month: '2026-08',
      summary: analytics.summary,
      employeeStats: analytics.employees,
      dailyRecords: await Attendance.find().lean()
    });

    assert(Buffer.isBuffer(excelBuffer) && excelBuffer.length > 0, '9. Excel Generator produces non-empty Buffer (.xlsx)');

    // --------------------------------------------------------------------
    // TEST 10: Mocked Cloudinary Upload & Archive Monthly Flow
    // --------------------------------------------------------------------
    // Mock generateAndUploadMonthlyExport to avoid needing real Cloudinary network credentials during test
    attendanceExportService.generateAndUploadMonthlyExport = async (monthStr) => {
      const exp = await AttendanceExport.findOneAndUpdate(
        { month: monthStr },
        {
          month: monthStr,
          status: 'completed',
          fileName: `attendance-report-${monthStr}.xlsx`,
          cloudinaryPublicId: `company-workspace/attendance-reports/${monthStr}/report`,
          fileUrl: `https://res.cloudinary.com/demo/raw/upload/attendance-report-${monthStr}.xlsx`,
          recordCount: 5,
          exportedAt: new Date()
        },
        { upsert: true, new: true }
      );
      return exp;
    };

    const archiveResult = await archiveAndDeleteMonth('2026-08');
    assert(archiveResult.success === true, '10. Archive and Delete Month succeeded');
    assert(archiveResult.exportRecord.status === 'completed', '10b. AttendanceExport marked completed');
    assert(archiveResult.exportRecord.deletedAt !== null, '10c. deletedAt timestamp recorded');

    const remainingAttendanceCount = await Attendance.countDocuments();
    assert(remainingAttendanceCount === 0, '10d. Attendance records safely deleted from MongoDB after verified export');

    // --------------------------------------------------------------------
    // TEST 11: Read-only protection for archived months
    // --------------------------------------------------------------------
    let archiveErrorThrown = false;
    try {
      await markAttendance({
        employeeId: emp1._id,
        date: '2026-08-11',
        session: 'morning',
        status: 'present',
        markedBy: admin._id
      });
    } catch (err) {
      archiveErrorThrown = true;
    }
    assert(archiveErrorThrown, '11. System prevents modifying attendance for archived/deleted months');

  } catch (err) {
    console.error('Test execution error:', err);
    assert(false, `Unexpected error: ${err.message}`);
  } finally {
    await mongoose.disconnect();
    await mongoServer.stop();
    console.log(`\n=== TEST VERIFICATION SUMMARY ===`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
  }
};

runAttendanceTests();
