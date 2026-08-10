const { body, validationResult } = require('express-validator');
const { sendError } = require('../utils/apiResponse');

// Helper to handle validation errors
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0].msg;
    return sendError(res, 400, firstError);
  }
  next();
};

// Login Validation Rules
const loginRules = [
  body('email')
    .notEmpty()
    .withMessage('Primary email is required')
    .isEmail()
    .withMessage('Please provide a valid primary email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validateRequest
];

// Forgot Password Validation Rules
const forgotPasswordRules = [
  body('email')
    .notEmpty()
    .withMessage('Primary email is required')
    .isEmail()
    .withMessage('Please provide a valid primary email address')
    .normalizeEmail(),
  validateRequest
];

// Reset Password Validation Rules
const resetPasswordRules = [
  body('password')
    .notEmpty()
    .withMessage('New password is required')
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

// Change Password Validation Rules
const changePasswordRules = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('New password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('New password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('New password must contain at least one number')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),
  validateRequest
];

module.exports = {
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  changePasswordRules,
  validateRequest
};
