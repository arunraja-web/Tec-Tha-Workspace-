const cron = require('node-cron');
const { sendDailyReportReminders } = require('../services/workReportReminderService');
const { getCompanyTimezone } = require('../utils/dateUtils');

/**
 * Initialize daily work report reminder scheduled job
 * Runs every day at 18:00 (6:00 PM) in COMPANY_TIMEZONE
 */
const initCronJob = () => {
  const timezone = getCompanyTimezone ? getCompanyTimezone() : 'Asia/Kolkata';
  const cronSchedule = process.env.WORK_REPORT_REMINDER_CRON || '0 18 * * *';

  cron.schedule(
    cronSchedule,
    async () => {
      console.log('[CRON] Running Daily Work Report Reminder Job...');
      try {
        const result = await sendDailyReportReminders();
        console.log(`[CRON] Work report reminders completed. Date: ${result.date}, Notified: ${result.notified}, Skipped: ${result.skipped}`);
      } catch (error) {
        console.error('[CRON] Work report reminder job failed:', error.message);
      }
    },
    {
      timezone
    }
  );

  console.log(`[CRON] Daily Work Report Reminder Job initialized (Schedule: '${cronSchedule}', Timezone: '${timezone}')`);
};

module.exports = {
  initCronJob
};
