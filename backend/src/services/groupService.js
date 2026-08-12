const mongoose = require('mongoose');
const Group = require('../models/Group');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { createNotification, createBulkNotifications } = require('./notificationService');
const { syncGroupConversation } = require('./conversationService');

/**
 * Helper to check case-insensitive unique active group name
 */
const checkDuplicateGroupName = async (name, excludeGroupId = null) => {
  const filter = {
    name: new RegExp(`^${name.trim()}$`, 'i'),
    isActive: true
  };
  if (excludeGroupId) {
    filter._id = { $ne: excludeGroupId };
  }
  const existingGroup = await Group.findOne(filter);
  return existingGroup;
};

/**
 * Helper to execute multi-document operations with optional session transaction
 */
const executeInTransaction = async (operation) => {
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const result = await operation(session);
    await session.commitTransaction();
    session.endSession();
    return result;
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
        session.endSession();
      } catch (e) {
        // Ignore session abort error if non-replica set
      }
    }
    // Fallback without transaction if transactions are unsupported on local standalone Mongo
    if (
      error.message &&
      (error.message.includes('Transaction numbers are only allowed') ||
        error.message.includes('replica set'))
    ) {
      return await operation(null);
    }
    throw error;
  }
};

/**
 * Create a new group (Admin only)
 */
const createGroup = async (adminUser, { name, description }) => {
  const cleanName = name.trim();
  const cleanDescription = description ? description.trim() : '';

  // Check duplicate active group name
  const existingGroup = await checkDuplicateGroupName(cleanName);
  if (existingGroup) {
    const err = new Error('Group with this name already exists and is active.');
    err.statusCode = 409;
    throw err;
  }

  // Find all active founders
  const activeFounders = await User.find({ role: 'founder', isActive: true }).select('_id');
  const founderIds = activeFounders.map((f) => f._id);

  // Note: Admin who created the group must NOT automatically become a member
  // Initial members array contains ONLY active founders
  const result = await executeInTransaction(async (session) => {
    const groupOptions = session ? { session } : {};
    
    const groupArray = await Group.create(
      [
        {
          name: cleanName,
          description: cleanDescription,
          createdBy: adminUser._id,
          members: founderIds,
          isActive: true
        }
      ],
      groupOptions
    );

    const group = groupArray[0];

    // Log Activity
    await ActivityLog.create(
      [
        {
          performedBy: adminUser._id,
          group: group._id,
          action: 'GROUP_CREATED',
          description: `Group '${group.name}' created`,
          newValue: {
            name: group.name,
            description: group.description,
            createdBy: group.createdBy,
            membersCount: group.members.length
          }
        }
      ],
      groupOptions
    );

    return group;
  });

  // Sync corresponding group conversation
  await syncGroupConversation(result._id);

  // Notify active founders (async outside transaction)
  if (founderIds.length > 0) {
    const founderIdsToNotify = founderIds.filter(
      (id) => id.toString() !== adminUser._id.toString()
    );
    if (founderIdsToNotify.length > 0) {
      await createBulkNotifications(founderIdsToNotify, {
        title: 'Added to New Group',
        message: `You have been automatically added to group '${result.name}'.`,
        group: result._id
      });
    }
  }

  return result;
};

/**
 * Get all active groups (filtered by role, search, pagination)
 */
const getGroups = async (user, queryParams = {}) => {
  const page = Math.max(1, parseInt(queryParams.page || '1', 10));
  let limit = parseInt(queryParams.limit || '20', 10);
  if (isNaN(limit) || limit <= 0) limit = 20;
  if (limit > 100) limit = 100;

  const skip = (page - 1) * limit;

  const filter = { isActive: true };

  // Role-based visibility scoping
  if (user.role === 'employee') {
    filter.members = user._id;
  }
  // Admin and Founder see all active groups

  // Search filter (name, description)
  if (queryParams.search) {
    const searchRegex = new RegExp(queryParams.search.trim(), 'i');
    filter.$or = [{ name: searchRegex }, { description: searchRegex }];
  }

  const totalGroups = await Group.countDocuments(filter);
  const groups = await Group.find(filter)
    .populate('createdBy', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    groups,
    pagination: {
      page,
      limit,
      totalGroups,
      totalPages: Math.ceil(totalGroups / limit) || 1
    }
  };
};

/**
 * Get groups where user is a member
 */
const getMyGroups = async (user) => {
  const filter = { isActive: true };

  if (user.role === 'founder') {
    // Founder must belong to every active group
    // So all active groups are returned
  } else {
    filter.members = user._id;
  }

  const groups = await Group.find(filter)
    .populate('createdBy', 'name email role')
    .sort({ createdAt: -1 });

  return groups;
};

