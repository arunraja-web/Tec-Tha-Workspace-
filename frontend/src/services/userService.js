import { fetchApi } from './api';

/**
 * Service for Admin User Management API endpoints (/api/users)
 */
export const userService = {
  /**
   * Get all users with filtering, search, pagination, and sorting (Admin only)
   * @param {Object} params - { search, role, status, page, limit, sortBy, sortOrder }
   */
  getUsers: async (params = {}) => {
    const query = new URLSearchParams();

    if (params.search) query.append('search', params.search);
    if (params.role) query.append('role', params.role);
    if (params.status) query.append('status', params.status);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);

    const queryString = query.toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;
    return await fetchApi(endpoint, { method: 'GET' });
  },

  /**
   * Get single user by ID (Admin only)
   * @param {string} id - Mongo User ID
   */
  getUserById: async (id) => {
    return await fetchApi(`/users/${id}`, { method: 'GET' });
  },

  /**
   * Create new user (Admin only)
   * @param {Object} userData - { name, email, secondaryEmail, phone, password, role }
   */
  createUser: async (userData) => {
    return await fetchApi('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Update existing user profile details (Admin only)
   * @param {string} id - Mongo User ID
   * @param {Object} userData - { name, email, secondaryEmail, phone, role, isActive }
   */
  updateUser: async (id, userData) => {
    return await fetchApi(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Activate or deactivate user status (Admin only)
   * @param {string} id - Mongo User ID
   * @param {boolean} isActive - Status flag
   */
  updateUserStatus: async (id, isActive) => {
    return await fetchApi(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },

  /**
   * Change user role (Admin only)
   * @param {string} id - Mongo User ID
   * @param {string} role - 'admin' | 'founder' | 'employee'
   */
  updateUserRole: async (id, role) => {
    return await fetchApi(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  /**
   * Admin direct password reset for user (Admin only)
   * @param {string} id - Mongo User ID
   * @param {string} password - New password
   */
  resetUserPassword: async (id, password) => {
    return await fetchApi(`/users/${id}/reset-password`, {
      method: 'PATCH',
      body: JSON.stringify({ password }),
    });
  },

  /**
   * Soft delete user account (Admin only)
   * @param {string} id - Mongo User ID
   */
  deleteUser: async (id) => {
    return await fetchApi(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

export default userService;
