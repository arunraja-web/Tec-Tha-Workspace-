const mongoose = require('mongoose');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const ActivityLog = require('../models/ActivityLog');
const { verifyConversationAccess } = require('./conversationService');

/**
 * Create a new message in a conversation (DB First)
 */
const createMessage = async (senderUser, { conversationId, content, messageType = 'text', attachment, replyTo }) => {
  const { conversation } = await verifyConversationAccess(senderUser, conversationId);

  const cleanContent = typeof content === 'string' ? content.trim() : '';

  // Validation rules
  if (messageType === 'text') {
    if (!cleanContent) {
      const err = new Error('Message content cannot be empty or whitespace only.');
      err.statusCode = 400;
      throw err;
    }
  } else if (messageType === 'image' || messageType === 'file') {
    if (!attachment || !attachment.fileUrl) {
      const err = new Error('Attachment fileUrl is required for image/file message type.');
      err.statusCode = 400;
      throw err;
    }
  }

  if (cleanContent.length > 5000) {
    const err = new Error('Message content cannot exceed 5000 characters.');
    err.statusCode = 400;
    throw err;
  }

  // Validate replyTo if provided
  let replyToId = null;
  if (replyTo) {
    if (!mongoose.Types.ObjectId.isValid(replyTo)) {
      const err = new Error('Invalid replyTo message ID');
      err.statusCode = 400;
      throw err;
    }
    const replyMsg = await Message.findOne({ _id: replyTo, conversation: conversation._id });
    if (replyMsg) {
      replyToId = replyMsg._id;
    }
  }

  // Save Message to MongoDB FIRST
  const message = await Message.create({
    conversation: conversation._id,
    sender: senderUser._id,
    content: cleanContent,
    messageType,
    attachment: attachment || undefined,
    replyTo: replyToId
  });

  // Update Conversation lastMessage and lastMessageAt atomically
  await Conversation.updateOne(
    { _id: conversation._id },
    {
      $set: {
        lastMessage: message._id,
        lastMessageAt: message.createdAt
      }
    }
  );

  // Log Activity
  await ActivityLog.create({
    performedBy: senderUser._id,
    action: 'MESSAGE_SENT',
    description: `Message sent in ${conversation.type} conversation '${conversation._id}'`,
    newValue: { messageId: message._id, messageType }
  });

  // Populate sender info before returning/emitting
  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'name email role phone')
    .populate({
      path: 'replyTo',
      select: 'content sender messageType createdAt',
      populate: { path: 'sender', select: 'name email' }
    });

  return populatedMessage;
};

/**
 * Get paginated messages for a conversation
 */
const getMessages = async (user, conversationId, queryParams = {}) => {
  const { conversation } = await verifyConversationAccess(user, conversationId);

  let limit = parseInt(queryParams.limit || '30', 10);
  if (isNaN(limit) || limit <= 0) limit = 30;
  if (limit > 100) limit = 100;

  const filter = { conversation: conversation._id };

  // Cursor pagination (before message ID)
  if (queryParams.before && mongoose.Types.ObjectId.isValid(queryParams.before)) {
    const beforeMsg = await Message.findById(queryParams.before);
    if (beforeMsg) {
      filter.createdAt = { $lt: beforeMsg.createdAt };
    }
  }

  const rawMessages = await Message.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .populate('sender', 'name email role phone')
    .populate({
      path: 'replyTo',
      select: 'content sender messageType createdAt',
      populate: { path: 'sender', select: 'name email' }
    });

  const hasMore = rawMessages.length > limit;
  const messages = hasMore ? rawMessages.slice(0, limit) : rawMessages;

  // Return in chronological order for chat UI display (oldest -> newest)
  messages.reverse();

  const nextCursor = hasMore && messages.length > 0 ? messages[0]._id : null;

  return {
    messages,
    pagination: {
      limit,
      hasMore,
      nextCursor
    }
  };
};

/**
 * Edit message content (Sender only)
 */
const editMessage = async (user, messageId, newContent) => {
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    const err = new Error('Invalid Message ID');
    err.statusCode = 400;
    throw err;
  }

  const message = await Message.findById(messageId);
  if (!message) {
    const err = new Error('Message not found');
    err.statusCode = 404;
    throw err;
  }

  if (message.sender.toString() !== user._id.toString()) {
    const err = new Error('You are not authorized to edit another user\'s message.');
    err.statusCode = 403;
    throw err;
  }

  if (message.isDeleted) {
    const err = new Error('Cannot edit a deleted message.');
    err.statusCode = 400;
    throw err;
  }

  const cleanContent = typeof newContent === 'string' ? newContent.trim() : '';
  if (!cleanContent) {
    const err = new Error('Message content cannot be empty.');
    err.statusCode = 400;
    throw err;
  }

  if (cleanContent.length > 5000) {
    const err = new Error('Message content cannot exceed 5000 characters.');
    err.statusCode = 400;
    throw err;
  }

  const oldContent = message.content;
  message.content = cleanContent;
  message.isEdited = true;
  message.editedAt = new Date();

  await message.save();

  // Log Activity
  await ActivityLog.create({
    performedBy: user._id,
    action: 'MESSAGE_EDITED',
    description: `Message '${message._id}' edited by sender`,
    oldValue: { content: oldContent },
    newValue: { content: cleanContent, editedAt: message.editedAt }
  });

  const updatedMessage = await Message.findById(message._id)
    .populate('sender', 'name email role phone')
    .populate({
      path: 'replyTo',
      select: 'content sender messageType createdAt',
      populate: { path: 'sender', select: 'name email' }
    });

  return updatedMessage;
};

/**
 * Soft delete a message (Sender only)
 */
const deleteMessage = async (user, messageId) => {
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    const err = new Error('Invalid Message ID');
    err.statusCode = 400;
    throw err;
  }

  const message = await Message.findById(messageId);
  if (!message) {
    const err = new Error('Message not found');
    err.statusCode = 404;
    throw err;
  }

  if (message.sender.toString() !== user._id.toString()) {
    const err = new Error('You are not authorized to delete another user\'s message.');
    err.statusCode = 403;
    throw err;
  }

  if (message.isDeleted) {
    return message;
  }

  message.isDeleted = true;
  message.deletedAt = new Date();
  message.content = '';

  await message.save();

  // Log Activity
  await ActivityLog.create({
    performedBy: user._id,
    action: 'MESSAGE_DELETED',
    description: `Message '${message._id}' soft deleted by sender`,
    newValue: { isDeleted: true, deletedAt: message.deletedAt }
  });

  const updatedMessage = await Message.findById(message._id)
    .populate('sender', 'name email role phone');

  return updatedMessage;
};

module.exports = {
  createMessage,
  getMessages,
  editMessage,
  deleteMessage
};
