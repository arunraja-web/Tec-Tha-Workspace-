const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadTaskFile, handleUploadError } = require('../middleware/uploadMiddleware');

const {
  createTask,
  getTasks,
  getMyTasks,
  getTaskById,
  updateTask,
  assignTask,
  updateStatus,
  updateProgress,
  completeTask,
  reopenTask,
  cancelTask,
  archiveTask,
  restoreTask,
  deleteTask,
  duplicateTask,
  bulkCreateTasks,
  bulkAssignTasks,
  getTaskHistory
} = require('../controllers/taskController');

const {
  getComments,
  addComment,
  updateComment,
  deleteComment
} = require('../controllers/taskCommentController');

const {
  uploadAttachment,
  deleteAttachment
} = require('../controllers/taskAttachmentController');

const {
  getSubtasks,
  createSubtask,
  updateSubtask,
  updateSubtaskStatus,
  deleteSubtask
} = require('../controllers/taskSubtaskController');

const {
  getCompanyAnalytics,
  getEmployeeAnalytics,
  getMyAnalytics
} = require('../controllers/taskAnalyticsController');

const {
  validateCreateTask,
  validateUpdateTask,
  validateAssignTask,
  validateStatusUpdate,
  validateProgressUpdate,
  validateCancelTask,
  validateComment,
  validateSubtask,
  validateAnalyticsQuery
} = require('../validators/taskValidator');

const router = express.Router();

// Apply auth protection to all task routes
router.use(protect);

// ----------------------------------------------------
// ANALYTICS ROUTES (Static routes BEFORE :id routes)
// ----------------------------------------------------
router.get('/analytics', authorize('admin', 'founder'), validateAnalyticsQuery, getCompanyAnalytics);
router.get('/analytics/employees', authorize('admin', 'founder'), validateAnalyticsQuery, getEmployeeAnalytics);
router.get('/my/analytics', validateAnalyticsQuery, getMyAnalytics);

// ----------------------------------------------------
// TASK LISTING & BULK ROUTES
// ----------------------------------------------------
router.get('/my', getMyTasks);
router.get('/', getTasks);
router.post('/', authorize('admin', 'founder'), validateCreateTask, createTask);
router.post('/bulk', authorize('admin', 'founder'), bulkCreateTasks);
router.patch('/bulk/assign', authorize('admin', 'founder'), bulkAssignTasks);

// ----------------------------------------------------
// SINGLE TASK ACTIONS & DETAILS
// ----------------------------------------------------
router.get('/:id', getTaskById);
router.put('/:id', authorize('admin', 'founder'), validateUpdateTask, updateTask);
router.patch('/:id/assign', authorize('admin', 'founder'), validateAssignTask, assignTask);
router.patch('/:id/status', validateStatusUpdate, updateStatus);
router.patch('/:id/progress', validateProgressUpdate, updateProgress);
router.patch('/:id/complete', authorize('admin', 'founder'), completeTask);
router.patch('/:id/reopen', authorize('admin', 'founder'), reopenTask);
router.patch('/:id/cancel', authorize('admin', 'founder'), validateCancelTask, cancelTask);
router.patch('/:id/archive', authorize('admin', 'founder'), archiveTask);
router.patch('/:id/restore', authorize('admin', 'founder'), restoreTask);
router.delete('/:id', authorize('admin'), deleteTask);
router.post('/:id/duplicate', authorize('admin', 'founder'), duplicateTask);
router.get('/:id/history', getTaskHistory);

// ----------------------------------------------------
// TASK COMMENTS
// ----------------------------------------------------
router.get('/:id/comments', getComments);
router.post('/:id/comments', validateComment, addComment);
router.put('/:id/comments/:commentId', validateComment, updateComment);
router.delete('/:id/comments/:commentId', deleteComment);

// ----------------------------------------------------
// TASK ATTACHMENTS
// ----------------------------------------------------
router.post('/:id/attachments', uploadTaskFile, handleUploadError, uploadAttachment);
router.delete('/:id/attachments/:attachmentId', deleteAttachment);

// ----------------------------------------------------
// SUBTASKS
// ----------------------------------------------------
router.get('/:id/subtasks', getSubtasks);
router.post('/:id/subtasks', authorize('admin', 'founder'), validateSubtask, createSubtask);
router.put('/:id/subtasks/:subtaskId', authorize('admin', 'founder'), updateSubtask);
router.patch('/:id/subtasks/:subtaskId/status', updateSubtaskStatus);
router.delete('/:id/subtasks/:subtaskId', authorize('admin', 'founder'), deleteSubtask);

module.exports = router;
