const cron = require('node-cron');
const {
  checkDueSoonReminders,
  checkOverdueReminders,
  generateRecurringTasks
} = require('../services/taskReminderService');
const { getCompanyTimezone } = require('../utils/dateUtils');

/**
 * Initialize automated task reminder and recurring task cron jobs
 * Runs hourly (0 * * * *) in process.env.COMPANY_TIMEZONE
 */
const initCronJobs = () => {
  const timezone = getCompanyTimezone ? getCompanyTimezone() : 'Asia/Kolkata';

  // Hourly schedule: '0 * * * *'
  cron.schedule(
    '0 * * * *',
    async () => {
      console.log('[CRON] Running hourly Task Reminders and Recurring Task Generator...');

      try {
        const dueSoonRes = await checkDueSoonReminders();
        console.log(`[CRON] Due soon reminders sent: ${dueSoonRes.notified}/${dueSoonRes.checked}`);

        const overdueRes = await checkOverdueReminders();
        console.log(`[CRON] Overdue reminders sent: ${overdueRes.notified}/${overdueRes.checked}`);

        const recurringRes = await generateRecurringTasks();
        console.log(`[CRON] Recurring tasks generated: ${recurringRes.generated}/${recurringRes.checked}`);
      } catch (error) {
        console.error('[CRON] Task reminder job failed:', error.message);
      }
    },
    {
      timezone
    }
  );

  console.log(`[CRON] Task Reminder & Recurring Job initialized (Schedule: '0 * * * *', Timezone: '${timezone}')`);
};

module.exports = {
  initCronJobs
};
