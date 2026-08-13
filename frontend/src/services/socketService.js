import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') ||
  'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  /**
   * Connect to Socket.IO server using credentials (HTTP-only cookie)
   */
  connect() {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        withCredentials: true,
        autoConnect: false,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });
    }

    if (!this.socket.connected) {
      this.socket.connect();
    }

    return this.socket;
  }

  /**
   * Disconnect socket instance
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected() {
    return !!(this.socket && this.socket.connected);
  }

  /**
   * Get current socket instance
   */
  getSocket() {
    return this.socket;
  }

  /**
   * Join conversation room
   * @param {string} conversationId 
   * @param {function} callback 
   */
  joinConversation(conversationId, callback) {
    if (this.socket) {
      this.socket.emit('join_conversation', { conversationId }, (ack) => {
        if (typeof callback === 'function') callback(ack);
      });
    }
  }

  /**
   * Leave conversation room
   * @param {string} conversationId 
   * @param {function} callback 
   */
  leaveConversation(conversationId, callback) {
    if (this.socket) {
      this.socket.emit('leave_conversation', { conversationId }, (ack) => {
        if (typeof callback === 'function') callback(ack);
      });
    }
  }

  /**
   * Send real-time message via socket
   * @param {object} payload - { conversationId, content, messageType, attachment, replyTo }
   * @param {function} callback 
   */
  sendMessage(payload, callback) {
    if (this.socket) {
      this.socket.emit('send_message', payload, (ack) => {
        if (typeof callback === 'function') callback(ack);
      });
    }
  }

  /**
   * Emit start typing
   * @param {string} conversationId 
   */
  startTyping(conversationId) {
    if (this.socket && conversationId) {
      this.socket.emit('typing_start', { conversationId });
    }
  }

  /**
   * Emit stop typing
   * @param {string} conversationId 
   */
  stopTyping(conversationId) {
    if (this.socket && conversationId) {
      this.socket.emit('typing_stop', { conversationId });
    }
  }

  /**
   * Mark message/conversation as read via socket
   * @param {string} conversationId 
   * @param {string} messageId 
   * @param {function} callback 
   */
  markRead(conversationId, messageId, callback) {
    if (this.socket && conversationId) {
      this.socket.emit('message_read', { conversationId, messageId }, (ack) => {
        if (typeof callback === 'function') callback(ack);
      });
    }
  }

  /**
   * Event Listeners Helpers
   */
  on(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback); // Prevent duplicate handlers
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export const socketService = new SocketService();
export default socketService;
