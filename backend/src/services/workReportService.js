const mongoose = require('mongoose');
const WorkReport = require('../models/WorkReport');
const WorkReportReview = require('../models/WorkReportReview');
const Task = require('../models/Task');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { notifyAdminsAndFoundersOnSubmit, notifyEmployeeOnReview } = require('./workReportNotificationService');
const { getStartOfDay, getEndOfDay, getTodayDateString, getMonthRange, formatDateToYYYYMMDD } = require('../utils/dateUtils');

/**
 * Validate that linked tasks exist and are assigned to the target user
 */
const validateUserTasks = async (taskIds, userId) => {
  if (!Array.isArray(taskIds) || taskIds.length === 0) return [];

  const validTasks = await Task.find({
    _id: { $in: taskIds },
    assignedTo: userId
  }).select('_id');

  if (validTasks.length !== taskIds.length) {
    const error = new Error('One or more selected tasks are invalid or not assigned to you');
    error.statusCode = 400;
    throw error;
  }

  return validTasks.map((t) => t._id);
};

/**
 * Create a daily work report draft for the logged in employee
 */
const createDraft = async (user, data) => {
  const targetDateStr = formatDateToYYYYMMDD(data.reportDate || getTodayDateString());
  const startOfDay = getStartOfDay(targetDateStr);
  const endOfDay = getEndOfDay(targetDateStr);

  // Check if a report already exists for employee + reportDate
  const existingReport = await WorkReport.findOne({
    employee: user._id,
    reportDate: { $gte: startOfDay, $lte: endOfDay }
  }).populate('tasks', '_id title status progress');

  if (existingReport) {
    if (['draft', 'needs_revision'].includes(existingReport.status)) {
      return {
        existing: true,
        report: existingReport,
        message: 'A report draft already exists for this date'
      };
    }
    const error = new Error('A work report has already been submitted or reviewed for this date');
    error.statusCode = 409;
    throw error;
  }

  // Validate tasks if provided
  let taskIds = [];
  if (data.tasks && data.tasks.length > 0) {
    taskIds = await validateUserTasks(data.tasks, user._id);
  }

  const newReport = await WorkReport.create({
    employee: user._id,
    reportDate: startOfDay,
    summary: data.summary || '',
    completedWork: data.completedWork || '',
    challenges: data.challenges || '',
    nextDayPlan: data.nextDayPlan || '',
    tasks: taskIds,
    status: 'draft'
  });

  // Record ActivityLog
  await ActivityLog.create({
    performedBy: user._id,
    targetUser: user._id,
    report: newReport._id,
    action: 'WORK_REPORT_CREATED',
    description: `Created work report draft for ${targetDateStr}`
  });

  const populated = await WorkReport.findById(newReport._id)
    .populate('employee', '_id name email role department')
    .populate('tasks', '_id title status progress');

  return {
    existing: false,
    report: populated,
    message: 'Work report draft created successfully'
  };
};

/**
 * Get today's report for logged in employee
 */
const getTodayReport = async (user) => {
  const todayStr = getTodayDateString();
  const startOfDay = getStartOfDay(todayStr);
  const endOfDay = getEndOfDay(todayStr);

  const report = await WorkReport.findOne({
    employee: user._id,
    reportDate: { $gte: startOfDay, $lte: endOfDay }
  })
    .populate('employee', '_id name email role department')
    .populate('tasks', '_id title status progress')
    .populate('reviewedBy', '_id name email role');

  return report;
};

/**
 * Get logged in employee's report list with pagination & filters
 */
