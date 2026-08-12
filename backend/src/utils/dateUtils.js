/**
 * Date and Timezone Utilities for Attendance Management System
 * Uses COMPANY_TIMEZONE env var (default: Asia/Kolkata)
 */

const getCompanyTimezone = () => {
  return process.env.COMPANY_TIMEZONE || 'Asia/Kolkata';
};

/**
 * Gets parts of a date in specified timezone
 * @param {Date|string|number} date 
 * @param {string} timezone 
 */
const getPartsInTimezone = (date = new Date(), timezone = getCompanyTimezone()) => {
  const d = new Date(date);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(d);
  const result = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      result[part.type] = part.value;
    }
  }
  return result;
};

/**
 * Returns today's date string YYYY-MM-DD in company timezone
 */
const getTodayDateString = (timezone = getCompanyTimezone()) => {
  const parts = getPartsInTimezone(new Date(), timezone);
  return `${parts.year}-${parts.month}-${parts.day}`;
};

/**
 * Parse YYYY-MM-DD or Date into start of day UTC Date in target timezone
 */
const getStartOfDay = (dateInput, timezone = getCompanyTimezone()) => {
  let dateStr;
  if (typeof dateInput === 'string') {
    dateStr = dateInput.trim();
  } else if (dateInput instanceof Date) {
    const parts = getPartsInTimezone(dateInput, timezone);
    dateStr = `${parts.year}-${parts.month}-${parts.day}`;
  } else {
    dateStr = getTodayDateString(timezone);
  }

  // Create Date object for 00:00:00 local time
  const [year, month, day] = dateStr.split('-').map(Number);
  
  // Find local ISO string representation and calculate offset
  const localTarget = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  const targetParts = getPartsInTimezone(localTarget, timezone);
  
  // Calculate difference between local target representation and actual UTC
  const targetUtcHours = Date.UTC(
    Number(targetParts.year),
    Number(targetParts.month) - 1,
    Number(targetParts.day),
    Number(targetParts.hour === '24' ? 0 : targetParts.hour),
    Number(targetParts.minute),
    Number(targetParts.second)
  );

  const offsetMs = targetUtcHours - localTarget.getTime();
  return new Date(localTarget.getTime() - offsetMs);
};

/**
 * Parse YYYY-MM-DD or Date into end of day UTC Date in target timezone
 */
const getEndOfDay = (dateInput, timezone = getCompanyTimezone()) => {
  let dateStr;
  if (typeof dateInput === 'string') {
    dateStr = dateInput.trim();
  } else if (dateInput instanceof Date) {
    const parts = getPartsInTimezone(dateInput, timezone);
    dateStr = `${parts.year}-${parts.month}-${parts.day}`;
  } else {
    dateStr = getTodayDateString(timezone);
  }

  const [year, month, day] = dateStr.split('-').map(Number);
  const localTarget = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
  const targetParts = getPartsInTimezone(localTarget, timezone);

  const targetUtcHours = Date.UTC(
    Number(targetParts.year),
    Number(targetParts.month) - 1,
    Number(targetParts.day),
    Number(targetParts.hour === '24' ? 0 : targetParts.hour),
    Number(targetParts.minute),
    Number(targetParts.second)
  );

  const offsetMs = targetUtcHours - localTarget.getTime();
  return new Date(localTarget.getTime() - offsetMs);
};

/**
 * Returns month start and end boundaries for YYYY-MM
 */
const getMonthRange = (monthStr, timezone = getCompanyTimezone()) => {
  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) {
    const todayParts = getPartsInTimezone(new Date(), timezone);
    monthStr = `${todayParts.year}-${todayParts.month}`;
  }

  const [year, month] = monthStr.split('-').map(Number);
  
  // Last day of month
  const lastDay = new Date(year, month, 0).getDate();

  const startStr = `${year}-${String(month).padStart(2, '0')}-01`;
  const endStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const startOfMonth = getStartOfDay(startStr, timezone);
  const endOfMonth = getEndOfDay(endStr, timezone);

  return {
    monthStr,
    year,
    month,
    daysInMonth: lastDay,
    startOfMonth,
    endOfMonth
  };
};

/**
 * Format a JS Date to YYYY-MM-DD in company timezone
 */
const formatDateToYYYYMMDD = (dateInput, timezone = getCompanyTimezone()) => {
  if (!dateInput) return null;
  const parts = getPartsInTimezone(new Date(dateInput), timezone);
  return `${parts.year}-${parts.month}-${parts.day}`;
};

/**
 * Format a JS Date to YYYY-MM in company timezone
 */
const formatDateToYYYYMM = (dateInput, timezone = getCompanyTimezone()) => {
  if (!dateInput) return null;
  const parts = getPartsInTimezone(new Date(dateInput), timezone);
  return `${parts.year}-${parts.month}`;
};

/**
 * Get previous month string in YYYY-MM format
 */
const getPreviousMonthStr = (monthStr, timezone = getCompanyTimezone()) => {
  let year, month;
  if (monthStr && /^\d{4}-\d{2}$/.test(monthStr)) {
    [year, month] = monthStr.split('-').map(Number);
  } else {
    const parts = getPartsInTimezone(new Date(), timezone);
    year = Number(parts.year);
    month = Number(parts.month);
  }

  if (month === 1) {
    year -= 1;
    month = 12;
  } else {
    month -= 1;
  }

  return `${year}-${String(month).padStart(2, '0')}`;
};

module.exports = {
  getCompanyTimezone,
  getPartsInTimezone,
  getTodayDateString,
  getStartOfDay,
  getEndOfDay,
  getMonthRange,
  formatDateToYYYYMMDD,
  formatDateToYYYYMM,
  getPreviousMonthStr
};
