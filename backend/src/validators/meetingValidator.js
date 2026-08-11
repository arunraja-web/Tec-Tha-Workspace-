const { body, param } = require('express-validator');
const { validateRequest } = require('./authValidator');

// Validate Meeting MongoId Parameter
const validateMeetingId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid meeting ID'),
  validateRequest
];

// Create Meeting Validation Rules
const createMeetingRules = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .bail()
    .isString()
    .withMessage('Title must be a string')
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('Title must be between 3 and 150 characters'),

  body('description')
    .optional({ checkFalsy: false })
    .isString()
    .withMessage('Description must be a string')
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('meetingLink')
    .notEmpty()
    .withMessage('Meeting link is required')
    .bail()
    .isString()
    .withMessage('Meeting link must be a string')
    .trim()
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true
    })
    .withMessage('Meeting link must be a valid HTTP or HTTPS URL'),

  // Prevent forbidden fields in create payload
  body(['isActive', 'createdAt', 'createdBy', 'userId'])
    .custom((value, { req, path }) => {
      if (req.body[path] !== undefined) {
        throw new Error(`Field '${path}' cannot be set directly by client`);
      }
      return true;
    }),

  validateRequest
];

// Update Meeting Validation Rules
const updateMeetingRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid meeting ID'),

  body('title')
    .optional()
    .isString()
    .withMessage('Title must be a string')
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ min: 3, max: 150 })
    .withMessage('Title must be between 3 and 150 characters'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('meetingLink')
    .optional()
    .isString()
    .withMessage('Meeting link must be a string')
    .trim()
    .notEmpty()
    .withMessage('Meeting link cannot be empty')
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true
    })
    .withMessage('Meeting link must be a valid HTTP or HTTPS URL'),

  // Reject attempts to alter system or status fields in regular update
  body(['isActive', 'createdAt', 'createdBy', 'userId'])
    .custom((value, { req, path }) => {
      if (req.body[path] !== undefined) {
        if (path === 'isActive') {
          throw new Error("Use PATCH /api/meetings/:id/status to change 'isActive' status");
        }
        throw new Error(`Field '${path}' cannot be modified`);
      }
      return true;
    }),

  validateRequest
];

// Update Meeting Status Validation Rules
const updateStatusRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid meeting ID'),

  body('isActive')
    .exists()
    .withMessage('isActive field is required')
    .custom((value) => {
      if (typeof value !== 'boolean') {
        throw new Error('isActive must be a boolean value (true or false)');
      }
      return true;
    }),

  validateRequest
];

module.exports = {
  validateMeetingId,
  createMeetingRules,
  updateMeetingRules,
  updateStatusRules
};
