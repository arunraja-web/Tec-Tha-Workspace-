const { sendError } = require('../utils/apiResponse');

/**
 * Handle 404 - Not Found
 */
const notFound = (req, res, next) => {
  return sendError(res, 404, `Route not found - ${req.originalUrl}`);
};

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details for developer in non-production
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error Stack:', err);
  }

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    return sendError(res, 404, message);
  }

  // Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || err.keyPattern || {})[0] || 'field';
    let message = 'An account with this credential already exists.';
    if (field === 'email') {
      message = 'An account with this email already exists.';
    } else if (field === 'secondaryEmail') {
      message = 'An account with this secondary email already exists.';
    } else if (field === 'phone') {
      message = 'An account with this phone number already exists.';
    }
    return sendError(res, 400, message);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    return sendError(res, 400, message);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid authentication token');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Authentication token expired');
  }

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const message = err.message || 'Internal Server Error';

  return sendError(res, statusCode, message);
};

/**
 * Async handler wrapper to catch async controller errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  notFound,
  errorHandler,
  asyncHandler
};
