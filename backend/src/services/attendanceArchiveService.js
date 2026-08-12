const Attendance = require('../models/Attendance');
const AttendanceExport = require('../models/AttendanceExport');
const attendanceExportService = require('./attendanceExportService');
const { getMonthRange } = require('../utils/dateUtils');

/**
 * Safely archive and delete MongoDB attendance records for a specified month.
 * 
 * Order of Execution:
 * 1. Fetch attendance records
 * 2. Generate Excel
 * 3. Upload to Cloudinary
 * 4. Verify Cloudinary upload & save export metadata
 * 5. Delete attendance records from MongoDB
 * 6. Update AttendanceExport.deletedAt
 * 
 * IF ANY STEP BEFORE 5 FAILS -> ATTENDANCE IS NOT DELETED.
 * 
 * @param {string} monthStr - Format YYYY-MM
 * @returns {Promise<Object>} Summary of archiving result
 */
const archiveAndDeleteMonth = async (monthStr) => {
  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) {
    throw new Error('Invalid month format. Expected YYYY-MM');
  }

  const { startOfMonth, endOfMonth } = getMonthRange(monthStr);

  // Check existing export record
  let exportRecord = await AttendanceExport.findOne({ month: monthStr });

  if (exportRecord && exportRecord.status === 'completed' && exportRecord.deletedAt) {
    return {
      success: true,
      message: `Month ${monthStr} is already archived and deleted`,
      exportRecord,
      deletedCount: 0
    };
  }

  // Step 1 - 4: Generate Excel, Upload to Cloudinary, Save Export Metadata
  const completedExport = await attendanceExportService.generateAndUploadMonthlyExport(monthStr);

  if (!completedExport || completedExport.status !== 'completed' || !completedExport.fileUrl) {
    throw new Error(`Archiving failed for ${monthStr}: Cloudinary export was not successfully completed`);
  }

  // Step 5: Delete MongoDB attendance records for that month
  const deleteResult = await Attendance.deleteMany({
    date: { $gte: startOfMonth, $lte: endOfMonth }
  });

  // Step 6: Update deletedAt timestamp on export record
  completedExport.deletedAt = new Date();
  await completedExport.save();

  return {
    success: true,
    message: `Month ${monthStr} successfully archived, uploaded to Cloudinary, and local attendance records cleaned up`,
    exportRecord: completedExport,
    deletedCount: deleteResult.deletedCount
  };
};

module.exports = {
  archiveAndDeleteMonth
};
