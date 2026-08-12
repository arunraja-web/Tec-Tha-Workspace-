const { createNotification, createBulkNotifications } = require('./notificationService');

/**
 * Task Notification Service helper
 */
const notifyTaskAssigned = async (task, assignedToUser, assignerUser) => {
  if (!assignedToUser || !assignedToUser._id) return;
  if (assignedToUser._id.toString() === assignerUser._id.toString()) return;

  await createNotification({
    recipient: assignedToUser._id,
    title: 'New Task Assigned',
    message: `${assignerUser.name} assigned you a task: "${task.title}"`,
    type: 'TASK_ASSIGNED',
    group: task.group || null
  });
};

const notifyTaskReassigned = async (task, newEmployee, oldEmployeeId, assignerUser) => {
  if (newEmployee && newEmployee._id && newEmployee._id.toString() !== assignerUser._id.toString()) {
    await createNotification({
      recipient: newEmployee._id,
      title: 'Task Reassigned to You',
      message: `${assignerUser.name} assigned you the task: "${task.title}"`,
      type: 'TASK_ASSIGNED',
      group: task.group || null
    });
  }

  if (oldEmployeeId && oldEmployeeId.toString() !== assignerUser._id.toString() && (!newEmployee || oldEmployeeId.toString() !== newEmployee._id.toString())) {
    await createNotification({
      recipient: oldEmployeeId,
      title: 'Task Reassigned',
      message: `The task "${task.title}" has been reassigned by ${assignerUser.name}`,
      type: 'TASK_REASSIGNED',
      group: task.group || null
    });
  }
};

const notifyTaskStatusChanged = async (task, oldStatus, newStatus, updatedByUser) => {
  const recipientIds = [];
  if (task.assignedTo && task.assignedTo.toString() !== updatedByUser._id.toString()) {
    recipientIds.push(task.assignedTo);
  }
  if (task.assignedBy && task.assignedBy.toString() !== updatedByUser._id.toString()) {
    recipientIds.push(task.assignedBy);
  }

  if (recipientIds.length > 0) {
    let title = `Task Status Updated: ${newStatus.toUpperCase()}`;
    let message = `${updatedByUser.name} updated task status from ${oldStatus} to ${newStatus} for "${task.title}"`;

    if (newStatus === 'in_review') {
      title = 'Task Submitted for Review';
      message = `${updatedByUser.name} submitted the task "${task.title}" for review.`;
    } else if (newStatus === 'completed') {
      title = 'Task Approved & Completed';
      message = `${updatedByUser.name} marked the task "${task.title}" as completed.`;
    }

    await createBulkNotifications(recipientIds, {
      title,
      message,
      type: 'TASK_STATUS_CHANGED',
      group: task.group || null
    });
  }
};

const notifyTaskCommentAdded = async (task, comment, authorUser) => {
  const recipientIds = new Set();

  if (task.assignedTo && task.assignedTo.toString() !== authorUser._id.toString()) {
    recipientIds.add(task.assignedTo.toString());
  }
  if (task.assignedBy && task.assignedBy.toString() !== authorUser._id.toString()) {
    recipientIds.add(task.assignedBy.toString());
  }

  const idsArray = Array.from(recipientIds);
  if (idsArray.length > 0) {
    await createBulkNotifications(idsArray, {
      title: 'New Comment on Task',
      message: `${authorUser.name} commented on "${task.title}": ${comment.content.substring(0, 50)}...`,
      type: 'TASK_COMMENT',
      group: task.group || null
    });
  }
};

const notifyTaskCancelled = async (task, cancellingUser, reason) => {
  if (task.assignedTo && task.assignedTo.toString() !== cancellingUser._id.toString()) {
    await createNotification({
      recipient: task.assignedTo,
      title: 'Task Cancelled',
      message: `${cancellingUser.name} cancelled task "${task.title}". Reason: ${reason}`,
      type: 'TASK_CANCELLED',
      group: task.group || null
    });
  }
};

const notifyTaskReopened = async (task, reopeningUser) => {
  if (task.assignedTo && task.assignedTo.toString() !== reopeningUser._id.toString()) {
    await createNotification({
      recipient: task.assignedTo,
      title: 'Task Reopened',
      message: `${reopeningUser.name} reopened the task: "${task.title}"`,
      type: 'TASK_REOPENED',
      group: task.group || null
    });
  }
};

module.exports = {
  notifyTaskAssigned,
  notifyTaskReassigned,
  notifyTaskStatusChanged,
  notifyTaskCommentAdded,
  notifyTaskCancelled,
  notifyTaskReopened
};
