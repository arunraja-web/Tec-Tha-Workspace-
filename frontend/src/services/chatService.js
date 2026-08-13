import { fetchApi } from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Chat REST API Services
 */
export const chatService = {
  /**
   * Fetch all conversations for the current user
   */
  getConversations: async () => {
    return await fetchApi('/conversations');
  },

  /**
   * Create or retrieve a direct conversation with a target user
   * @param {string} userId - Target user ID
   */
  createDirectConversation: async (userId) => {
    return await fetchApi('/conversations/direct', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  /**
   * Fetch details for a specific conversation by ID
   * @param {string} conversationId 
   */
  getConversationById: async (conversationId) => {
    return await fetchApi(`/conversations/${conversationId}`);
  },

  /**
   * Fetch message history for a conversation
   * @param {string} conversationId 
   * @param {object} params - { limit, before }
   */
  getMessages: async (conversationId, params = {}) => {
    const query = new URLSearchParams();
    if (params.limit) query.append('limit', params.limit);
    if (params.before) query.append('before', params.before);
    
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return await fetchApi(`/conversations/${conversationId}/messages${queryString}`);
  },

  /**
   * Send a message via REST API
   * @param {string} conversationId 
   * @param {object} data - { content, messageType, attachment, replyTo }
   */
  sendMessage: async (conversationId, data) => {
    return await fetchApi(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Edit an existing message
   * @param {string} messageId 
   * @param {object} data - { content }
   */
  editMessage: async (messageId, data) => {
    return await fetchApi(`/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete (soft-delete) an existing message
   * @param {string} messageId 
   */
  deleteMessage: async (messageId) => {
    return await fetchApi(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Mark a conversation as read
   * @param {string} conversationId 
   */
  markConversationRead: async (conversationId) => {
    return await fetchApi(`/conversations/${conversationId}/read`, {
      method: 'PATCH',
    });
  },

  /**
   * Upload an attachment file for chat
   * @param {FormData} formData - Contains 'file' field
   */
  uploadMessageAttachment: async (formData) => {
    const url = `${API_BASE_URL}/messages/attachment`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to upload attachment');
    }

    const payload = data.data || data.attachment || data;
    return {
      fileUrl: payload.fileUrl || payload.url || '',
      url: payload.url || payload.fileUrl || '',
      originalName: payload.originalName || payload.fileName || 'Attachment',
      fileName: payload.fileName || payload.originalName || 'Attachment',
      fileSize: payload.fileSize || 0,
      fileType: payload.fileType || 'file',
      publicId: payload.publicId || '',
    };
  },
};

export default chatService;
