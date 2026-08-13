const mongoose = require('mongoose');
const Task = require('../models/Task');
const User = require('../models/User');
const Group = require('../models/Group');
const TaskHistory = require('../models/TaskHistory');
const ActivityLog = require('../models/ActivityLog');
const {
  notifyTaskAssigned,
  notifyTaskReassigned,
  notifyTaskStatusChanged,
  notifyTaskCancelled,
  notifyTaskReopened
} = require('./taskNotificationService');

/**
 * Execute multi-document database operation in transaction (with standalone fallback)
 */
const executeInTransaction = async (operation) => {
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const result = await operation(session);
    await session.commitTransaction();
    session.endSession();
    return result;
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
        session.endSession();
      } catch (e) {
        // Ignore session abort error if non-replica set
      }
    }
    if (
      error.message &&
      (error.message.includes('Transaction numbers are only allowed') ||
        error.message.includes('replica set'))
    ) {
      return await operation(null);
    }
    throw error;
  }
};

/**
 * Helper to check if employee has access to a task (assigned directly or member of assigned group)
 */
const canEmployeeAccessTask = async (currentUser, task) => {
  if (!task) return false;
  if (['admin', 'founder'].includes(currentUser.role)) return true;

  const assignedToId = task.assignedTo?._id
    ? task.assignedTo._id.toString()
    : task.assignedTo
    ? task.assignedTo.toString()
    : null;

  if (assignedToId && assignedToId === currentUser._id.toString()) {
    return true;
  }

  if (task.group) {
    const groupId = task.group._id ? task.group._id : task.group;
    const isMember = await Group.exists({
      _id: groupId,
      members: currentUser._id,
      isActive: true
    });
    if (isMember) return true;
  }

  return false;
};

/**
 * Create a new task (Admin or Founder only)
 */
const createTask = async (currentUser, taskData) => {
  if (!['admin', 'founder'].includes(currentUser.role)) {
    const err = new Error('Not authorized to create tasks');
    err.statusCode = 403;
    throw err;
  }

  const {
    title,
    description,
    assignedTo,
    group,
    priority,
    startDate,
    dueDate,
    isRecurring,
    recurrence
  } = taskData;

  if (!assignedTo && !group) {
    const err = new Error('Task must be assigned to either an employee or a group');
    err.statusCode = 400;
    throw err;
  }

  // 1. Verify Assigned Employee if provided
  let targetEmployee = null;
  if (assignedTo) {
    targetEmployee = await User.findById(assignedTo);
    if (!targetEmployee || !targetEmployee.isActive) {
      const err = new Error('Assigned user does not exist or is inactive');
      err.statusCode = 404;
      throw err;
    }
  }

  // 2. Verify Group if provided
  let targetGroup = null;
  if (group) {
    targetGroup = await Group.findById(group);
    if (!targetGroup || !targetGroup.isActive) {
      const err = new Error('Specified group does not exist or is inactive');
      err.statusCode = 404;
      throw err;
    }

    if (assignedTo) {
      const isMember = targetGroup.members.some(
        (mId) => mId.toString() === assignedTo.toString()
      );
      if (!isMember) {
        const err = new Error('Assigned employee is not a member of the specified group');
        err.statusCode = 400;
        throw err;
      }
    }
  }

  // 3. Create Task within transaction
  const createdTask = await executeInTransaction(async (session) => {
    const opts = session ? { session } : {};

    const [newTask] = await Task.create(
      [
        {
          title: title.trim(),
          description: description ? description.trim() : '',
          assignedTo: assignedTo || null,
          assignedBy: currentUser._id,
          group: group || null,
          priority: priority || 'medium',
          status: 'todo',
          progress: 0,
          startDate: startDate ? new Date(startDate) : null,
          dueDate: dueDate ? new Date(dueDate) : null,
          isRecurring: Boolean(isRecurring),
          recurrence: recurrence || { enabled: false }
        }
      ],
      opts
    );

    // Record Task History
    await TaskHistory.create(
      [
        {
          task: newTask._id,
          action: 'TASK_CREATED',
          performedBy: currentUser._id,
          newValue: { title: newTask.title, assignedTo: newTask.assignedTo, priority: newTask.priority }
        }
      ],
      opts
    );

    // Record Activity Log
    const targetDesc = targetEmployee
      ? targetEmployee.name
      : targetGroup
      ? `Group: ${targetGroup.name}`
      : 'Group Members';

    await ActivityLog.create(
      [
        {
          performedBy: currentUser._id,
          targetUser: assignedTo || null,
          group: group || null,
          action: 'TASK_CREATED',
          description: `Created task: "${newTask.title}" for ${targetDesc}`
        }
      ],
      opts
    );

    return newTask;
  });

  // Dispatch Notification
  await notifyTaskAssigned(createdTask, targetEmployee, currentUser);

  // Return populated task
  return await Task.findById(createdTask._id)
    .populate('assignedTo', '_id name email role')
    .populate('assignedBy', '_id name email role')
    .populate('group', '_id name');
};

