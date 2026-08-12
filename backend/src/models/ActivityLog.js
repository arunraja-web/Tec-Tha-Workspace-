const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      default: null
    },
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkReport',
      default: null
    },
    leave: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Leave',
      default: null
    },
    action: {
      type: String,
      enum: [
        'USER_CREATED',
        'USER_UPDATED',
        'USER_DEACTIVATED',
        'USER_REACTIVATED',
        'USER_ROLE_CHANGED',
        'USER_DELETED',
        'GROUP_CREATED',
        'GROUP_UPDATED',
        'MEMBER_ADDED',
        'MEMBER_REMOVED',
        'ADMIN_JOINED_GROUP',
        'ADMIN_LEFT_GROUP',
        'GROUP_DEACTIVATED',
        'GROUP_REACTIVATED',
        'MESSAGE_SENT',
        'MESSAGE_EDITED',
        'MESSAGE_DELETED',
        'TASK_CREATED',
        'TASK_ASSIGNED',
        'TASK_REASSIGNED',
        'TASK_UPDATED',
        'TASK_STATUS_CHANGED',
        'TASK_PROGRESS_CHANGED',
        'TASK_COMPLETED',
        'TASK_REOPENED',
        'TASK_CANCELLED',
        'TASK_ARCHIVED',
        'TASK_RESTORED',
        'TASK_DELETED',
        'TASK_COMMENT_ADDED',
        'TASK_ATTACHMENT_ADDED',
        'WORK_REPORT_CREATED',
        'WORK_REPORT_UPDATED',
        'WORK_REPORT_SUBMITTED',
        'WORK_REPORT_REVIEWED',
        'WORK_REPORT_REVISION_REQUESTED',
        'WORK_REPORT_ATTACHMENT_ADDED',
        'WORK_REPORT_ATTACHMENT_REMOVED',
        'LEAVE_CREATED',
        'LEAVE_UPDATED',
        'LEAVE_CANCELLED',
        'LEAVE_APPROVED',
        'LEAVE_REJECTED'
      ],
      required: true
    },
    description: {
      type: String,
      default: null
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

activityLogSchema.index({ performedBy: 1, action: 1 });
activityLogSchema.index({ group: 1 });
activityLogSchema.index({ targetUser: 1 });
activityLogSchema.index({ report: 1 });
activityLogSchema.index({ leave: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
