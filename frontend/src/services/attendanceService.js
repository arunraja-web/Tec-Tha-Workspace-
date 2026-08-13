import { fetchApi } from './api';

/**
 * Attendance API Service
 * Maps cleanly to backend /api/attendance endpoints
 */

/**
 * GET /api/attendance?date=YYYY-MM-DD
 * Admin get daily attendance for all active employees
 * @param {string} date - YYYY-MM-DD
 */
export const getDailyAttendance = async (date) => {
  const query = new URLSearchParams();
  if (date) query.append('date', date);
  const queryString = query.toString();
  const endpoint = `/attendance${queryString ? `?${queryString}` : ''}`;

  return await fetchApi(endpoint, {
    method: 'GET',
  });
};

/**
 * POST /api/attendance
 * Admin mark single session attendance for employee
 * @param {Object} data - { employeeId, date, session, status }
 */
export const markAttendance = async (data) => {
  return await fetchApi('/attendance', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * POST /api/attendance/bulk
 * Admin bulk mark attendance for session
 * @param {Object} data - { date, session, attendance: [{ employeeId, status }] }
 */
export const markBulkAttendance = async (data) => {
  return await fetchApi('/attendance/bulk', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * PUT /api/attendance/:id
 * Admin update full attendance record
 * @param {string} id - Attendance record ID
 * @param {Object} data - { morning: { status }, evening: { status } }
 */
export const updateAttendanceRecord = async (id, data) => {
  return await fetchApi(`/attendance/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * PATCH /api/attendance/:id/session
 * Admin update specific session status
 * @param {string} id - Attendance record ID
 * @param {string} session - 'morning' | 'evening'
 * @param {string} status - 'present' | 'absent' | 'leave' | 'holiday'
 */
export const updateSessionStatus = async (id, session, status) => {
  return await fetchApi(`/attendance/${id}/session`, {
    method: 'PATCH',
    body: JSON.stringify({ session, status }),
  });
};

/**
 * GET /api/attendance/my?month=YYYY-MM
 * Employee view own attendance history
 * @param {string} month - YYYY-MM
 */
export const getMyAttendance = async (month) => {
  const query = new URLSearchParams();
  if (month) query.append('month', month);
  const queryString = query.toString();
  const endpoint = `/attendance/my${queryString ? `?${queryString}` : ''}`;

  return await fetchApi(endpoint, {
    method: 'GET',
  });
};

/**
 * GET /api/attendance/employee/:employeeId?month=YYYY-MM
 * Detailed monthly attendance calendar for specific employee
 * @param {string} employeeId 
 * @param {string} month - YYYY-MM
 */
export const getEmployeeMonthlyCalendar = async (employeeId, month) => {
  const query = new URLSearchParams();
  if (month) query.append('month', month);
  const queryString = query.toString();
  const endpoint = `/attendance/employee/${employeeId}${queryString ? `?${queryString}` : ''}`;

  return await fetchApi(endpoint, {
    method: 'GET',
  });
};

/**
 * GET /api/attendance/analytics?month=YYYY-MM
 * Admin & Founder view monthly overall analytics
 * @param {string} month - YYYY-MM
 */
export const getAttendanceAnalytics = async (month) => {
  const query = new URLSearchParams();
  if (month) query.append('month', month);
  const queryString = query.toString();
  const endpoint = `/attendance/analytics${queryString ? `?${queryString}` : ''}`;

  return await fetchApi(endpoint, {
    method: 'GET',
  });
};

/**
 * GET /api/attendance/analytics/department?month=YYYY-MM
 * Admin & Founder view department analytics
 * @param {string} month - YYYY-MM
 */
export const getDepartmentAnalytics = async (month) => {
  const query = new URLSearchParams();
  if (month) query.append('month', month);
  const queryString = query.toString();
  const endpoint = `/attendance/analytics/department${queryString ? `?${queryString}` : ''}`;

  return await fetchApi(endpoint, {
    method: 'GET',
  });
};

/**
 * POST /api/attendance/export/:month
 * Admin manually trigger export & Cloudinary upload
 * @param {string} month - YYYY-MM
 */
export const exportMonthlyReport = async (month) => {
  return await fetchApi(`/attendance/export/${month}`, {
    method: 'POST',
  });
};

/**
 * GET /api/attendance/exports
 * Admin & Founder view available export reports history
 */
export const getAttendanceExports = async () => {
  return await fetchApi('/attendance/exports', {
    method: 'GET',
  });
};

/**
 * GET /api/attendance/:id
 * Get single attendance record details
 * @param {string} id 
 */
export const getAttendanceById = async (id) => {
  return await fetchApi(`/attendance/${id}`, {
    method: 'GET',
  });
};

export default {
  getDailyAttendance,
  markAttendance,
  markBulkAttendance,
  updateAttendanceRecord,
  updateSessionStatus,
  getMyAttendance,
  getEmployeeMonthlyCalendar,
  getAttendanceAnalytics,
  getDepartmentAnalytics,
  exportMonthlyReport,
  getAttendanceExports,
  getAttendanceById,
};