/**
 * Get all tasks with search, filter, sorting, pagination
 */
const getTasks = async (currentUser, queryParams) => {
  const {
    status,
    priority,
    assignedTo,
    assignedBy,
    group,
    overdue,
    isArchived,
    startDate,
    dueDate,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 20
  } = queryParams;

  const filter = {};

  // Role scoping: Employee receives their directly assigned tasks AND group tasks
  if (currentUser.role === 'employee') {
    const userGroups = await Group.find({ members: currentUser._id, isActive: true }).select('_id');
    const userGroupIds = userGroups.map((g) => g._id);

    filter.$or = [
      { assignedTo: currentUser._id },
      { group: { $in: userGroupIds } }
    ];
  } else if (assignedTo) {
    filter.assignedTo = assignedTo;
  }

  if (assignedBy) filter.assignedBy = assignedBy;
  if (group) filter.group = group;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  // Archival filter (default false)
  if (isArchived !== undefined) {
    filter.isArchived = String(isArchived) === 'true';
  } else {
    filter.isArchived = false;
  }

  // Overdue filter
  if (String(overdue) === 'true') {
    filter.dueDate = { $lt: new Date() };
    filter.status = { $nin: ['completed', 'cancelled'] };
  }

  // Date range filters
  if (startDate) {
    filter.startDate = { $gte: new Date(startDate) };
  }
  if (dueDate && String(overdue) !== 'true') {
    filter.dueDate = { $lte: new Date(dueDate) };
  }

  // Search filter (title & description)
  if (search && search.trim()) {
    const searchCondition = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } }
    ];
    if (filter.$or) {
      filter.$and = [
        { $or: filter.$or },
        { $or: searchCondition }
      ];
      delete filter.$or;
    } else {
      filter.$or = searchCondition;
    }
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
  const skip = (pageNum - 1) * limitNum;

  const sortOptions = {};
  const validSortFields = ['createdAt', 'dueDate', 'priority', 'updatedAt', 'progress'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
  sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

  const [tasks, totalTasks] = await Promise.all([
    Task.find(filter)
      .populate('assignedTo', '_id name email role')
      .populate('assignedBy', '_id name email role')
      .populate('group', '_id name')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum),
    Task.countDocuments(filter)
  ]);

  return {
    tasks,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalTasks,
      totalPages: Math.ceil(totalTasks / limitNum) || 1
    }
  };
};

/**
 * Get current employee's assigned tasks
 */
const getMyTasks = async (currentUser, queryParams) => {
  return await getTasks(currentUser, queryParams);
};

/**
 * Get task by ID with authorization verification
 */
const getTaskById = async (currentUser, taskId) => {
  const task = await Task.findById(taskId)
    .populate('assignedTo', '_id name email role')
    .populate('assignedBy', '_id name email role')
    .populate('group', '_id name')
    .populate('parentTask', '_id title status progress');

  if (!task) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }

  const hasAccess = await canEmployeeAccessTask(currentUser, task);
  if (!hasAccess) {
    const err = new Error('You are not authorized to view this task');
    err.statusCode = 403;
    throw err;
  }

  return task;
};

/**
 * Update task details (Admin/Founder only)
 */
