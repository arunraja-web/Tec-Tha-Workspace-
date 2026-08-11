export const ROLES = {
  FOUNDER: 'founder',
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
};

export const ROLE_DASHBOARDS = {
  [ROLES.FOUNDER]: '/founder/dashboard',
  [ROLES.ADMIN]: '/admin/dashboard',
  [ROLES.EMPLOYEE]: '/employee/dashboard',
};
