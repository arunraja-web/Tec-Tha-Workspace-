const { body, param } = require('express-validator');
const { validateRequest } = require('./authValidator');

// Reject mass assignment attempts
const checkProhibitedFields = (req, res, next) => {
  const prohibited = ['createdBy', 'members', 'isActive', 'createdAt', 'updatedAt'];
  for (const field of prohibited) {
    if (req.body && req.body[field] !== undefined && req.path === '/' && req.method === 'POST') {
      // In POST /api/groups
      delete req.body[field];
    } else if (req.body && req.body[field] !== undefined && req.method === 'PUT') {
      // In PUT /api/groups/:id
      delete req.body[field];
    }
  }
  next();
};

// Validate Group ID Parameter
const validateGroupId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Group ID'),
  validateRequest
];

// Create Group Validation Rules (Admin)
const createGroupRules = [
  checkProhibitedFields,
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Group name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Group name must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  validateRequest
];

// Update Group Validation Rules (Admin)
const updateGroupRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Group ID'),
  checkProhibitedFields,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Group name must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  validateRequest
];

// Update Group Status Rules (Admin)
const updateStatusRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Group ID'),
  body('isActive')
    .exists()
    .withMessage('isActive status is required')
    .isBoolean()
    .withMessage('isActive must be a boolean value (true or false)'),
  validateRequest
];

// Add Single Member Validation Rules (Admin)
const addMemberRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Group ID'),
  body('userId')
    .notEmpty()
    .withMessage('userId is required')
    .isMongoId()
    .withMessage('Invalid User ID'),
  validateRequest
];

// Bulk Add Members Validation Rules (Admin)
const bulkAddMembersRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Group ID'),
  body('userIds')
    .isArray({ min: 1 })
    .withMessage('userIds must be a non-empty array of user IDs'),
  validateRequest
];

// Remove Member Validation Rules (Admin)
const removeMemberRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid Group ID'),
  param('userId')
    .isMongoId()
    .withMessage('Invalid User ID'),
  validateRequest
];

module.exports = {
  validateGroupId,
  createGroupRules,
  updateGroupRules,
  updateStatusRules,
  addMemberRules,
  bulkAddMembersRules,
  removeMemberRules
};
