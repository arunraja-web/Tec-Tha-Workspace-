const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const groupController = require('../controllers/groupController');
const {
  validateGroupId,
  createGroupRules,
  updateGroupRules,
  updateStatusRules,
  addMemberRules,
  bulkAddMembersRules,
  removeMemberRules
} = require('../validators/groupValidator');

// Protect all routes with JWT authentication
router.use(protect);

// GET /api/groups/my (Get groups where user is a member)
router.get('/my', groupController.getMyGroups);

// POST /api/groups (Create a new group - Admin only)
router.post('/', authorize('admin'), createGroupRules, groupController.createGroup);

// GET /api/groups (Get all active groups with search & pagination)
router.get('/', groupController.getGroups);

// GET /api/groups/:id (Get single group details)
router.get('/:id', validateGroupId, groupController.getGroupById);

// GET /api/groups/:id/members (Get group members list)
router.get('/:id/members', validateGroupId, groupController.getGroupMembers);

// PUT /api/groups/:id (Update group name/description - Admin only)
router.put('/:id', authorize('admin'), updateGroupRules, groupController.updateGroup);

// PATCH /api/groups/:id/status (Deactivate/Reactivate group - Admin only)
router.patch('/:id/status', authorize('admin'), updateStatusRules, groupController.updateGroupStatus);

// POST /api/groups/:id/members (Add employee to group - Admin only)
router.post('/:id/members', authorize('admin'), addMemberRules, groupController.addMember);

// POST /api/groups/:id/members/bulk (Bulk add employees to group - Admin only)
router.post('/:id/members/bulk', authorize('admin'), bulkAddMembersRules, groupController.bulkAddMembers);

// DELETE /api/groups/:id/members/:userId (Remove employee from group - Admin only)
router.delete('/:id/members/:userId', authorize('admin'), removeMemberRules, groupController.removeMember);

// POST /api/groups/:id/join (Admin join group - Admin only)
router.post('/:id/join', authorize('admin'), validateGroupId, groupController.joinGroup);

// DELETE /api/groups/:id/leave (Admin leave group - Admin only)
router.delete('/:id/leave', authorize('admin'), validateGroupId, groupController.leaveGroup);

// DELETE /api/groups/:id (Soft delete group - Admin only)
router.delete('/:id', authorize('admin'), validateGroupId, groupController.deleteGroup);

module.exports = router;
