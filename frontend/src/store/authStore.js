import { ROLES, ROLE_DASHBOARDS } from '../constants/roles';

const AUTH_USER_KEY = 'vcw_authenticated_user';

export const getStoredUser = () => {
  try {
    const data = localStorage.getItem(AUTH_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const setStoredUser = (user) => {
  try {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch (e) {
    console.error('Failed to update stored user:', e);
  }
};

export const getDashboardForRole = (role) => {
  if (!role) return '/login';
  const normalizedRole = String(role).toLowerCase().trim();
  return ROLE_DASHBOARDS[normalizedRole] || ROLE_DASHBOARDS[ROLES.EMPLOYEE] || '/login';
};
