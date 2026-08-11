const meetingService = require('../services/meetingService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @desc    Create a new meeting
 * @route   POST /api/meetings
 * @access  Private (All authenticated roles)
 */
const createMeeting = async (req, res) => {
  try {
    const meeting = await meetingService.createMeeting(req.user, req.body);
    return sendSuccess(res, 201, 'Meeting created successfully', meeting);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message);
  }
};

/**
 * @desc    Get all active meetings
 * @route   GET /api/meetings
 * @access  Private (All authenticated roles)
 */
const getMeetings = async (req, res) => {
  try {
    const result = await meetingService.getMeetings(req.query);
    return sendSuccess(res, 200, 'Meetings retrieved successfully', result);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message);
  }
};

/**
 * @desc    Get single active meeting by ID
 * @route   GET /api/meetings/:id
 * @access  Private (All authenticated roles)
 */
const getMeetingById = async (req, res) => {
  try {
    const meeting = await meetingService.getMeetingById(req.params.id);
    return sendSuccess(res, 200, 'Meeting retrieved successfully', meeting);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message);
  }
};

/**
 * @desc    Update meeting (Creator or Admin)
 * @route   PUT /api/meetings/:id
 * @access  Private (Creator or Admin)
 */
const updateMeeting = async (req, res) => {
  try {
    const updatedMeeting = await meetingService.updateMeeting(
      req.user,
      req.params.id,
      req.body
    );
    return sendSuccess(res, 200, 'Meeting updated successfully', updatedMeeting);
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message);
  }
};

/**
 * @desc    Activate/Deactivate meeting status (Creator or Admin)
 * @route   PATCH /api/meetings/:id/status
 * @access  Private (Creator or Admin)
 */
const updateMeetingStatus = async (req, res) => {
  try {
    const updatedMeeting = await meetingService.updateMeetingStatus(
      req.user,
      req.params.id,
      req.body.isActive
    );
    return sendSuccess(
      res,
      200,
      'Meeting status updated successfully',
      updatedMeeting
    );
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message);
  }
};

/**
 * @desc    Soft delete meeting (Creator or Admin)
 * @route   DELETE /api/meetings/:id
 * @access  Private (Creator or Admin)
 */
const deleteMeeting = async (req, res) => {
  try {
    await meetingService.deleteMeeting(req.user, req.params.id);
    return sendSuccess(res, 200, 'Meeting deactivated successfully');
  } catch (error) {
    return sendError(res, error.statusCode || 500, error.message);
  }
};

module.exports = {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  updateMeetingStatus,
  deleteMeeting
};
