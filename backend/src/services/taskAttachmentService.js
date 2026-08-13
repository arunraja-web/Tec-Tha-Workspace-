const Task = require('../models/Task');
const TaskHistory = require('../models/TaskHistory');
const ActivityLog = require('../models/ActivityLog');
const { uploadTaskAttachmentToCloudinary, deleteCloudinaryAsset } = require('../utils/cloudinary');
const { canEmployeeAccessTask } = require('./taskService');

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
  const hasAccess = await canEmployeeAccessTask(currentUser, task);
  if (!hasAccess) {
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

  // Authorization check: Uploader, Admin/Founder, or assigned employee / group member
  const uploaderId = attachment.uploadedBy
    ? (attachment.uploadedBy._id || attachment.uploadedBy).toString()
    : null;
  const isUploader = uploaderId && uploaderId === currentUser._id.toString();
  const isManagement = ['admin', 'founder'].includes(currentUser.role);
  const hasAccess = await canEmployeeAccessTask(currentUser, task);

  if (!isUploader && !isManagement && !hasAccess) {
    const err = new Error('Not authorized to delete this attachment');
    err.statusCode = 403;
    throw err;
  }

  // Delete from Cloudinary safely
  if (attachment.publicId && !attachment.publicId.startsWith('data_uri_')) {
    try {
      const isImage = attachment.fileType === 'image' || (attachment.fileType && attachment.fileType.startsWith('image/'));
      await deleteCloudinaryAsset(attachment.publicId, isImage ? 'image' : 'auto');
    } catch (e) {
      console.warn(`Cloudinary asset deletion warning: ${e.message}`);
    }
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
