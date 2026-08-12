const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const ConversationParticipant = require('../models/ConversationParticipant');
const Message = require('../models/Message');
const Group = require('../models/Group');
const User = require('../models/User');

/**
 * Verify user access to direct or group conversation
 * @param {Object} user - Authenticated user model/object
 * @param {String|mongoose.Types.ObjectId} conversationId
 * @returns {Promise<{ conversation: Object, group: Object|null }>}
 */
const verifyConversationAccess = async (user, conversationId) => {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    const err = new Error('Invalid Conversation ID');
    err.statusCode = 400;
    throw err;
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    isActive: true
  });

  if (!conversation) {
    const err = new Error('Conversation not found');
    err.statusCode = 404;
    throw err;
  }

  let group = null;

  if (conversation.type === 'direct') {
    const isParticipant = conversation.participants.some(
      (pId) => pId.toString() === user._id.toString()
    );
    if (!isParticipant) {
      const err = new Error('You are not a participant of this conversation.');
      err.statusCode = 403;
      throw err;
    }
  } else if (conversation.type === 'group') {
    if (!conversation.group) {
      const err = new Error('Group conversation missing group reference');
      err.statusCode = 400;
      throw err;
    }

    group = await Group.findOne({
      _id: conversation.group,
      isActive: true
    });

    if (!group) {
      const err = new Error('Associated group is inactive or not found.');
      err.statusCode = 404;
      throw err;
    }

    const isGroupMember = group.members.some(
      (mId) => mId.toString() === user._id.toString()
    );

    if (!isGroupMember) {
      const err = new Error('You are not a member of this group.');
      err.statusCode = 403;
      throw err;
    }
  }

  return { conversation, group };
};

/**
 * Create or get direct 1-to-1 conversation between two users
 */
const createOrGetDirectConversation = async (currentUser, targetUserId) => {
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    const err = new Error('Invalid Target User ID');
    err.statusCode = 400;
    throw err;
  }

  if (currentUser._id.toString() === targetUserId.toString()) {
    const err = new Error('Cannot start a direct conversation with yourself.');
    err.statusCode = 400;
    throw err;
  }

  const targetUser = await User.findOne({ _id: targetUserId, isActive: true });
  if (!targetUser) {
    const err = new Error('Target user not found or is inactive');
    err.statusCode = 404;
    throw err;
  }

  // Sort participant IDs consistently to prevent duplicate conversations
  const sortedParticipantIds = [
    currentUser._id.toString(),
    targetUserId.toString()
  ].sort();

  let conversation = await Conversation.findOne({
    type: 'direct',
    participants: { $all: sortedParticipantIds, $size: 2 }
  }).populate('participants', 'name email role phone isActive');

  if (!conversation) {
    conversation = await Conversation.create({
      type: 'direct',
      participants: sortedParticipantIds,
      group: null
    });

    conversation = await Conversation.findById(conversation._id).populate(
      'participants',
      'name email role phone isActive'
    );
  }

  // Ensure ConversationParticipant records exist for both users
  for (const pId of sortedParticipantIds) {
    await ConversationParticipant.updateOne(
      { conversation: conversation._id, user: pId },
      { $setOnInsert: { joinedAt: new Date() } },
      { upsert: true }
    );
  }

  return conversation;
};

/**
 * Sync Group conversation and participant records with Group model members
 */
const syncGroupConversation = async (groupId) => {
  if (!mongoose.Types.ObjectId.isValid(groupId)) return null;

  const group = await Group.findById(groupId);
  if (!group || !group.isActive) return null;

  let conversation = await Conversation.findOne({
    type: 'group',
    group: groupId
  });

  if (!conversation) {
    conversation = await Conversation.create({
      type: 'group',
      group: groupId,
      participants: group.members
    });
  } else {
    conversation.participants = group.members;
    await conversation.save();
  }

  // Ensure ConversationParticipant records exist for all current members
  const memberIdStrs = group.members.map((mId) => mId.toString());
  for (const mId of group.members) {
    await ConversationParticipant.updateOne(
      { conversation: conversation._id, user: mId },
      { $setOnInsert: { joinedAt: new Date() } },
      { upsert: true }
    );
  }

  // Remove participant records for users who are no longer group members
  await ConversationParticipant.deleteMany({
    conversation: conversation._id,
    user: { $nin: group.members }
  });

  return conversation;
};

/**
 * Get all conversations accessible to user
 */
