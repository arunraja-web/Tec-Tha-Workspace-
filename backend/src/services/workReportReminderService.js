const User = require('../models/User');
const WorkReport = require('../models/WorkReport');
const { getMissingReports } = require('./workReportAnalyticsService');
const { notifyEmployeeReminder } = require('./workReportNotificationService');
const { formatDateToYYYYMMDD, getStartOfDay, getEndOfDay } = require('../utils/dateUtils');

/**
 * Send daily report reminders to active employees missing reports for target date
 * Prevents duplicate reminders on repeated executions using notification/reminderSentAt tracking
 * 
 * @param {string|Date} [dateInput] - Target date YYYY-MM-DD or Date object
 */
const sendDailyReportReminders = async (dateInput) => {
  const dateStr = formatDateToYYYYMMDD(dateInput || new Date());
  const startOfDay = getStartOfDay(dateStr);
  const endOfDay = getEndOfDay(dateStr);

  const missingResult = await getMissingReports(dateStr);
  const missingEmployees = missingResult.missingEmployees;

  let notifiedCount = 0;
  let skippedCount = 0;

  for (const emp of missingEmployees) {
    // Check if a report draft exists with reminderSentAt set
    const existingDraft = await WorkReport.findOne({
      employee: emp._id,
      reportDate: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingDraft) {
      // If reminder was already sent today, skip
      if (existingDraft.reminderSentAt && existingDraft.reminderSentAt >= startOfDay && existingDraft.reminderSentAt <= endOfDay) {
        skippedCount++;
        continue;
      }
      // Update reminderSentAt
      existingDraft.reminderSentAt = new Date();
      await existingDraft.save();
    } else {
      // Create a lightweight draft entry or mark reminderSentAt
      try {
        await WorkReport.create({
          employee: emp._id,
          reportDate: startOfDay,
          status: 'draft',
          reminderSentAt: new Date()
        });
      } catch (err) {
        // If unique compound index collision occurred, update existing
        await WorkReport.updateOne(
          { employee: emp._id, reportDate: startOfDay },
          { $set: { reminderSentAt: new Date() } }
        );
      }
    }

    // Send notification
    await notifyEmployeeReminder(emp._id, dateStr);
    notifiedCount++;
  }

  return {
    date: dateStr,
    totalMissing: missingEmployees.length,
    notified: notifiedCount,
    skipped: skippedCount
  };
};

module.exports = {
  sendDailyReportReminders,
  getMissingReports
};
