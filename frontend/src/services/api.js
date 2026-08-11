const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
  * Standardized fetch API wrapper with CORS credentials (HTTP-only cookies)
  */
export const fetchApi = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Essential for sending/receiving HTTP-Only cookies
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type');
    let data = {};

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    }

    if (!response.ok) {
      const errorMessage = data.message || data.error || `HTTP Error ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to authentication server. Please ensure backend is running.');
    }
    throw error;
  }
};

export default fetchApi;
