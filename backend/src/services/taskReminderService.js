const Task = require('../models/Task');
const TaskHistory = require('../models/TaskHistory');
const { createNotification, createBulkNotifications } = require('./notificationService');

/**
 * Check and send Due Soon notifications (Due in next 24 hours)
 */
const checkDueSoonReminders = async () => {
  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const dueSoonTasks = await Task.find({
    dueDate: { $gte: now, $lte: next24h },
    status: { $nin: ['completed', 'cancelled'] },
    isArchived: false,
    dueSoonNotified: false
  }).populate('assignedTo', '_id name email');

  let notifiedCount = 0;

  for (const task of dueSoonTasks) {
    if (task.assignedTo && task.assignedTo._id) {
      await createNotification({
        recipient: task.assignedTo._id,
        title: 'Task Due Soon',
        message: `Reminder: Task "${task.title}" is due within 24 hours.`,
        type: 'TASK_DUE_SOON',
        group: task.group || null
      });

      task.dueSoonNotified = true;
      await task.save();
      notifiedCount++;
    }
  }

  return { checked: dueSoonTasks.length, notified: notifiedCount };
};

/**
 * Check and send Overdue notifications
 */
const checkOverdueReminders = async () => {
  const now = new Date();

  const overdueTasks = await Task.find({
    dueDate: { $lt: now },
    status: { $nin: ['completed', 'cancelled'] },
    isArchived: false,
    overdueNotified: false
  }).populate('assignedTo', '_id name email');

  let notifiedCount = 0;

  for (const task of overdueTasks) {
    const recipients = [];
    if (task.assignedTo && task.assignedTo._id) recipients.push(task.assignedTo._id);
    if (task.assignedBy && task.assignedBy.toString() !== (task.assignedTo?._id?.toString())) {
      recipients.push(task.assignedBy);
    }

    if (recipients.length > 0) {
      await createBulkNotifications(recipients, {
        title: 'Task Overdue Warning',
        message: `Task "${task.title}" has passed its due date (${task.dueDate.toLocaleDateString()}).`,
        type: 'TASK_OVERDUE',
        group: task.group || null
      });

      task.overdueNotified = true;
      await task.save();
      notifiedCount++;
    }
  }

  return { checked: overdueTasks.length, notified: notifiedCount };
};

/**
 * Calculate next recurrence date based on frequency and interval
 */
const calculateNextRunDate = (currentDate, frequency, interval = 1) => {
  const nextDate = new Date(currentDate);
  const step = Math.max(1, interval);

  if (frequency === 'daily') {
    nextDate.setDate(nextDate.getDate() + step);
  } else if (frequency === 'weekly') {
    nextDate.setDate(nextDate.getDate() + 7 * step);
  } else if (frequency === 'monthly') {
    nextDate.setMonth(nextDate.getMonth() + step);
  }

  return nextDate;
};

/**
 * Automatically generate recurring task occurrences when scheduled
 */
const generateRecurringTasks = async () => {
  const now = new Date();

  const recurringTemplates = await Task.find({
    isRecurring: true,
    'recurrence.enabled': true,
    'recurrence.nextRunDate': { $lte: now },
    isArchived: false
  });

  let generatedCount = 0;

  for (const template of recurringTemplates) {
    const rec = template.recurrence;
    if (rec.endDate && new Date(rec.endDate) < now) {
      template.recurrence.enabled = false;
      await template.save();
      continue;
    }

    // Calculate new due date relative to template due date if present
    let newDueDate = null;
    if (template.dueDate) {
      const timeDiff = template.dueDate.getTime() - template.createdAt.getTime();
      newDueDate = new Date(now.getTime() + Math.max(0, timeDiff));
    }

    // Create next task instance
    const newOccurrence = await Task.create({
      title: template.title,
      description: template.description,
      assignedTo: template.assignedTo,
      assignedBy: template.assignedBy,
      group: template.group,
      priority: template.priority,
      status: 'todo',
      progress: 0,
      startDate: now,
      dueDate: newDueDate,
      parentTask: template.parentTask || null,
      isRecurring: false
    });

    await TaskHistory.create({
      task: newOccurrence._id,
      action: 'TASK_CREATED',
      performedBy: template.assignedBy,
      metadata: { recurringSourceId: template._id }
    });

    // Advance template nextRunDate
    const nextDate = calculateNextRunDate(rec.nextRunDate || now, rec.frequency, rec.interval);
    template.recurrence.lastGeneratedAt = now;
    template.recurrence.nextRunDate = nextDate;

    if (rec.endDate && nextDate > new Date(rec.endDate)) {
      template.recurrence.enabled = false;
    }

    await template.save();
    generatedCount++;
  }

  return { checked: recurringTemplates.length, generated: generatedCount };
};

module.exports = {
  checkDueSoonReminders,
  checkOverdueReminders,
  generateRecurringTasks
};
