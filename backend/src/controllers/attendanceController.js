const { asyncHandler } = require('../middleware/errorMiddleware');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const attendanceService = require('../services/attendanceService');
const attendanceAnalyticsService = require('../services/attendanceAnalyticsService');
const attendanceExportService = require('../services/attendanceExportService');
const attendanceArchiveService = require('../services/attendanceArchiveService');
const Attendance = require('../models/Attendance');

/**
 * GET /api/attendance?date=YYYY-MM-DD
 * Admin get daily attendance for all active employees
 */
const getDailyAttendance = asyncHandler(async (req, res) => {
  const dateStr = req.query.date;
  const result = await attendanceService.getDailyAttendance(dateStr);
  return res.status(200).json({
    success: true,
    date: result.date,
    employees: result.employees
  });
});

/**
 * POST /api/attendance
 * Admin mark single session attendance for employee
 */
const markAttendance = asyncHandler(async (req, res) => {
  const { employeeId, date, session, status } = req.body;
  const markedBy = req.user._id;

  const record = await attendanceService.markAttendance({
    employeeId,
    date,
    session,
    status,
    markedBy
  });

  return sendSuccess(res, 200, `${session.charAt(0).toUpperCase() + session.slice(1)} attendance marked successfully`, record);
});

/**
 * POST /api/attendance/bulk
 * Admin bulk mark attendance for session
 */
const bulkMarkAttendance = asyncHandler(async (req, res) => {
  const { date, session, attendance } = req.body;
  const markedBy = req.user._id;

  const summary = await attendanceService.bulkMarkAttendance({
    date,
    session,
    attendance,
    markedBy
  });

  return res.status(200).json({
    success: true,
    message: `${session.charAt(0).toUpperCase() + session.slice(1)} attendance saved successfully`,
    data: summary
  });
});

/**
 * PUT /api/attendance/:id
 * Admin update attendance record
 */
const updateAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { morning, evening } = req.body;
  const markedBy = req.user._id;

  const updatedRecord = await attendanceService.updateAttendanceRecord(id, { morning, evening }, markedBy);
  return sendSuccess(res, 200, 'Attendance updated successfully', updatedRecord);
});

/**
 * PATCH /api/attendance/:id/session
 * Admin update specific session status
 */
const updateSessionStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { session, status } = req.body;
  const markedBy = req.user._id;

  const updatedRecord = await attendanceService.updateSessionStatus(id, session, status, markedBy);
  return sendSuccess(res, 200, 'Session attendance status updated successfully', updatedRecord);
});

/**
 * GET /api/attendance/my?month=YYYY-MM
 * Employee view own attendance history
 */
const getMyAttendance = asyncHandler(async (req, res) => {
  const employeeId = req.user._id;
  const monthStr = req.query.month;

  const data = await attendanceService.getEmployeeAttendance(employeeId, monthStr);
  return sendSuccess(res, 200, 'Employee attendance retrieved successfully', data);
});

/**
 * GET /api/attendance/employee/:employeeId?month=YYYY-MM
 * Detailed monthly attendance calendar for specific employee
 */
const getEmployeeMonthlyCalendar = asyncHandler(async (req, res) => {
  const targetEmployeeId = req.params.employeeId;
  const monthStr = req.query.month;

  // Authorization check: employee role can ONLY access their own record
  if (req.user.role === 'employee' && req.user._id.toString() !== targetEmployeeId.toString()) {
    return sendError(res, 403, 'Forbidden: You can only view your own attendance calendar');
  }

  const calendar = await attendanceService.getEmployeeMonthlyCalendar(targetEmployeeId, monthStr);
  return res.status(200).json(calendar);
});

/**
 * GET /api/attendance/analytics?month=YYYY-MM
 * Admin & Founder view monthly analytics
 */
const getAnalytics = asyncHandler(async (req, res) => {
  const monthStr = req.query.month;
  const analytics = await attendanceAnalyticsService.getMonthlyAnalytics(monthStr);
  return sendSuccess(res, 200, 'Attendance monthly analytics retrieved successfully', analytics);
});

/**
 * GET /api/attendance/analytics/department?month=YYYY-MM
 * Admin & Founder view department analytics
 */
const getDepartmentAnalytics = asyncHandler(async (req, res) => {
  const monthStr = req.query.month;
  const deptAnalytics = await attendanceAnalyticsService.getDepartmentAnalytics(monthStr);
  return sendSuccess(res, 200, 'Department attendance analytics retrieved successfully', deptAnalytics);
});

/**
 * POST /api/attendance/export/:month
 * Admin manually trigger export & Cloudinary upload
 */
const exportMonthlyReport = asyncHandler(async (req, res) => {
  const monthStr = req.params.month;
  const exportRecord = await attendanceExportService.generateAndUploadMonthlyExport(monthStr);
  return sendSuccess(res, 200, 'Monthly attendance report exported successfully', exportRecord);
});

/**
 * GET /api/attendance/exports
 * Admin & Founder view available export reports history
 */
const getExportsHistory = asyncHandler(async (req, res) => {
  const exportsList = await attendanceExportService.getAllExports();
  return res.status(200).json({
    success: true,
    exports: exportsList
  });
});

/**
 * GET /api/attendance/:id
 * Get single attendance record details
 */
const getAttendanceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const record = await Attendance.findById(id).populate('employee', 'name email department');

  if (!record) {
    return sendError(res, 404, 'Attendance record not found');
  }

  // Authorization check for employees
  if (req.user.role === 'employee' && record.employee._id.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Forbidden: Access denied');
  }

  return sendSuccess(res, 200, 'Attendance record retrieved', record);
});

/**
 * POST /api/attendance/test-archive/:month
 * Dev/Test helper endpoint to trigger and test archiveAndDeleteMonth flow safely
 */
const simulateArchiveAndDelete = asyncHandler(async (req, res) => {
  const monthStr = req.params.month;
  const result = await attendanceArchiveService.archiveAndDeleteMonth(monthStr);
  return sendSuccess(res, 200, `Simulated monthly archiving completed for ${monthStr}`, result);
});

module.exports = {
  getDailyAttendance,
  markAttendance,
  bulkMarkAttendance,
  updateAttendance,
  updateSessionStatus,
  getMyAttendance,
  getEmployeeMonthlyCalendar,
  getAnalytics,
  getDepartmentAnalytics,
  exportMonthlyReport,
  getExportsHistory,
  getAttendanceById,
  simulateArchiveAndDelete
};
