import { fetchApi } from './api';

/**
 * Service for Task Management API endpoints (/api/tasks)
 */
export const taskService = {
  /**
   * Get all tasks (Admin/Founder see all, Employee assigned only) with search, filters, pagination
   * @param {Object} params - { search, status, priority, assignedTo, group, overdue, isArchived, startDate, dueDate, page, limit, sortBy, sortOrder }
   */
  getTasks: async (params = {}) => {
    const query = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        query.append(key, params[key]);
      }
    });
    const queryString = query.toString();
    const endpoint = `/tasks${queryString ? `?${queryString}` : ''}`;
    return await fetchApi(endpoint, { method: 'GET' });
  },

  /**
   * Get logged-in employee assigned tasks
   * @param {Object} params - pagination, search, filter options
   */
  getMyTasks: async (params = {}) => {
    const query = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        query.append(key, params[key]);
      }
    });
    const queryString = query.toString();
    const endpoint = `/tasks/my${queryString ? `?${queryString}` : ''}`;
    return await fetchApi(endpoint, { method: 'GET' });
  },

  /**
   * Get single task details by ID
   * @param {string} id - Mongo Task ID
   */
  getTaskById: async (id) => {
    return await fetchApi(`/tasks/${id}`, { method: 'GET' });
  },

  /**
   * Create a new task (Admin/Founder only)
   * @param {Object} data - { title, description, assignedTo, group, priority, startDate, dueDate }
   */
  createTask: async (data) => {
    return await fetchApi('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update task details (Admin/Founder only)
   * @param {string} id - Task ID
   * @param {Object} data - Task fields to update
   */
  updateTask: async (id, data) => {
    return await fetchApi(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Reassign task to another employee (Admin/Founder only)
   * @param {string} id - Task ID
   * @param {string} assignedTo - Employee User ID
   */
  assignTask: async (id, assignedTo) => {
    return await fetchApi(`/tasks/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assignedTo }),
    });
  },

  /**
   * Update task status
   * @param {string} id - Task ID
   * @param {string} status - todo | in_progress | in_review | completed | cancelled
   */
  updateStatus: async (id, status) => {
    return await fetchApi(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  /**
   * Update task progress (0-100%)
   * @param {string} id - Task ID
   * @param {number} progress - 0 to 100
   */
  updateProgress: async (id, progress) => {
    return await fetchApi(`/tasks/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progress }),
    });
  },

  /**
   * Complete task (Admin/Founder only)
   * @param {string} id - Task ID
   */
  completeTask: async (id) => {
    return await fetchApi(`/tasks/${id}/complete`, { method: 'PATCH' });
  },

  /**
   * Reopen task (Admin/Founder only)
   * @param {string} id - Task ID
   */
  reopenTask: async (id) => {
    return await fetchApi(`/tasks/${id}/reopen`, { method: 'PATCH' });
  },

  /**
   * Cancel task with mandatory reason (Admin/Founder only)
   * @param {string} id - Task ID
   * @param {string} reason - Cancellation reason
   */
  cancelTask: async (id, reason) => {
    return await fetchApi(`/tasks/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  },

  /**
   * Archive task (Admin/Founder only)
   * @param {string} id - Task ID
   */
  archiveTask: async (id) => {
    return await fetchApi(`/tasks/${id}/archive`, { method: 'PATCH' });
  },

  /**
   * Restore archived task (Admin/Founder only)
   * @param {string} id - Task ID
   */
  restoreTask: async (id) => {
    return await fetchApi(`/tasks/${id}/restore`, { method: 'PATCH' });
  },

  /**
   * Soft delete task (Admin only)
   * @param {string} id - Task ID
   */
  deleteTask: async (id) => {
    return await fetchApi(`/tasks/${id}`, { method: 'DELETE' });
  },

  /**
   * Duplicate task (Admin/Founder only)
   * @param {string} id - Task ID
   */
  duplicateTask: async (id) => {
    return await fetchApi(`/tasks/${id}/duplicate`, { method: 'POST' });
  },

  /**
   * Get task audit history trail
   * @param {string} id - Task ID
   */
  getTaskHistory: async (id) => {
    return await fetchApi(`/tasks/${id}/history`, { method: 'GET' });
  },

  /**
   * Get comments for a task
   * @param {string} id - Task ID
   */
  getComments: async (id) => {
    return await fetchApi(`/tasks/${id}/comments`, { method: 'GET' });
  },

  /**
   * Add a comment to a task
   * @param {string} id - Task ID
   * @param {string} text - Comment text
   */
  addComment: async (id, text) => {
    return await fetchApi(`/tasks/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content: text, text }),
    });
  },

  /**
   * Update comment text
   * @param {string} taskId - Task ID
   * @param {string} commentId - Comment ID
   * @param {string} text - Updated comment text
   */
  updateComment: async (taskId, commentId, text) => {
    return await fetchApi(`/tasks/${taskId}/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ content: text, text }),
    });
  },

  /**
   * Delete comment
   * @param {string} taskId - Task ID
   * @param {string} commentId - Comment ID
   */
  deleteComment: async (taskId, commentId) => {
    return await fetchApi(`/tasks/${taskId}/comments/${commentId}`, { method: 'DELETE' });
  },

  /**
   * Upload file attachment to Cloudinary for a task
   * @param {string} id - Task ID
   * @param {FormData} formData - FormData containing 'file'
   */
  uploadAttachment: async (id, formData) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const response = await fetch(`${API_BASE_URL}/tasks/${id}/attachments`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to upload attachment');
    }
    return data;
  },

  /**
   * Delete task attachment
   * @param {string} taskId - Task ID
   * @param {string} attachmentId - Attachment ID
   */
  deleteAttachment: async (taskId, attachmentId) => {
    return await fetchApi(`/tasks/${taskId}/attachments/${attachmentId}`, { method: 'DELETE' });
  },

  /**
   * Get subtasks for a task
   * @param {string} id - Task ID
   */
  getSubtasks: async (id) => {
    return await fetchApi(`/tasks/${id}/subtasks`, { method: 'GET' });
  },

  /**
   * Create subtask (Admin/Founder only)
   * @param {string} id - Task ID
   * @param {Object} data - { title, assignedTo, dueDate }
   */
  createSubtask: async (id, data) => {
    return await fetchApi(`/tasks/${id}/subtasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update subtask details
   * @param {string} taskId - Task ID
   * @param {string} subtaskId - Subtask ID
   * @param {Object} data - Update data
   */
  updateSubtask: async (taskId, subtaskId, data) => {
    return await fetchApi(`/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update subtask status or progress
   * @param {string} taskId - Task ID
   * @param {string} subtaskId - Subtask ID
   * @param {Object} data - { status, progress }
   */
  updateSubtaskStatus: async (taskId, subtaskId, data) => {
    return await fetchApi(`/tasks/${taskId}/subtasks/${subtaskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete subtask
   * @param {string} taskId - Task ID
   * @param {string} subtaskId - Subtask ID
   */
  deleteSubtask: async (taskId, subtaskId) => {
    return await fetchApi(`/tasks/${taskId}/subtasks/${subtaskId}`, { method: 'DELETE' });
  },

  /**
   * Get company-wide task analytics
   * @param {Object} params - { from, to }
   */
  getCompanyAnalytics: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);
    const queryString = query.toString();
    return await fetchApi(`/tasks/analytics${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
  },

  /**
   * Get employee performance task analytics
   * @param {Object} params - { from, to }
   */
  getEmployeeAnalytics: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);
    const queryString = query.toString();
    return await fetchApi(`/tasks/analytics/employees${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
  },

  /**
   * Get logged-in employee personal task analytics
   * @param {Object} params - { from, to }
   */
  getMyAnalytics: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);
    const queryString = query.toString();
    return await fetchApi(`/tasks/my/analytics${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
  },
};

export default taskService;
