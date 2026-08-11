import { fetchApi } from './api';

/**
 * Authenticate user with Primary Email + Password
 * Backend endpoint: POST /api/auth/login
 */
export const loginUser = async (email, password) => {
  return await fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
    }),
  });
};

/**
 * Logout current authenticated user & clear HTTP-Only cookie
 * Backend endpoint: POST /api/auth/logout
 */
export const logoutUser = async () => {
  try {
    return await fetchApi('/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.warn('Logout API call exception:', error.message);
    return { success: true };
  }
};

/**
 * Get current authenticated user profile
 * Backend endpoint: GET /api/auth/me
 */
export const getCurrentUser = async () => {
  return await fetchApi('/auth/me', {
    method: 'GET',
  });
};
