const User = require('../models/User');
const WorkReport = require('../models/WorkReport');
const Attendance = require('../models/Attendance');
const { getStartOfDay, getEndOfDay, getMonthRange, formatDateToYYYYMMDD } = require('../utils/dateUtils');

/**
 * Get daily overview for admin/founder dashboard
 */
const getDailyOverview = async (dateInput) => {
  const dateStr = formatDateToYYYYMMDD(dateInput || new Date());
  const startOfDay = getStartOfDay(dateStr);
  const endOfDay = getEndOfDay(dateStr);

  // 1. Fetch active employees
  const activeEmployees = await User.find({
    role: 'employee',
    isActive: true,
    deletedAt: null
  }).select('_id name email department').lean();

  const activeEmployeeIds = activeEmployees.map((e) => e._id);
  const totalEmployees = activeEmployees.length;

  // 2. Fetch attendance for date to check for approved leave/holiday
  const attendanceRecords = await Attendance.find({
    date: { $gte: startOfDay, $lte: endOfDay },
    employee: { $in: activeEmployeeIds }
  }).lean();

  const leaveEmployeeSet = new Set();
  attendanceRecords.forEach((att) => {
    const morningLeave = att.morning && att.morning.status === 'leave';
    const eveningLeave = att.evening && att.evening.status === 'leave';
    const isHoliday = (att.morning && att.morning.status === 'holiday') || (att.evening && att.evening.status === 'holiday');

    if ((morningLeave && eveningLeave) || isHoliday) {
      leaveEmployeeSet.add(att.employee.toString());
    }
  });

  const expectedReportsCount = Math.max(0, totalEmployees - leaveEmployeeSet.size);

  // 3. Fetch reports for target date
  const reports = await WorkReport.find({
    reportDate: { $gte: startOfDay, $lte: endOfDay },
    employee: { $in: activeEmployeeIds }
  }).lean();

  let submittedCount = 0;
  let draftCount = 0;
  let needsRevisionCount = 0;
  let reviewedCount = 0;

  const employeeReportMap = new Map();

  reports.forEach((rep) => {
    employeeReportMap.set(rep.employee.toString(), rep);
    if (rep.status === 'submitted') submittedCount++;
    else if (rep.status === 'draft') draftCount++;
    else if (rep.status === 'needs_revision') needsRevisionCount++;
    else if (rep.status === 'reviewed') reviewedCount++;
  });

  // Calculate missing count (expected employees without submitted, reviewed, draft, or needs_revision report)
  let missingCount = 0;
  activeEmployees.forEach((emp) => {
    const empId = emp._id.toString();
    const isExempt = leaveEmployeeSet.has(empId);
    const hasReport = employeeReportMap.has(empId);

    if (!isExempt && !hasReport) {
      missingCount++;
    }
  });

  return {
    date: dateStr,
    totalEmployees,
    expectedReports: expectedReportsCount,
    submitted: submittedCount,
    draft: draftCount,
    needsRevision: needsRevisionCount,
    reviewed: reviewedCount,
    missing: missingCount
  };
};

/**
 * Get missing report employee list for a given date
 */
const getMissingReports = async (dateInput) => {
  const dateStr = formatDateToYYYYMMDD(dateInput || new Date());
  const startOfDay = getStartOfDay(dateStr);
  const endOfDay = getEndOfDay(dateStr);

  const activeEmployees = await User.find({
    role: 'employee',
    isActive: true,
    deletedAt: null
  }).select('_id name email phone role department').lean();

  const activeEmployeeIds = activeEmployees.map((e) => e._id);

  // Fetch attendance to check full day leave / holiday
  const attendanceRecords = await Attendance.find({
    date: { $gte: startOfDay, $lte: endOfDay },
    employee: { $in: activeEmployeeIds }
  }).lean();

  const leaveEmployeeSet = new Set();
  attendanceRecords.forEach((att) => {
    const morningLeave = att.morning && att.morning.status === 'leave';
    const eveningLeave = att.evening && att.evening.status === 'leave';
    const isHoliday = (att.morning && att.morning.status === 'holiday') || (att.evening && att.evening.status === 'holiday');

    if ((morningLeave && eveningLeave) || isHoliday) {
      leaveEmployeeSet.add(att.employee.toString());
    }
  });

  // Fetch work reports for date
  const reports = await WorkReport.find({
    reportDate: { $gte: startOfDay, $lte: endOfDay },
    employee: { $in: activeEmployeeIds }
  }).lean();

  const employeeReportMap = new Map();
  reports.forEach((r) => {
    employeeReportMap.set(r.employee.toString(), r);
  });

  const missingEmployees = activeEmployees.filter((emp) => {
    const empId = emp._id.toString();
    if (leaveEmployeeSet.has(empId)) return false; // Exclude approved leave/holiday
    
    const rep = employeeReportMap.get(empId);
    // Missing if no report at all or status is strictly missing
    return !rep || rep.status === 'draft';
  });

  return {
    date: dateStr,
    totalMissing: missingEmployees.length,
    missingEmployees: missingEmployees.map((emp) => ({
      _id: emp._id,
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      department: emp.department || 'General',
      status: employeeReportMap.has(emp._id.toString()) ? 'draft' : 'not_started'
    }))
  };
};

