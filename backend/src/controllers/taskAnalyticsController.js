const { asyncHandler } = require('../middleware/errorMiddleware');
const { sendSuccess } = require('../utils/apiResponse');
const taskAnalyticsService = require('../services/taskAnalyticsService');

/**
 * @desc    Get company-wide task analytics
 * @route   GET /api/tasks/analytics
 * @access  Private (Admin, Founder)
 */
const getCompanyAnalytics = asyncHandler(async (req, res) => {
  const analytics = await taskAnalyticsService.getCompanyAnalytics(req.user, req.query);
  return sendSuccess(res, 200, 'Company task analytics retrieved successfully', analytics);
});

/**
 * @desc    Get employee performance breakdown analytics
 * @route   GET /api/tasks/analytics/employees
 * @access  Private (Admin, Founder)
 */
const getEmployeeAnalytics = asyncHandler(async (req, res) => {
  const analytics = await taskAnalyticsService.getEmployeeAnalytics(req.user, req.query);
  return sendSuccess(res, 200, 'Employee performance analytics retrieved successfully', analytics);
});

/**
 * @desc    Get employee personal task analytics
 * @route   GET /api/tasks/my/analytics
 * @access  Private (Employee, Admin, Founder)
 */
const getMyAnalytics = asyncHandler(async (req, res) => {
  const analytics = await taskAnalyticsService.getMyAnalytics(req.user, req.query);
  return sendSuccess(res, 200, 'Personal task analytics retrieved successfully', analytics);
});

module.exports = {
  getCompanyAnalytics,
  getEmployeeAnalytics,
  getMyAnalytics
};
