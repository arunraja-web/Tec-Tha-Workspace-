const User = require('../models/User');
const Attendance = require('../models/Attendance');
const AttendanceExport = require('../models/AttendanceExport');
const { getStartOfDay, getEndOfDay, getMonthRange, formatDateToYYYYMMDD, formatDateToYYYYMM } = require('../utils/dateUtils');

/**
 * Helper to check if a target date belongs to an archived/deleted month
 */
const checkIfMonthIsArchived = async (dateOrMonthInput) => {
  let monthStr;
  if (typeof dateOrMonthInput === 'string' && /^\d{4}-\d{2}$/.test(dateOrMonthInput)) {
    monthStr = dateOrMonthInput;
  } else {
    monthStr = formatDateToYYYYMM(dateOrMonthInput);
  }

  const exportRecord = await AttendanceExport.findOne({ month: monthStr });
  if (exportRecord && exportRecord.status === 'completed' && exportRecord.deletedAt) {
    throw new Error(`Attendance for month ${monthStr} is archived and read-only.`);
  }
};

/**
 * Get daily attendance for all active employees
 * Admin management view
 * 
 * @param {string} dateStr - YYYY-MM-DD
 */
const getDailyAttendance = async (dateStr) => {
  const normalizedDateStr = formatDateToYYYYMMDD(dateStr);
  const startOfDay = getStartOfDay(normalizedDateStr);
  const endOfDay = getEndOfDay(normalizedDateStr);

  // Fetch all active employees
  const employees = await User.find({
    role: 'employee',
    isActive: true,
    deletedAt: null
  })
    .select('_id name email phone department')
    .sort({ name: 1 })
    .lean();

  // Fetch attendance records for the day
  const attendanceRecords = await Attendance.find({
    date: { $gte: startOfDay, $lte: endOfDay }
  }).lean();

  const recordMap = new Map();
  attendanceRecords.forEach((rec) => {
    recordMap.set(rec.employee.toString(), rec);
  });

  const employeeAttendanceList = employees.map((emp) => {
    const rec = recordMap.get(emp._id.toString());
    return {
      employee: {
        _id: emp._id,
        name: emp.name,
        email: emp.email,
        department: emp.department || 'General'
      },
      attendanceId: rec ? rec._id : null,
      morning: rec && rec.morning && rec.morning.status ? rec.morning : null,
      evening: rec && rec.evening && rec.evening.status ? rec.evening : null
    };
  });

  return {
    date: normalizedDateStr,
    employees: employeeAttendanceList
  };
};

/**
 * Mark single employee session attendance using atomic upsert
 */
const markAttendance = async ({ employeeId, date, session, status, markedBy }) => {
  const normalizedDateStr = formatDateToYYYYMMDD(date);
  const startOfDay = getStartOfDay(normalizedDateStr);

  await checkIfMonthIsArchived(normalizedDateStr);

  // Validate employee
  const employee = await User.findById(employeeId);
  if (!employee) {
    throw new Error('Employee not found');
  }
  if (!employee.isActive || employee.deletedAt) {
    throw new Error('Employee is inactive or deleted');
  }
  if (employee.role !== 'employee') {
    throw new Error('Attendance can only be marked for users with employee role');
  }

  const updateField = session === 'morning' ? 'morning' : 'evening';
  const now = new Date();

  // Atomic upsert
  const updatedRecord = await Attendance.findOneAndUpdate(
    { employee: employeeId, date: startOfDay },
    {
      $set: {
        [`${updateField}.status`]: status,
        [`${updateField}.markedBy`]: markedBy,
        [`${updateField}.markedAt`]: now
      }
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true
    }
  ).populate('employee', 'name email department');

  return updatedRecord;
};

/**
 * Bulk mark attendance for multiple employees using bulkWrite operations
 */
