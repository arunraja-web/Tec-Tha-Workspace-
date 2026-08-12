const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadWorkReportFile, handleUploadError } = require('../middleware/uploadMiddleware');
const {
  validateCreateReport,
  validateUpdateReport,
  validateSubmitReport,
  validateReviewReport,
  validateReportQuery
} = require('../validators/workReportValidator');

const {
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
} = require('../controllers/workReportController');

// All routes require authentication
router.use(protect);

// Employee specific literal routes
router.post('/', authorize('employee'), validateCreateReport, createDraftHandler);
router.get('/my', authorize('employee'), validateReportQuery, getMyReportsHandler);
router.get('/my/today', authorize('employee'), getTodayReportHandler);

// Admin & Founder analytics / overview literal routes
router.get('/overview', authorize('admin', 'founder'), getOverviewHandler);
router.get('/missing', authorize('admin', 'founder'), getMissingReportsHandler);
router.get('/analytics', authorize('admin', 'founder'), getMonthlyAnalyticsHandler);
router.get('/analytics/employees', authorize('admin', 'founder'), getEmployeeAnalyticsHandler);

// Admin & Founder report list
router.get('/', authorize('admin', 'founder'), validateReportQuery, getAllReportsHandler);

// Parametric routes (ID based)
router.get('/:id', authorize('admin', 'founder', 'employee'), getReportByIdHandler);
router.put('/:id', authorize('employee'), validateUpdateReport, updateDraftHandler);
router.post('/:id/submit', authorize('employee'), validateSubmitReport, submitReportHandler);
router.post('/:id/attachments', authorize('employee'), uploadWorkReportFile, handleUploadError, addAttachmentHandler);
router.delete('/:id/attachments/:attachmentId', authorize('admin', 'founder', 'employee'), removeAttachmentHandler);
router.patch('/:id/review', authorize('admin', 'founder'), validateReviewReport, reviewReportHandler);

module.exports = router;