const updateTask = async (currentUser, taskId, updateData) => {
  if (!['admin', 'founder'].includes(currentUser.role)) {
    const err = new Error('Not authorized to update task details');
    err.statusCode = 403;
    throw err;
  }

  const task = await Task.findById(taskId);
  if (!task) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }

  const allowedFields = ['title', 'description', 'assignedTo', 'group', 'priority', 'startDate', 'dueDate'];
  const previousValue = {};
  const newValue = {};

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      previousValue[field] = task[field];
      if (field === 'title' || field === 'description') {
        task[field] = updateData[field] ? updateData[field].trim() : '';
      } else {
        task[field] = updateData[field];
      }
      newValue[field] = task[field];
    }
  }

  // If group is updated, check membership
  if (updateData.group && updateData.assignedTo) {
    const targetGroup = await Group.findById(updateData.group);
    if (targetGroup && targetGroup.isActive) {
      const isMember = targetGroup.members.some(
        (mId) => mId.toString() === updateData.assignedTo.toString()
      );
      if (!isMember) {
        const err = new Error('Assigned employee is not a member of the specified group');
        err.statusCode = 400;
        throw err;
      }
    }
  }

  await task.save();

  // Log Task History & Activity
  await TaskHistory.create({
    task: task._id,
    action: 'TASK_UPDATED',
    performedBy: currentUser._id,
    previousValue,
    newValue
  });

  await ActivityLog.create({
    performedBy: currentUser._id,
    targetUser: task.assignedTo,
    group: task.group,
    action: 'TASK_UPDATED',
    description: `Updated task details for "${task.title}"`
  });

  return await getTaskById(currentUser, task._id);
};

/**
 * Dedicated task reassignment endpoint (Admin/Founder only)
 */
const assignTask = async (currentUser, taskId, newAssignedToId) => {
  if (!['admin', 'founder'].includes(currentUser.role)) {
    const err = new Error('Not authorized to reassign tasks');
    err.statusCode = 403;
    throw err;
  }

  const task = await Task.findById(taskId);
  if (!task) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }

  const newEmployee = await User.findById(newAssignedToId);
  if (!newEmployee || !newEmployee.isActive) {
    const err = new Error('Target employee does not exist or is inactive');
    err.statusCode = 404;
    throw err;
  }

  const oldEmployeeId = task.assignedTo;
  task.assignedTo = newAssignedToId;
  await task.save();

  await TaskHistory.create({
    task: task._id,
    action: 'TASK_REASSIGNED',
    performedBy: currentUser._id,
    previousValue: oldEmployeeId,
    newValue: newAssignedToId
  });

  await ActivityLog.create({
    performedBy: currentUser._id,
    targetUser: newAssignedToId,
    action: 'TASK_REASSIGNED',
    description: `Reassigned task "${task.title}" to ${newEmployee.name}`
  });

  await notifyTaskReassigned(task, newEmployee, oldEmployeeId, currentUser);

  return await getTaskById(currentUser, task._id);
};

/**
 * Update task status with role-based workflow rules
 */
const updateStatus = async (currentUser, taskId, newStatus) => {
  const task = await Task.findById(taskId);
  if (!task) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }

  // Permission Check
  if (currentUser.role === 'employee') {
    const hasAccess = await canEmployeeAccessTask(currentUser, task);
    if (!hasAccess) {
      const err = new Error('Not authorized to update status for this task');
      err.statusCode = 403;
      throw err;
    }

    // Employee Allowed Workflow: todo -> in_progress, in_progress -> in_review, in_review -> in_progress
    const current = task.status;
    const isAllowed =
      (current === 'todo' && newStatus === 'in_progress') ||
      (current === 'in_progress' && newStatus === 'in_review') ||
      (current === 'in_review' && newStatus === 'in_progress');

    if (!isAllowed) {
      const err = new Error(`Employees are not permitted to transition status from ${current} to ${newStatus}`);
      err.statusCode = 403;
      throw err;
    }
  }

  const oldStatus = task.status;
  task.status = newStatus;

  // Handle completion auto-updates
  if (newStatus === 'completed') {
    task.progress = 100;
    task.completedAt = new Date();
  } else if (oldStatus === 'completed' && newStatus !== 'completed') {
    task.completedAt = null;
  }

  await task.save();

  await TaskHistory.create({
    task: task._id,
    action: 'STATUS_CHANGED',
    performedBy: currentUser._id,
    previousValue: oldStatus,
    newValue: newStatus
  });

  await ActivityLog.create({
    performedBy: currentUser._id,
    targetUser: task.assignedTo,
    action: 'TASK_STATUS_CHANGED',
    description: `Status of task "${task.title}" changed from ${oldStatus} to ${newStatus}`
  });

  await notifyTaskStatusChanged(task, oldStatus, newStatus, currentUser);

  return await getTaskById(currentUser, task._id);
};

/**
 * Update task progress percentage (0 - 100)
 */
