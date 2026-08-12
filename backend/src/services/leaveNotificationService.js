const User = require('../models/User');
const { createNotification, createBulkNotifications } = require('./notificationService');
const { formatDateToYYYYMMDD } = require('../utils/dateUtils');

/**
 * Notify all active Founders when an employee submits a leave request
 */
const notifyFoundersOnCreate = async (leave, employeeUser) => {
  try {
    const founders = await User.find({
      role: 'founder',
      isActive: true,
      deletedAt: null
    }).select('_id');

    // Exclude employee themselves if they are a founder
    const recipientIds = founders
      .map((f) => f._id.toString())
      .filter((id) => id !== employeeUser._id.toString());

    if (recipientIds.length > 0) {
      const startStr = formatDateToYYYYMMDD(leave.startDate);
      const endStr = formatDateToYYYYMMDD(leave.endDate);

      await createBulkNotifications(recipientIds, {
        title: 'New Leave Request Submitted',
        message: `${employeeUser.name} submitted a ${leave.leaveType} leave request from ${startStr} to ${endStr}.`,
        type: 'LEAVE_SUBMITTED'
      });
    }
  } catch (error) {
    console.error('Failed to send leave creation notification:', error.message);
  }
};

/**
 * Notify employee when their leave request is approved
 */
const notifyEmployeeOnApprove = async (leave, reviewerUser) => {
  try {
    const employeeId = leave.employee._id ? leave.employee._id : leave.employee;
    if (employeeId.toString() === reviewerUser._id.toString()) return;

    const startStr = formatDateToYYYYMMDD(leave.startDate);
    const endStr = formatDateToYYYYMMDD(leave.endDate);

    await createNotification({
      recipient: employeeId,
      title: 'Leave Request Approved',
      message: `Your ${leave.leaveType} leave request from ${startStr} to ${endStr} has been approved by ${reviewerUser.name}.`,
      type: 'LEAVE_APPROVED'
    });
  } catch (error) {
    console.error('Failed to send leave approval notification:', error.message);
  }
};

/**
 * Notify employee when their leave request is rejected
 */
const notifyEmployeeOnReject = async (leave, reviewerUser, comment) => {
  try {
    const employeeId = leave.employee._id ? leave.employee._id : leave.employee;
    if (employeeId.toString() === reviewerUser._id.toString()) return;

    const startStr = formatDateToYYYYMMDD(leave.startDate);
    const endStr = formatDateToYYYYMMDD(leave.endDate);
    const commentMsg = comment ? ` Reason: "${comment}"` : '';

    await createNotification({
      recipient: employeeId,
      title: 'Leave Request Rejected',
      message: `Your ${leave.leaveType} leave request from ${startStr} to ${endStr} has been rejected.${commentMsg}`,
      type: 'LEAVE_REJECTED'
    });
  } catch (error) {
    console.error('Failed to send leave rejection notification:', error.message);
  }
};

/**
 * Notify Founders when an employee cancels a pending leave
 */
const notifyFoundersOnCancel = async (leave, employeeUser) => {
  try {
    const founders = await User.find({
      role: 'founder',
      isActive: true,
      deletedAt: null
    }).select('_id');

    const recipientIds = founders
      .map((f) => f._id.toString())
      .filter((id) => id !== employeeUser._id.toString());

    if (recipientIds.length > 0) {
      const startStr = formatDateToYYYYMMDD(leave.startDate);
      const endStr = formatDateToYYYYMMDD(leave.endDate);

      await createBulkNotifications(recipientIds, {
        title: 'Leave Request Cancelled',
        message: `${employeeUser.name} cancelled their ${leave.leaveType} leave request for ${startStr} to ${endStr}.`,
        type: 'LEAVE_CANCELLED'
      });
    }
  } catch (error) {
    console.error('Failed to send leave cancellation notification:', error.message);
  }
};

module.exports = {
  notifyFoundersOnCreate,
  notifyEmployeeOnApprove,
  notifyEmployeeOnReject,
  notifyFoundersOnCancel
};
