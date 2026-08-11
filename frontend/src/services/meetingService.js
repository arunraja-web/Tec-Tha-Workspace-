import { fetchApi } from './api';

/**
 * Meeting API Service
 */

/**
 * Get active meetings with optional search, pagination, and sorting
 * @param {Object} params - Query params (search, page, limit, sortOrder)
 */
export const getMeetings = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  if (params.sortOrder) query.append('sortOrder', params.sortOrder);

  const queryString = query.toString();
  const endpoint = `/meetings${queryString ? `?${queryString}` : ''}`;

  return await fetchApi(endpoint, {
    method: 'GET',
  });
};

/**
 * Get single active meeting by ID
 * @param {string} id - Meeting ID
 */
export const getMeetingById = async (id) => {
  return await fetchApi(`/meetings/${id}`, {
    method: 'GET',
  });
};

/**
 * Create a new meeting
 * @param {Object} data - { title, description, meetingLink }
 */
export const createMeeting = async (data) => {
  return await fetchApi('/meetings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Update meeting details
 * @param {string} id - Meeting ID
 * @param {Object} data - { title, description, meetingLink }
 */
export const updateMeeting = async (id, data) => {
  return await fetchApi(`/meetings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * Update meeting active status
 * @param {string} id - Meeting ID
 * @param {boolean} isActive - Status boolean
 */
export const updateMeetingStatus = async (id, isActive) => {
  return await fetchApi(`/meetings/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  });
};

/**
 * Soft delete / deactivate meeting
 * @param {string} id - Meeting ID
 */
export const deleteMeeting = async (id) => {
  return await fetchApi(`/meetings/${id}`, {
    method: 'DELETE',
  });
};

export default {
  getMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  updateMeetingStatus,
  deleteMeeting,
};
