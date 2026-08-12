const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  editMessage,
  deleteMessage,
  uploadAttachment
} = require('../controllers/messageController');
const {
  editMessageRules,
  validateMessageId
} = require('../validators/messageValidator');
const { uploadChatFile, handleUploadError } = require('../middleware/uploadMiddleware');

// All message routes require JWT authentication
router.use(protect);

router.post('/attachment', uploadChatFile, handleUploadError, uploadAttachment);
router.put('/:id', editMessageRules, editMessage);
router.delete('/:id', validateMessageId, deleteMessage);

module.exports = router;
