const mongoose = require('mongoose');

const taskHistorySchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task reference is required']
    },
    action: {
      type: String,
      enum: [
        'TASK_CREATED',
        'TASK_ASSIGNED',
        'TASK_REASSIGNED',
        'TASK_UPDATED',
        'STATUS_CHANGED',
        'PROGRESS_CHANGED',
        'PRIORITY_CHANGED',
        'DUE_DATE_CHANGED',
        'COMMENT_ADDED',
        'COMMENT_UPDATED',
        'COMMENT_DELETED',
        'ATTACHMENT_ADDED',
        'ATTACHMENT_REMOVED',
        'SUBTASK_CREATED',
        'SUBTASK_UPDATED',
        'SUBTASK_DELETED',
        'TASK_COMPLETED',
        'TASK_REOPENED',
        'TASK_CANCELLED',
        'TASK_ARCHIVED',
        'TASK_RESTORED',
        'TASK_DUPLICATED',
        'TASK_DELETED'
      ],
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Performed by user is required']
    },
    previousValue: {
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
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

taskHistorySchema.index({ task: 1, createdAt: -1 });
taskHistorySchema.index({ performedBy: 1 });

const TaskHistory = mongoose.model('TaskHistory', taskHistorySchema);

module.exports = TaskHistory;
