/**
 * Standard API Response Format Utilities
 */

const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    message
  };
  if (data !== null) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
};

const sendError = (res, statusCode = 400, message = 'An error occurred') => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = {
  sendSuccess,
  sendError
};
