const Task = require('../models/Task');
const TaskComment = require('../models/TaskComment');
const TaskHistory = require('../models/TaskHistory');
const ActivityLog = require('../models/ActivityLog');
const { notifyTaskCommentAdded } = require('./taskNotificationService');
const { canEmployeeAccessTask } = require('./taskService');

/**
 * Get comments for a task
 */
const getComments = async (currentUser, taskId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }

  // Authorization check
  const hasAccess = await canEmployeeAccessTask(currentUser, task);
  if (!hasAccess) {
    const err = new Error('Not authorized to access comments for this task');
    err.statusCode = 403;
    throw err;
  }

  const comments = await TaskComment.find({ task: taskId })
    .populate('author', '_id name email role')
    .sort({ createdAt: 1 });

  return comments;
};

/**
 * Add a comment to a task
 */
const addComment = async (currentUser, taskId, content) => {
  const task = await Task.findById(taskId);
  if (!task) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }

  // Employee can only comment on assigned tasks
  const hasAccess = await canEmployeeAccessTask(currentUser, task);
  if (!hasAccess) {
    const err = new Error('Not authorized to comment on this task');
    err.statusCode = 403;
    throw err;
  }

  const comment = await TaskComment.create({
    task: taskId,
    author: currentUser._id,
    content: content.trim()
  });

  await TaskHistory.create({
    task: taskId,
    action: 'COMMENT_ADDED',
    performedBy: currentUser._id,
    newValue: { commentId: comment._id, content: comment.content }
  });

  await ActivityLog.create({
    performedBy: currentUser._id,
    action: 'TASK_COMMENT_ADDED',
    description: `Added comment on task "${task.title}"`
  });

  await notifyTaskCommentAdded(task, comment, currentUser);

  return await TaskComment.findById(comment._id).populate('author', '_id name email role');
};

/**
 * Update comment content
 */
const updateComment = async (currentUser, taskId, commentId, content) => {
  const comment = await TaskComment.findOne({ _id: commentId, task: taskId });
  if (!comment) {
    const err = new Error('Comment not found');
    err.statusCode = 404;
    throw err;
  }

  // Permissions: Author or Admin/Founder
  const isAuthor = comment.author.toString() === currentUser._id.toString();
  const isManagement = ['admin', 'founder'].includes(currentUser.role);

  if (!isAuthor && !isManagement) {
    const err = new Error('Not authorized to edit another user\'s comment');
    err.statusCode = 403;
    throw err;
  }

  const oldContent = comment.content;
  comment.content = content.trim();
  await comment.save();

  await TaskHistory.create({
    task: taskId,
    action: 'COMMENT_UPDATED',
    performedBy: currentUser._id,
    previousValue: oldContent,
    newValue: comment.content
  });

  return await TaskComment.findById(comment._id).populate('author', '_id name email role');
};

/**
 * Delete comment
 */
const deleteComment = async (currentUser, taskId, commentId) => {
  const comment = await TaskComment.findOne({ _id: commentId, task: taskId });
  if (!comment) {
    const err = new Error('Comment not found');
    err.statusCode = 404;
    throw err;
  }

  const isAuthor = comment.author.toString() === currentUser._id.toString();
  const isManagement = ['admin', 'founder'].includes(currentUser.role);

  if (!isAuthor && !isManagement) {
    const err = new Error('Not authorized to delete another user\'s comment');
    err.statusCode = 403;
    throw err;
  }

  await TaskComment.deleteOne({ _id: commentId });

  await TaskHistory.create({
    task: taskId,
    action: 'COMMENT_DELETED',
    performedBy: currentUser._id,
    previousValue: comment.content
  });

  return { success: true, message: 'Comment deleted successfully' };
};

module.exports = {
  getComments,
  addComment,
  updateComment,
  deleteComment
};
