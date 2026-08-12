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

const validateCreateReport = [
  body('reportDate')
    .optional({ nullable: true })
    .custom((val) => {
      if (!val) return true;
      return !isNaN(Date.parse(val)) || /^\d{4}-\d{2}-\d{2}$/.test(val);
    })
    .withMessage('reportDate must be a valid date string (YYYY-MM-DD or ISO string)'),
  body('summary')
    .optional({ nullable: true })
    .isString()
    .withMessage('Summary must be a string')
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Summary cannot exceed 3000 characters'),
  body('completedWork')
    .optional({ nullable: true })
    .isString()
    .withMessage('Completed work must be a string')
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Completed work cannot exceed 5000 characters'),
  body('challenges')
    .optional({ nullable: true })
    .isString()
    .withMessage('Challenges must be a string')
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Challenges cannot exceed 3000 characters'),
  body('nextDayPlan')
    .optional({ nullable: true })
    .isString()
    .withMessage('Next day plan must be a string')
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Next day plan cannot exceed 3000 characters'),
  body('tasks')
    .optional({ nullable: true })
    .isArray()
    .withMessage('Tasks must be an array of Task IDs')
    .custom((arr) => {
      if (!Array.isArray(arr)) return true;
      return arr.every((id) => mongoose.Types.ObjectId.isValid(id));
    })
    .withMessage('All task IDs must be valid ObjectIds'),
  validateResult
];

const validateUpdateReport = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid Work Report ID'),
  body('summary')
    .optional({ nullable: true })
    .isString()
    .withMessage('Summary must be a string')
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Summary cannot exceed 3000 characters'),
  body('completedWork')
    .optional({ nullable: true })
    .isString()
    .withMessage('Completed work must be a string')
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Completed work cannot exceed 5000 characters'),
  body('challenges')
    .optional({ nullable: true })
    .isString()
    .withMessage('Challenges must be a string')
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Challenges cannot exceed 3000 characters'),
  body('nextDayPlan')
    .optional({ nullable: true })
    .isString()
    .withMessage('Next day plan must be a string')
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Next day plan cannot exceed 3000 characters'),
  body('tasks')
    .optional({ nullable: true })
    .isArray()
    .withMessage('Tasks must be an array of Task IDs')
    .custom((arr) => {
      if (!Array.isArray(arr)) return true;
      return arr.every((id) => mongoose.Types.ObjectId.isValid(id));
    })
    .withMessage('All task IDs must be valid ObjectIds'),
  validateResult
];

const validateSubmitReport = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid Work Report ID'),
  validateResult
];

const validateReviewReport = [
  param('id')
    .custom((val) => mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid Work Report ID'),
  body('action')
    .notEmpty()
    .withMessage('Action is required')
    .isIn(['approve', 'request_revision'])
    .withMessage('Action must be either "approve" or "request_revision"'),
  body('comment')
    .custom((val, { req }) => {
      if (req.body.action === 'request_revision' && (!val || typeof val !== 'string' || !val.trim())) {
        throw new Error('Comment is required when requesting a revision');
      }
      return true;
    })
    .optional({ nullable: true })
    .isString()
    .withMessage('Comment must be a string')
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Review comment cannot exceed 2000 characters'),
  validateResult
];

const validateReportQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('month')
    .optional()
    .matches(/^\d{4}-\d{2}$/)
    .withMessage('Month must be in YYYY-MM format'),
  query('date')
    .optional()
    .custom((val) => !val || !isNaN(Date.parse(val)) || /^\d{4}-\d{2}-\d{2}$/.test(val))
    .withMessage('Date must be a valid YYYY-MM-DD format'),
  query('status')
    .optional()
    .isIn(['draft', 'submitted', 'needs_revision', 'reviewed'])
    .withMessage('Status filter must be draft, submitted, needs_revision, or reviewed'),
  query('employee')
    .optional()
    .custom((val) => !val || mongoose.Types.ObjectId.isValid(val))
    .withMessage('Invalid Employee ObjectId'),
  validateResult
];

module.exports = {
  validateCreateReport,
  validateUpdateReport,
  validateSubmitReport,
  validateReviewReport,
  validateReportQuery
};
