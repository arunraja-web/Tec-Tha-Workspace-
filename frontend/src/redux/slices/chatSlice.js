import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import chatService from '../../services/chatService';

// The API serializes Mongoose documents with `id`, while the chat UI uses
// `_id`. Keep that conversion at the API boundary so every consumer receives
// one stable chat shape. Messages use `conversation` in MongoDB, but the
// client indexes messages by `conversationId`.
const normalizeUser = (user) => {
  if (!user || typeof user !== 'object') return user;
  return { ...user, _id: user._id || user.id };
};

const normalizeMessage = (message) => {
  if (!message || typeof message !== 'object') return message;
  const conversationId = message.conversationId || message.conversation;
  return {
    ...message,
    _id: message._id || message.id,
    conversationId:
      typeof conversationId === 'object'
        ? conversationId._id || conversationId.id
        : conversationId,
    sender: normalizeUser(message.sender),
    replyTo: message.replyTo
      ? { ...message.replyTo, _id: message.replyTo._id || message.replyTo.id, sender: normalizeUser(message.replyTo.sender) }
      : message.replyTo,
  };
};

const normalizeConversation = (conversation) => {
  if (!conversation || typeof conversation !== 'object') return conversation;
  return {
    ...conversation,
    _id: conversation._id || conversation.id,
    user: normalizeUser(conversation.user),
    participants: Array.isArray(conversation.participants)
      ? conversation.participants.map(normalizeUser)
      : [],
    lastMessage: normalizeMessage(conversation.lastMessage),
  };
};

// Async Thunks
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatService.getConversations();
      if (Array.isArray(response)) return response.map(normalizeConversation);
      if (Array.isArray(response.data)) return response.data.map(normalizeConversation);
      if (response.data && Array.isArray(response.data.conversations)) return response.data.conversations.map(normalizeConversation);
      if (Array.isArray(response.conversations)) return response.conversations.map(normalizeConversation);
      return [];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch conversations');
    }
  }
);

export const createDirectConversation = createAsyncThunk(
  'chat/createDirectConversation',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await chatService.createDirectConversation(userId);
      if (response.data && response.data.conversation) return normalizeConversation(response.data.conversation);
      if (response.conversation) return normalizeConversation(response.conversation);
      if (response.data && (response.data._id || response.data.id)) return normalizeConversation(response.data);
      return normalizeConversation(response.data || response);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create direct conversation');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ conversationId, before, limit = 30 }, { rejectWithValue }) => {
    try {
      const response = await chatService.getMessages(conversationId, { limit, before });
      let messages = [];
      if (Array.isArray(response)) {
        messages = response;
      } else if (Array.isArray(response.data)) {
        messages = response.data;
      } else if (response.data && Array.isArray(response.data.messages)) {
        messages = response.data.messages;
      } else if (Array.isArray(response.messages)) {
        messages = response.messages;
      }

      const pagination = response.pagination || (response.data && response.data.pagination) || {
        hasMore: messages.length >= limit,
        limit,
      };

      return { conversationId, messages: messages.map(normalizeMessage), pagination, isOlder: !!before };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch messages');
    }
  }
);

export const sendMessageRest = createAsyncThunk(
  'chat/sendMessageRest',
  async ({ conversationId, content, messageType, attachment, replyTo }, { rejectWithValue }) => {
    try {
      const response = await chatService.sendMessage(conversationId, {
        content,
        messageType,
        attachment,
        replyTo,
      });
      return normalizeMessage(response.data || response.message || response);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to send message');
    }
  }
);

export const editMessage = createAsyncThunk(
  'chat/editMessage',
  async ({ messageId, content }, { rejectWithValue }) => {
    try {
      const response = await chatService.editMessage(messageId, { content });
      return normalizeMessage(response.data || response.message || response);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to edit message');
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'chat/deleteMessage',
  async (messageId, { rejectWithValue }) => {
    try {
      const response = await chatService.deleteMessage(messageId);
      return { messageId, message: response.data || response.message || response };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete message');
    }
  }
);

export const markConversationRead = createAsyncThunk(
  'chat/markConversationRead',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await chatService.markConversationRead(conversationId);
      return { conversationId, result: response.data || response };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to mark conversation read');
    }
  }
);