/**
 * Get single active group details
 */
const getGroupById = async (user, groupId) => {
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    const err = new Error('Invalid Group ID');
    err.statusCode = 400;
    throw err;
  }

  const group = await Group.findOne({ _id: groupId, isActive: true }).populate(
    'createdBy',
    'name email role'
  );

  if (!group) {
    const err = new Error('Group not found');
    err.statusCode = 404;
    throw err;
  }

  // Authorization check for employee
  if (user.role === 'employee') {
    const isMember = group.members.some(
      (mId) => mId.toString() === user._id.toString()
    );
    if (!isMember) {
      const err = new Error('You are not a member of this group.');
      err.statusCode = 403;
      throw err;
    }
  }

  return group;
};

/**
 * Get group members list
 */
const getGroupMembers = async (user, groupId) => {
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    const err = new Error('Invalid Group ID');
    err.statusCode = 400;
    throw err;
  }

  const group = await Group.findOne({ _id: groupId, isActive: true }).populate({
    path: 'members',
    select: 'name email role phone isActive'
  });

  if (!group) {
    const err = new Error('Group not found');
    err.statusCode = 404;
    throw err;
  }

  // Authorization check for employee
  if (user.role === 'employee') {
    const isMember = group.members.some(
      (m) => m._id.toString() === user._id.toString()
    );
    if (!isMember) {
      const err = new Error('You are not a member of this group.');
      err.statusCode = 403;
      throw err;
    }
  }

  return group.members;
};

/**
 * Update group name and description (Admin only)
 */
const updateGroup = async (adminUser, groupId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    const err = new Error('Invalid Group ID');
    err.statusCode = 400;
    throw err;
  }

  const group = await Group.findOne({ _id: groupId, isActive: true });
  if (!group) {
    const err = new Error('Group not found');
    err.statusCode = 404;
    throw err;
  }

  // Explicit field selection for Mass Assignment Protection
  const { name, description } = updateData;

  if (name !== undefined) {
    const cleanName = name.trim();
    if (cleanName.toLowerCase() !== group.name.toLowerCase()) {
      const duplicate = await checkDuplicateGroupName(cleanName, group._id);
      if (duplicate) {
        const err = new Error('Group with this name already exists and is active.');
        err.statusCode = 409;
        throw err;
      }
    }
  }

  const oldValue = {
    name: group.name,
    description: group.description
  };

  if (name !== undefined) group.name = name.trim();
  if (description !== undefined) group.description = description.trim();

  const updatedGroup = await group.save();

  // Log Activity
  await ActivityLog.create({
    performedBy: adminUser._id,
    group: group._id,
    action: 'GROUP_UPDATED',
    description: `Group '${updatedGroup.name}' updated`,
    oldValue,
    newValue: {
      name: updatedGroup.name,
      description: updatedGroup.description
    }
  });

  return updatedGroup;
};

/**
 * Deactivate or reactivate a group (Admin only)
 */
const updateGroupStatus = async (adminUser, groupId, isActive) => {
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    const err = new Error('Invalid Group ID');
    err.statusCode = 400;
    throw err;
  }

  const group = await Group.findById(groupId);
  if (!group) {
    const err = new Error('Group not found');
    err.statusCode = 404;
    throw err;
  }

  if (group.isActive === isActive) {
    return group;
  }

  const oldStatus = group.isActive;

  // Reactivating group: ensure ALL active founders are members
  if (isActive) {
    const activeFounders = await User.find({ role: 'founder', isActive: true }).select('_id');
    const founderIds = activeFounders.map((f) => f._id);

    // Use $addToSet to merge active founders into members
    if (founderIds.length > 0) {
      await Group.updateOne(
        { _id: groupId },
        { $addToSet: { members: { $each: founderIds } } }
      );
    }
  }

  group.isActive = isActive;
  const updatedGroup = await group.save();

  // Log Activity
  await ActivityLog.create({
    performedBy: adminUser._id,
    group: group._id,
    action: isActive ? 'GROUP_REACTIVATED' : 'GROUP_DEACTIVATED',
    description: `Group '${updatedGroup.name}' ${isActive ? 'reactivated' : 'deactivated'}`,
    oldValue: { isActive: oldStatus },
    newValue: { isActive }
  });

  return updatedGroup;
};

/**
 * Add an employee to a group (Admin only)
 */
