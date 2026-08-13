const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true
    },
    fileUrl: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          if (!v) return false;
          return !v.startsWith('data:') && (v.startsWith('http://') || v.startsWith('https://'));
        },
        message: 'Attachment fileUrl must be a valid Cloudinary HTTPS URL and cannot be a Base64 Data URI.'
      }
    },
    publicId: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      default: 'file'
    },
    fileSize: {
      type: Number,
      default: 0
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const workReportSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required']
    },
    reportDate: {
      type: Date,
      required: [true, 'Report date is required']
    },
    summary: {
      type: String,
      trim: true,
      maxlength: [3000, 'Summary cannot exceed 3000 characters'],
      default: ''
    },
    completedWork: {
      type: String,
      trim: true,
      maxlength: [5000, 'Completed work cannot exceed 5000 characters'],
      default: ''
    },
    challenges: {
      type: String,
      trim: true,
      maxlength: [3000, 'Challenges cannot exceed 3000 characters'],
      default: ''
    },
    nextDayPlan: {
      type: String,
      trim: true,
      maxlength: [3000, 'Next day plan cannot exceed 3000 characters'],
      default: ''
    },
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
      }
    ],
    attachments: [attachmentSchema],
    status: {
      type: String,
      enum: {
        values: ['draft', 'submitted', 'needs_revision', 'reviewed'],
        message: 'Invalid work report status'
      },
      default: 'draft'
    },
    submittedAt: {
      type: Date,
      default: null
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    reviewComment: {
      type: String,
      trim: true,
      default: ''
    },
    revisionRequestedAt: {
      type: Date,
      default: null
    },
    reminderSentAt: {
      type: Date,
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

// Compound Unique Index: Maximum ONE work report per employee per reportDate
workReportSchema.index(
  { employee: 1, reportDate: 1 },
  { unique: true }
);

// Auxiliary Query Performance Indexes
workReportSchema.index({ status: 1, reportDate: -1 });
workReportSchema.index({ reportDate: -1 });
workReportSchema.index({ summary: 'text', completedWork: 'text', challenges: 'text', nextDayPlan: 'text' });

const WorkReport = mongoose.model('WorkReport', workReportSchema);

module.exports = WorkReport;
