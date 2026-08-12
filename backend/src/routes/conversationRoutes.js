const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createDirectConversation,
  getConversations,
  getConversationById,
  markRead
} = require('../controllers/conversationController');
const {
  getMessages,
  sendMessage
} = require('../controllers/messageController');
const {
  createDirectConversationRules,
  validateConversationId
} = require('../validators/conversationValidator');
const {
  createMessageRules
} = require('../validators/messageValidator');

// All conversation routes are protected with JWT auth
router.use(protect);

router.post('/direct', createDirectConversationRules, createDirectConversation);
router.get('/', getConversations);
router.get('/:id', validateConversationId, getConversationById);
router.patch('/:id/read', validateConversationId, markRead);

// Conversation message routes
router.get('/:id/messages', validateConversationId, getMessages);
router.post('/:id/messages', createMessageRules, sendMessage);

module.exports = router;
