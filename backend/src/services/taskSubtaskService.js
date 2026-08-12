const Task = require('../models/Task');
const User = require('../models/User');
const TaskHistory = require('../models/TaskHistory');

/**
 * Helper to recalculate parent task progress based on subtasks
 */
const syncParentTaskProgress = async (parentTaskId, currentUser) => {
  const subtasks = await Task.find({ parentTask: parentTaskId, isArchived: false });
  if (subtasks.length === 0) return;

  const totalProgress = subtasks.reduce((sum, st) => sum + (st.progress || 0), 0);
  const avgProgress = Math.round(totalProgress / subtasks.length);

  const parentTask = await Task.findById(parentTaskId);
  if (!parentTask) return;

  if (parentTask.progress !== avgProgress) {
    const oldProgress = parentTask.progress;
    parentTask.progress = avgProgress;

    if (avgProgress === 100 && parentTask.status === 'in_progress') {
      parentTask.status = 'in_review';
    } else if (avgProgress > 0 && parentTask.status === 'todo') {
      parentTask.status = 'in_progress';
    }

    await parentTask.save();

    await TaskHistory.create({
      task: parentTask._id,
      action: 'PROGRESS_CHANGED',
      performedBy: currentUser._id,
      previousValue: oldProgress,
      newValue: avgProgress,
      metadata: { source: 'subtask_auto_recalculation' }
    });
  }
};

/**
 * Helper to check for circular parent relationship
 */
const detectCircularParent = async (taskId, potentialParentId) => {
  if (taskId.toString() === potentialParentId.toString()) {
    return true;
  }
  let currentParentId = potentialParentId;
  while (currentParentId) {
    const parent = await Task.findById(currentParentId).select('parentTask');
    if (!parent || !parent.parentTask) break;
    if (parent.parentTask.toString() === taskId.toString()) {
      return true;
    }
    currentParentId = parent.parentTask;
  }
  return false;
};

/**
 * Get all subtasks for a parent task
 */
const getSubtasks = async (currentUser, parentTaskId) => {
  const parentTask = await Task.findById(parentTaskId);
  if (!parentTask) {
    const err = new Error('Parent task not found');
    err.statusCode = 404;
    throw err;
  }

  if (
    currentUser.role === 'employee' &&
    parentTask.assignedTo.toString() !== currentUser._id.toString()
  ) {
    const err = new Error('Not authorized to view subtasks for this task');
    err.statusCode = 403;
    throw err;
  }

  const subtasks = await Task.find({ parentTask: parentTaskId, isArchived: false })
    .populate('assignedTo', '_id name email role')
    .populate('assignedBy', '_id name email role')
    .sort({ createdAt: 1 });

  return subtasks;
};

/**
 * Create a subtask
 */
const createSubtask = async (currentUser, parentTaskId, subtaskData) => {
  if (!['admin', 'founder'].includes(currentUser.role)) {
    const err = new Error('Not authorized to create subtasks');
    err.statusCode = 403;
    throw err;
  }

  const parentTask = await Task.findById(parentTaskId);
  if (!parentTask) {
    const err = new Error('Parent task not found');
    err.statusCode = 404;
    throw err;
  }

  const { title, description, assignedTo, priority, dueDate } = subtaskData;

  const targetAssignee = assignedTo || parentTask.assignedTo;
  const userExists = await User.findById(targetAssignee);
  if (!userExists || !userExists.isActive) {
    const err = new Error('Subtask assignee does not exist or is inactive');
    err.statusCode = 404;
    throw err;
  }

  const subtask = await Task.create({
    title: title.trim(),
    description: description ? description.trim() : '',
    assignedTo: targetAssignee,
    assignedBy: currentUser._id,
    group: parentTask.group,
    parentTask: parentTaskId,
    priority: priority || 'medium',
    status: 'todo',
    progress: 0,
    dueDate: dueDate ? new Date(dueDate) : null
  });

  await TaskHistory.create({
    task: parentTaskId,
    action: 'SUBTASK_CREATED',
    performedBy: currentUser._id,
    newValue: { subtaskId: subtask._id, title: subtask.title }
  });

  await syncParentTaskProgress(parentTaskId, currentUser);

  return await Task.findById(subtask._id)
    .populate('assignedTo', '_id name email role')
    .populate('assignedBy', '_id name email role');
};

