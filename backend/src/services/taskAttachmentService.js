const Task = require('../models/Task');
const TaskHistory = require('../models/TaskHistory');
const ActivityLog = require('../models/ActivityLog');
const { uploadTaskAttachmentToCloudinary, deleteCloudinaryAsset } = require('../utils/cloudinary');

/**
 * Upload attachment file for task
 */
const uploadAttachment = async (currentUser, taskId, file) => {
  if (!file) {
    const err = new Error('No attachment file provided');
    err.statusCode = 400;
    throw err;
  }

  const task = await Task.findById(taskId);
  if (!task) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }

  // Authorization check
  if (
    currentUser.role === 'employee' &&
    task.assignedTo.toString() !== currentUser._id.toString()
  ) {
    const err = new Error('Not authorized to add attachments to this task');
    err.statusCode = 403;
    throw err;
  }

  // Upload to Cloudinary
  const uploadResult = await uploadTaskAttachmentToCloudinary(
    file.buffer,
    file.originalname,
    file.mimetype
  );

  const attachmentData = {
    fileName: uploadResult.fileName,
    fileUrl: uploadResult.fileUrl,
    publicId: uploadResult.publicId,
    fileType: uploadResult.fileType,
    fileSize: uploadResult.fileSize,
    uploadedBy: currentUser._id,
    uploadedAt: new Date()
  };

  task.attachments.push(attachmentData);
  await task.save();

  const newAttachment = task.attachments[task.attachments.length - 1];

  await TaskHistory.create({
    task: task._id,
    action: 'ATTACHMENT_ADDED',
    performedBy: currentUser._id,
    newValue: { attachmentId: newAttachment._id, fileName: newAttachment.fileName }
  });

  await ActivityLog.create({
    performedBy: currentUser._id,
    action: 'TASK_ATTACHMENT_ADDED',
    description: `Uploaded attachment "${newAttachment.fileName}" to task "${task.title}"`
  });

  return newAttachment;
};

/**
 * Delete attachment from task
 */
const deleteAttachment = async (currentUser, taskId, attachmentId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    const err = new Error('Task not found');
    err.statusCode = 404;
    throw err;
  }

  const attachmentIndex = task.attachments.findIndex(
    (att) => att._id.toString() === attachmentId.toString()
  );

  if (attachmentIndex === -1) {
    const err = new Error('Attachment not found');
    err.statusCode = 404;
    throw err;
  }

  const attachment = task.attachments[attachmentIndex];

  // Authorization check: Uploader or Admin/Founder
  const isUploader = attachment.uploadedBy.toString() === currentUser._id.toString();
  const isManagement = ['admin', 'founder'].includes(currentUser.role);

  if (!isUploader && !isManagement) {
    const err = new Error('Not authorized to delete this attachment');
    err.statusCode = 403;
    throw err;
  }

  // Delete from Cloudinary
  if (attachment.publicId) {
    const isImage = attachment.fileType === 'image' || attachment.fileType.startsWith('image/');
    await deleteCloudinaryAsset(attachment.publicId, isImage ? 'image' : 'raw');
  }

  task.attachments.splice(attachmentIndex, 1);
  await task.save();

  await TaskHistory.create({
    task: task._id,
    action: 'ATTACHMENT_REMOVED',
    performedBy: currentUser._id,
    previousValue: { attachmentId, fileName: attachment.fileName }
  });

  return { success: true, message: 'Attachment deleted successfully' };
};

module.exports = {
  uploadAttachment,
  deleteAttachment
};
