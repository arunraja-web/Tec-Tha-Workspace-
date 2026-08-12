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

const validateCreateTask = [
  body('title')
    .notEmpty()
    .withMessage('Task title is required')
    .bail()
    .isString()
    .withMessage('Title must be a string')
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('Task title must be between 3 and 150 characters'),
  body('description')
    .optional({ nullable: true })
    .isString()
    .withMessage('Description must be a string')
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Description cannot exceed 3000 characters'),
  body('assignedTo')
    .notEmpty()
    .withMessage('assignedTo is required')
    .bail()
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid assignedTo User ID'),
  body('group')
    .optional({ nullable: true })
    .custom((val) => !val || mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid group ID'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  body('startDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('startDate must be a valid ISO Date'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('dueDate must be a valid ISO Date'),
  body('isRecurring')
    .optional()
    .isBoolean()
    .withMessage('isRecurring must be a boolean'),
  body('recurrence.frequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly'])
    .withMessage('Recurrence frequency must be daily, weekly, or monthly'),
  body('recurrence.interval')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Recurrence interval must be a positive integer'),
  validateResult
];

const validateUpdateTask = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid Task ID'),
  body('title')
    .optional()
    .isString()
    .withMessage('Title must be a string')
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('Task title must be between 3 and 150 characters'),
  body('description')
    .optional({ nullable: true })
    .isString()
    .withMessage('Description must be a string')
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Description cannot exceed 3000 characters'),
  body('assignedTo')
    .optional()
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid assignedTo User ID'),
  body('group')
    .optional({ nullable: true })
    .custom((val) => !val || mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid group ID'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  body('startDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('startDate must be a valid ISO Date'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('dueDate must be a valid ISO Date'),
  validateResult
];

const validateAssignTask = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid Task ID'),
  body('assignedTo')
    .notEmpty()
    .withMessage('assignedTo field is required')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid assignedTo User ID'),
  validateResult
];

const validateStatusUpdate = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid Task ID'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['todo', 'in_progress', 'in_review', 'completed', 'cancelled'])
    .withMessage('Status must be one of: todo, in_progress, in_review, completed, cancelled'),
  validateResult
];

const validateProgressUpdate = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid Task ID'),
  body('progress')
    .notEmpty()
    .withMessage('Progress is required')
    .isInt({ min: 0, max: 100 })
    .withMessage('Progress must be an integer between 0 and 100'),
  validateResult
];

const validateCancelTask = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid Task ID'),
  body('reason')
    .notEmpty()
    .withMessage('Cancellation reason is required')
    .isString()
    .trim()
    .isLength({ min: 3, max: 1000 })
    .withMessage('Cancellation reason must be between 3 and 1000 characters'),
  validateResult
];

const validateComment = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid Task ID'),
  body('content')
    .notEmpty()
    .withMessage('Comment content is required')
    .isString()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment must be between 1 and 2000 characters'),
  validateResult
];

const validateSubtask = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid Parent Task ID'),
  body('title')
    .notEmpty()
    .withMessage('Subtask title is required')
    .isString()
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('Subtask title must be between 3 and 150 characters'),
  body('assignedTo')
    .optional({ nullable: true })
    .custom((val) => !val || mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid assignedTo User ID'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('dueDate must be a valid ISO Date'),
  validateResult
];

const validateAnalyticsQuery = [
  query('from')
    .optional()
    .isISO8601()
    .withMessage('from parameter must be a valid ISO Date'),
  query('to')
    .optional()
    .isISO8601()
    .withMessage('to parameter must be a valid ISO Date'),
  validateResult
];

module.exports = {
  validateCreateTask,
  validateUpdateTask,
  validateAssignTask,
  validateStatusUpdate,
  validateProgressUpdate,
  validateCancelTask,
  validateComment,
  validateSubtask,
  validateAnalyticsQuery
};
