const ExcelJS = require('exceljs');
const { formatDateToYYYYMMDD } = require('./dateUtils');

/**
 * Generate complete Excel report workbook buffer for attendance
 * 
 * @param {Object} data 
 * @param {string} data.month - Format YYYY-MM
 * @param {Object} data.summary - Summary analytics data
 * @param {Array} data.employeeStats - Array of employee statistics
 * @param {Array} data.dailyRecords - Array of raw daily attendance records
 * @returns {Promise<Buffer>}
 */
const generateAttendanceExcelReport = async ({ month, summary, employeeStats, dailyRecords }) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Company Workspace Attendance System';
  workbook.lastModifiedBy = 'Attendance System';
  workbook.created = new Date();

  // Helper colors & styles
  const headerFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '1E293B' } // Dark slate blue
  };

  const headerFont = {
    name: 'Segoe UI',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFF' }
  };

  const titleFont = {
    name: 'Segoe UI',
    size: 16,
    bold: true,
    color: { argb: '0F172A' }
  };

  const subTitleFont = {
    name: 'Segoe UI',
    size: 12,
    bold: true,
    color: { argb: '475569' }
  };

  const cardHeaderFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'F1F5F9' }
  };

  const borderStyle = {
    top: { style: 'thin', color: { argb: 'CBD5E1' } },
    left: { style: 'thin', color: { argb: 'CBD5E1' } },
    bottom: { style: 'thin', color: { argb: 'CBD5E1' } },
    right: { style: 'thin', color: { argb: 'CBD5E1' } }
  };

  // ----------------------------------------------------
  // SHEET 1 — Summary
  // ----------------------------------------------------
  const sheet1 = workbook.addWorksheet('Summary', {
    views: [{ showGridLines: true }]
  });

  sheet1.mergeCells('A1:D1');
  const titleCell = sheet1.getCell('A1');
  titleCell.value = 'Company Attendance Report';
  titleCell.font = titleFont;
  titleCell.alignment = { vertical: 'middle' };

  sheet1.mergeCells('A2:D2');
  const subTitleCell = sheet1.getCell('A2');
  subTitleCell.value = `Month: ${month}`;
  subTitleCell.font = subTitleFont;
  subTitleCell.alignment = { vertical: 'middle' };

  sheet1.addRow([]); // Blank row

  const summaryHeaders = ['Metric', 'Value'];
  const summaryHeaderRow = sheet1.addRow(summaryHeaders);
  summaryHeaderRow.height = 24;

  summaryHeaderRow.eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
    cell.border = borderStyle;
  });

  const summaryMetrics = [
    ['Total Employees', summary.totalEmployees || 0],
    ['Working Days', summary.workingDays || 0],
    ['Overall Attendance %', `${(summary.overallAttendancePercentage || 0).toFixed(2)}%`],
    ['Total Present Sessions', summary.totalPresent || 0],
    ['Total Absent Sessions', summary.totalAbsent || 0],
    ['Total Leave Sessions', summary.totalLeave || 0]
  ];

  summaryMetrics.forEach(([metric, val]) => {
    const row = sheet1.addRow([metric, val]);
    row.height = 20;
    row.eachCell((cell, colNumber) => {
      cell.border = borderStyle;
      cell.font = { name: 'Segoe UI', size: 11 };
      if (colNumber === 2) {
        cell.font = { name: 'Segoe UI', size: 11, bold: true };
        cell.alignment = { horizontal: 'right' };
      }
    });
  });

  sheet1.getColumn(1).width = 30;
  sheet1.getColumn(2).width = 25;

  // ----------------------------------------------------
  // SHEET 2 — Employee Summary
  // ----------------------------------------------------
  const sheet2 = workbook.addWorksheet('Employee Summary', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }]
  });

  sheet2.columns = [
    { header: 'Employee', key: 'employeeName', width: 25 },
    { header: 'Department', key: 'department', width: 18 },
    { header: 'Morning Present', key: 'morningPresent', width: 16 },
    { header: 'Morning Absent', key: 'morningAbsent', width: 16 },
    { header: 'Morning Leave', key: 'morningLeave', width: 16 },
    { header: 'Evening Present', key: 'eveningPresent', width: 16 },
    { header: 'Evening Absent', key: 'eveningAbsent', width: 16 },
    { header: 'Evening Leave', key: 'eveningLeave', width: 16 },
    { header: 'Total Present', key: 'totalPresent', width: 15 },
    { header: 'Total Absent', key: 'totalAbsent', width: 15 },
    { header: 'Total Leave', key: 'totalLeave', width: 15 },
    { header: 'Attendance %', key: 'attendancePercentage', width: 16 }
  ];

  const empHeaderRow = sheet2.getRow(1);
  empHeaderRow.height = 26;
  empHeaderRow.eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = borderStyle;
  });

  (employeeStats || []).forEach((stat) => {
    const row = sheet2.addRow({
      employeeName: stat.employee?.name || stat.employeeName || 'N/A',
      department: stat.department || stat.employee?.department || 'General',
      morningPresent: stat.morning?.present || 0,
      morningAbsent: stat.morning?.absent || 0,
      morningLeave: stat.morning?.leave || 0,
      eveningPresent: stat.evening?.present || 0,
      eveningAbsent: stat.evening?.absent || 0,
      eveningLeave: stat.evening?.leave || 0,
      totalPresent: (stat.morning?.present || 0) + (stat.evening?.present || 0),
      totalAbsent: (stat.morning?.absent || 0) + (stat.evening?.absent || 0),
      totalLeave: (stat.morning?.leave || 0) + (stat.evening?.leave || 0),
      attendancePercentage: `${(stat.attendancePercentage || 0).toFixed(2)}%`
    });

    row.height = 20;
    row.eachCell((cell, colNumber) => {
      cell.border = borderStyle;
      cell.font = { name: 'Segoe UI', size: 10 };
      if (colNumber >= 3) {
        cell.alignment = { horizontal: 'center' };
      }
      if (colNumber === 12) {
        cell.font = { name: 'Segoe UI', size: 10, bold: true };
      }
    });
  });

  sheet2.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: sheet2.columns.length }
  };

  // ----------------------------------------------------
  // SHEET 3 — Daily Attendance
  // ----------------------------------------------------
  const sheet3 = workbook.addWorksheet('Daily Attendance', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }]
  });

  sheet3.columns = [
    { header: 'Date', key: 'date', width: 16 },
    { header: 'Employee', key: 'employeeName', width: 25 },
    { header: 'Morning', key: 'morningStatus', width: 16 },
    { header: 'Evening', key: 'eveningStatus', width: 16 }
  ];

  const dailyHeaderRow = sheet3.getRow(1);
  dailyHeaderRow.height = 26;
  dailyHeaderRow.eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = borderStyle;
  });

  (dailyRecords || []).forEach((record) => {
    const row = sheet3.addRow({
      date: formatDateToYYYYMMDD(record.date) || record.dateStr || 'N/A',
      employeeName: record.employee?.name || 'N/A',
      morningStatus: record.morning?.status ? record.morning.status.toUpperCase() : 'NOT MARKED',
      eveningStatus: record.evening?.status ? record.evening.status.toUpperCase() : 'NOT MARKED'
    });

    row.height = 20;
    row.eachCell((cell, colNumber) => {
      cell.border = borderStyle;
      cell.font = { name: 'Segoe UI', size: 10 };
      if (colNumber === 1 || colNumber >= 3) {
        cell.alignment = { horizontal: 'center' };
      }
    });
  });

  sheet3.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: sheet3.columns.length }
  };

  return await workbook.xlsx.writeBuffer();
};

module.exports = {
  generateAttendanceExcelReport
};
