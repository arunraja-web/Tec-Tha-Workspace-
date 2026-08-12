const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee ID is required']
    },
    leaveType: {
      type: String,
      enum: {
        values: ['casual', 'sick', 'annual', 'emergency', 'other'],
        message: 'Leave type must be casual, sick, annual, emergency, or other'
      },
      required: [true, 'Leave type is required']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
      minlength: [3, 'Reason must be at least 3 characters'],
      maxlength: [1000, 'Reason cannot exceed 1000 characters']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected', 'cancelled'],
        message: 'Status must be pending, approved, rejected, or cancelled'
      },
      default: 'pending'
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
    cancelledAt: {
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

// Indexes for date range overlap queries, status filtering, and performance
leaveSchema.index({ employee: 1, startDate: 1 });
leaveSchema.index({ employee: 1, endDate: 1 });
leaveSchema.index({ status: 1, startDate: 1 });
leaveSchema.index({ status: 1, endDate: 1 });
leaveSchema.index({ createdAt: -1 });

const Leave = mongoose.model('Leave', leaveSchema);

module.exports = Leave;
