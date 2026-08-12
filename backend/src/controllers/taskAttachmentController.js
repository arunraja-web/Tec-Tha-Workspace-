const { asyncHandler } = require('../middleware/errorMiddleware');
const { sendSuccess } = require('../utils/apiResponse');
const taskAttachmentService = require('../services/taskAttachmentService');

/**
 * @desc    Upload attachment file to task
 * @route   POST /api/tasks/:id/attachments
 * @access  Private (Admin, Founder, Assigned Employee)
 */
const uploadAttachment = asyncHandler(async (req, res) => {
  const attachment = await taskAttachmentService.uploadAttachment(
    req.user,
    req.params.id,
    req.file
  );
  return sendSuccess(res, 201, 'Attachment uploaded successfully', attachment);
});

/**
 * @desc    Delete attachment from task
 * @route   DELETE /api/tasks/:id/attachments/:attachmentId
 * @access  Private (Uploader, Admin, Founder)
 */
const deleteAttachment = asyncHandler(async (req, res) => {
  const result = await taskAttachmentService.deleteAttachment(
    req.user,
    req.params.id,
    req.params.attachmentId
  );
  return sendSuccess(res, 200, result.message);
});

module.exports = {
  uploadAttachment,
  deleteAttachment
};
