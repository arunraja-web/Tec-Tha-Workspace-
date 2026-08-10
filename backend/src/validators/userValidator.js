const { body, param } = require('express-validator');
const { validateRequest } = require('./authValidator');

// Phone Regex: Allows digits with optional leading +, length 10 to 15
const phoneRegex = /^\+?[0-9]{10,15}$/;

// Create User Validation Rules (Admin)
const createUserRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Primary email is required')
    .isEmail()
    .withMessage('Please provide a valid primary email address')
    .normalizeEmail(),
  body('secondaryEmail')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid secondary email address')
    .normalizeEmail()
    .custom((value, { req }) => {
      if (value && req.body.email && value.toLowerCase() === req.body.email.toLowerCase()) {
        throw new Error('Secondary email cannot be the same as primary email');
      }
      return true;
    }),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(phoneRegex)
    .withMessage('Please provide a valid phone number (10-15 digits, optional leading +)'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  body('role')
    .optional()
    .isIn(['admin', 'founder', 'employee'])
    .withMessage('Role must be admin, founder, or employee'),
  validateRequest
];

// Update User Validation Rules (Admin)
const updateUserRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid User ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid primary email address')
    .normalizeEmail(),
  body('secondaryEmail')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid secondary email address')
    .normalizeEmail()
    .custom((value, { req }) => {
      if (value && req.body.email && value.toLowerCase() === req.body.email.toLowerCase()) {
        throw new Error('Secondary email cannot be the same as primary email');
      }
      return true;
    }),
  body('phone')
    .optional()
    .trim()
    .matches(phoneRegex)
    .withMessage('Please provide a valid phone number (10-15 digits, optional leading +)'),
  validateRequest
];

// Update User Status Rules (Admin)
const updateStatusRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid User ID'),
  body('isActive')
    .exists()
    .withMessage('isActive status is required')
    .isBoolean()
    .withMessage('isActive must be a boolean value (true or false)'),
  validateRequest
];

// Update User Role Rules (Admin)
const updateRoleRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid User ID'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['admin', 'founder', 'employee'])
    .withMessage('Role must be admin, founder, or employee'),
  validateRequest
];

// Admin Reset Password Rules
const adminResetPasswordRules = [
  param('id')
    .isMongoId()
    .withMessage('Invalid User ID'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  validateRequest
];

module.exports = {
  createUserRules,
  updateUserRules,
  updateStatusRules,
  updateRoleRules,
  adminResetPasswordRules
};
