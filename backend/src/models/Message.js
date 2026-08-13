const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      trim: true,
      maxlength: [5000, 'Message content cannot exceed 5000 characters'],
      default: ''
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file'],
      default: 'text'
    },
    attachment: {
      fileName: String,
      fileUrl: {
        type: String,
        validate: {
          validator: function (v) {
            if (!v) return true;
            return !v.startsWith('data:') && (v.startsWith('http://') || v.startsWith('https://'));
          },
          message: 'Attachment fileUrl must be a valid Cloudinary HTTPS URL and cannot be a Base64 Data URI.'
        }
      },
      publicId: String,
      fileType: String,
      fileSize: Number
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: {
      type: Date,
      default: null
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
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

// Indexes for pagination and queries
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
