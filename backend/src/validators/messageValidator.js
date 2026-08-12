const { body, param } = require('express-validator');
const { validateRequest } = require('./authValidator');

// Mass assignment protection helper
const checkProhibitedMessageFields = (req, res, next) => {
  const prohibited = ['sender', 'senderId', 'conversation', 'isEdited', 'editedAt', 'isDeleted', 'deletedAt'];
  if (req.body) {
    for (const field of prohibited) {
      delete req.body[field];
    }
  }
  next();
};

const createMessageRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Conversation ID'),
  checkProhibitedMessageFields,
  body('content')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Message content cannot exceed 5000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file'])
    .withMessage('messageType must be text, image, or file'),
  body('replyTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid replyTo message ID'),
  validateRequest
];

const editMessageRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Message ID'),
  checkProhibitedMessageFields,
  body('content')
    .notEmpty()
    .withMessage('Updated message content is required')
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Message content cannot exceed 5000 characters'),
  validateRequest
];

const validateMessageId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Message ID'),
  validateRequest
];

module.exports = {
  createMessageRules,
  editMessageRules,
  validateMessageId
};