const addMember = async (adminUser, groupId, targetUserId) => {
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    const err = new Error('Invalid Group ID');
    err.statusCode = 400;
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    const err = new Error('Invalid User ID');
    err.statusCode = 400;
    throw err;
  }

  const group = await Group.findOne({ _id: groupId, isActive: true });
  if (!group) {
    const err = new Error('Group not found');
    err.statusCode = 404;
    throw err;
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser || !targetUser.isActive) {
    const err = new Error('Target user not found or is inactive');
    err.statusCode = 404;
    throw err;
  }

  // Reject non-employees (Founder membership is automatic, Admin joins voluntarily)
  if (targetUser.role === 'founder') {
    const err = new Error('Founder membership is automatic. Founders cannot be manually added.');
    err.statusCode = 400;
    throw err;
  }

  if (targetUser.role === 'admin') {
    const err = new Error('Admins cannot be manually added to groups. Admins must join voluntarily.');
    err.statusCode = 400;
    throw err;
  }

  // Check if already a member
  const isAlreadyMember = group.members.some(
    (mId) => mId.toString() === targetUserId.toString()
  );
  if (isAlreadyMember) {
    const err = new Error('User is already a member of this group.');
    err.statusCode = 409;
    throw err;
  }

  // Add employee atomically using $addToSet
  await Group.updateOne(
    { _id: groupId },
    { $addToSet: { members: targetUserId } }
  );

  // Log Activity
  await ActivityLog.create({
    performedBy: adminUser._id,
    targetUser: targetUserId,
    group: group._id,
    action: 'MEMBER_ADDED',
    description: `User '${targetUser.name}' added to group '${group.name}'`
  });

  // Create Notification for added employee
  await createNotification({
    recipient: targetUserId,
    title: 'Added to Group',
    message: `You have been added to ${group.name}.`,
    group: group._id
  });

  await syncGroupConversation(groupId);

  const updatedGroup = await Group.findById(groupId).populate(
    'members',
    'name email role'
  );
  return updatedGroup;
};

/**
 * Bulk add employees to a group (Admin only)
 */
const bulkAddMembers = async (adminUser, groupId, userIds) => {
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    const err = new Error('Invalid Group ID');
    err.statusCode = 400;
    throw err;
  }

  if (!Array.isArray(userIds)) {
    const err = new Error('userIds must be an array');
    err.statusCode = 400;
    throw err;
  }

  const group = await Group.findOne({ _id: groupId, isActive: true });
  if (!group) {
    const err = new Error('Group not found');
    err.statusCode = 404;
    throw err;
  }

  let added = 0;
  let alreadyMembers = 0;
  let failed = 0;

  const validEmployeeIdsToAdd = [];
  const existingMemberSet = new Set(group.members.map((id) => id.toString()));

  for (const userId of userIds) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      failed++;
      continue;
    }

    const targetUser = await User.findById(userId);
    if (!targetUser || !targetUser.isActive || targetUser.role !== 'employee') {
      failed++;
      continue;
    }

    if (existingMemberSet.has(userId.toString())) {
      alreadyMembers++;
      continue;
    }

    validEmployeeIdsToAdd.push(targetUser._id);
  }

  if (validEmployeeIdsToAdd.length > 0) {
    await Group.updateOne(
      { _id: groupId },
      { $addToSet: { members: { $each: validEmployeeIdsToAdd } } }
    );

    added = validEmployeeIdsToAdd.length;

    // Log Activity & Create Notifications for valid added members
    for (const empId of validEmployeeIdsToAdd) {
      await ActivityLog.create({
        performedBy: adminUser._id,
        targetUser: empId,
        group: group._id,
        action: 'MEMBER_ADDED',
        description: `Employee added to group '${group.name}'`
      });
    }

    await createBulkNotifications(validEmployeeIdsToAdd, {
      title: 'Added to Group',
      message: `You have been added to ${group.name}.`,
      group: group._id
    });

    await syncGroupConversation(groupId);
  }

  return {
    added,
    alreadyMembers,
    failed
  };
};

/**
 * Remove an employee from a group (Admin only)
 */
