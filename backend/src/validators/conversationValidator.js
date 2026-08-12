const { body, param } = require('express-validator');
const { validateRequest } = require('./authValidator');

// Check prohibited fields (mass assignment protection)
const checkProhibitedFields = (req, res, next) => {
  const prohibited = ['sender', 'senderId', 'participants', 'group', 'isActive'];
  if (req.body) {
    for (const field of prohibited) {
      delete req.body[field];
    }
  }
  next();
};

const createDirectConversationRules = [
  checkProhibitedFields,
  body('userId')
    .notEmpty()
    .withMessage('userId is required')
    .isMongoId()
    .withMessage('Invalid User ID'),
  validateRequest
];

const validateConversationId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Conversation ID'),
  validateRequest
];

module.exports = {
  createDirectConversationRules,
  validateConversationId
};
