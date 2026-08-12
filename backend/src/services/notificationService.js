const Notification = require('../models/Notification');

/**
 * Create a notification for a single user
 */
const createNotification = async ({ recipient, title, message, type = 'GROUP_EVENT', group = null }) => {
  if (!recipient) return null;
  return await Notification.create({
    recipient,
    title,
    message,
    type,
    group
  });
};

/**
 * Create notifications for multiple users
 */
const createBulkNotifications = async (recipientIds, { title, message, type = 'GROUP_EVENT', group = null }) => {
  if (!Array.isArray(recipientIds) || recipientIds.length === 0) return [];

  const notifications = recipientIds.map((recipient) => ({
    recipient,
    title,
    message,
    type,
    group
  }));

  return await Notification.insertMany(notifications);
};

module.exports = {
  createNotification,
  createBulkNotifications
};
