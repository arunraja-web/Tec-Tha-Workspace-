const mongoose = require('mongoose');

const attendanceExportSchema = new mongoose.Schema(
  {
    month: {
      type: String,
      required: [true, 'Month string (YYYY-MM) is required'],
      unique: true,
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: ['processing', 'completed', 'failed'],
        message: 'Status must be processing, completed, or failed'
      },
      default: 'processing'
    },
    fileName: {
      type: String,
      default: null
    },
    cloudinaryPublicId: {
      type: String,
      default: null
    },
    fileUrl: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return !v.startsWith('data:') && (v.startsWith('http://') || v.startsWith('https://'));
        },
        message: 'Export fileUrl must be a valid Cloudinary HTTPS URL and cannot be a Base64 Data URI.'
      }
    },
    recordCount: {
      type: Number,
      default: 0
    },
    exportedAt: {
      type: Date,
      default: null
    },
    deletedAt: {
      type: Date,
      default: null
    },
    errorMessage: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const AttendanceExport = mongoose.model('AttendanceExport', attendanceExportSchema);

module.exports = AttendanceExport;
