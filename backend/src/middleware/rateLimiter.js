const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for login requests (max 5 attempts per 15 minutes per IP in prod/dev, relaxed in test)
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 5,
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false
});

/**
 * Rate limiter for forgot-password requests (max 3 requests per hour per IP in prod/dev, relaxed in test)
 */
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'test' ? 1000 : 3,
  message: {
    success: false,
    message: 'Too many password reset requests from this IP, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  loginLimiter,
  forgotPasswordLimiter
};
