const User = require('../models/User');
const Attendance = require('../models/Attendance');
const { getMonthRange } = require('../utils/dateUtils');

/**
 * Calculate attendance percentage formula
 * Attendance % = (Present Sessions / Applicable Sessions) * 100
 * Applicable Sessions = Present + Absent (Holidays & Leaves excluded from absent penalty)
 */
const calculateAttendancePercentage = (present, absent) => {
  const applicable = present + absent;
  if (applicable === 0) return 100;
  return Number(((present / applicable) * 100).toFixed(2));
};

/**
 * Get monthly analytics overall & employee breakdown
 * 
 * @param {string} monthStr - Format YYYY-MM
 */
const getMonthlyAnalytics = async (monthStr) => {
  const { startOfMonth, endOfMonth, monthStr: normalizedMonth } = getMonthRange(monthStr);

  // 1. Fetch active employees
  const activeEmployees = await User.find({
    role: 'employee',
    isActive: true,
    deletedAt: null
  }).select('_id name email phone department').lean();

  const employeeMap = new Map();
  activeEmployees.forEach((emp) => {
    employeeMap.set(emp._id.toString(), emp);
  });

  // 2. Fetch all attendance records for the month
  const attendanceRecords = await Attendance.find({
    date: { $gte: startOfMonth, $lte: endOfMonth }
  }).lean();

  // Distinct working days with attendance marked
  const distinctDates = new Set();
  attendanceRecords.forEach((r) => {
    distinctDates.add(r.date.toISOString().split('T')[0]);
  });

  // Initialize employee stats counters
  const empStats = new Map();
  activeEmployees.forEach((emp) => {
    empStats.set(emp._id.toString(), {
      employee: {
        _id: emp._id,
        name: emp.name,
        email: emp.email,
        department: emp.department || 'General'
      },
      morning: { present: 0, absent: 0, leave: 0, holiday: 0 },
      evening: { present: 0, absent: 0, leave: 0, holiday: 0 },
      totalPresent: 0,
      totalAbsent: 0,
      totalLeave: 0,
      totalHoliday: 0,
      attendancePercentage: 100
    });
  });

  let overallPresent = 0;
  let overallAbsent = 0;
  let overallLeave = 0;
  let overallHoliday = 0;

  // Process attendance records
  attendanceRecords.forEach((rec) => {
    const empId = rec.employee ? rec.employee.toString() : null;
    if (!empId || !empStats.has(empId)) return;

    const stat = empStats.get(empId);

    // Morning session
    if (rec.morning && rec.morning.status) {
      const st = rec.morning.status;
      if (st === 'present') {
        stat.morning.present += 1;
        stat.totalPresent += 1;
        overallPresent += 1;
      } else if (st === 'absent') {
        stat.morning.absent += 1;
        stat.totalAbsent += 1;
        overallAbsent += 1;
      } else if (st === 'leave') {
        stat.morning.leave += 1;
        stat.totalLeave += 1;
        overallLeave += 1;
      } else if (st === 'holiday') {
        stat.morning.holiday += 1;
        stat.totalHoliday += 1;
        overallHoliday += 1;
      }
    }

    // Evening session
    if (rec.evening && rec.evening.status) {
      const st = rec.evening.status;
      if (st === 'present') {
        stat.evening.present += 1;
        stat.totalPresent += 1;
        overallPresent += 1;
      } else if (st === 'absent') {
        stat.evening.absent += 1;
        stat.totalAbsent += 1;
        overallAbsent += 1;
      } else if (st === 'leave') {
        stat.evening.leave += 1;
        stat.totalLeave += 1;
        overallLeave += 1;
      } else if (st === 'holiday') {
        stat.evening.holiday += 1;
        stat.totalHoliday += 1;
        overallHoliday += 1;
      }
    }
  });

  // Calculate percentage for each employee
  const employeeBreakdown = Array.from(empStats.values()).map((stat) => {
    stat.attendancePercentage = calculateAttendancePercentage(stat.totalPresent, stat.totalAbsent);
    return stat;
  });

  const overallAttendancePercentage = calculateAttendancePercentage(overallPresent, overallAbsent);

  return {
    month: normalizedMonth,
    summary: {
      totalEmployees: activeEmployees.length,
      workingDays: distinctDates.size,
      totalPresent: overallPresent,
      totalAbsent: overallAbsent,
      totalLeave: overallLeave,
      totalHoliday: overallHoliday,
      overallAttendancePercentage
    },
    employees: employeeBreakdown
  };
};

/**
 * Get department level analytics
 * 
 * @param {string} monthStr - Format YYYY-MM
 */
const getDepartmentAnalytics = async (monthStr) => {
  const { summary, employees } = await getMonthlyAnalytics(monthStr);

  const deptMap = new Map();

  employees.forEach((empStat) => {
    const dept = empStat.employee.department || 'General';

    if (!deptMap.has(dept)) {
      deptMap.set(dept, {
        department: dept,
        totalEmployees: 0,
        totalPresent: 0,
        totalAbsent: 0,
        totalLeave: 0,
        totalHoliday: 0,
        attendancePercentage: 100
      });
    }

    const deptStat = deptMap.get(dept);
    deptStat.totalEmployees += 1;
    deptStat.totalPresent += empStat.totalPresent;
    deptStat.totalAbsent += empStat.totalAbsent;
    deptStat.totalLeave += empStat.totalLeave;
    deptStat.totalHoliday += empStat.totalHoliday;
  });

  const departmentAnalytics = Array.from(deptMap.values()).map((deptStat) => {
    deptStat.attendancePercentage = calculateAttendancePercentage(
      deptStat.totalPresent,
      deptStat.totalAbsent
    );
    return deptStat;
  });

  return {
    month: summary.month || monthStr,
    departments: departmentAnalytics
  };
};

module.exports = {
  calculateAttendancePercentage,
  getMonthlyAnalytics,
  getDepartmentAnalytics
};