const bulkMarkAttendance = async ({ date, session, attendance, markedBy }) => {
  const normalizedDateStr = formatDateToYYYYMMDD(date);
  const startOfDay = getStartOfDay(normalizedDateStr);

  await checkIfMonthIsArchived(normalizedDateStr);

  const employeeIds = attendance.map((item) => item.employeeId);

  // Validate all employees exist, active, role=employee
  const validEmployees = await User.find({
    _id: { $in: employeeIds },
    role: 'employee',
    isActive: true,
    deletedAt: null
  }).select('_id');

  const validSet = new Set(validEmployees.map((e) => e._id.toString()));

  const now = new Date();
  const updateField = session === 'morning' ? 'morning' : 'evening';

  const bulkOps = [];
  let successful = 0;
  let failed = 0;
  const failureDetails = [];

  attendance.forEach((item) => {
    const empIdStr = item.employeeId.toString();
    if (!validSet.has(empIdStr)) {
      failed++;
      failureDetails.push({ employeeId: empIdStr, reason: 'Invalid, inactive, or non-employee user' });
      return;
    }

    successful++;
    bulkOps.push({
      updateOne: {
        filter: { employee: item.employeeId, date: startOfDay },
        update: {
          $set: {
            [`${updateField}.status`]: item.status,
            [`${updateField}.markedBy`]: markedBy,
            [`${updateField}.markedAt`]: now
          }
        },
        upsert: true
      }
    });
  });

  if (bulkOps.length > 0) {
    await Attendance.bulkWrite(bulkOps);
  }

  return {
    total: attendance.length,
    successful,
    failed,
    failureDetails
  };
};

/**
 * Update existing attendance document (PUT)
 */
const updateAttendanceRecord = async (id, { morning, evening }, markedBy) => {
  const record = await Attendance.findById(id);
  if (!record) {
    throw new Error('Attendance record not found');
  }

  await checkIfMonthIsArchived(record.date);

  const now = new Date();

  if (morning && morning.status) {
    record.morning.status = morning.status;
    record.morning.markedBy = markedBy;
    record.morning.markedAt = now;
  }

  if (evening && evening.status) {
    record.evening.status = evening.status;
    record.evening.markedBy = markedBy;
    record.evening.markedAt = now;
  }

  await record.save();
  return await Attendance.findById(id).populate('employee', 'name email department');
};

/**
 * Update specific session status (PATCH)
 */
const updateSessionStatus = async (id, session, status, markedBy) => {
  const record = await Attendance.findById(id);
  if (!record) {
    throw new Error('Attendance record not found');
  }

  await checkIfMonthIsArchived(record.date);

  const now = new Date();
  if (session === 'morning') {
    record.morning.status = status;
    record.morning.markedBy = markedBy;
    record.morning.markedAt = now;
  } else if (session === 'evening') {
    record.evening.status = status;
    record.evening.markedBy = markedBy;
    record.evening.markedAt = now;
  } else {
    throw new Error("Invalid session. Must be 'morning' or 'evening'");
  }

  await record.save();
  return await Attendance.findById(id).populate('employee', 'name email department');
};

/**
 * Get employee attendance records for a given month
 */
const getEmployeeAttendance = async (employeeId, monthStr) => {
  const { startOfMonth, endOfMonth, monthStr: normalizedMonth } = getMonthRange(monthStr);

  const records = await Attendance.find({
    employee: employeeId,
    date: { $gte: startOfMonth, $lte: endOfMonth }
  })
    .sort({ date: 1 })
    .lean();

  return {
    employeeId,
    month: normalizedMonth,
    records: records.map((r) => ({
      _id: r._id,
      date: formatDateToYYYYMMDD(r.date),
      morning: r.morning,
      evening: r.evening
    }))
  };
};

/**
 * Get monthly attendance calendar for employee
 */
const getEmployeeMonthlyCalendar = async (employeeId, monthStr) => {
  const { startOfMonth, endOfMonth, year, month, daysInMonth } = getMonthRange(monthStr);

  const records = await Attendance.find({
    employee: employeeId,
    date: { $gte: startOfMonth, $lte: endOfMonth }
  })
    .sort({ date: 1 })
    .lean();

  const recordMap = new Map();
  records.forEach((r) => {
    recordMap.set(formatDateToYYYYMMDD(r.date), r);
  });

  const calendar = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const rec = recordMap.get(dStr);

    calendar.push({
      date: dStr,
      morning: rec && rec.morning && rec.morning.status ? rec.morning.status : null,
      evening: rec && rec.evening && rec.evening.status ? rec.evening.status : null
    });
  }

  return calendar;
};

module.exports = {
  getDailyAttendance,
  markAttendance,
  bulkMarkAttendance,
  updateAttendanceRecord,
  updateSessionStatus,
  getEmployeeAttendance,
  getEmployeeMonthlyCalendar
};
