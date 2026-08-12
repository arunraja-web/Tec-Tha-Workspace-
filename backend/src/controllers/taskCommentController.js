const { asyncHandler } = require('../middleware/errorMiddleware');
const { sendSuccess } = require('../utils/apiResponse');
const taskCommentService = require('../services/taskCommentService');

/**
 * @desc    Get comments for a task
 * @route   GET /api/tasks/:id/comments
 * @access  Private (Admin, Founder, Assigned Employee)
 */
const getComments = asyncHandler(async (req, res) => {
  const comments = await taskCommentService.getComments(req.user, req.params.id);
  return sendSuccess(res, 200, 'Comments retrieved successfully', comments);
});

/**
 * @desc    Add comment to a task
 * @route   POST /api/tasks/:id/comments
 * @access  Private (Admin, Founder, Assigned Employee)
 */
const addComment = asyncHandler(async (req, res) => {
  const comment = await taskCommentService.addComment(
    req.user,
    req.params.id,
    req.body.content
  );
  return sendSuccess(res, 201, 'Comment added successfully', comment);
});

/**
 * @desc    Update comment content
 * @route   PUT /api/tasks/:id/comments/:commentId
 * @access  Private (Comment Author, Admin, Founder)
 */
const updateComment = asyncHandler(async (req, res) => {
  const updatedComment = await taskCommentService.updateComment(
    req.user,
    req.params.id,
    req.params.commentId,
    req.body.content
  );
  return sendSuccess(res, 200, 'Comment updated successfully', updatedComment);
});

/**
 * @desc    Delete comment
 * @route   DELETE /api/tasks/:id/comments/:commentId
 * @access  Private (Comment Author, Admin, Founder)
 */
const deleteComment = asyncHandler(async (req, res) => {
  const result = await taskCommentService.deleteComment(
    req.user,
    req.params.id,
    req.params.commentId
  );
  return sendSuccess(res, 200, result.message);
});

module.exports = {
  getComments,
  addComment,
  updateComment,
  deleteComment
};
