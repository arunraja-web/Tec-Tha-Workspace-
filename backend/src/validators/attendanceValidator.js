const { body, query, param, validationResult } = require('express-validator');
const { sendError } = require('../utils/apiResponse');

/**
 * Middleware to check validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMsg = errors.array().map((err) => err.msg).join(', ');
    return sendError(res, 400, errorMsg);
  }
  next();
};

/**
 * Validation rule for marking single attendance
 */
const markAttendanceValidator = [
  body('employeeId')
    .notEmpty().withMessage('employeeId is required')
    .isMongoId().withMessage('Invalid employee ID format'),
  body('date')
    .notEmpty().withMessage('date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('date must be in YYYY-MM-DD format'),
  body('session')
    .notEmpty().withMessage('session is required')
    .isIn(['morning', 'evening']).withMessage('session must be morning or evening'),
  body('status')
    .notEmpty().withMessage('status is required')
    .isIn(['present', 'absent', 'leave', 'holiday']).withMessage('status must be present, absent, leave, or holiday'),
  validate
];

/**
 * Validation rule for bulk marking attendance
 */
const bulkAttendanceValidator = [
  body('date')
    .notEmpty().withMessage('date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('date must be in YYYY-MM-DD format'),
  body('session')
    .notEmpty().withMessage('session is required')
    .isIn(['morning', 'evening']).withMessage('session must be morning or evening'),
  body('attendance')
    .isArray({ min: 1 }).withMessage('attendance must be a non-empty array')
    .custom((arr) => {
      const seen = new Set();
      for (const item of arr) {
        if (!item.employeeId) {
          throw new Error('Each item in attendance array must have an employeeId');
        }
        if (seen.has(item.employeeId.toString())) {
          throw new Error(`Duplicate employeeId ${item.employeeId} in bulk request`);
        }
        seen.add(item.employeeId.toString());
        if (!['present', 'absent', 'leave', 'holiday'].includes(item.status)) {
          throw new Error(`Invalid status '${item.status}' for employee ${item.employeeId}`);
        }
      }
      return true;
    }),
  validate
];

/**
 * Validation rule for updating attendance via PUT
 */
const updateAttendanceValidator = [
  param('id')
    .isMongoId().withMessage('Invalid attendance document ID'),
  body('morning.status')
    .optional()
    .isIn(['present', 'absent', 'leave', 'holiday']).withMessage('morning status must be present, absent, leave, or holiday'),
  body('evening.status')
    .optional()
    .isIn(['present', 'absent', 'leave', 'holiday']).withMessage('evening status must be present, absent, leave, or holiday'),
  validate
];

/**
 * Validation rule for PATCH /session
 */
const updateSessionValidator = [
  param('id')
    .isMongoId().withMessage('Invalid attendance document ID'),
  body('session')
    .notEmpty().withMessage('session is required')
    .isIn(['morning', 'evening']).withMessage('session must be morning or evening'),
  body('status')
    .notEmpty().withMessage('status is required')
    .isIn(['present', 'absent', 'leave', 'holiday']).withMessage('status must be present, absent, leave, or holiday'),
  validate
];

/**
 * Validation rule for month parameter YYYY-MM
 */
const monthParamValidator = [
  param('month')
    .optional()
    .matches(/^\d{4}-\d{2}$/).withMessage('month must be in YYYY-MM format'),
  query('month')
    .optional()
    .matches(/^\d{4}-\d{2}$/).withMessage('month must be in YYYY-MM format'),
  validate
];

/**
 * Validation rule for daily date query YYYY-MM-DD
 */
const dailyDateQueryValidator = [
  query('date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('date must be in YYYY-MM-DD format'),
  validate
];

module.exports = {
  markAttendanceValidator,
  bulkAttendanceValidator,
  updateAttendanceValidator,
  updateSessionValidator,
  monthParamValidator,
  dailyDateQueryValidator
};
