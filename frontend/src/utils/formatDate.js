/**
 * Date formatting and normalization utilities for Attendance Module
 */

/**
 * Returns today's date in YYYY-MM-DD format
 * @returns {string} YYYY-MM-DD
 */
export const getTodayYYYYMMDD = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Returns current month in YYYY-MM format
 * @returns {string} YYYY-MM
 */
export const getCurrentYYYYMM = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Formats a Date object or date string into YYYY-MM-DD
 * @param {Date|string} dateInput 
 * @returns {string} YYYY-MM-DD
 */
export const formatDateToYYYYMMDD = (dateInput) => {
  if (!dateInput) return getTodayYYYYMMDD();
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput;
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return getTodayYYYYMMDD();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats a Date object or date string into YYYY-MM
 * @param {Date|string} dateInput 
 * @returns {string} YYYY-MM
 */
export const formatDateToYYYYMM = (dateInput) => {
  if (!dateInput) return getCurrentYYYYMM();
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}$/.test(dateInput)) {
    return dateInput;
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return getCurrentYYYYMM();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Formats YYYY-MM-DD into friendly readable date string e.g. "August 11, 2026"
 * @param {string} dateStr 
 * @returns {string}
 */
export const formatFriendlyDate = (dateStr) => {
  if (!dateStr) return '';
  const normalized = formatDateToYYYYMMDD(dateStr);
  const [year, month, day] = normalized.split('-');
  const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  return dateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Formats YYYY-MM into friendly readable month string e.g. "August 2026"
 * @param {string} monthStr 
 * @returns {string}
 */
export const formatFriendlyMonth = (monthStr) => {
  if (!monthStr) return '';
  const normalized = formatDateToYYYYMM(monthStr);
  const [year, month] = normalized.split('-');
  const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return dateObj.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

export default {
  getTodayYYYYMMDD,
  getCurrentYYYYMM,
  formatDateToYYYYMMDD,
  formatDateToYYYYMM,
  formatFriendlyDate,
  formatFriendlyMonth,
};
