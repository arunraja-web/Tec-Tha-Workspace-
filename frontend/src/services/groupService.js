import { fetchApi } from './api';

/**
 * Service for Group Management API endpoints (/api/groups)
 */
export const groupService = {
  /**
   * Get all active groups (scoped by role, with search & pagination)
   * @param {Object} params - { search, page, limit }
   */
  getGroups: async (params = {}) => {
    const query = new URLSearchParams();

    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const queryString = query.toString();
    const endpoint = `/groups${queryString ? `?${queryString}` : ''}`;
    return await fetchApi(endpoint, { method: 'GET' });
  },

  /**
   * Get groups where current user is a member
   */
  getMyGroups: async () => {
    return await fetchApi('/groups/my', { method: 'GET' });
  },

  /**
   * Get single group details by ID
   * @param {string} id - Mongo Group ID
   */
  getGroupById: async (id) => {
    return await fetchApi(`/groups/${id}`, { method: 'GET' });
  },

  /**
   * Get group members list
   * @param {string} id - Mongo Group ID
   */
  getGroupMembers: async (id) => {
    return await fetchApi(`/groups/${id}/members`, { method: 'GET' });
  },

  /**
   * Create a new group (Admin only)
   * @param {Object} data - { name, description }
   */
  createGroup: async (data) => {
    return await fetchApi('/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update existing group name & description (Admin only)
   * @param {string} id - Mongo Group ID
   * @param {Object} data - { name, description }
   */
  updateGroup: async (id, data) => {
    return await fetchApi(`/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Deactivate or reactivate group status (Admin only)
   * @param {string} id - Mongo Group ID
   * @param {boolean} isActive - Status boolean
   */
  updateGroupStatus: async (id, isActive) => {
    return await fetchApi(`/groups/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },

  /**
   * Add a single employee to group (Admin only)
   * @param {string} groupId - Mongo Group ID
   * @param {string} userId - Mongo User ID (employee)
   */
  addMember: async (groupId, userId) => {
    return await fetchApi(`/groups/${groupId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  /**
   * Bulk add multiple employees to group (Admin only)
   * @param {string} groupId - Mongo Group ID
   * @param {Array<string>} userIds - Array of employee Mongo User IDs
   */
  bulkAddMembers: async (groupId, userIds) => {
    return await fetchApi(`/groups/${groupId}/members/bulk`, {
      method: 'POST',
      body: JSON.stringify({ userIds }),
    });
  },

  /**
   * Remove an employee from group (Admin only)
   * @param {string} groupId - Mongo Group ID
   * @param {string} userId - Mongo User ID (employee)
   */
  removeMember: async (groupId, userId) => {
    return await fetchApi(`/groups/${groupId}/members/${userId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Admin voluntarily joins group (Admin only)
   * @param {string} groupId - Mongo Group ID
   */
  joinGroup: async (groupId) => {
    return await fetchApi(`/groups/${groupId}/join`, {
      method: 'POST',
    });
  },

  /**
   * Admin voluntarily leaves group (Admin only)
   * @param {string} groupId - Mongo Group ID
   */
  leaveGroup: async (groupId) => {
    return await fetchApi(`/groups/${groupId}/leave`, {
      method: 'DELETE',
    });
  },

  /**
   * Soft delete group (Admin only)
   * @param {string} groupId - Mongo Group ID
   */
  deleteGroup: async (groupId) => {
    return await fetchApi(`/groups/${groupId}`, {
      method: 'DELETE',
    });
  },
};

export default groupService;
