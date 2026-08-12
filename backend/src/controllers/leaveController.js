const leaveService = require('../services/leaveService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @desc    Employee apply for leave
 * @route   POST /api/leaves
 * @access  Private (Employee, Founder, Admin)
 */
const applyLeave = async (req, res, next) => {
  try {
    const leave = await leaveService.createLeave(req.user, req.body);
    return sendSuccess(res, 201, 'Leave request submitted successfully', leave);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Get authenticated employee's own leave history
 * @route   GET /api/leaves/my
 * @access  Private (Employee, Founder, Admin)
 */
const getMyLeaves = async (req, res, next) => {
  try {
    const result = await leaveService.getMyLeaves(req.user._id, req.query);
    return sendSuccess(res, 200, 'Leave history retrieved successfully', result);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Get single leave request details
 * @route   GET /api/leaves/:id
 * @access  Private (Employee own, Admin/Founder any)
 */
const getLeaveById = async (req, res, next) => {
  try {
    const leave = await leaveService.getLeaveById(req.params.id, req.user);
    return sendSuccess(res, 200, 'Leave request details retrieved successfully', leave);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Employee update pending leave request
 * @route   PUT /api/leaves/:id
 * @access  Private (Employee own pending)
 */
const updateLeave = async (req, res, next) => {
  try {
    const leave = await leaveService.updateLeave(req.params.id, req.user, req.body);
    return sendSuccess(res, 200, 'Leave request updated successfully', leave);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Employee cancel pending leave request
 * @route   PATCH /api/leaves/:id/cancel
 * @access  Private (Employee own pending)
 */
const cancelLeave = async (req, res, next) => {
  try {
    const leave = await leaveService.cancelLeave(req.params.id, req.user);
    return sendSuccess(res, 200, 'Leave request cancelled successfully', leave);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Founder approve leave request
 * @route   PATCH /api/leaves/:id/approve
 * @access  Private (FOUNDER ONLY)
 */
const approveLeave = async (req, res, next) => {
  try {
    // Enforcement: Admin MUST NOT approve
    if (req.user.role !== 'founder') {
      return sendError(res, 403, 'Only Founder can approve leave requests.');
    }

    const comment = req.body.comment || '';
    const leave = await leaveService.approveLeave(req.params.id, req.user, comment);
    return sendSuccess(res, 200, 'Leave request approved successfully', leave);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Founder reject leave request
 * @route   PATCH /api/leaves/:id/reject
 * @access  Private (FOUNDER ONLY)
 */
const rejectLeave = async (req, res, next) => {
  try {
    // Enforcement: Admin MUST NOT reject
    if (req.user.role !== 'founder') {
      return sendError(res, 403, 'Only Founder can reject leave requests.');
    }

    const comment = req.body.comment;
    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      return sendError(res, 400, 'Review comment is required when rejecting a leave request.');
    }

    const leave = await leaveService.rejectLeave(req.params.id, req.user, comment);
    return sendSuccess(res, 200, 'Leave request rejected successfully', leave);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    List all company leave requests
 * @route   GET /api/leaves
 * @access  Private (Admin, Founder)
 */
const getAllLeaves = async (req, res, next) => {
  try {
    const result = await leaveService.getAllLeaves(req.query);
    return sendSuccess(res, 200, 'All leave requests retrieved successfully', result);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    List pending leave requests
 * @route   GET /api/leaves/pending
 * @access  Private (Admin, Founder)
 */
const getPendingLeaves = async (req, res, next) => {
  try {
    const result = await leaveService.getPendingLeaves(req.query);
    return sendSuccess(res, 200, 'Pending leave requests retrieved successfully', result);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Get summary leave analytics
 * @route   GET /api/leaves/analytics
 * @access  Private (Admin, Founder)
 */
const getLeaveAnalytics = async (req, res, next) => {
  try {
    const analytics = await leaveService.getLeaveAnalytics(req.query);
    return sendSuccess(res, 200, 'Leave analytics retrieved successfully', analytics);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Get employee-wise leave analytics
 * @route   GET /api/leaves/analytics/employees
 * @access  Private (Admin, Founder)
 */
const getEmployeeLeaveAnalytics = async (req, res, next) => {
  try {
    const analytics = await leaveService.getEmployeeLeaveAnalytics(req.query);
    return sendSuccess(res, 200, 'Employee leave analytics retrieved successfully', analytics);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getLeaveById,
  updateLeave,
  cancelLeave,
  approveLeave,
  rejectLeave,
  getAllLeaves,
  getPendingLeaves,
  getLeaveAnalytics,
  getEmployeeLeaveAnalytics
};
