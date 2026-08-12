const { asyncHandler } = require('../middleware/errorMiddleware');
const { sendSuccess } = require('../utils/apiResponse');
const taskSubtaskService = require('../services/taskSubtaskService');

/**
 * @desc    Get all subtasks for a parent task
 * @route   GET /api/tasks/:id/subtasks
 * @access  Private (Admin, Founder, Assigned Employee)
 */
const getSubtasks = asyncHandler(async (req, res) => {
  const subtasks = await taskSubtaskService.getSubtasks(req.user, req.params.id);
  return sendSuccess(res, 200, 'Subtasks retrieved successfully', subtasks);
});

/**
 * @desc    Create a subtask
 * @route   POST /api/tasks/:id/subtasks
 * @access  Private (Admin, Founder)
 */
const createSubtask = asyncHandler(async (req, res) => {
  const subtask = await taskSubtaskService.createSubtask(
    req.user,
    req.params.id,
    req.body
  );
  return sendSuccess(res, 201, 'Subtask created successfully', subtask);
});

/**
 * @desc    Update subtask details
 * @route   PUT /api/tasks/:id/subtasks/:subtaskId
 * @access  Private (Admin, Founder)
 */
const updateSubtask = asyncHandler(async (req, res) => {
  const updatedSubtask = await taskSubtaskService.updateSubtask(
    req.user,
    req.params.id,
    req.params.subtaskId,
    req.body
  );
  return sendSuccess(res, 200, 'Subtask updated successfully', updatedSubtask);
});

/**
 * @desc    Update subtask status or progress
 * @route   PATCH /api/tasks/:id/subtasks/:subtaskId/status
 * @access  Private (Admin, Founder, Assigned Employee)
 */
const updateSubtaskStatus = asyncHandler(async (req, res) => {
  const updatedSubtask = await taskSubtaskService.updateSubtaskStatus(
    req.user,
    req.params.id,
    req.params.subtaskId,
    req.body
  );
  return sendSuccess(res, 200, 'Subtask status updated successfully', updatedSubtask);
});

/**
 * @desc    Delete subtask
 * @route   DELETE /api/tasks/:id/subtasks/:subtaskId
 * @access  Private (Admin, Founder)
 */
const deleteSubtask = asyncHandler(async (req, res) => {
  const result = await taskSubtaskService.deleteSubtask(
    req.user,
    req.params.id,
    req.params.subtaskId
  );
  return sendSuccess(res, 200, result.message);
});

module.exports = {
  getSubtasks,
  createSubtask,
  updateSubtask,
  updateSubtaskStatus,
  deleteSubtask
};