const updateProgress = async (currentUser, taskId, progressVal) => {
  const task = await Task.findById(taskId);
  if (!task) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }

  if (currentUser.role === 'employee') {
    const hasAccess = await canEmployeeAccessTask(currentUser, task);
    if (!hasAccess) {
      const err = new Error('Not authorized to update progress for this task');
      err.statusCode = 403;
      throw err;
    }
  }

  const numProgress = parseInt(progressVal, 10);
  if (isNaN(numProgress) || numProgress < 0 || numProgress > 100) {
    const err = new Error('Progress must be between 0 and 100');
    err.statusCode = 400;
    throw err;
  }

  const oldProgress = task.progress;
  const oldStatus = task.status;

  task.progress = numProgress;

  // Auto transition to in_review if employee reaches 100% in_progress
  if (numProgress === 100 && task.status === 'in_progress') {
    task.status = 'in_review';
  } else if (numProgress > 0 && task.status === 'todo') {
    task.status = 'in_progress';
  }

  await task.save();

  await TaskHistory.create({
    task: task._id,
    action: 'PROGRESS_CHANGED',
    performedBy: currentUser._id,
    previousValue: oldProgress,
    newValue: numProgress
  });

  if (oldStatus !== task.status) {
    await notifyTaskStatusChanged(task, oldStatus, task.status, currentUser);
  }

  return await getTaskById(currentUser, task._id);
};

/**
 * Complete Task (Admin / Founder only)
 */
const completeTask = async (currentUser, taskId) => {
  if (!['admin', 'founder'].includes(currentUser.role)) {
    const err = new Error('Not authorized to complete tasks');
    err.statusCode = 403;
    throw err;
  }
  return await updateStatus(currentUser, taskId, 'completed');
};

/**
 * Reopen Task (Admin / Founder only)
 */
const reopenTask = async (currentUser, taskId) => {
  if (!['admin', 'founder'].includes(currentUser.role)) {
    const err = new Error('Not authorized to reopen tasks');
    err.statusCode = 403;
    throw err;
  }

  const task = await Task.findById(taskId);
  if (!task) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }

  const oldStatus = task.status;
  task.status = 'in_progress';
  task.completedAt = null;
  await task.save();

  await TaskHistory.create({
    task: task._id,
    action: 'TASK_REOPENED',
    performedBy: currentUser._id,
    previousValue: oldStatus,
    newValue: 'in_progress'
  });

  await ActivityLog.create({
    performedBy: currentUser._id,
    targetUser: task.assignedTo,
    action: 'TASK_REOPENED',
    description: `Reopened task "${task.title}"`
  });

  await notifyTaskReopened(task, currentUser);

  return await getTaskById(currentUser, task._id);
};

/**
 * Cancel Task (Admin / Founder only with required reason)
 */
const cancelTask = async (currentUser, taskId, reason) => {
  if (!['admin', 'founder'].includes(currentUser.role)) {
    const err = new Error('Not authorized to cancel tasks');
    err.statusCode = 403;
    throw err;
  }

  if (!reason || !reason.trim()) {
    const err = new Error('Cancellation reason is required');
    err.statusCode = 400;
    throw err;
  }

  const task = await Task.findById(taskId);
  if (!task) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }

  const oldStatus = task.status;
  task.status = 'cancelled';
  task.cancelledAt = new Date();
  task.cancelledBy = currentUser._id;
  task.cancellationReason = reason.trim();

  await task.save();

  await TaskHistory.create({
    task: task._id,
    action: 'TASK_CANCELLED',
    performedBy: currentUser._id,
    previousValue: oldStatus,
    newValue: 'cancelled',
    metadata: { reason: task.cancellationReason }
  });

  await ActivityLog.create({
    performedBy: currentUser._id,
    targetUser: task.assignedTo,
    action: 'TASK_CANCELLED',
    description: `Cancelled task "${task.title}". Reason: ${task.cancellationReason}`
  });

  await notifyTaskCancelled(task, currentUser, task.cancellationReason);

  return await getTaskById(currentUser, task._id);
};

/**
 * Archive Task (Admin / Founder only)
 */
const archiveTask = async (currentUser, taskId) => {
  if (!['admin', 'founder'].includes(currentUser.role)) {
    const err = new Error('Not authorized to archive tasks');
    err.statusCode = 403;
    throw err;
  }

  const task = await Task.findById(taskId);
  if (!task) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }

  task.isArchived = true;
  task.archivedAt = new Date();
  task.archivedBy = currentUser._id;
  await task.save();

  await TaskHistory.create({
    task: task._id,
    action: 'TASK_ARCHIVED',
    performedBy: currentUser._id
  });

  await ActivityLog.create({
    performedBy: currentUser._id,
    action: 'TASK_ARCHIVED',
    description: `Archived task "${task.title}"`
  });

  return await getTaskById(currentUser, task._id);
};