const getMyReports = async (user, query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = Math.min(parseInt(query.limit, 10) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = { employee: user._id };

  if (query.status) {
    filter.status = query.status;
  }

  if (query.month && /^\d{4}-\d{2}$/.test(query.month)) {
    const { startOfMonth, endOfMonth } = getMonthRange(query.month);
    filter.reportDate = { $gte: startOfMonth, $lte: endOfMonth };
  }

  const [reports, total] = await Promise.all([
    WorkReport.find(filter)
      .populate('tasks', '_id title status progress')
      .populate('reviewedBy', '_id name email role')
      .sort({ reportDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    WorkReport.countDocuments(filter)
  ]);

  return {
    reports,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1
    }
  };
};

/**
 * Get a single work report by ID with review history
 */
const getReportById = async (reportId, user) => {
  const report = await WorkReport.findById(reportId)
    .populate('employee', '_id name email role department')
    .populate('tasks', '_id title status progress')
    .populate('reviewedBy', '_id name email role')
    .populate('attachments.uploadedBy', '_id name email');

  if (!report) {
    const error = new Error('Work report not found');
    error.statusCode = 404;
    throw error;
  }

  const isOwner = report.employee._id.toString() === user._id.toString();
  const isAdminOrFounder = ['admin', 'founder'].includes(user.role);

  if (!isOwner && !isAdminOrFounder) {
    const error = new Error('Not authorized to view this work report');
    error.statusCode = 403;
    throw error;
  }

  // Fetch review history
  const reviewHistory = await WorkReportReview.find({ report: report._id })
    .populate('reviewer', '_id name email role')
    .sort({ createdAt: -1 });

  const reportObj = report.toObject();
  reportObj.reviewHistory = reviewHistory;

  return reportObj;
};

/**
 * Update an existing work report draft or needs_revision report
 */
const updateDraft = async (reportId, user, data) => {
  const report = await WorkReport.findById(reportId);

  if (!report) {
    const error = new Error('Work report not found');
    error.statusCode = 404;
    throw error;
  }

  if (report.employee.toString() !== user._id.toString()) {
    const error = new Error('You can only update your own work report');
    error.statusCode = 403;
    throw error;
  }

  if (!['draft', 'needs_revision'].includes(report.status)) {
    const error = new Error(`Cannot modify a work report with status '${report.status}'`);
    error.statusCode = 400;
    throw error;
  }

  if (data.summary !== undefined) report.summary = data.summary;
  if (data.completedWork !== undefined) report.completedWork = data.completedWork;
  if (data.challenges !== undefined) report.challenges = data.challenges;
  if (data.nextDayPlan !== undefined) report.nextDayPlan = data.nextDayPlan;

  if (data.tasks !== undefined) {
    const taskIds = await validateUserTasks(data.tasks, user._id);
    report.tasks = taskIds;
  }

  await report.save();

  // Record ActivityLog
  await ActivityLog.create({
    performedBy: user._id,
    targetUser: user._id,
    report: report._id,
    action: 'WORK_REPORT_UPDATED',
    description: `Updated work report for ${formatDateToYYYYMMDD(report.reportDate)}`
  });

  return await WorkReport.findById(report._id)
    .populate('employee', '_id name email role department')
    .populate('tasks', '_id title status progress');
};

/**
 * Submit work report for admin/founder review
 */
const submitReport = async (reportId, user) => {
  const report = await WorkReport.findById(reportId);

  if (!report) {
    const error = new Error('Work report not found');
    error.statusCode = 404;
    throw error;
  }

  if (report.employee.toString() !== user._id.toString()) {
    const error = new Error('You can only submit your own work report');
    error.statusCode = 403;
    throw error;
  }

  if (!['draft', 'needs_revision'].includes(report.status)) {
    const error = new Error(`Cannot submit a work report with status '${report.status}'`);
    error.statusCode = 400;
    throw error;
  }

  if (!report.completedWork || !report.completedWork.trim()) {
    const error = new Error('Completed work section is required to submit the report');
    error.statusCode = 400;
    throw error;
  }

  report.status = 'submitted';
  report.submittedAt = new Date();
  await report.save();

  // Record ActivityLog
  await ActivityLog.create({
    performedBy: user._id,
    targetUser: user._id,
    report: report._id,
    action: 'WORK_REPORT_SUBMITTED',
    description: `Submitted work report for ${formatDateToYYYYMMDD(report.reportDate)}`
  });

  // Notify Admins and Founders
  await notifyAdminsAndFoundersOnSubmit(report, user);

  return await WorkReport.findById(report._id)
    .populate('employee', '_id name email role department')
    .populate('tasks', '_id title status progress');
};

/**
 * Admin or Founder reviews a submitted work report (Approve or Request Revision)
 */
const reviewReport = async (reportId, reviewerUser, { action, comment }) => {
  const report = await WorkReport.findById(reportId);

  if (!report) {
    const error = new Error('Work report not found');
    error.statusCode = 404;
    throw error;
  }

  // Prevent reviewer from reviewing their own employee report
  if (report.employee.toString() === reviewerUser._id.toString()) {
    const error = new Error('You cannot review your own work report');
    error.statusCode = 403;
    throw error;
  }

  if (report.status === 'reviewed' && action === 'approve') {
    const error = new Error('This work report has already been reviewed');
    error.statusCode = 400;
    throw error;
  }

  if (action === 'request_revision' && (!comment || !comment.trim())) {
    const error = new Error('Review comment is required when requesting a revision');
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();

  if (action === 'approve') {
    report.status = 'reviewed';
    report.reviewedBy = reviewerUser._id;
    report.reviewedAt = now;
    report.reviewComment = comment || '';

    await report.save();

    // Create WorkReportReview history
    await WorkReportReview.create({
      report: report._id,
      reviewer: reviewerUser._id,
      action: 'approved',
      comment: comment || ''
    });

    // Record ActivityLog
    await ActivityLog.create({
      performedBy: reviewerUser._id,
      targetUser: report.employee,
      report: report._id,
      action: 'WORK_REPORT_REVIEWED',
      description: `Approved work report for ${formatDateToYYYYMMDD(report.reportDate)}`
    });

    // Notify employee
    await notifyEmployeeOnReview(report, reviewerUser, 'approved', comment);
  } else if (action === 'request_revision') {
    report.status = 'needs_revision';
    report.reviewedBy = reviewerUser._id;
    report.reviewedAt = now;
    report.reviewComment = comment;
    report.revisionRequestedAt = now;

    await report.save();

    // Create WorkReportReview history
    await WorkReportReview.create({
      report: report._id,
      reviewer: reviewerUser._id,
      action: 'revision_requested',
      comment: comment
    });

    // Record ActivityLog
    await ActivityLog.create({
      performedBy: reviewerUser._id,
      targetUser: report.employee,
      report: report._id,
      action: 'WORK_REPORT_REVISION_REQUESTED',
      description: `Requested revision for work report: '${comment}'`
    });

    // Notify employee
    await notifyEmployeeOnReview(report, reviewerUser, 'revision_requested', comment);
  } else {
    const error = new Error('Invalid review action. Must be approve or request_revision');
    error.statusCode = 400;
    throw error;
  }

  return await WorkReport.findById(report._id)
    .populate('employee', '_id name email role department')
    .populate('tasks', '_id title status progress')
    .populate('reviewedBy', '_id name email role');
};

/**
 * Get all employee work reports for Admin and Founder view with search & filters
 */
const getAllReports = async (user, query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = Math.min(parseInt(query.limit, 10) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = {};

  if (query.employee && mongoose.Types.ObjectId.isValid(query.employee)) {
    filter.employee = query.employee;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.date && /^\d{4}-\d{2}-\d{2}$/.test(query.date)) {
    const startOfDay = getStartOfDay(query.date);
    const endOfDay = getEndOfDay(query.date);
    filter.reportDate = { $gte: startOfDay, $lte: endOfDay };
  } else if (query.month && /^\d{4}-\d{2}$/.test(query.month)) {
    const { startOfMonth, endOfMonth } = getMonthRange(query.month);
    filter.reportDate = { $gte: startOfMonth, $lte: endOfMonth };
  }

  if (query.search && query.search.trim()) {
    const regex = new RegExp(query.search.trim(), 'i');
    filter.$or = [
      { summary: regex },
      { completedWork: regex },
      { challenges: regex },
      { nextDayPlan: regex }
    ];
  }

  // Filter by department if specified
  if (query.department && query.department.trim()) {
    const empIds = await User.find({
      department: new RegExp(query.department.trim(), 'i'),
      role: 'employee'
    }).distinct('_id');
    filter.employee = { $in: empIds };
  }

  const [reports, total] = await Promise.all([
    WorkReport.find(filter)
      .populate('employee', '_id name email role department')
      .populate('tasks', '_id title status progress')
      .populate('reviewedBy', '_id name email role')
      .sort({ reportDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    WorkReport.countDocuments(filter)
  ]);

  return {
    reports,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1
    }
  };
};

module.exports = {
  createDraft,
  getTodayReport,
  getMyReports,
  getReportById,
  updateDraft,
  submitReport,
  reviewReport,
  getAllReports
};
