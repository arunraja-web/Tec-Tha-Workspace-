const mongoose = require('mongoose');
const Task = require('../models/Task');

/**
 * Helper to build base date range match filter
 */
const buildDateFilter = (from, to) => {
  const filter = { isArchived: false };
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }
  return filter;
};

/**
 * Company-wide Task Analytics (Admin / Founder only)
 */
const getCompanyAnalytics = async (currentUser, { from, to }) => {
  if (!['admin', 'founder'].includes(currentUser.role)) {
    const err = new Error('Not authorized to access company analytics');
    err.statusCode = 403;
    throw err;
  }

  const matchFilter = buildDateFilter(from, to);
  const now = new Date();

  const [counts] = await Task.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: null,
        totalTasks: { $sum: 1 },
        todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        inReview: { $sum: { $cond: [{ $eq: ['$status', 'in_review'] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ['$dueDate', null] },
                  { $lt: ['$dueDate', now] },
                  { $ne: ['$status', 'completed'] },
                  { $ne: ['$status', 'cancelled'] }
                ]
              },
              1,
              0
            ]
          }
        },
        lowPriority: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } },
        mediumPriority: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
        highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
        urgentPriority: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } }
      }
    }
  ]);

  const stats = counts || {
    totalTasks: 0,
    todo: 0,
    inProgress: 0,
    inReview: 0,
    completed: 0,
    cancelled: 0,
    overdue: 0,
    lowPriority: 0,
    mediumPriority: 0,
    highPriority: 0,
    urgentPriority: 0
  };

  // Calculate Average Completion Time (in hours)
  const [avgTimeResult] = await Task.aggregate([
    {
      $match: {
        ...matchFilter,
        status: 'completed',
        completedAt: { $ne: null }
      }
    },
    {
      $project: {
        durationHours: {
          $divide: [{ $subtract: ['$completedAt', '$createdAt'] }, 1000 * 60 * 60]
        }
      }
    },
    {
      $group: {
        _id: null,
        avgHours: { $avg: '$durationHours' }
      }
    }
  ]);

  const averageCompletionTime = avgTimeResult ? Math.round(avgTimeResult.avgHours * 10) / 10 : 0;
  const completionPercentage = stats.totalTasks > 0 ? Math.round((stats.completed / stats.totalTasks) * 100) : 0;

  return {
    totalTasks: stats.totalTasks,
    todo: stats.todo,
    inProgress: stats.inProgress,
    inReview: stats.inReview,
    completed: stats.completed,
    cancelled: stats.cancelled,
    overdue: stats.overdue,
    completionPercentage,
    averageCompletionTime,
    priorityBreakdown: {
      low: stats.lowPriority,
      medium: stats.mediumPriority,
      high: stats.highPriority,
      urgent: stats.urgentPriority
    }
  };
};

/**
 * Employee Performance Breakdown Analytics (Admin / Founder only)
 */
const getEmployeeAnalytics = async (currentUser, { from, to }) => {
  if (!['admin', 'founder'].includes(currentUser.role)) {
    const err = new Error('Not authorized to access employee performance analytics');
    err.statusCode = 403;
    throw err;
  }

  const matchFilter = buildDateFilter(from, to);
  const now = new Date();

  const employeeStats = await Task.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$assignedTo',
        totalTasks: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        inReview: { $sum: { $cond: [{ $eq: ['$status', 'in_review'] }, 1, 0] } },
        todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ['$dueDate', null] },
                  { $lt: ['$dueDate', now] },
                  { $ne: ['$status', 'completed'] },
                  { $ne: ['$status', 'cancelled'] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'employee'
      }
    },
    { $unwind: '$employee' },
    {
      $project: {
        _id: 0,
        employee: {
          id: '$employee._id',
          name: '$employee.name',
          email: '$employee.email',
          role: '$employee.role'
        },
        totalTasks: 1,
        completed: 1,
        inProgress: 1,
        inReview: 1,
        todo: 1,
        cancelled: 1,
        overdue: 1,
        completionPercentage: {
          $cond: [
            { $gt: ['$totalTasks', 0] },
            { $round: [{ $multiply: [{ $divide: ['$completed', '$totalTasks'] }, 100] }, 0] },
            0
          ]
        }
      }
    },
    { $sort: { completionPercentage: -1, totalTasks: -1 } }
  ]);

  return employeeStats;
};

/**
 * Employee Personal Analytics
 */
const getMyAnalytics = async (currentUser, { from, to }) => {
  const matchFilter = buildDateFilter(from, to);
  matchFilter.assignedTo = new mongoose.Types.ObjectId(currentUser._id);
  const now = new Date();

  const [statsResult] = await Task.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: null,
        totalTasks: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
        inReview: { $sum: { $cond: [{ $eq: ['$status', 'in_review'] }, 1, 0] } },
        todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ['$dueDate', null] },
                  { $lt: ['$dueDate', now] },
                  { $ne: ['$status', 'completed'] },
                  { $ne: ['$status', 'cancelled'] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  const stats = statsResult || {
    totalTasks: 0,
    completed: 0,
    inProgress: 0,
    inReview: 0,
    todo: 0,
    cancelled: 0,
    overdue: 0
  };

  const completionPercentage = stats.totalTasks > 0 ? Math.round((stats.completed / stats.totalTasks) * 100) : 0;

  return {
    totalTasks: stats.totalTasks,
    completed: stats.completed,
    inProgress: stats.inProgress,
    inReview: stats.inReview,
    todo: stats.todo,
    cancelled: stats.cancelled,
    overdue: stats.overdue,
    completionPercentage
  };
};

module.exports = {
  getCompanyAnalytics,
  getEmployeeAnalytics,
  getMyAnalytics
};
