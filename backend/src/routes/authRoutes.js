const express = require('express');
const router = express.Router();

const {
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');
const { loginLimiter, forgotPasswordLimiter } = require('../middleware/rateLimiter');
const {
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  changePasswordRules
} = require('../validators/authValidator');

// Public authentication routes
router.post('/login', loginLimiter, loginRules, login);
router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordRules, forgotPassword);
router.post('/reset-password/:token', resetPasswordRules, resetPassword);

// Protected authentication routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePasswordRules, changePassword);

module.exports = router;
