const { asyncHandler } = require('../middleware/errorMiddleware');
const { sendSuccess } = require('../utils/apiResponse');
const taskService = require('../services/taskService');

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private (Admin, Founder)
 */
const createTask = asyncHandler(async (req, res) => {
  const task = await taskService.createTask(req.user, req.body);
  return sendSuccess(res, 201, 'Task created successfully', task);
});

/**
 * @desc    Get tasks list with search, filter, sort, pagination
 * @route   GET /api/tasks
 * @access  Private (Admin, Founder, Employee - scoped)
 */
const getTasks = asyncHandler(async (req, res) => {
  const result = await taskService.getTasks(req.user, req.query);
  return sendSuccess(res, 200, 'Tasks retrieved successfully', result);
});

/**
 * @desc    Get current employee's assigned tasks
 * @route   GET /api/tasks/my
 * @access  Private (Employee, Admin, Founder)
 */
const getMyTasks = asyncHandler(async (req, res) => {
  const result = await taskService.getMyTasks(req.user, req.query);
  return sendSuccess(res, 200, 'My tasks retrieved successfully', result);
});

/**
 * @desc    Get task details by ID
 * @route   GET /api/tasks/:id
 * @access  Private (Admin, Founder, Assigned Employee)
 */
const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.user, req.params.id);
  return sendSuccess(res, 200, 'Task details retrieved successfully', task);
});

/**
 * @desc    Update task details
 * @route   PUT /api/tasks/:id
 * @access  Private (Admin, Founder)
 */
const updateTask = asyncHandler(async (req, res) => {
  const updatedTask = await taskService.updateTask(req.user, req.params.id, req.body);
  return sendSuccess(res, 200, 'Task updated successfully', updatedTask);
});

/**
 * @desc    Reassign task to another employee
 * @route   PATCH /api/tasks/:id/assign
 * @access  Private (Admin, Founder)
 */
const assignTask = asyncHandler(async (req, res) => {
  const updatedTask = await taskService.assignTask(
    req.user,
    req.params.id,
    req.body.assignedTo
  );
  return sendSuccess(res, 200, 'Task reassigned successfully', updatedTask);
});

/**
 * @desc    Update task status
 * @route   PATCH /api/tasks/:id/status
 * @access  Private (Admin, Founder, Assigned Employee)
 */
const updateStatus = asyncHandler(async (req, res) => {
  const updatedTask = await taskService.updateStatus(
    req.user,
    req.params.id,
    req.body.status
  );
  return sendSuccess(res, 200, 'Task status updated successfully', updatedTask);
});

/**
 * @desc    Update task progress percentage
 * @route   PATCH /api/tasks/:id/progress
 * @access  Private (Admin, Founder, Assigned Employee)
 */
const updateProgress = asyncHandler(async (req, res) => {
  const updatedTask = await taskService.updateProgress(
    req.user,
    req.params.id,
    req.body.progress
  );
  return sendSuccess(res, 200, 'Task progress updated successfully', updatedTask);
});

/**
 * @desc    Complete task
 * @route   PATCH /api/tasks/:id/complete
 * @access  Private (Admin, Founder)
 */
const completeTask = asyncHandler(async (req, res) => {
  const task = await taskService.completeTask(req.user, req.params.id);
  return sendSuccess(res, 200, 'Task completed successfully', task);
});

/**
 * @desc    Reopen task
 * @route   PATCH /api/tasks/:id/reopen
 * @access  Private (Admin, Founder)
 */
const reopenTask = asyncHandler(async (req, res) => {
  const task = await taskService.reopenTask(req.user, req.params.id);
  return sendSuccess(res, 200, 'Task reopened successfully', task);
});

/**
 * @desc    Cancel task with reason
 * @route   PATCH /api/tasks/:id/cancel
 * @access  Private (Admin, Founder)
 */
const cancelTask = asyncHandler(async (req, res) => {
  const task = await taskService.cancelTask(
    req.user,
    req.params.id,
    req.body.reason
  );
  return sendSuccess(res, 200, 'Task cancelled successfully', task);
});

/**
 * @desc    Archive task
 * @route   PATCH /api/tasks/:id/archive
 * @access  Private (Admin, Founder)
 */
const archiveTask = asyncHandler(async (req, res) => {
  const task = await taskService.archiveTask(req.user, req.params.id);
  return sendSuccess(res, 200, 'Task archived successfully', task);
});

/**
 * @desc    Restore task
 * @route   PATCH /api/tasks/:id/restore
 * @access  Private (Admin, Founder)
 */
const restoreTask = asyncHandler(async (req, res) => {
  const task = await taskService.restoreTask(req.user, req.params.id);
  return sendSuccess(res, 200, 'Task restored successfully', task);
});

/**
 * @desc    Soft delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private (Admin)
 */
const deleteTask = asyncHandler(async (req, res) => {
  const result = await taskService.deleteTask(req.user, req.params.id);
  return sendSuccess(res, 200, result.message);
});

/**
 * @desc    Duplicate existing task
 * @route   POST /api/tasks/:id/duplicate
 * @access  Private (Admin, Founder)
 */
const duplicateTask = asyncHandler(async (req, res) => {
  const task = await taskService.duplicateTask(req.user, req.params.id);
  return sendSuccess(res, 201, 'Task duplicated successfully', task);
});

/**
 * @desc    Bulk create tasks
 * @route   POST /api/tasks/bulk
 * @access  Private (Admin, Founder)
 */
const bulkCreateTasks = asyncHandler(async (req, res) => {
  const result = await taskService.bulkCreateTasks(req.user, req.body.tasks);
  return sendSuccess(res, 201, 'Bulk task creation processed', result);
});

/**
 * @desc    Bulk assign tasks to an employee
 * @route   PATCH /api/tasks/bulk/assign
 * @access  Private (Admin, Founder)
 */
const bulkAssignTasks = asyncHandler(async (req, res) => {
  const result = await taskService.bulkAssignTasks(
    req.user,
    req.body.taskIds,
    req.body.assignedTo
  );
  return sendSuccess(res, 200, 'Bulk task assignment completed', result);
});

/**
 * @desc    Get audit history of a task
 * @route   GET /api/tasks/:id/history
 * @access  Private (Admin, Founder, Assigned Employee)
 */
const getTaskHistory = asyncHandler(async (req, res) => {
  const history = await taskService.getTaskHistory(req.user, req.params.id);
  return sendSuccess(res, 200, 'Task history retrieved successfully', history);
});

module.exports = {
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
};
