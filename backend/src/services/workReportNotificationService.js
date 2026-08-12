const User = require('../models/User');
const { createNotification, createBulkNotifications } = require('./notificationService');

/**
 * Notify all Admins and Founders when an employee submits a work report
 */
const notifyAdminsAndFoundersOnSubmit = async (report, employeeUser) => {
  try {
    const reviewers = await User.find({
      role: { $in: ['admin', 'founder'] },
      isActive: true,
      deletedAt: null
    }).select('_id');

    // Exclude employee themselves if they have admin/founder role
    const recipientIds = reviewers
      .map((r) => r._id.toString())
      .filter((id) => id !== employeeUser._id.toString());

    if (recipientIds.length > 0) {
      await createBulkNotifications(recipientIds, {
        title: 'New Daily Work Report Submitted',
        message: `${employeeUser.name} submitted today's work report.`,
        type: 'WORK_REPORT_SUBMITTED'
      });
    }
  } catch (error) {
    console.error('Failed to send work report submit notification:', error.message);
  }
};

/**
 * Notify employee when their work report is reviewed (approved or revision requested)
 */
const notifyEmployeeOnReview = async (report, reviewerUser, action, comment) => {
  try {
    const employeeId = report.employee._id ? report.employee._id : report.employee;
    if (employeeId.toString() === reviewerUser._id.toString()) return;

    const isApproved = action === 'approved' || action === 'approve';
    const title = isApproved ? 'Work Report Approved' : 'Work Report Needs Revision';
    const message = isApproved
      ? `Your work report has been reviewed and approved by ${reviewerUser.name}.`
      : `Your work report needs revision. Comment: "${comment || 'Please update your report details.'}"`;

    await createNotification({
      recipient: employeeId,
      title,
      message,
      type: isApproved ? 'WORK_REPORT_REVIEWED' : 'WORK_REPORT_REVISION_REQUESTED'
    });
  } catch (error) {
    console.error('Failed to send work report review notification:', error.message);
  }
};

/**
 * Notify employee with daily reminder to submit report
 */
const notifyEmployeeReminder = async (employeeId, dateStr) => {
  try {
    await createNotification({
      recipient: employeeId,
      title: 'Daily Work Report Reminder',
      message: `Please submit today's (${dateStr}) work report.`,
      type: 'WORK_REPORT_REMINDER'
    });
  } catch (error) {
    console.error('Failed to send work report reminder notification:', error.message);
  }
};

module.exports = {
  notifyAdminsAndFoundersOnSubmit,
  notifyEmployeeOnReview,
  notifyEmployeeReminder
};
