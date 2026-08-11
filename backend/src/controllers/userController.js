const userService = require('../services/userService');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * @desc    Create new user (Admin only)
 * @route   POST /api/users
 * @access  Private/Admin
 */
const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.user, req.body);
  return sendSuccess(res, 201, 'User created successfully', { user });
});

/**
 * @desc    Get all users with filtering, search, pagination, and sorting (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  const result = await userService.getUsers(req.query);
  return sendSuccess(res, 200, 'Users retrieved successfully', result);
});

/**
 * @desc    Get single user by ID (Admin only)
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return sendSuccess(res, 200, 'User details fetched successfully', { user });
});

/**
 * @desc    Update user profile by ID (Admin only)
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.user, req.params.id, req.body);
  return sendSuccess(res, 200, 'User updated successfully', { user });
});

/**
 * @desc    Activate or Deactivate user status (Admin only)
 * @route   PATCH /api/users/:id/status
 * @access  Private/Admin
 */
const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await userService.updateUserStatus(req.user, req.params.id, isActive);
  const statusText = isActive ? 'activated' : 'deactivated';
  return sendSuccess(res, 200, `User account ${statusText} successfully`, { user });
});

/**
 * @desc    Change user role (Admin only)
 * @route   PATCH /api/users/:id/role
 * @access  Private/Admin
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const user = await userService.updateUserRole(req.user, req.params.id, role);
  return sendSuccess(res, 200, `User role updated to ${role} successfully`, { user });
});

/**
 * @desc    Admin reset user password (Admin only)
 * @route   PATCH /api/users/:id/reset-password
 * @access  Private/Admin
 */
const resetUserPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return sendError(res, 400, 'Please provide a new password');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  user.password = password;
  await user.save();

  return sendSuccess(res, 200, 'User password reset successfully by Admin');
});

/**
 * @desc    Delete user account (Soft Delete) (Admin only)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.user, req.params.id);
  return sendSuccess(res, 200, 'User deleted successfully');
});

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  updateUserRole,
  resetUserPassword,
  deleteUser
};
