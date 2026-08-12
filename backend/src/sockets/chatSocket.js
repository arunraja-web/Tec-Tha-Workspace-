const { Server } = require('socket.io');
const socketAuthMiddleware = require('./socketAuth');
const conversationService = require('../services/conversationService');
const messageService = require('../services/messageService');
const presenceService = require('../services/presenceService');
const { notifyMessageRecipients } = require('../services/chatNotificationService');

// Safe In-Memory Rate Limiting for Sockets (per user/socket)
const rateLimits = new Map();

const isRateLimited = (socketId, action, limit = 10, windowMs = 5000) => {
  const key = `${socketId}:${action}`;
  const now = Date.now();

  if (!rateLimits.has(key)) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  const record = rateLimits.get(key);
  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + windowMs;
    return false;
  }

  record.count += 1;
  if (record.count > limit) {
    return true;
  }

  return false;
};

/**
 * Initialize Socket.IO server and handlers
 */
const initSocketServer = (httpServer, corsOptions) => {
  const io = new Server(httpServer, {
    cors: corsOptions || {
      origin: true,
      credentials: true
    }
  });

  // Attach authentication middleware
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    const user = socket.user;
    const userId = user._id.toString();

    // 1. Join personal room (user:{userId})
    const personalRoom = `user:${userId}`;
    socket.join(personalRoom);

    // 2. Track Presence
    const wasOffline = presenceService.addUserSocket(userId, socket.id);
    if (wasOffline) {
      // Broadcast online status to all connected sockets
      io.emit('user_online', {
        userId,
        isOnline: true
      });
    }

    // Handle join_conversation
    socket.on('join_conversation', async (data, ack) => {
      try {
        const conversationId = typeof data === 'object' ? data.conversationId : data;

        const { conversation } = await conversationService.verifyConversationAccess(
          user,
          conversationId
        );

        const roomName = `conversation:${conversation._id}`;
        socket.join(roomName);

        if (typeof ack === 'function') {
          ack({
            success: true,
            conversationId: conversation._id
          });
        }
      } catch (error) {
        if (typeof ack === 'function') {
          ack({
            success: false,
            message: error.message || 'Failed to join conversation'
          });
        }
      }
    });

    // Handle leave_conversation
    socket.on('leave_conversation', (data, ack) => {
      try {
        const conversationId = typeof data === 'object' ? data.conversationId : data;
        if (conversationId) {
          socket.leave(`conversation:${conversationId}`);
        }
        if (typeof ack === 'function') {
          ack({ success: true });
        }
      } catch (error) {
        if (typeof ack === 'function') {
          ack({ success: false, message: error.message });
        }
      }
    });

    // Handle send_message via Socket.IO
    socket.on('send_message', async (data, ack) => {
      try {
        if (isRateLimited(socket.id, 'send_message', 10, 5000)) {
          if (typeof ack === 'function') {
            return ack({
              success: false,
              message: 'Rate limit exceeded. Please slow down.'
            });
          }
          return;
        }

        const { conversationId, content, messageType, attachment, replyTo } = data || {};

        // Verify access & save to MongoDB FIRST
        const { conversation } = await conversationService.verifyConversationAccess(
          user,
          conversationId
        );

        const savedMessage = await messageService.createMessage(user, {
          conversationId: conversation._id,
          content,
          messageType,
          attachment,
          replyTo
        });

        // Emit new_message to conversation room
        const roomName = `conversation:${conversation._id}`;
        io.to(roomName).emit('new_message', savedMessage);

        // Also emit to direct recipient's personal room if direct chat
        if (conversation.type === 'direct') {
          const recipientId = conversation.participants.find(
            (pId) => pId.toString() !== userId
          );
          if (recipientId) {
            io.to(`user:${recipientId.toString()}`).emit('new_message', savedMessage);
          }
        }

        // Fetch active socket users in conversation room for notification check
        const roomSockets = await io.in(roomName).fetchSockets();
        const activeUsersInRoom = roomSockets.map((s) => s.user?._id?.toString()).filter(Boolean);

        notifyMessageRecipients(savedMessage, conversation, activeUsersInRoom);

        if (typeof ack === 'function') {
          ack({
            success: true,
            message: savedMessage
          });
        }
      } catch (error) {
        if (typeof ack === 'function') {
          ack({
            success: false,
            message: error.message || 'Failed to send message'
          });
        }
      }
    });

    // Handle typing_start
    socket.on('typing_start', async (data) => {
      try {
        if (isRateLimited(socket.id, 'typing', 20, 5000)) return;

        const conversationId = typeof data === 'object' ? data.conversationId : data;
        if (!conversationId) return;

        await conversationService.verifyConversationAccess(user, conversationId);

        socket.to(`conversation:${conversationId}`).emit('user_typing', {
          conversationId,
          user: {
            _id: user._id,
            name: user.name
          }
        });
      } catch (error) {
        // Silently swallow typing errors
      }
    });

    // Handle typing_stop
    socket.on('typing_stop', async (data) => {
      try {
        const conversationId = typeof data === 'object' ? data.conversationId : data;
        if (!conversationId) return;

        socket.to(`conversation:${conversationId}`).emit('user_typing_stop', {
          conversationId,
          userId: user._id
        });
      } catch (error) {
        // Silently swallow typing errors
      }
    });

    // Handle message_read
    socket.on('message_read', async (data, ack) => {
      try {
        const { conversationId, messageId } = data || {};
        if (!conversationId) return;

        const readResult = await conversationService.markConversationAsRead(
          user,
          conversationId,
          messageId
        );

        // Broadcast message_read event to room
        io.to(`conversation:${conversationId}`).emit('message_read', {
          conversationId,
          user: {
            _id: user._id,
            name: user.name
          },
          lastReadMessage: readResult.lastReadMessage,
          lastReadAt: readResult.lastReadAt
        });

        if (typeof ack === 'function') {
          ack({ success: true, readResult });
        }
      } catch (error) {
        if (typeof ack === 'function') {
          ack({ success: false, message: error.message });
        }
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const becameOffline = presenceService.removeUserSocket(userId, socket.id);
      if (becameOffline) {
        io.emit('user_offline', {
          userId,
          isOnline: false,
          lastSeen: new Date()
        });
      }
    });
  });

  return io;
};

module.exports = {
  initSocketServer
};
