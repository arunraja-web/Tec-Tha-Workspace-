const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeeting,
  updateMeetingStatus,
  deleteMeeting
} = require('../controllers/meetingController');

const {
  validateMeetingId,
  createMeetingRules,
  updateMeetingRules,
  updateStatusRules
} = require('../validators/meetingValidator');

// All routes require authentication
router.use(protect);

// Meeting CRUD endpoints
router
  .route('/')
  .post(createMeetingRules, createMeeting)
  .get(getMeetings);

router
  .route('/:id')
  .get(validateMeetingId, getMeetingById)
  .put(updateMeetingRules, updateMeeting)
  .delete(validateMeetingId, deleteMeeting);

router.patch('/:id/status', updateStatusRules, updateMeetingStatus);

module.exports = router;
