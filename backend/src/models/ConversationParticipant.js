const mongoose = require('mongoose');

const conversationParticipantSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    lastReadMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null
    },
    lastReadAt: {
      type: Date,
      default: null
    },
    joinedAt: {
      type: Date,
      default: Date.now
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

// Unique index: conversation + user
conversationParticipantSchema.index({ conversation: 1, user: 1 }, { unique: true });
conversationParticipantSchema.index({ user: 1 });

const ConversationParticipant = mongoose.model(
  'ConversationParticipant',
  conversationParticipantSchema
);

module.exports = ConversationParticipant;
