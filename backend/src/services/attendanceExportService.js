const AttendanceExport = require('../models/AttendanceExport');
const Attendance = require('../models/Attendance');
const { getMonthlyAnalytics } = require('./attendanceAnalyticsService');
const { generateAttendanceExcelReport } = require('../utils/excelGenerator');
const { uploadExcelToCloudinary } = require('../utils/cloudinary');
const { getMonthRange } = require('../utils/dateUtils');

/**
 * Generate monthly Excel report and upload to Cloudinary
 * 
 * @param {string} monthStr - Format YYYY-MM
 * @returns {Promise<Object>} AttendanceExport document
 */
const generateAndUploadMonthlyExport = async (monthStr) => {
  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) {
    throw new Error('Invalid month format. Expected YYYY-MM');
  }

  // 1. Find or create AttendanceExport record in 'processing' state
  let exportRecord = await AttendanceExport.findOne({ month: monthStr });

  if (exportRecord && exportRecord.status === 'completed' && exportRecord.fileUrl) {
    // If export was already completed and data hasn't been modified/deleted, return existing record
    return exportRecord;
  }

  if (!exportRecord) {
    exportRecord = await AttendanceExport.create({
      month: monthStr,
      status: 'processing'
    });
  } else {
    exportRecord.status = 'processing';
    exportRecord.errorMessage = null;
    await exportRecord.save();
  }

  try {
    // 2. Fetch monthly analytics & daily attendance records
    const analytics = await getMonthlyAnalytics(monthStr);
    const { startOfMonth, endOfMonth } = getMonthRange(monthStr);

    const dailyRecords = await Attendance.find({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    })
      .populate('employee', 'name email department')
      .sort({ date: 1, 'employee.name': 1 })
      .lean();

    // 3. Generate Excel file buffer
    const excelBuffer = await generateAttendanceExcelReport({
      month: monthStr,
      summary: analytics.summary,
      employeeStats: analytics.employees,
      dailyRecords
    });

    const fileName = `attendance-report-${monthStr}.xlsx`;

    // 4. Upload Excel to Cloudinary
    const uploadResult = await uploadExcelToCloudinary(excelBuffer, monthStr, fileName);

    // 5. Update AttendanceExport record
    exportRecord.status = 'completed';
    exportRecord.fileName = fileName;
    exportRecord.cloudinaryPublicId = uploadResult.publicId;
    exportRecord.fileUrl = uploadResult.secureUrl;
    exportRecord.recordCount = dailyRecords.length;
    exportRecord.exportedAt = new Date();
    exportRecord.errorMessage = null;

    await exportRecord.save();

    return exportRecord;
  } catch (error) {
    exportRecord.status = 'failed';
    exportRecord.errorMessage = error.message;
    await exportRecord.save();
    throw error;
  }
};

/**
 * Get all monthly export records
 */
const getAllExports = async () => {
  return await AttendanceExport.find().sort({ month: -1 }).lean();
};

/**
 * Get export details for a specific month
 */
const getExportByMonth = async (monthStr) => {
  return await AttendanceExport.findOne({ month: monthStr }).lean();
};

module.exports = {
  generateAndUploadMonthlyExport,
  getAllExports,
  getExportByMonth
};
