const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

/**
 * Check for duplicate credentials (email, secondaryEmail, phone) across primary & secondary email fields
 */
const checkDuplicates = async (email, secondaryEmail, phone, excludeUserId = null) => {
  const excludeFilter = excludeUserId ? { _id: { $ne: excludeUserId } } : {};

  // 1. Check Primary Email against all primary and secondary emails
  if (email) {
    const cleanEmail = email.toLowerCase().trim();
    const existingPrimary = await User.findOne({
      $or: [{ email: cleanEmail }, { secondaryEmail: cleanEmail }],
      ...excludeFilter
    });
    if (existingPrimary) {
      return 'An account with this email already exists.';
    }
  }

  // 2. Check Secondary Email against all primary and secondary emails
  if (secondaryEmail) {
    const cleanSecondary = secondaryEmail.toLowerCase().trim();
    const existingSecondary = await User.findOne({
      $or: [{ email: cleanSecondary }, { secondaryEmail: cleanSecondary }],
      ...excludeFilter
    });
    if (existingSecondary) {
      return 'An account with this secondary email already exists.';
    }
  }

  // 3. Check Phone
  if (phone) {
    const cleanPhone = phone.trim();
    const existingPhone = await User.findOne({
      phone: cleanPhone,
      ...excludeFilter
    });
    if (existingPhone) {
      return 'An account with this phone number already exists.';
    }
  }

  return null;
};

/**
 * Create a new user
 */
const createUser = async (adminUser, userData) => {
  const { name, email, secondaryEmail, phone, password, role } = userData;

  const cleanEmail = email ? email.toLowerCase().trim() : '';
  const cleanSecondaryEmail = secondaryEmail ? secondaryEmail.toLowerCase().trim() : null;
  const cleanPhone = phone ? phone.trim() : '';

  // Check primary vs secondary email equality for the user
  if (cleanSecondaryEmail && cleanEmail === cleanSecondaryEmail) {
    const err = new Error('Secondary email cannot be the same as primary email');
    err.statusCode = 400;
    throw err;
  }

  // Check duplicate credentials
  const duplicateErr = await checkDuplicates(cleanEmail, cleanSecondaryEmail, cleanPhone);
  if (duplicateErr) {
    const err = new Error(duplicateErr);
    err.statusCode = 400;
    throw err;
  }

  // Create User
  const user = await User.create({
    name: name.trim(),
    email: cleanEmail,
    secondaryEmail: cleanSecondaryEmail,
    phone: cleanPhone,
    password,
    role: role || 'employee'
  });

  // Log Activity
  await ActivityLog.create({
    performedBy: adminUser._id,
    targetUser: user._id,
    action: 'USER_CREATED',
    newValue: {
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    }
  });

  return user;
};

/**
 * Get all users with filtering, search, pagination, and sorting
 */
const getUsers = async (queryParams) => {
  const page = Math.max(1, parseInt(queryParams.page || '1', 10));
  let limit = parseInt(queryParams.limit || '20', 10);
  if (isNaN(limit) || limit <= 0) limit = 20;
  if (limit > 100) limit = 100;

  const skip = (page - 1) * limit;

  const filter = {};

  // Filtering by Role
  if (queryParams.role && ['admin', 'founder', 'employee'].includes(queryParams.role)) {
    filter.role = queryParams.role;
  }

  // Filtering by Status
  if (queryParams.status !== undefined) {
    if (queryParams.status === 'active' || queryParams.status === 'true') {
      filter.isActive = true;
    } else if (queryParams.status === 'inactive' || queryParams.status === 'false') {
      filter.isActive = false;
    }
  }

  // Search filter (name, email, phone)
  if (queryParams.search) {
    const searchRegex = new RegExp(queryParams.search.trim(), 'i');
    filter.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
  }

  // Sorting
  const allowedSortFields = ['name', 'email', 'role', 'createdAt', 'updatedAt'];
  const sortBy = allowedSortFields.includes(queryParams.sortBy) ? queryParams.sortBy : 'createdAt';
  const sortOrder = queryParams.sortOrder === 'asc' ? 1 : -1;
  const sortOption = { [sortBy]: sortOrder };

  const totalUsers = await User.countDocuments(filter);
  const users = await User.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  return {
    users,
    pagination: {
      page,
      limit,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit) || 1
    }
  };
};

/**
 * Get single user by ID
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

/**
 * Count active admins in system
 */
const getActiveAdminCount = async () => {
  return await User.countDocuments({ role: 'admin', isActive: true });
};

/**
 * Update user details
 */