const removeMember = async (adminUser, groupId, targetUserId) => {
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    const err = new Error('Invalid Group ID');
    err.statusCode = 400;
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    const err = new Error('Invalid User ID');
    err.statusCode = 400;
    throw err;
  }

  const group = await Group.findOne({ _id: groupId, isActive: true });
  if (!group) {
    const err = new Error('Group not found');
    err.statusCode = 404;
    throw err;
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    const err = new Error('Target user not found');
    err.statusCode = 404;
    throw err;
  }

  // CRITICAL FOUNDER PROTECTION RULE
  if (targetUser.role === 'founder') {
    const err = new Error('Founder must remain a member of every group.');
    err.statusCode = 400;
    throw err;
  }

  // Verify target user is in group members
  const isMember = group.members.some(
    (mId) => mId.toString() === targetUserId.toString()
  );
  if (!isMember) {
    const err = new Error('Target user is not a member of this group.');
    err.statusCode = 400;
    throw err;
  }

  // Only employees can be manually removed
  if (targetUser.role !== 'employee') {
    const err = new Error('Only employee members can be removed by Admin.');
    err.statusCode = 400;
    throw err;
  }

  // Remove member atomically using $pull
  await Group.updateOne(
    { _id: groupId },
    { $pull: { members: targetUserId } }
  );

  // Log Activity
  await ActivityLog.create({
    performedBy: adminUser._id,
    targetUser: targetUserId,
    group: group._id,
    action: 'MEMBER_REMOVED',
    description: `User '${targetUser.name}' removed from group '${group.name}'`
  });

  // Create Notification for removed employee
  await createNotification({
    recipient: targetUserId,
    title: 'Removed from Group',
    message: `You have been removed from ${group.name}.`,
    group: group._id
  });

  await syncGroupConversation(groupId);

  return true;
};

/**
 * Admin voluntarily joins a group (Admin only)
 */
const joinGroup = async (adminUser, groupId) => {
  if (adminUser.role !== 'admin') {
    const err = new Error('Only Admin users can join groups voluntarily.');
    err.statusCode = 403;
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    const err = new Error('Invalid Group ID');
    err.statusCode = 400;
    throw err;
  }

  const group = await Group.findOne({ _id: groupId, isActive: true });
  if (!group) {
    const err = new Error('Group not found');
    err.statusCode = 404;
    throw err;
  }

  const isAlreadyMember = group.members.some(
    (mId) => mId.toString() === adminUser._id.toString()
  );
  if (isAlreadyMember) {
    const err = new Error('You are already a member of this group.');
    err.statusCode = 409;
    throw err;
  }

  await Group.updateOne(
    { _id: groupId },
    { $addToSet: { members: adminUser._id } }
  );

  // Log Activity
  await ActivityLog.create({
    performedBy: adminUser._id,
    group: group._id,
    action: 'ADMIN_JOINED_GROUP',
    description: `Admin '${adminUser.name}' voluntarily joined group '${group.name}'`
  });

  await syncGroupConversation(groupId);

  const updatedGroup = await Group.findById(groupId).populate(
    'members',
    'name email role'
  );
  return updatedGroup;
};

/**
 * Admin leaves a group they voluntarily joined (Admin only)
 */
const leaveGroup = async (adminUser, groupId) => {
  if (adminUser.role !== 'admin') {
    const err = new Error('Only Admin users can use this leave endpoint.');
    err.statusCode = 403;
    throw err;
  }

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    const err = new Error('Invalid Group ID');
    err.statusCode = 400;
    throw err;
  }

  const group = await Group.findOne({ _id: groupId, isActive: true });
  if (!group) {
    const err = new Error('Group not found');
    err.statusCode = 404;
    throw err;
  }

  const isMember = group.members.some(
    (mId) => mId.toString() === adminUser._id.toString()
  );
  if (!isMember) {
    const err = new Error('You are not a member of this group.');
    err.statusCode = 400;
    throw err;
  }

  await Group.updateOne(
    { _id: groupId },
    { $pull: { members: adminUser._id } }
  );

  // Log Activity
  await ActivityLog.create({
    performedBy: adminUser._id,
    group: group._id,
    action: 'ADMIN_LEFT_GROUP',
    description: `Admin '${adminUser.name}' left group '${group.name}'`
  });

  await syncGroupConversation(groupId);

  return true;
};

/**
 * Soft delete a group (Admin only)
 */
const deleteGroup = async (adminUser, groupId) => {
  return await updateGroupStatus(adminUser, groupId, false);
};

/**
 * Automatically add a newly promoted founder to all active groups
 */
const addFounderToAllActiveGroups = async (founderUserId) => {
  await Group.updateMany(
    { isActive: true },
    { $addToSet: { members: founderUserId } }
  );
};

module.exports = {
  createGroup,
  getGroups,
  getMyGroups,
  getGroupById,
  getGroupMembers,
  updateGroup,
  updateGroupStatus,
  addMember,
  bulkAddMembers,
  removeMember,
  joinGroup,
  leaveGroup,
  deleteGroup,
  addFounderToAllActiveGroups
};
