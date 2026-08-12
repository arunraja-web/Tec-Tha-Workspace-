const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array()
    });
  }
  next();
};

const validateCreateLeave = [
  body('leaveType')
    .notEmpty()
    .withMessage('Leave type is required')
    .isIn(['casual', 'sick', 'annual', 'emergency', 'other'])
    .withMessage('Leave type must be casual, sick, annual, emergency, or other'),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .custom((val) => !isNaN(Date.parse(val)))
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .custom((val, { req }) => {
      if (isNaN(Date.parse(val))) {
        throw new Error('End date must be a valid date');
      }
      if (req.body.startDate && new Date(val) < new Date(req.body.startDate)) {
        throw new Error('End date cannot be before start date');
      }
      return true;
    }),
  body('reason')
    .notEmpty()
    .withMessage('Reason is required')
    .isString()
    .withMessage('Reason must be a string')
    .trim()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Reason must be between 3 and 1000 characters'),
  validateResult
];

const validateUpdateLeave = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid Leave ID'),
  body('leaveType')
    .optional()
    .isIn(['casual', 'sick', 'annual', 'emergency', 'other'])
    .withMessage('Leave type must be casual, sick, annual, emergency, or other'),
  body('startDate')
    .optional()
    .custom((val) => !isNaN(Date.parse(val)))
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .custom((val, { req }) => {
      if (isNaN(Date.parse(val))) {
        throw new Error('End date must be a valid date');
      }
      const start = req.body.startDate ? new Date(req.body.startDate) : null;
      if (start && new Date(val) < start) {
        throw new Error('End date cannot be before start date');
      }
      return true;
    }),
  body('reason')
    .optional()
    .isString()
    .withMessage('Reason must be a string')
    .trim()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Reason must be between 3 and 1000 characters'),
  validateResult
];

const validateApproveLeave = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid Leave ID'),
  body('comment')
    .optional({ nullable: true })
    .isString()
    .withMessage('Comment must be a string')
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Review comment cannot exceed 1000 characters'),
  validateResult
];

const validateRejectLeave = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid Leave ID'),
  body('comment')
    .notEmpty()
    .withMessage('Review comment is required when rejecting a leave request')
    .isString()
    .withMessage('Comment must be a string')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Review comment must be between 1 and 1000 characters'),
  validateResult
];

const validateLeaveIdParam = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid Leave ID'),
  validateResult
];

const validateLeaveQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected', 'cancelled'])
    .withMessage('Status filter must be pending, approved, rejected, or cancelled'),
  query('leaveType')
    .optional()
    .isIn(['casual', 'sick', 'annual', 'emergency', 'other'])
    .withMessage('Invalid leave type filter'),
  query('month')
    .optional()
    .matches(/^\d{4}-\d{2}$/)
    .withMessage('Month must be in YYYY-MM format'),
  query('startDate')
    .optional()
    .custom((val) => !isNaN(Date.parse(val)))
    .withMessage('startDate must be a valid date'),
  query('endDate')
    .optional()
    .custom((val) => !isNaN(Date.parse(val)))
    .withMessage('endDate must be a valid date'),
  query('employee')
    .optional()
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid Employee ObjectId'),
  validateResult
];

module.exports = {
  validateCreateLeave,
  validateUpdateLeave,
  validateApproveLeave,
  validateRejectLeave,
  validateLeaveIdParam,
  validateLeaveQuery
};
