const conversationService = require('../services/conversationService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @desc    Create or get 1-to-1 direct conversation with target user
 * @route   POST /api/conversations/direct
 * @access  Private
 */
const createDirectConversation = async (req, res) => {
  try {
    const { userId } = req.body;
    const conversation = await conversationService.createOrGetDirectConversation(req.user, userId);
    return sendSuccess(res, 200, 'Direct conversation created or retrieved successfully', conversation);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message);
  }
};

/**
 * @desc    Get user conversations (direct & group)
 * @route   GET /api/conversations
 * @access  Private
 */
const getConversations = async (req, res) => {
  try {
    const conversations = await conversationService.getUserConversations(req.user);
    return sendSuccess(res, 200, 'Conversations retrieved successfully', conversations);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message);
  }
};

/**
 * @desc    Get single conversation detail
 * @route   GET /api/conversations/:id
 * @access  Private
 */
const getConversationById = async (req, res) => {
  try {
    const conversation = await conversationService.getConversationById(req.user, req.params.id);
    return sendSuccess(res, 200, 'Conversation retrieved successfully', conversation);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message);
  }
};

/**
 * @desc    Mark conversation as read up to latest or specified message
 * @route   PATCH /api/conversations/:id/read
 * @access  Private
 */
const markRead = async (req, res) => {
  try {
    const result = await conversationService.markConversationAsRead(
      req.user,
      req.params.id,
      req.body.messageId
    );
    return sendSuccess(res, 200, 'Conversation marked as read successfully', result);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message);
  }
};

module.exports = {
  createDirectConversation,
  getConversations,
  getConversationById,
  markRead
};
