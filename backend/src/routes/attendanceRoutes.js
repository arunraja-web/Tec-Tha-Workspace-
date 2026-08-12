const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const attendanceController = require('../controllers/attendanceController');
const {
  markAttendanceValidator,
  bulkAttendanceValidator,
  updateAttendanceValidator,
  updateSessionValidator,
  monthParamValidator,
  dailyDateQueryValidator
} = require('../validators/attendanceValidator');

// Protect all routes below
router.use(protect);

// ----------------------------------------------------
// Public Employee & General Attendance Endpoints
// ----------------------------------------------------

// Employee view own attendance
router.get(
  '/my',
  authorize('admin', 'founder', 'employee'),
  monthParamValidator,
  attendanceController.getMyAttendance
);

// Employee monthly calendar
router.get(
  '/employee/:employeeId',
  authorize('admin', 'founder', 'employee'),
  monthParamValidator,
  attendanceController.getEmployeeMonthlyCalendar
);

// ----------------------------------------------------
// Admin & Founder Analytics & Exports
// ----------------------------------------------------

// Overall analytics
router.get(
  '/analytics',
  authorize('admin', 'founder'),
  monthParamValidator,
  attendanceController.getAnalytics
);

// Department analytics
router.get(
  '/analytics/department',
  authorize('admin', 'founder'),
  monthParamValidator,
  attendanceController.getDepartmentAnalytics
);

// Get export history
router.get(
  '/exports',
  authorize('admin', 'founder'),
  attendanceController.getExportsHistory
);

// ----------------------------------------------------
// Admin Management Endpoints
// ----------------------------------------------------

// Admin get daily attendance
router.get(
  '/',
  authorize('admin'),
  dailyDateQueryValidator,
  attendanceController.getDailyAttendance
);

// Admin mark single attendance
router.post(
  '/',
  authorize('admin'),
  markAttendanceValidator,
  attendanceController.markAttendance
);

// Admin bulk mark attendance
router.post(
  '/bulk',
  authorize('admin'),
  bulkAttendanceValidator,
  attendanceController.bulkMarkAttendance
);

// Admin manual export trigger
router.post(
  '/export/:month',
  authorize('admin'),
  monthParamValidator,
  attendanceController.exportMonthlyReport
);

// Admin dev/testing endpoint for monthly archive simulation
router.post(
  '/test-archive/:month',
  authorize('admin'),
  monthParamValidator,
  attendanceController.simulateArchiveAndDelete
);

// Admin update full attendance document
router.put(
  '/:id',
  authorize('admin'),
  updateAttendanceValidator,
  attendanceController.updateAttendance
);

// Admin update single session status
router.patch(
  '/:id/session',
  authorize('admin'),
  updateSessionValidator,
  attendanceController.updateSessionStatus
);

// Get single attendance record by ID
router.get(
  '/:id',
  authorize('admin', 'founder', 'employee'),
  attendanceController.getAttendanceById
);

module.exports = router;