/**
 * Update subtask details
 */
const updateSubtask = async (currentUser, parentTaskId, subtaskId, updateData) => {
  if (!['admin', 'founder'].includes(currentUser.role)) {
    const err = new Error('Not authorized to edit subtask details');
    err.statusCode = 403;
    throw err;
  }

  const subtask = await Task.findOne({ _id: subtaskId, parentTask: parentTaskId });
  if (!subtask) {
    const err = new Error('Subtask not found');
    err.statusCode = 404;
    throw err;
  }

  if (updateData.parentTask) {
    const isCircular = await detectCircularParent(subtaskId, updateData.parentTask);
    if (isCircular) {
      const err = new Error('Circular parent relationship detected');
      err.statusCode = 400;
      throw err;
    }
  }

  const allowedFields = ['title', 'description', 'assignedTo', 'priority', 'dueDate'];
  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      subtask[field] = updateData[field];
    }
  }

  await subtask.save();

  await TaskHistory.create({
    task: parentTaskId,
    action: 'SUBTASK_UPDATED',
    performedBy: currentUser._id,
    newValue: { subtaskId, title: subtask.title }
  });

  return await Task.findById(subtask._id)
    .populate('assignedTo', '_id name email role')
    .populate('assignedBy', '_id name email role');
};

/**
 * Update subtask status/progress
 */
const updateSubtaskStatus = async (currentUser, parentTaskId, subtaskId, statusOrProgress) => {
  const subtask = await Task.findOne({ _id: subtaskId, parentTask: parentTaskId });
  if (!subtask) {
    const err = new Error('Subtask not found');
    err.statusCode = 404;
    throw err;
  }

  if (
    currentUser.role === 'employee' &&
    subtask.assignedTo.toString() !== currentUser._id.toString()
  ) {
    const err = new Error('Not authorized to update this subtask');
    err.statusCode = 403;
    throw err;
  }

  if (statusOrProgress.progress !== undefined) {
    const prog = parseInt(statusOrProgress.progress, 10);
    subtask.progress = prog;
    if (prog === 100) subtask.status = 'completed';
    else if (prog > 0 && subtask.status === 'todo') subtask.status = 'in_progress';
  }

  if (statusOrProgress.status !== undefined) {
    subtask.status = statusOrProgress.status;
    if (statusOrProgress.status === 'completed') {
      subtask.progress = 100;
    }
  }

  await subtask.save();

  await syncParentTaskProgress(parentTaskId, currentUser);

  return await Task.findById(subtask._id)
    .populate('assignedTo', '_id name email role')
    .populate('assignedBy', '_id name email role');
};

/**
 * Delete subtask
 */
const deleteSubtask = async (currentUser, parentTaskId, subtaskId) => {
  if (!['admin', 'founder'].includes(currentUser.role)) {
    const err = new Error('Not authorized to delete subtasks');
    err.statusCode = 403;
    throw err;
  }

  const subtask = await Task.findOne({ _id: subtaskId, parentTask: parentTaskId });
  if (!subtask) {
    const err = new Error('Subtask not found');
    err.statusCode = 404;
    throw err;
  }

  subtask.isArchived = true;
  await subtask.save();

  await TaskHistory.create({
    task: parentTaskId,
    action: 'SUBTASK_DELETED',
    performedBy: currentUser._id,
    previousValue: { subtaskId, title: subtask.title }
  });

  await syncParentTaskProgress(parentTaskId, currentUser);

  return { success: true, message: 'Subtask deleted successfully' };
};

module.exports = {
  getSubtasks,
  createSubtask,
  updateSubtask,
  updateSubtaskStatus,
  deleteSubtask
};
