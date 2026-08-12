const express = require('express');
const router = express.Router();

const leaveController = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  validateCreateLeave,
  validateUpdateLeave,
  validateApproveLeave,
  validateRejectLeave,
  validateLeaveIdParam,
  validateLeaveQuery
} = require('../validators/leaveValidator');

// Protect all leave routes
router.use(protect);

// 1. Employee Leave History
router.get('/my', validateLeaveQuery, leaveController.getMyLeaves);

// 2. Leave Analytics (Admin & Founder)
router.get('/analytics/employees', authorize('admin', 'founder'), leaveController.getEmployeeLeaveAnalytics);
router.get('/analytics', authorize('admin', 'founder'), leaveController.getLeaveAnalytics);

// 3. Convenience Pending Leaves List (Admin & Founder)
router.get('/pending', authorize('admin', 'founder'), validateLeaveQuery, leaveController.getPendingLeaves);

// 4. Apply for Leave (Authenticated User)
router.post('/', validateCreateLeave, leaveController.applyLeave);

// 5. List All Leaves (Admin & Founder)
router.get('/', authorize('admin', 'founder'), validateLeaveQuery, leaveController.getAllLeaves);

// 6. Get Single Leave Details (Employee own, Admin/Founder any)
router.get('/:id', validateLeaveIdParam, leaveController.getLeaveById);

// 7. Employee Update Pending Leave
router.put('/:id', validateUpdateLeave, leaveController.updateLeave);

// 8. Employee Cancel Pending Leave
router.patch('/:id/cancel', validateLeaveIdParam, leaveController.cancelLeave);

// 9. Founder Approve Leave (STRICTLY FOUNDER ONLY)
router.patch('/:id/approve', validateApproveLeave, leaveController.approveLeave);

// 10. Founder Reject Leave (STRICTLY FOUNDER ONLY)
router.patch('/:id/reject', validateRejectLeave, leaveController.rejectLeave);

module.exports = router;
