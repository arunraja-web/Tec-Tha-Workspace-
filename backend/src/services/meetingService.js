const Meeting = require('../models/Meeting');

/**
 * Create a new meeting
 * @param {Object} user - Authenticated user object (req.user)
 * @param {Object} meetingData - Body containing title, description, meetingLink
 */
const createMeeting = async (user, meetingData) => {
  const { title, description, meetingLink } = meetingData;

  const meeting = await Meeting.create({
    title: title.trim(),
    description: description ? description.trim() : '',
    meetingLink: meetingLink.trim(),
    isActive: true,
    createdBy: user._id
  });

  return meeting;
};

/**
 * Get active meetings with search, pagination, and sorting
 * @param {Object} queryParams - Express req.query object
 */
const getMeetings = async (queryParams) => {
  const page = Math.max(1, parseInt(queryParams.page || '1', 10));
  let limit = parseInt(queryParams.limit || '20', 10);
  if (isNaN(limit) || limit <= 0) limit = 20;
  if (limit > 100) limit = 100;

  const skip = (page - 1) * limit;

  // Filter only active meetings by default
  const filter = { isActive: true };

  // Search filter (title, description)
  if (queryParams.search && queryParams.search.trim()) {
    const searchRegex = new RegExp(queryParams.search.trim(), 'i');
    filter.$or = [{ title: searchRegex }, { description: searchRegex }];
  }

  // Sorting: strictly allowed on createdAt (desc by default)
  const sortOrder = queryParams.sortOrder === 'asc' ? 1 : -1;
  const sortOption = { createdAt: sortOrder };

  const totalMeetings = await Meeting.countDocuments(filter);
  const meetings = await Meeting.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  return {
    meetings,
    pagination: {
      page,
      limit,
      totalMeetings,
      totalPages: Math.ceil(totalMeetings / limit) || 1
    }
  };
};

/**
 * Get a single active meeting by ID
 * @param {string} meetingId - Meeting ObjectId
 */
const getMeetingById = async (meetingId) => {
  const meeting = await Meeting.findById(meetingId);

  if (!meeting || !meeting.isActive) {
    const err = new Error('Meeting not found');
    err.statusCode = 404;
    throw err;
  }

  return meeting;
};

/**
 * Update meeting details (Creator or Admin only)
 * @param {Object} user - Authenticated user object
 * @param {string} meetingId - Meeting ObjectId
 * @param {Object} updateData - Body containing allowed fields
 */
const updateMeeting = async (user, meetingId, updateData) => {
  const meeting = await Meeting.findById(meetingId);

  if (!meeting || !meeting.isActive) {
    const err = new Error('Meeting not found');
    err.statusCode = 404;
    throw err;
  }

  // Ownership check: Creator or Admin
  const isCreator = meeting.createdBy.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';

  if (!isCreator && !isAdmin) {
    const err = new Error('Not authorized to update this meeting');
    err.statusCode = 403;
    throw err;
  }

  const { title, description, meetingLink } = updateData;

  if (title !== undefined) meeting.title = title.trim();
  if (description !== undefined) meeting.description = description.trim();
  if (meetingLink !== undefined) meeting.meetingLink = meetingLink.trim();

  const updatedMeeting = await meeting.save();
  return updatedMeeting;
};

/**
 * Update meeting active status (Creator or Admin only)
 * @param {Object} user - Authenticated user object
 * @param {string} meetingId - Meeting ObjectId
 * @param {boolean} isActive - Target status
 */
const updateMeetingStatus = async (user, meetingId, isActive) => {
  const meeting = await Meeting.findById(meetingId);

  if (!meeting) {
    const err = new Error('Meeting not found');
    err.statusCode = 404;
    throw err;
  }

  // Ownership check: Creator or Admin
  const isCreator = meeting.createdBy.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';

  if (!isCreator && !isAdmin) {
    const err = new Error('Not authorized to change meeting status');
    err.statusCode = 403;
    throw err;
  }

  meeting.isActive = isActive;
  const updatedMeeting = await meeting.save();
  return updatedMeeting;
};

/**
 * Soft delete / deactivate meeting (Creator or Admin only)
 * @param {Object} user - Authenticated user object
 * @param {string} meetingId - Meeting ObjectId
 */
const deleteMeeting = async (user, meetingId) => {
  const meeting = await Meeting.findById(meetingId);

  if (!meeting || !meeting.isActive) {
    const err = new Error('Meeting not found');
    err.statusCode = 404;
    throw err;
  }

  // Ownership check: Creator or Admin
  const isCreator = meeting.createdBy.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';

  if (!isCreator && !isAdmin) {
    const err = new Error('Not authorized to deactivate this meeting');
    err.statusCode = 403;
    throw err;
  }

  meeting.isActive = false;
  await meeting.save();
  return true;
};

module.exports = {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  updateMeetingStatus,
  deleteMeeting
};
