const WorkReport = require('../models/WorkReport');
const ActivityLog = require('../models/ActivityLog');
const { uploadWorkReportAttachmentToCloudinary, deleteCloudinaryAsset } = require('../utils/cloudinary');
const { formatDateToYYYYMM, formatDateToYYYYMMDD } = require('../utils/dateUtils');

/**
 * Add attachment to a work report
 */
const addAttachment = async (reportId, user, file) => {
  if (!file || !file.buffer) {
    throw new Error('File buffer is required');
  }

  const report = await WorkReport.findById(reportId);
  if (!report) {
    const error = new Error('Work report not found');
    error.statusCode = 404;
    throw error;
  }

  // Authorization check: employee can add file only to their own draft or needs_revision report
  if (report.employee.toString() !== user._id.toString()) {
    const error = new Error('You can only upload attachments to your own work report');
    error.statusCode = 403;
    throw error;
  }

  if (!['draft', 'needs_revision'].includes(report.status)) {
    const error = new Error(`Cannot add attachments to a report with status '${report.status}'`);
    error.statusCode = 400;
    throw error;
  }

  const reportMonthStr = formatDateToYYYYMM(report.reportDate);
  const [yearStr, monthStr] = reportMonthStr.split('-');

  // Upload to Cloudinary
  const uploadResult = await uploadWorkReportAttachmentToCloudinary(
    file.buffer,
    file.originalname,
    file.mimetype,
    yearStr,
    monthStr
  );

  const attachmentData = {
    fileName: uploadResult.fileName,
    fileUrl: uploadResult.fileUrl,
    publicId: uploadResult.publicId,
    fileType: uploadResult.fileType,
    fileSize: uploadResult.fileSize,
    uploadedBy: user._id,
    uploadedAt: new Date()
  };

  report.attachments.push(attachmentData);
  await report.save();

  // Record ActivityLog
  await ActivityLog.create({
    performedBy: user._id,
    targetUser: report.employee,
    report: report._id,
    action: 'WORK_REPORT_ATTACHMENT_ADDED',
    description: `Added attachment '${uploadResult.fileName}' to work report`
  });

  return await WorkReport.findById(report._id)
    .populate('employee', '_id name email role department')
    .populate('tasks', '_id title status progress');
};

/**
 * Remove attachment from a work report
 */
const removeAttachment = async (reportId, user, attachmentId) => {
  const report = await WorkReport.findById(reportId);
  if (!report) {
    const error = new Error('Work report not found');
    error.statusCode = 404;
    throw error;
  }

  const isOwner = report.employee.toString() === user._id.toString();
  const isAdminOrFounder = ['admin', 'founder'].includes(user.role);

  if (!isOwner && !isAdminOrFounder) {
    const error = new Error('Not authorized to delete attachments from this report');
    error.statusCode = 403;
    throw error;
  }

  // If employee, can only modify if draft or needs_revision
  if (isOwner && !['draft', 'needs_revision'].includes(report.status)) {
    const error = new Error(`Cannot remove attachments from a report with status '${report.status}'`);
    error.statusCode = 400;
    throw error;
  }

  const attachment = report.attachments.id(attachmentId);
  if (!attachment) {
    const error = new Error('Attachment not found');
    error.statusCode = 404;
    throw error;
  }

  const publicId = attachment.publicId;
  const fileName = attachment.fileName;
  const resourceType = attachment.fileType === 'image' ? 'image' : 'raw';

  // Delete from Cloudinary
  if (publicId) {
    await deleteCloudinaryAsset(publicId, resourceType);
  }

  report.attachments.pull(attachmentId);
  await report.save();

  // Record ActivityLog
  await ActivityLog.create({
    performedBy: user._id,
    targetUser: report.employee,
    report: report._id,
    action: 'WORK_REPORT_ATTACHMENT_REMOVED',
    description: `Removed attachment '${fileName}' from work report`
  });

  return await WorkReport.findById(report._id)
    .populate('employee', '_id name email role department')
    .populate('tasks', '_id title status progress');
};

module.exports = {
  addAttachment,
  removeAttachment
};