/**
 * Restore Task (Admin / Founder only)
 */
const restoreTask = async (currentUser, taskId) => {
  if (!['admin', 'founder'].includes(currentUser.role)) {
    const err = new Error('Not authorized to restore tasks');
    err.statusCode = 403;
    throw err;
  }

  const task = await Task.findById(taskId);
  if (!task) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }

  task.isArchived = false;
  task.archivedAt = null;
  task.archivedBy = null;
  await task.save();

  await TaskHistory.create({
    task: task._id,
    action: 'TASK_RESTORED',
    performedBy: currentUser._id
  });

  await ActivityLog.create({
    performedBy: currentUser._id,
    action: 'TASK_RESTORED',
    description: `Restored archived task "${task.title}"`
  });

  return await getTaskById(currentUser, task._id);
};

/**
 * Soft delete task (Admin only)
 */
const deleteTask = async (currentUser, taskId) => {
  if (currentUser.role !== 'admin') {
    const err = new Error('Only admins are authorized to delete tasks');
    err.statusCode = 403;
    throw err;
  }

  const task = await Task.findById(taskId);
  if (!task) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }

  task.isArchived = true;
  task.archivedAt = new Date();
  task.archivedBy = currentUser._id;
  await task.save();

  await ActivityLog.create({
    performedBy: currentUser._id,
    action: 'TASK_DELETED',
    description: `Soft deleted task "${task.title}"`
  });

  return { success: true, message: 'Task deleted successfully' };
};

/**
 * Duplicate task (Admin / Founder only)
 */
const duplicateTask = async (currentUser, taskId) => {
  if (!['admin', 'founder'].includes(currentUser.role)) {
    const err = new Error('Not authorized to duplicate tasks');
    err.statusCode = 403;
    throw err;
  }

  const sourceTask = await Task.findById(taskId);
  if (!sourceTask) {
    const err = new Error('Source task not found');
    err.statusCode = 404;
    throw err;
  }

  const newTaskData = {
    title: `${sourceTask.title} (Copy)`,
    description: sourceTask.description,
    assignedTo: sourceTask.assignedTo,
    group: sourceTask.group,
    priority: sourceTask.priority,
    startDate: sourceTask.startDate,
    dueDate: sourceTask.dueDate
  };

  return await createTask(currentUser, newTaskData);
};

/**
 * Bulk create tasks (Admin / Founder only)
 */
const bulkCreateTasks = async (currentUser, tasksArray) => {
  if (!['admin', 'founder'].includes(currentUser.role)) {
    const err = new Error('Not authorized to bulk create tasks');
    err.statusCode = 403;
    throw err;
  }

  if (!Array.isArray(tasksArray) || tasksArray.length === 0) {
    const err = new Error('Tasks array must be a non-empty list');
    err.statusCode = 400;
    throw err;
  }

  const created = [];
  const failed = [];
  const errors = [];

  for (let i = 0; i < tasksArray.length; i++) {
    try {
      const task = await createTask(currentUser, tasksArray[i]);
      created.push(task);
    } catch (err) {
      failed.push(tasksArray[i]);
      errors.push({ index: i, error: err.message });
    }
  }

  return { created, failed, errors };
};

/**
 * Bulk assign tasks (Admin / Founder only)
 */
const bulkAssignTasks = async (currentUser, taskIds, targetEmployeeId) => {
  if (!['admin', 'founder'].includes(currentUser.role)) {
    const err = new Error('Not authorized to bulk assign tasks');
    err.statusCode = 403;
    throw err;
  }

  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    const err = new Error('taskIds array is required');
    err.statusCode = 400;
    throw err;
  }

  const updatedTasks = [];
  for (const tId of taskIds) {
    const updated = await assignTask(currentUser, tId, targetEmployeeId);
    updatedTasks.push(updated);
  }

  return updatedTasks;
};

/**
 * Get Task Audit History
 */
const getTaskHistory = async (currentUser, taskId) => {
  // Check task exists and authorization
  await getTaskById(currentUser, taskId);

  const history = await TaskHistory.find({ task: taskId })
    .populate('performedBy', '_id name email role')
    .sort({ createdAt: -1 });

  return history;
};

module.exports = {
  canEmployeeAccessTask,
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
