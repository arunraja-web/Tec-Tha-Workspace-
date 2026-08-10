const crypto = require('crypto');
const User = require('../models/User');
const { sendTokenCookie } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const sendEmail = require('../utils/sendEmail');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * @desc    Login user with Primary Email + Password
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 400, 'Please provide primary email and password');
  }

  const cleanEmail = email.toLowerCase().trim();

  // Explicitly search for user by PRIMARY email only (+password for verification)
  const user = await User.findOne({ email: cleanEmail }).select('+password');

  if (!user) {
    return sendError(res, 401, 'Invalid credentials');
  }

  // Verify if account is active
  if (!user.isActive) {
    return sendError(res, 401, 'User account is deactivated. Please contact an administrator.');
  }

  // Check password match
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return sendError(res, 401, 'Invalid credentials');
  }

  // Generate JWT & send HTTP-only Cookie
  return sendTokenCookie(user, 200, res, 'Login successful');
});

/**
 * @desc    Logout user & clear authentication cookie
 * @route   POST /api/auth/logout
 * @access  Private (or Public)
 */
const logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  });

  return sendSuccess(res, 200, 'Logged out successfully');
});

/**
 * @desc    Get authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  return res.status(200).json({
    success: true,
    user: {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      secondaryEmail: user.secondaryEmail || null,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  });
});

/**
 * @desc    Forgot Password - Sends reset token to secondaryEmail
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return sendError(res, 400, 'Please provide your primary email address');
  }

  const cleanEmail = email.toLowerCase().trim();
  const genericResponseMsg = 'If the account exists, password reset instructions have been sent.';

  const user = await User.findOne({ email: cleanEmail });

  // Do NOT reveal whether email exists or if secondaryEmail is configured
  if (!user || !user.secondaryEmail) {
    return sendSuccess(res, 200, genericResponseMsg);
  }

  // Check if account is active
  if (!user.isActive) {
    return sendSuccess(res, 200, genericResponseMsg);
  }

  // Get reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

  const message = `You are receiving this email because a password reset request was made for your account.\n\nPlease use the following link or reset token to set a new password:\n\nReset Link: ${resetUrl}\nReset Token: ${resetToken}\n\nThis token will expire in 15 minutes.\n\nIf you did not request this, please ignore this email.`;

  try {
    await sendEmail({
      email: user.secondaryEmail,
      subject: 'Password Reset Request - Workspace',
      message
    });

    return sendSuccess(res, 200, genericResponseMsg);
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return sendError(res, 500, 'Email could not be sent. Please try again later.');
  }
});

/**
 * @desc    Reset Password using token
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const resetToken = req.params.token;
  const { password } = req.body;

  if (!password) {
    return sendError(res, 400, 'Please provide a new password');
  }

  // Hash the incoming URL token to compare with hashed DB token
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return sendError(res, 400, 'Invalid or expired password reset token');
  }

  // Set new password and invalidate reset token
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  return sendSuccess(res, 200, 'Password reset successful. You can now login with your new password.');
});

/**
 * @desc    Change Password for logged-in user
 * @route   POST /api/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return sendError(res, 400, 'Please provide current and new password');
  }

  // Get user with password field
  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  // Check current password
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return sendError(res, 401, 'Current password is incorrect');
  }

  // Update to new password
  user.password = newPassword;
  await user.save();

  return sendSuccess(res, 200, 'Password changed successfully');
});

module.exports = {
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword
};