/**
 * Get monthly analytics overview
 */
const getMonthlyAnalytics = async (monthStr) => {
  const { startOfMonth, endOfMonth, daysInMonth } = getMonthRange(monthStr);

  const activeEmployees = await User.find({
    role: 'employee',
    isActive: true,
    deletedAt: null
  }).select('_id').lean();

  const activeEmployeeIds = activeEmployees.map((e) => e._id);
  const totalEmployees = activeEmployees.length;

  // Aggregate report stats for the month using MongoDB pipeline
  const statsAggregation = await WorkReport.aggregate([
    {
      $match: {
        reportDate: { $gte: startOfMonth, $lte: endOfMonth },
        employee: { $in: activeEmployeeIds }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const statsMap = {
    draft: 0,
    submitted: 0,
    needs_revision: 0,
    reviewed: 0
  };

  statsAggregation.forEach((item) => {
    statsMap[item._id] = item.count;
  });

  // Calculate total submitted (submitted + reviewed) vs expected
  const totalSubmitted = statsMap.submitted + statsMap.reviewed + statsMap.needs_revision;
  const estimatedExpected = totalEmployees * daysInMonth;
  const missing = Math.max(0, estimatedExpected - (statsMap.submitted + statsMap.reviewed + statsMap.needs_revision + statsMap.draft));
  const submissionRate = estimatedExpected > 0 ? Number(((totalSubmitted / estimatedExpected) * 100).toFixed(2)) : 0;
  const reviewRate = totalSubmitted > 0 ? Number(((statsMap.reviewed / totalSubmitted) * 100).toFixed(2)) : 0;

  return {
    month: monthStr,
    expected: estimatedExpected,
    submitted: statsMap.submitted,
    reviewed: statsMap.reviewed,
    needsRevision: statsMap.needs_revision,
    draft: statsMap.draft,
    missing,
    submissionRate,
    reviewRate
  };
};

/**
 * Get monthly analytics broken down by employee
 */
const getEmployeeMonthlyAnalytics = async (monthStr) => {
  const { startOfMonth, endOfMonth, daysInMonth } = getMonthRange(monthStr);

  const activeEmployees = await User.find({
    role: 'employee',
    isActive: true,
    deletedAt: null
  }).select('_id name email department').sort({ name: 1 }).lean();

  const activeEmployeeIds = activeEmployees.map((e) => e._id);

  // Aggregate by employee and status
  const empReportAggregation = await WorkReport.aggregate([
    {
      $match: {
        reportDate: { $gte: startOfMonth, $lte: endOfMonth },
        employee: { $in: activeEmployeeIds }
      }
    },
    {
      $group: {
        _id: { employee: '$employee', status: '$status' },
        count: { $sum: 1 }
      }
    }
  ]);

  const empMap = new Map();
  activeEmployees.forEach((emp) => {
    empMap.set(emp._id.toString(), {
      employee: {
        _id: emp._id,
        name: emp.name,
        email: emp.email,
        department: emp.department || 'General'
      },
      expected: daysInMonth,
      submitted: 0,
      reviewed: 0,
      needsRevision: 0,
      draft: 0,
      missing: daysInMonth,
      submissionRate: 0
    });
  });

  empReportAggregation.forEach((item) => {
    const empId = item._id.employee.toString();
    const status = item._id.status;
    const count = item.count;

    if (empMap.has(empId)) {
      const record = empMap.get(empId);
      if (status === 'submitted') record.submitted += count;
      else if (status === 'reviewed') record.reviewed += count;
      else if (status === 'needs_revision') record.needsRevision += count;
      else if (status === 'draft') record.draft += count;
    }
  });

  // Calculate final numbers and percentage for each employee
  const result = Array.from(empMap.values()).map((record) => {
    const totalFilled = record.submitted + record.reviewed + record.needsRevision + record.draft;
    record.missing = Math.max(0, record.expected - totalFilled);
    const validSubmitted = record.submitted + record.reviewed + record.needsRevision;
    record.submissionRate = record.expected > 0 ? Number(((validSubmitted / record.expected) * 100).toFixed(2)) : 0;
    return record;
  });

  return {
    month: monthStr,
    employees: result
  };
};

module.exports = {
  getDailyOverview,
  getMissingReports,
  getMonthlyAnalytics,
  getEmployeeMonthlyAnalytics
};