const initialState = {
  conversations: [],
  selectedConversationId: null,
  messagesByConversation: {},
  paginationByConversation: {},
  onlineUsers: {},
  typingUsers: {}, // { [conversationId]: { [userId]: userName } }
  socketConnected: false,
  loading: false,
  messagesLoading: false,
  sending: false,
  uploading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSelectedConversation: (state, action) => {
      state.selectedConversationId = action.payload;
      // Reset unread count for selected conversation
      if (action.payload) {
        const convIndex = state.conversations.findIndex((c) => c._id === action.payload);
        if (convIndex !== -1) {
          state.conversations[convIndex].unreadCount = 0;
        }
      }
    },

    setSocketConnected: (state, action) => {
      state.socketConnected = action.payload;
    },

    receiveNewMessage: (state, action) => {
      const message = normalizeMessage(action.payload);
      if (!message || !message.conversationId) return;

      const conversationId =
        typeof message.conversationId === 'object'
          ? message.conversationId._id
          : message.conversationId;

      // Initialize array if not present
      if (!state.messagesByConversation[conversationId]) {
        state.messagesByConversation[conversationId] = [];
      }

      const existingMessages = state.messagesByConversation[conversationId];

      // Deduplicate by _id
      const existsIndex = existingMessages.findIndex((m) => m._id === message._id);
      if (existsIndex !== -1) {
        // Replace existing message (useful for updating pending/optimistic messages)
        existingMessages[existsIndex] = message;
      } else {
        existingMessages.push(message);
      }

      // Update conversation's lastMessage & lastMessageAt preview
      const convIndex = state.conversations.findIndex((c) => c._id === conversationId);
      if (convIndex !== -1) {
        state.conversations[convIndex].lastMessage = message;
        state.conversations[convIndex].lastMessageAt = message.createdAt || new Date().toISOString();

        // Increment unread count if conversation is NOT currently active
        if (state.selectedConversationId !== conversationId) {
          state.conversations[convIndex].unreadCount =
            (state.conversations[convIndex].unreadCount || 0) + 1;
        }
      }
    },

    receiveMessageEdited: (state, action) => {
      const editedMessage = normalizeMessage(action.payload);
      if (!editedMessage || !editedMessage.conversationId) return;

      const conversationId =
        typeof editedMessage.conversationId === 'object'
          ? editedMessage.conversationId._id
          : editedMessage.conversationId;

      const messages = state.messagesByConversation[conversationId];
      if (messages) {
        const idx = messages.findIndex((m) => m._id === editedMessage._id);
        if (idx !== -1) {
          messages[idx] = { ...messages[idx], ...editedMessage, isEdited: true };
        }
      }

      // Update last message in conversation preview if applicable
      const convIndex = state.conversations.findIndex((c) => c._id === conversationId);
      if (convIndex !== -1 && state.conversations[convIndex].lastMessage?._id === editedMessage._id) {
        state.conversations[convIndex].lastMessage = editedMessage;
      }
    },

    receiveMessageDeleted: (state, action) => {
      const deletedMessage = normalizeMessage(action.payload);
      const messageId = deletedMessage?._id;
      const conversationId = deletedMessage?.conversationId;
      if (!conversationId || !messageId) return;

      const messages = state.messagesByConversation[conversationId];
      if (messages) {
        const idx = messages.findIndex((m) => m._id === messageId);
        if (idx !== -1) {
          messages[idx] = {
            ...messages[idx],
            isDeleted: true,
            content: 'This message was deleted.',
            attachment: null,
          };
        }
      }
    },

    receiveMessageRead: (state, action) => {
      const { conversationId } = action.payload || {};
      if (!conversationId) return;

      const convIndex = state.conversations.findIndex((c) => c._id === conversationId);
      if (convIndex !== -1) {
        state.conversations[convIndex].unreadCount = 0;
      }
    },

    setTypingUser: (state, action) => {
      const { conversationId, user } = action.payload;
      if (!conversationId || !user || !user._id) return;

      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = {};
      }
      state.typingUsers[conversationId][user._id] = user.name || 'Someone';
    },

    clearTypingUser: (state, action) => {
      const { conversationId, userId } = action.payload;
      if (!conversationId || !userId) return;

      if (state.typingUsers[conversationId]) {
        delete state.typingUsers[conversationId][userId];
        if (Object.keys(state.typingUsers[conversationId]).length === 0) {
          delete state.typingUsers[conversationId];
        }
      }
    },

    setOnlineUsersList: (state, action) => {
      const { onlineUserIds = [] } = action.payload || {};
      onlineUserIds.forEach((id) => {
        if (id) {
          const cleanId = String(id).trim();
          state.onlineUsers[cleanId] = {
            isOnline: true,
            lastSeen: new Date().toISOString(),
          };
        }
      });
    },

    setUserPresence: (state, action) => {
      const { userId, isOnline, lastSeen } = action.payload || {};
      if (!userId) return;

      const cleanId = String(userId).trim();
      state.onlineUsers[cleanId] = {
        isOnline: !!isOnline,
        lastSeen: lastSeen || new Date().toISOString(),
      };
    },

    clearChatError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchConversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createDirectConversation
      .addCase(createDirectConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDirectConversation.fulfilled, (state, action) => {
        state.loading = false;
        const newConv = action.payload;
        const existingIdx = state.conversations.findIndex((c) => c._id === newConv._id);
        if (existingIdx !== -1) {
          state.conversations[existingIdx] = newConv;
        } else {
          state.conversations.unshift(newConv);
        }
        state.selectedConversationId = newConv._id;
      })
      .addCase(createDirectConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchMessages
      .addCase(fetchMessages.pending, (state) => {
        state.messagesLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        const { conversationId, messages, pagination, isOlder } = action.payload;

        const currentMessages = state.messagesByConversation[conversationId] || [];

        if (isOlder) {
          // Prepend older messages cleanly without duplicates
          const newMsgIds = new Set(messages.map((m) => m._id));
          const filteredCurrent = currentMessages.filter((m) => !newMsgIds.has(m._id));
          state.messagesByConversation[conversationId] = [...messages, ...filteredCurrent];
        } else {
          // Fresh message fetch replace / merge
          state.messagesByConversation[conversationId] = messages;
        }

        state.paginationByConversation[conversationId] = pagination;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.error = action.payload;
      })

      // sendMessageRest
      .addCase(sendMessageRest.pending, (state) => {
        state.sending = true;
      })
      .addCase(sendMessageRest.fulfilled, (state, action) => {
        state.sending = false;
        const message = action.payload;
        if (message && message.conversationId) {
          const convId =
            typeof message.conversationId === 'object'
              ? message.conversationId._id
              : message.conversationId;

          if (!state.messagesByConversation[convId]) {
            state.messagesByConversation[convId] = [];
          }
          const exists = state.messagesByConversation[convId].some((m) => m._id === message._id);
          if (!exists) {
            state.messagesByConversation[convId].push(message);
          }
        }
      })
      .addCase(sendMessageRest.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      })

      // editMessage
      .addCase(editMessage.fulfilled, (state, action) => {
        const editedMessage = action.payload;
        if (!editedMessage || !editedMessage.conversationId) return;

        const conversationId =
          typeof editedMessage.conversationId === 'object'
            ? editedMessage.conversationId._id
            : editedMessage.conversationId;

        const messages = state.messagesByConversation[conversationId];
        if (messages) {
          const idx = messages.findIndex((m) => m._id === editedMessage._id);
          if (idx !== -1) {
            messages[idx] = editedMessage;
          }
        }
      })

      // deleteMessage
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const { messageId } = action.payload;
        Object.keys(state.messagesByConversation).forEach((convId) => {
          const messages = state.messagesByConversation[convId];
          const idx = messages.findIndex((m) => m._id === messageId);
          if (idx !== -1) {
            messages[idx] = {
              ...messages[idx],
              isDeleted: true,
              content: 'This message was deleted.',
              attachment: null,
            };
          }
        });
      })

      // markConversationRead
      .addCase(markConversationRead.fulfilled, (state, action) => {
        const { conversationId } = action.payload;
        const convIndex = state.conversations.findIndex((c) => c._id === conversationId);
        if (convIndex !== -1) {
          state.conversations[convIndex].unreadCount = 0;
        }
      });
  },
});

export const {
  setSelectedConversation,
  setSocketConnected,
  receiveNewMessage,
  receiveMessageEdited,
  receiveMessageDeleted,
  receiveMessageRead,
  setTypingUser,
  clearTypingUser,
  setUserPresence,
  setOnlineUsersList,
  clearChatError,
} = chatSlice.actions;

export default chatSlice.reducer;
