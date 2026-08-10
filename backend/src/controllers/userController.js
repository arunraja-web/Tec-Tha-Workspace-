const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * Helper to check for existing duplicate credentials (email, secondaryEmail, phone)
 */
const checkDuplicates = async (email, secondaryEmail, phone, excludeUserId = null) => {
  const queryFilter = (field, val) => {
    const filter = { [field]: val };
    if (excludeUserId) {
      filter._id = { $ne: excludeUserId };
    }
    return filter;
  };

  // 1. Check Primary Email against all primary and secondary emails
  if (email) {
    const existingPrimary = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { secondaryEmail: email.toLowerCase() }],
      ...(excludeUserId ? { _id: { $ne: excludeUserId } } : {})
    });
    if (existingPrimary) {
      return `Primary email '${email}' is already registered in the system`;
    }
  }

  // 2. Check Secondary Email against all primary and secondary emails
  if (secondaryEmail) {
    const existingSecondary = await User.findOne({
      $or: [{ email: secondaryEmail.toLowerCase() }, { secondaryEmail: secondaryEmail.toLowerCase() }],
      ...(excludeUserId ? { _id: { $ne: excludeUserId } } : {})
    });
    if (existingSecondary) {
      return `Secondary email '${secondaryEmail}' is already registered in the system`;
    }
  }

  // 3. Check Phone
  if (phone) {
    const existingPhone = await User.findOne(queryFilter('phone', phone.trim()));
    if (existingPhone) {
      return `Phone number '${phone}' is already registered in the system`;
    }
  }

  return null;
};

/**
 * @desc    Create new user (Admin only)
 * @route   POST /api/users
 * @access  Private/Admin
 */
const createUser = asyncHandler(async (req, res) => {
  const { name, email, secondaryEmail, phone, password, role } = req.body;

  // Validate presence of required fields
  if (!name || !email || !phone || !password) {
    return sendError(res, 400, 'Please provide name, primary email, phone, and password');
  }

  // Validate duplicate credentials
  const duplicateErr = await checkDuplicates(email, secondaryEmail, phone);
  if (duplicateErr) {
    return sendError(res, 400, duplicateErr);
  }

  // Create User
  const user = await User.create({
    name,
    email: email.toLowerCase().trim(),
    secondaryEmail: secondaryEmail ? secondaryEmail.toLowerCase().trim() : null,
    phone: phone.trim(),
    password,
    role: role || 'employee'
  });

  return sendSuccess(res, 201, 'User created successfully', { user });
});

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '50', 10);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.role) {
    filter.role = req.query.role;
  }
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    filter.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
  }

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return sendSuccess(res, 200, 'Users fetched successfully', {
    count: users.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    users
  });
});

/**
 * @desc    Get single user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  return sendSuccess(res, 200, 'User details fetched successfully', { user });
});

/**
 * @desc    Update user profile by ID
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  const { name, email, secondaryEmail, phone } = req.body;

  // Check for duplicates if email, secondaryEmail, or phone are being updated
  const duplicateErr = await checkDuplicates(
    email && email.toLowerCase() !== user.email ? email : null,
    secondaryEmail && secondaryEmail.toLowerCase() !== user.secondaryEmail ? secondaryEmail : null,
    phone && phone !== user.phone ? phone : null,
    user._id
  );

  if (duplicateErr) {
    return sendError(res, 400, duplicateErr);
  }

  if (name) user.name = name;
  if (email) user.email = email.toLowerCase().trim();
  if (secondaryEmail !== undefined) {
    user.secondaryEmail = secondaryEmail ? secondaryEmail.toLowerCase().trim() : null;
  }
  if (phone) user.phone = phone.trim();

  const updatedUser = await user.save();

  return sendSuccess(res, 200, 'User updated successfully', { user: updatedUser });
});

/**
 * @desc    Activate or Deactivate user status
 * @route   PATCH /api/users/:id/status
 * @access  Private/Admin
 */
const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return sendError(res, 400, 'Please provide boolean isActive status (true or false)');
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  // Prevent admin from deactivating their own account accidentally
  if (user._id.toString() === req.user.id.toString() && !isActive) {
    return sendError(res, 400, 'Admin cannot deactivate their own account');
  }

  user.isActive = isActive;
  await user.save();

  const statusText = isActive ? 'activated' : 'deactivated';
  return sendSuccess(res, 200, `User account ${statusText} successfully`, { user });
});

/**
 * @desc    Change user role
 * @route   PATCH /api/users/:id/role
 * @access  Private/Admin
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!role || !['admin', 'founder', 'employee'].includes(role)) {
    return sendError(res, 400, 'Role must be admin, founder, or employee');
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  user.role = role;
  await user.save();

  return sendSuccess(res, 200, `User role updated to ${role} successfully`, { user });
});

/**
 * @desc    Admin reset user password
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
 * @desc    Delete user account
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  // Prevent admin from deleting their own account
  if (user._id.toString() === req.user.id.toString()) {
    return sendError(res, 400, 'Admin cannot delete their own account');
  }

  await user.deleteOne();

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
