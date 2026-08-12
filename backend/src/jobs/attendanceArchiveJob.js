const cron = require('node-cron');
const { archiveAndDeleteMonth } = require('../services/attendanceArchiveService');
const { getPreviousMonthStr, getCompanyTimezone } = require('../utils/dateUtils');

/**
 * Initialize automated monthly attendance archive & deletion scheduled job
 * Runs at 00:00 on the 1st of every month in process.env.COMPANY_TIMEZONE
 */
const initCronJob = () => {
  const timezone = getCompanyTimezone();
  
  // Cron schedule: 0 0 1 * * -> 00:00 on the 1st day of every month
  cron.schedule(
    '0 0 1 * *',
    async () => {
      const prevMonth = getPreviousMonthStr(null, timezone);
      console.log(`[CRON] Starting automatic monthly attendance archive for month: ${prevMonth}`);

      try {
        const result = await archiveAndDeleteMonth(prevMonth);
        console.log(`[CRON] Attendance archive completed successfully for ${prevMonth}:`, result.message);
      } catch (error) {
        console.error(`[CRON] Automatic attendance archive failed for ${prevMonth}:`, error.message);
      }
    },
    {
      timezone
    }
  );

  console.log(`[CRON] Monthly Attendance Archive Job initialized (Schedule: '0 0 1 * *', Timezone: '${timezone}')`);
};

module.exports = {
  initCronJob
};