const getUserConversations = async (user) => {
  // Find direct conversations where user is a participant
  const directConversations = await Conversation.find({
    type: 'direct',
    participants: user._id,
    isActive: true
  })
    .populate('participants', 'name email role phone isActive')
    .populate({
      path: 'lastMessage',
      populate: { path: 'sender', select: 'name email role' }
    })
    .sort({ lastMessageAt: -1, updatedAt: -1 });

  // Find active groups where user is a member
  const userActiveGroups = await Group.find({
    isActive: true,
    members: user._id
  }).select('_id');

  const activeGroupIds = userActiveGroups.map((g) => g._id);

  // Sync/Find group conversations
  const groupConversations = await Conversation.find({
    type: 'group',
    group: { $in: activeGroupIds },
    isActive: true
  })
    .populate('group', 'name description createdBy isActive')
    .populate({
      path: 'lastMessage',
      populate: { path: 'sender', select: 'name email role' }
    })
    .sort({ lastMessageAt: -1, updatedAt: -1 });

  const allConversations = [...directConversations, ...groupConversations];

  // Calculate unread counts and format result
  const results = await Promise.all(
    allConversations.map(async (conv) => {
      const participantRecord = await ConversationParticipant.findOne({
        conversation: conv._id,
        user: user._id
      });

      let unreadCount = 0;
      const lastReadAt = participantRecord ? participantRecord.lastReadAt : null;

      const unreadQuery = {
        conversation: conv._id,
        sender: { $ne: user._id }
      };

      if (lastReadAt) {
        unreadQuery.createdAt = { $gt: lastReadAt };
      }

      unreadCount = await Message.countDocuments(unreadQuery);

      const convObject = conv.toObject();

      let otherUser = null;
      if (conv.type === 'direct' && Array.isArray(conv.participants)) {
        otherUser = conv.participants.find(
          (p) => p.id.toString() !== user._id.toString() && p._id?.toString() !== user._id.toString()
        );
      }

      return {
        id: convObject.id || convObject._id,
        _id: convObject._id,
        type: convObject.type,
        group: convObject.group || null,
        user: otherUser || null,
        participants: convObject.participants || [],
        lastMessage: convObject.lastMessage || null,
        lastMessageAt: convObject.lastMessageAt || null,
        unreadCount,
        createdAt: convObject.createdAt,
        updatedAt: convObject.updatedAt
      };
    })
  );

  // Sort by latest message time
  results.sort((a, b) => {
    const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : new Date(a.createdAt).getTime();
    const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : new Date(b.createdAt).getTime();
    return timeB - timeA;
  });

  return results;
};

/**
 * Get single conversation details with membership verification
 */
const getConversationById = async (user, conversationId) => {
  const { conversation, group } = await verifyConversationAccess(user, conversationId);

  const populatedConv = await Conversation.findById(conversation._id)
    .populate('participants', 'name email role phone isActive')
    .populate('group', 'name description createdBy members isActive')
    .populate({
      path: 'lastMessage',
      populate: { path: 'sender', select: 'name email role' }
    });

  const participantRecord = await ConversationParticipant.findOne({
    conversation: conversation._id,
    user: user._id
  });

  const lastReadAt = participantRecord ? participantRecord.lastReadAt : null;
  const unreadQuery = {
    conversation: conversation._id,
    sender: { $ne: user._id }
  };
  if (lastReadAt) {
    unreadQuery.createdAt = { $gt: lastReadAt };
  }

  const unreadCount = await Message.countDocuments(unreadQuery);

  const resultObj = populatedConv.toObject();

  let otherUser = null;
  if (populatedConv.type === 'direct' && Array.isArray(populatedConv.participants)) {
    otherUser = populatedConv.participants.find(
      (p) => p.id.toString() !== user._id.toString() && p._id?.toString() !== user._id.toString()
    );
  }

  return {
    id: resultObj.id || resultObj._id,
    _id: resultObj._id,
    type: resultObj.type,
    group: resultObj.group || null,
    user: otherUser || null,
    participants: resultObj.participants || [],
    lastMessage: resultObj.lastMessage || null,
    lastMessageAt: resultObj.lastMessageAt || null,
    unreadCount,
    lastReadMessage: participantRecord?.lastReadMessage || null,
    lastReadAt: participantRecord?.lastReadAt || null,
    createdAt: resultObj.createdAt,
    updatedAt: resultObj.updatedAt
  };
};

/**
 * Mark conversation read for authenticated user
 */
const markConversationAsRead = async (user, conversationId, messageId = null) => {
  const { conversation } = await verifyConversationAccess(user, conversationId);

  let targetMessage = null;
  if (messageId && mongoose.Types.ObjectId.isValid(messageId)) {
    targetMessage = await Message.findOne({ _id: messageId, conversation: conversation._id });
  }

  if (!targetMessage) {
    targetMessage = await Message.findOne({ conversation: conversation._id })
      .sort({ createdAt: -1 });
  }

  const now = new Date();
  const updateData = {
    lastReadAt: now
  };
  if (targetMessage) {
    updateData.lastReadMessage = targetMessage._id;
  }

  await ConversationParticipant.updateOne(
    { conversation: conversation._id, user: user._id },
    { $set: updateData },
    { upsert: true }
  );

  return {
    conversationId: conversation._id,
    lastReadMessage: targetMessage ? targetMessage._id : null,
    lastReadAt: now,
    unreadCount: 0
  };
};

module.exports = {
  verifyConversationAccess,
  createOrGetDirectConversation,
  syncGroupConversation,
  getUserConversations,
  getConversationById,
  markConversationAsRead
};