const updateUser = async (adminUser, targetUserId, updateData) => {
  const user = await User.findById(targetUserId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  // Mass assignment protection: explicitly pick allowed fields
  const { name, email, secondaryEmail, phone, role, isActive } = updateData;

  const newEmail = email !== undefined ? email.toLowerCase().trim() : user.email;
  const newSecondaryEmail =
    secondaryEmail !== undefined
      ? secondaryEmail
        ? secondaryEmail.toLowerCase().trim()
        : null
      : user.secondaryEmail;
  const newPhone = phone !== undefined ? phone.trim() : user.phone;

  // Prevent primary === secondary email
  if (newSecondaryEmail && newEmail === newSecondaryEmail) {
    const err = new Error('Secondary email cannot be the same as primary email');
    err.statusCode = 400;
    throw err;
  }

  // Check duplicate credentials if email, secondaryEmail, or phone are being updated
  const duplicateErr = await checkDuplicates(
    email !== undefined && newEmail !== user.email ? newEmail : null,
    secondaryEmail !== undefined && newSecondaryEmail !== user.secondaryEmail ? newSecondaryEmail : null,
    phone !== undefined && newPhone !== user.phone ? newPhone : null,
    user._id
  );

  if (duplicateErr) {
    const err = new Error(duplicateErr);
    err.statusCode = 400;
    throw err;
  }

  // Self-Lockout & Last-Admin checks for role update
  if (role !== undefined && role !== user.role) {
    if (adminUser._id.toString() === user._id.toString() && role !== 'admin') {
      const err = new Error('You cannot remove or disable your own admin access.');
      err.statusCode = 400;
      throw err;
    }

    if (user.role === 'admin' && user.isActive && role !== 'admin') {
      const activeAdmins = await getActiveAdminCount();
      if (activeAdmins <= 1) {
        const err = new Error('At least one active administrator must remain.');
        err.statusCode = 400;
        throw err;
      }
    }
  }

  // Self-Lockout & Last-Admin checks for status update
  if (isActive !== undefined && isActive !== user.isActive) {
    if (adminUser._id.toString() === user._id.toString() && !isActive) {
      const err = new Error('You cannot remove or disable your own admin access.');
      err.statusCode = 400;
      throw err;
    }

    if (user.role === 'admin' && user.isActive && !isActive) {
      const activeAdmins = await getActiveAdminCount();
      if (activeAdmins <= 1) {
        const err = new Error('At least one active administrator must remain.');
        err.statusCode = 400;
        throw err;
      }
    }
  }

  const oldValue = {
    name: user.name,
    email: user.email,
    secondaryEmail: user.secondaryEmail,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive
  };

  if (name !== undefined) user.name = name.trim();
  if (email !== undefined) user.email = newEmail;
  if (secondaryEmail !== undefined) user.secondaryEmail = newSecondaryEmail;
  if (phone !== undefined) user.phone = newPhone;
  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;

  const updatedUser = await user.save();

  // Log Activity
  await ActivityLog.create({
    performedBy: adminUser._id,
    targetUser: user._id,
    action: 'USER_UPDATED',
    oldValue,
    newValue: {
      name: updatedUser.name,
      email: updatedUser.email,
      secondaryEmail: updatedUser.secondaryEmail,
      phone: updatedUser.phone,
      role: updatedUser.role,
      isActive: updatedUser.isActive
    }
  });

  return updatedUser;
};

/**
 * Update user role
 */
const updateUserRole = async (adminUser, targetUserId, newRole) => {
  const user = await User.findById(targetUserId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  if (user.role === newRole) {
    return user;
  }

  // Prevent self demotion
  if (adminUser._id.toString() === user._id.toString() && newRole !== 'admin') {
    const err = new Error('You cannot remove or disable your own admin access.');
    err.statusCode = 400;
    throw err;
  }

  // Last admin check
  if (user.role === 'admin' && user.isActive && newRole !== 'admin') {
    const activeAdmins = await getActiveAdminCount();
    if (activeAdmins <= 1) {
      const err = new Error('At least one active administrator must remain.');
      err.statusCode = 400;
      throw err;
    }
  }

  const oldRole = user.role;
  user.role = newRole;
  const updatedUser = await user.save();

  // Log Activity
  await ActivityLog.create({
    performedBy: adminUser._id,
    targetUser: user._id,
    action: 'USER_ROLE_CHANGED',
    oldValue: { role: oldRole },
    newValue: { role: newRole }
  });

  return updatedUser;
};

/**
 * Update user active status
 */
const updateUserStatus = async (adminUser, targetUserId, isActive) => {
  const user = await User.findById(targetUserId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  if (user.isActive === isActive) {
    return user;
  }

  // Prevent self deactivation
  if (adminUser._id.toString() === user._id.toString() && !isActive) {
    const err = new Error('You cannot remove or disable your own admin access.');
    err.statusCode = 400;
    throw err;
  }

  // Last admin check
  if (user.role === 'admin' && user.isActive && !isActive) {
    const activeAdmins = await getActiveAdminCount();
    if (activeAdmins <= 1) {
      const err = new Error('At least one active administrator must remain.');
      err.statusCode = 400;
      throw err;
    }
  }

  const oldStatus = user.isActive;
  user.isActive = isActive;
  const updatedUser = await user.save();

  // Log Activity
  await ActivityLog.create({
    performedBy: adminUser._id,
    targetUser: user._id,
    action: isActive ? 'USER_REACTIVATED' : 'USER_DEACTIVATED',
    oldValue: { isActive: oldStatus },
    newValue: { isActive }
  });

  return updatedUser;
};

/**
 * Soft delete user
 */
const deleteUser = async (adminUser, targetUserId) => {
  const user = await User.findById(targetUserId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  // Prevent self deletion
  if (adminUser._id.toString() === user._id.toString()) {
    const err = new Error('You cannot remove or disable your own admin access.');
    err.statusCode = 400;
    throw err;
  }

  // Last admin check
  if (user.role === 'admin' && user.isActive) {
    const activeAdmins = await getActiveAdminCount();
    if (activeAdmins <= 1) {
      const err = new Error('At least one active administrator must remain.');
      err.statusCode = 400;
      throw err;
    }
  }

  // Soft Delete
  user.isActive = false;
  user.deletedAt = new Date();
  await user.save();

  // Log Activity
  await ActivityLog.create({
    performedBy: adminUser._id,
    targetUser: user._id,
    action: 'USER_DELETED',
    oldValue: { isActive: true, deletedAt: null },
    newValue: { isActive: false, deletedAt: user.deletedAt }
  });

  return true;
};

module.exports = {
  checkDuplicates,
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserRole,
  updateUserStatus,
  deleteUser
};
