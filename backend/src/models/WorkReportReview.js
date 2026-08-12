const mongoose = require('mongoose');

const workReportReviewSchema = new mongoose.Schema(
  {
    report: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkReport',
      required: [true, 'Work report reference is required']
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reviewer user reference is required']
    },
    action: {
      type: String,
      enum: {
        values: ['approved', 'revision_requested'],
        message: 'Action must be approved or revision_requested'
      },
      required: true
    },
    comment: {
      type: String,
      trim: true,
      default: ''
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

workReportReviewSchema.index({ report: 1, createdAt: -1 });
workReportReviewSchema.index({ reviewer: 1 });

const WorkReportReview = mongoose.model('WorkReportReview', workReportReviewSchema);

module.exports = WorkReportReview;
