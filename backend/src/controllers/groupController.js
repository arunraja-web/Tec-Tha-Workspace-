const { asyncHandler } = require('../middleware/errorMiddleware');
const { sendSuccess } = require('../utils/apiResponse');
const groupService = require('../services/groupService');

/**
 * @desc    Create a new group
 * @route   POST /api/groups
 * @access  Private (Admin)
 */
const createGroup = asyncHandler(async (req, res) => {
  const group = await groupService.createGroup(req.user, req.body);
  return sendSuccess(res, 201, 'Group created successfully', group);
});

/**
 * @desc    Get all active groups (scoped by role, with search & pagination)
 * @route   GET /api/groups
 * @access  Private (Admin, Founder, Employee)
 */
const getGroups = asyncHandler(async (req, res) => {
  const result = await groupService.getGroups(req.user, req.query);
  return sendSuccess(res, 200, 'Groups retrieved successfully', result);
});

/**
 * @desc    Get groups where user is a member
 * @route   GET /api/groups/my
 * @access  Private (Admin, Founder, Employee)
 */
const getMyGroups = asyncHandler(async (req, res) => {
  const groups = await groupService.getMyGroups(req.user);
  return sendSuccess(res, 200, 'My groups retrieved successfully', groups);
});

/**
 * @desc    Get single group details
 * @route   GET /api/groups/:id
 * @access  Private (Admin, Founder, Employee member)
 */
const getGroupById = asyncHandler(async (req, res) => {
  const group = await groupService.getGroupById(req.user, req.params.id);
  return sendSuccess(res, 200, 'Group details retrieved successfully', group);
});

/**
 * @desc    Get members of a group
 * @route   GET /api/groups/:id/members
 * @access  Private (Admin, Founder, Employee member)
 */
const getGroupMembers = asyncHandler(async (req, res) => {
  const members = await groupService.getGroupMembers(req.user, req.params.id);
  return sendSuccess(res, 200, 'Group members retrieved successfully', members);
});

/**
 * @desc    Update group name & description
 * @route   PUT /api/groups/:id
 * @access  Private (Admin)
 */
const updateGroup = asyncHandler(async (req, res) => {
  const updatedGroup = await groupService.updateGroup(
    req.user,
    req.params.id,
    req.body
  );
  return sendSuccess(res, 200, 'Group updated successfully', updatedGroup);
});

/**
 * @desc    Deactivate or reactivate group
 * @route   PATCH /api/groups/:id/status
 * @access  Private (Admin)
 */
const updateGroupStatus = asyncHandler(async (req, res) => {
  const updatedGroup = await groupService.updateGroupStatus(
    req.user,
    req.params.id,
    req.body.isActive
  );
  return sendSuccess(
    res,
    200,
    `Group ${updatedGroup.isActive ? 'reactivated' : 'deactivated'} successfully`,
    updatedGroup
  );
});

/**
 * @desc    Add employee to group
 * @route   POST /api/groups/:id/members
 * @access  Private (Admin)
 */
const addMember = asyncHandler(async (req, res) => {
  const updatedGroup = await groupService.addMember(
    req.user,
    req.params.id,
    req.body.userId
  );
  return sendSuccess(res, 200, 'Member added successfully', updatedGroup);
});

/**
 * @desc    Bulk add employees to group
 * @route   POST /api/groups/:id/members/bulk
 * @access  Private (Admin)
 */
const bulkAddMembers = asyncHandler(async (req, res) => {
  const summary = await groupService.bulkAddMembers(
    req.user,
    req.params.id,
    req.body.userIds
  );
  return sendSuccess(res, 200, 'Members added successfully', summary);
});

/**
 * @desc    Remove employee from group
 * @route   DELETE /api/groups/:id/members/:userId
 * @access  Private (Admin)
 */
const removeMember = asyncHandler(async (req, res) => {
  await groupService.removeMember(req.user, req.params.id, req.params.userId);
  return sendSuccess(res, 200, 'Member removed successfully');
});

/**
 * @desc    Admin join group
 * @route   POST /api/groups/:id/join
 * @access  Private (Admin)
 */
const joinGroup = asyncHandler(async (req, res) => {
  const updatedGroup = await groupService.joinGroup(req.user, req.params.id);
  return sendSuccess(res, 200, 'Joined group successfully', updatedGroup);
});

/**
 * @desc    Admin leave group
 * @route   DELETE /api/groups/:id/leave
 * @access  Private (Admin)
 */
const leaveGroup = asyncHandler(async (req, res) => {
  await groupService.leaveGroup(req.user, req.params.id);
  return sendSuccess(res, 200, 'Left group successfully');
});

/**
 * @desc    Soft delete group
 * @route   DELETE /api/groups/:id
 * @access  Private (Admin)
 */
const deleteGroup = asyncHandler(async (req, res) => {
  await groupService.deleteGroup(req.user, req.params.id);
  return sendSuccess(res, 200, 'Group deactivated successfully');
});

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
  deleteGroup
};
