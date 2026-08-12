const workReportService = require('../services/workReportService');
const workReportAttachmentService = require('../services/workReportAttachmentService');
const workReportAnalyticsService = require('../services/workReportAnalyticsService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * POST /api/work-reports - Create a daily work report draft (Employee only)
 */
const createDraftHandler = async (req, res, next) => {
  try {
    const result = await workReportService.createDraft(req.user, req.body);
    const statusCode = result.existing ? 200 : 201;
    return sendSuccess(res, statusCode, result.message, result.report);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * GET /api/work-reports/my/today - Get today's work report for logged-in employee
 */
const getTodayReportHandler = async (req, res, next) => {
  try {
    const report = await workReportService.getTodayReport(req.user);
    return sendSuccess(res, 200, report ? 'Today work report fetched successfully' : 'No work report submitted for today', report);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * GET /api/work-reports/my - Get all reports for logged-in employee
 */
const getMyReportsHandler = async (req, res, next) => {
  try {
    const data = await workReportService.getMyReports(req.user, req.query);
    return sendSuccess(res, 200, 'Employee work reports fetched successfully', data);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * GET /api/work-reports/:id - Get a single work report by ID with review history
 */
const getReportByIdHandler = async (req, res, next) => {
  try {
    const report = await workReportService.getReportById(req.params.id, req.user);
    return sendSuccess(res, 200, 'Work report details fetched successfully', report);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * PUT /api/work-reports/:id - Update draft or needs_revision report
 */
const updateDraftHandler = async (req, res, next) => {
  try {
    const report = await workReportService.updateDraft(req.params.id, req.user, req.body);
    return sendSuccess(res, 200, 'Work report draft updated successfully', report);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * POST /api/work-reports/:id/submit - Submit report for review
 */
const submitReportHandler = async (req, res, next) => {
  try {
    const report = await workReportService.submitReport(req.params.id, req.user);
    return sendSuccess(res, 200, 'Work report submitted successfully', report);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * POST /api/work-reports/:id/attachments - Upload attachment to report
 */
const addAttachmentHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'Please upload a file');
    }
    const report = await workReportAttachmentService.addAttachment(req.params.id, req.user, req.file);
    return sendSuccess(res, 200, 'Attachment uploaded successfully', report);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * DELETE /api/work-reports/:id/attachments/:attachmentId - Remove attachment from report
 */
const removeAttachmentHandler = async (req, res, next) => {
  try {
    const report = await workReportAttachmentService.removeAttachment(
      req.params.id,
      req.user,
      req.params.attachmentId
    );
    return sendSuccess(res, 200, 'Attachment removed successfully', report);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * PATCH /api/work-reports/:id/review - Admin/Founder review (approve or request revision)
 */
const reviewReportHandler = async (req, res, next) => {
  try {
    const report = await workReportService.reviewReport(req.params.id, req.user, req.body);
    const msg = req.body.action === 'approve' ? 'Work report approved successfully' : 'Revision requested for work report';
    return sendSuccess(res, 200, msg, report);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * GET /api/work-reports - Get all employee work reports (Admin & Founder)
 */
const getAllReportsHandler = async (req, res, next) => {
  try {
    const data = await workReportService.getAllReports(req.user, req.query);
    return sendSuccess(res, 200, 'Work reports fetched successfully', data);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * GET /api/work-reports/overview - Daily report overview metrics (Admin & Founder)
 */
const getOverviewHandler = async (req, res, next) => {
  try {
    const data = await workReportAnalyticsService.getDailyOverview(req.query.date);
    return sendSuccess(res, 200, 'Daily work report overview fetched successfully', data);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * GET /api/work-reports/missing - Get missing report list (Admin & Founder)
 */
const getMissingReportsHandler = async (req, res, next) => {
  try {
    const data = await workReportAnalyticsService.getMissingReports(req.query.date);
    return sendSuccess(res, 200, 'Missing work reports fetched successfully', data);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * GET /api/work-reports/analytics - Get monthly analytics overview (Admin & Founder)
 */
const getMonthlyAnalyticsHandler = async (req, res, next) => {
  try {
    const data = await workReportAnalyticsService.getMonthlyAnalytics(req.query.month);
    return sendSuccess(res, 200, 'Monthly work report analytics fetched successfully', data);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

/**
 * GET /api/work-reports/analytics/employees - Get employee monthly analytics breakdown (Admin & Founder)
 */
const getEmployeeAnalyticsHandler = async (req, res, next) => {
  try {
    const data = await workReportAnalyticsService.getEmployeeMonthlyAnalytics(req.query.month);
    return sendSuccess(res, 200, 'Employee monthly work report analytics fetched successfully', data);
  } catch (error) {
    if (error.statusCode) {
      return sendError(res, error.statusCode, error.message);
    }
    next(error);
  }
};

module.exports = {
  createDraftHandler,
  getTodayReportHandler,
  getMyReportsHandler,
  getReportByIdHandler,
  updateDraftHandler,
  submitReportHandler,
  addAttachmentHandler,
  removeAttachmentHandler,
  reviewReportHandler,
  getAllReportsHandler,
  getOverviewHandler,
  getMissingReportsHandler,
  getMonthlyAnalyticsHandler,
  getEmployeeAnalyticsHandler
};
