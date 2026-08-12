const messageService = require('../services/messageService');
const { uploadChatAttachmentToCloudinary } = require('../utils/cloudinary');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { notifyMessageRecipients } = require('../services/chatNotificationService');
const conversationService = require('../services/conversationService');

/**
 * @desc    Get paginated messages for a conversation
 * @route   GET /api/conversations/:id/messages
 * @access  Private
 */
const getMessages = async (req, res) => {
  try {
    const data = await messageService.getMessages(req.user, req.params.id, req.query);
    return sendSuccess(res, 200, 'Messages retrieved successfully', data);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message);
  }
};

/**
 * @desc    Send a message via REST API
 * @route   POST /api/conversations/:id/messages
 * @access  Private
 */
const sendMessage = async (req, res) => {
  try {
    const { content, messageType, attachment, replyTo } = req.body;
    const conversationId = req.params.id;

    // Save message to MongoDB first
    const savedMessage = await messageService.createMessage(req.user, {
      conversationId,
      content,
      messageType,
      attachment,
      replyTo
    });

    // Emit Socket.IO event if IO instance is available on app
    const io = req.app.get('io');
    if (io) {
      const roomName = `conversation:${conversationId}`;
      io.to(roomName).emit('new_message', savedMessage);
    }

    // Handle asynchronous notification creation
    const { conversation } = await conversationService.verifyConversationAccess(req.user, conversationId);
    let activeSocketUsers = [];
    if (io) {
      const roomSockets = await io.in(`conversation:${conversationId}`).fetchSockets();
      activeSocketUsers = roomSockets.map((s) => s.user?._id?.toString()).filter(Boolean);
    }

    notifyMessageRecipients(savedMessage, conversation, activeSocketUsers);

    return sendSuccess(res, 201, 'Message sent successfully', savedMessage);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message);
  }
};

/**
 * @desc    Edit a message (Original Sender Only)
 * @route   PUT /api/messages/:id
 * @access  Private
 */
const editMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const updatedMessage = await messageService.editMessage(req.user, req.params.id, content);

    // Broadcast edit event via Socket.IO
    const io = req.app.get('io');
    if (io) {
      const roomName = `conversation:${updatedMessage.conversation}`;
      io.to(roomName).emit('message_edited', updatedMessage);
    }

    return sendSuccess(res, 200, 'Message updated successfully', updatedMessage);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message);
  }
};

/**
 * @desc    Soft-delete a message (Original Sender Only)
 * @route   DELETE /api/messages/:id
 * @access  Private
 */
const deleteMessage = async (req, res) => {
  try {
    const deletedMessage = await messageService.deleteMessage(req.user, req.params.id);

    // Broadcast delete event via Socket.IO
    const io = req.app.get('io');
    if (io) {
      const roomName = `conversation:${deletedMessage.conversation}`;
      io.to(roomName).emit('message_deleted', {
        _id: deletedMessage._id,
        conversation: deletedMessage.conversation,
        isDeleted: true,
        deletedAt: deletedMessage.deletedAt
      });
    }

    return sendSuccess(res, 200, 'Message deleted successfully', deletedMessage);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message);
  }
};

/**
 * @desc    Upload image/document attachment to Cloudinary
 * @route   POST /api/messages/attachment
 * @access  Private
 */
const uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'Please select a file to upload');
    }

    const result = await uploadChatAttachmentToCloudinary(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    return sendSuccess(res, 200, 'File uploaded to Cloudinary successfully', result);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message);
  }
};

module.exports = {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  uploadAttachment
};
