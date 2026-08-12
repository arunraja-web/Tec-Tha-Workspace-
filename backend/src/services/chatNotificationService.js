const { createNotification, createBulkNotifications } = require('./notificationService');
const User = require('../models/User');

/**
 * Handle notification creation for chat messages
 * @param {Object} message - Populated message document
 * @param {Object} conversation - Conversation document
 * @param {string[]} activeSocketUserIds - User IDs currently active in conversation room
 */
const notifyMessageRecipients = async (message, conversation, activeSocketUserIds = []) => {
  try {
    const senderIdStr = message.sender._id ? message.sender._id.toString() : message.sender.toString();
    const senderName = message.sender.name || 'Someone';

    if (conversation.type === 'direct') {
      const recipientId = conversation.participants.find(
        (pId) => pId.toString() !== senderIdStr
      );

      if (!recipientId) return;

      const recipientIdStr = recipientId.toString();

      // Don't notify if recipient is active in room
      if (activeSocketUserIds.includes(recipientIdStr)) {
        return;
      }

      // Check if recipient user account is active
      const recipientUser = await User.findOne({ _id: recipientId, isActive: true });
      if (!recipientUser) return;

      let msgPreview = message.content;
      if (message.messageType === 'image') msgPreview = '📷 Image attachment';
      else if (message.messageType === 'file') msgPreview = '📄 File attachment';

      await createNotification({
        recipient: recipientId,
        title: `New message from ${senderName}`,
        message: msgPreview.substring(0, 100),
        type: 'DIRECT_MESSAGE',
        group: null
      });
    } else if (conversation.type === 'group') {
      const groupMembers = conversation.participants || [];

      const recipientsToNotify = groupMembers.filter((mId) => {
        const idStr = mId.toString();
        return idStr !== senderIdStr && !activeSocketUserIds.includes(idStr);
      });

      if (recipientsToNotify.length === 0) return;

      // Filter for active users only
      const activeRecipients = await User.find({
        _id: { $in: recipientsToNotify },
        isActive: true
      }).select('_id');

      const recipientIds = activeRecipients.map((u) => u._id);
      if (recipientIds.length === 0) return;

      let msgPreview = message.content;
      if (message.messageType === 'image') msgPreview = '📷 Image attachment';
      else if (message.messageType === 'file') msgPreview = '📄 File attachment';

      await createBulkNotifications(recipientIds, {
        title: `New message in group chat`,
        message: `${senderName}: ${msgPreview.substring(0, 80)}`,
        type: 'GROUP_CHAT_MESSAGE',
        group: conversation.group
      });
    }
  } catch (error) {
    console.error('Error generating chat notification:', error.message);
  }
};

module.exports = {
  notifyMessageRecipients
};
