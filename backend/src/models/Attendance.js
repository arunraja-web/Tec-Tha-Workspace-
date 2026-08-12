const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: {
        values: ['present', 'absent', 'leave', 'holiday'],
        message: 'Status must be present, absent, leave, or holiday'
      },
      default: null
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    markedAt: {
      type: Date,
      default: null
    }
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee ID is required']
    },
    date: {
      type: Date,
      required: [true, 'Date is required']
    },
    morning: {
      type: sessionSchema,
      default: () => ({ status: null, markedBy: null, markedAt: null })
    },
    evening: {
      type: sessionSchema,
      default: () => ({ status: null, markedBy: null, markedAt: null })
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index ensuring exactly one attendance document per employee per day
attendanceSchema.index(
  { employee: 1, date: 1 },
  { unique: true }
);

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
