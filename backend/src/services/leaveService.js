const Leave = require('../models/Leave');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const ActivityLog = require('../models/ActivityLog');
const {
  getStartOfDay,
  getEndOfDay,
  getMonthRange,
  formatDateToYYYYMMDD
} = require('../utils/dateUtils');
const {
  notifyFoundersOnCreate,
  notifyEmployeeOnApprove,
  notifyEmployeeOnReject,
  notifyFoundersOnCancel
} = require('./leaveNotificationService');

/**
 * Calculate total inclusive leave days between start and end date
 */
const calculateLeaveDays = (startDateInput, endDateInput) => {
  const start = getStartOfDay(startDateInput);
  const end = getStartOfDay(endDateInput);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

/**
 * Check if employee has overlapping active leave requests (pending or approved)
 */
const checkOverlap = async (employeeId, startDate, endDate, excludeLeaveId = null) => {
  const startOfDay = getStartOfDay(startDate);
  const endOfDay = getEndOfDay(endDate);

  const query = {
    employee: employeeId,
    status: { $in: ['pending', 'approved'] },
    startDate: { $lte: endOfDay },
    endDate: { $gte: startOfDay }
  };

  if (excludeLeaveId) {
    query._id = { $ne: excludeLeaveId };
  }

  const overlapping = await Leave.findOne(query);
  return overlapping;
};

/**
 * Check if identical pending request exists
 */
const checkDuplicatePending = async (employeeId, leaveType, startDate, endDate, excludeLeaveId = null) => {
  const startOfDay = getStartOfDay(startDate);
  const endOfDay = getEndOfDay(endDate);

  const query = {
    employee: employeeId,
    status: 'pending',
    leaveType,
    startDate: startOfDay,
    endDate: endOfDay
  };

  if (excludeLeaveId) {
    query._id = { $ne: excludeLeaveId };
  }

  const duplicate = await Leave.findOne(query);
  return duplicate;
};

/**
 * 1. Employee apply for leave
 */
const createLeave = async (user, leaveData) => {
  const { leaveType, startDate, endDate, reason } = leaveData;

  // Derive employee ID exclusively from req.user._id
  const employeeId = user._id;

  const startOfDay = getStartOfDay(startDate);
  const endOfDay = getEndOfDay(endDate);

  if (startOfDay > endOfDay) {
    const error = new Error('End date cannot be before start date');
    error.statusCode = 400;
    throw error;
  }

  // Check duplicate request
  const duplicate = await checkDuplicatePending(employeeId, leaveType, startOfDay, endOfDay);
  if (duplicate) {
    const error = new Error('An existing leave request already covers these dates.');
    error.statusCode = 409;
    throw error;
  }

  // Check date overlap against pending and approved requests
  const overlapping = await checkOverlap(employeeId, startOfDay, endOfDay);
  if (overlapping) {
    const error = new Error('An existing leave request already covers these dates.');
    error.statusCode = 409;
    throw error;
  }

  // Create leave request
  const leave = await Leave.create({
    employee: employeeId,
    leaveType,
    startDate: startOfDay,
    endDate: endOfDay,
    reason: reason.trim(),
    status: 'pending'
  });

  // Create ActivityLog entry
  try {
    await ActivityLog.create({
      performedBy: user._id,
      targetUser: user._id,
      leave: leave._id,
      action: 'LEAVE_CREATED',
      description: `${user.name} submitted a ${leaveType} leave request from ${formatDateToYYYYMMDD(startOfDay)} to ${formatDateToYYYYMMDD(endOfDay)}`,
      metadata: {
        leaveType,
        startDate: startOfDay,
        endDate: endOfDay,
        leaveDays: calculateLeaveDays(startOfDay, endOfDay)
      }
    });
  } catch (err) {
    console.error('Failed to log leave creation activity:', err.message);
  }

  // Send notification to Founders
  await notifyFoundersOnCreate(leave, user);

  // Return populated leave object
  return await Leave.findById(leave._id)
    .populate('employee', '_id name email role department')
    .populate('reviewedBy', '_id name email role');
};

/**
 * 2. Get authenticated employee's own leave history
 */
const getMyLeaves = async (userId, queryParams = {}) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = Math.min(parseInt(queryParams.limit, 10) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = { employee: userId };

  if (queryParams.status) {
    filter.status = queryParams.status;
  }

  if (queryParams.leaveType) {
    filter.leaveType = queryParams.leaveType;
  }

  if (queryParams.month) {
    const { startOfMonth, endOfMonth } = getMonthRange(queryParams.month);
    filter.startDate = { $lte: endOfMonth };
    filter.endDate = { $gte: startOfMonth };
  } else {
    if (queryParams.startDate && queryParams.endDate) {
      filter.startDate = { $lte: getEndOfDay(queryParams.endDate) };
      filter.endDate = { $gte: getStartOfDay(queryParams.startDate) };
    } else if (queryParams.startDate) {
      filter.endDate = { $gte: getStartOfDay(queryParams.startDate) };
    } else if (queryParams.endDate) {
      filter.startDate = { $lte: getEndOfDay(queryParams.endDate) };
    }
  }

  const totalLeaves = await Leave.countDocuments(filter);
  const totalPages = Math.ceil(totalLeaves / limit) || 1;

  const leaves = await Leave.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('employee', '_id name email role department')
    .populate('reviewedBy', '_id name email role')
    .lean();

  return {
    leaves,
    pagination: {
      page,
      limit,
      totalLeaves,
      totalPages
    }
  };
};

/**
 * 3. Get single leave request by ID
 */
const getLeaveById = async (leaveId, user) => {
  const leave = await Leave.findById(leaveId)
    .populate('employee', '_id name email role department')
    .populate('reviewedBy', '_id name email role');

  if (!leave) {
    const error = new Error('Leave request not found');
    error.statusCode = 404;
    throw error;
  }

  // Employee can only view their own leave request
  if (user.role === 'employee' && leave.employee._id.toString() !== user._id.toString()) {
    const error = new Error('Forbidden: You are not authorized to view this leave request.');
    error.statusCode = 403;
    throw error;
  }

  return leave;
};

/**
 * 4. Employee update pending leave
 */
const updateLeave = async (leaveId, user, updateData) => {
  const leave = await Leave.findById(leaveId);

  if (!leave) {
    const error = new Error('Leave request not found');
    error.statusCode = 404;
    throw error;
  }

  // Only the employee who created the leave can update it
  if (leave.employee.toString() !== user._id.toString()) {
    const error = new Error('Forbidden: You can only edit your own leave requests.');
    error.statusCode = 403;
    throw error;
  }

  // Only pending leave requests can be updated
  if (leave.status !== 'pending') {
    const error = new Error('Only pending leave requests can be edited.');
    error.statusCode = 400;
    throw error;
  }

  const { leaveType, startDate, endDate, reason } = updateData;

  const newStart = startDate ? getStartOfDay(startDate) : leave.startDate;
  const newEnd = endDate ? getEndOfDay(endDate) : leave.endDate;

  if (newStart > newEnd) {
    const error = new Error('End date cannot be before start date');
    error.statusCode = 400;
    throw error;
  }

  // Check overlap excluding current leave
  const overlapping = await checkOverlap(user._id, newStart, newEnd, leaveId);
  if (overlapping) {
    const error = new Error('An existing leave request already covers these dates.');
    error.statusCode = 409;
    throw error;
  }

  if (leaveType) leave.leaveType = leaveType;
  if (startDate) leave.startDate = newStart;
  if (endDate) leave.endDate = newEnd;
  if (reason) leave.reason = reason.trim();

  await leave.save();

  // Create ActivityLog entry
  try {
    await ActivityLog.create({
      performedBy: user._id,
      targetUser: user._id,
      leave: leave._id,
      action: 'LEAVE_UPDATED',
      description: `${user.name} updated pending leave request`,
      metadata: {
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate
      }
    });
  } catch (err) {
    console.error('Failed to log leave update activity:', err.message);
  }

  return await Leave.findById(leave._id)
    .populate('employee', '_id name email role department')
    .populate('reviewedBy', '_id name email role');
};

/**
 * 5. Employee cancel pending leave
 */
const cancelLeave = async (leaveId, user) => {
  const leave = await Leave.findById(leaveId);

  if (!leave) {
    const error = new Error('Leave request not found');
    error.statusCode = 404;
    throw error;
  }

  if (leave.employee.toString() !== user._id.toString()) {
    const error = new Error('Forbidden: You can only cancel your own leave requests.');
    error.statusCode = 403;
    throw error;
  }

  if (leave.status !== 'pending') {
    const error = new Error('Only pending leave requests can be cancelled.');
    error.statusCode = 400;
    throw error;
  }

  leave.status = 'cancelled';
  leave.cancelledAt = new Date();
  await leave.save();

  // ActivityLog
  try {
    await ActivityLog.create({
      performedBy: user._id,
      targetUser: user._id,
      leave: leave._id,
      action: 'LEAVE_CANCELLED',
      description: `${user.name} cancelled their pending leave request`,
      metadata: {
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate
      }
    });
  } catch (err) {
    console.error('Failed to log leave cancellation activity:', err.message);
  }

  // Notify Founders
  await notifyFoundersOnCancel(leave, user);

  return await Leave.findById(leave._id)
    .populate('employee', '_id name email role department')
    .populate('reviewedBy', '_id name email role');
};

/**
 * 6. Founder approve leave request
 */
const approveLeave = async (leaveId, founderUser, comment = '') => {
  // STRICT RULE: ONLY FOUNDER CAN APPROVE
  if (founderUser.role !== 'founder') {
    const error = new Error('Only Founder can approve leave requests.');
    error.statusCode = 403;
    throw error;
  }

  const leave = await Leave.findById(leaveId);
  if (!leave) {
    const error = new Error('Leave request not found');
    error.statusCode = 404;
    throw error;
  }

  if (leave.status !== 'pending') {
    const error = new Error('Leave request has already been processed.');
    error.statusCode = 409;
    throw error;
  }

  // Founder self-approval protection
  if (leave.employee.toString() === founderUser._id.toString()) {
    const error = new Error('Founder cannot approve their own leave request.');
    error.statusCode = 400;
    throw error;
  }

  // Re-check overlap against existing APPROVED leaves for this employee
  const approvedOverlap = await Leave.findOne({
    _id: { $ne: leave._id },
    employee: leave.employee,
    status: 'approved',
    startDate: { $lte: leave.endDate },
    endDate: { $gte: leave.startDate }
  });

  if (approvedOverlap) {
    const error = new Error('Cannot approve: employee already has an approved leave request covering these dates.');
    error.statusCode = 409;
    throw error;
  }

  // Atomic update using status condition
  const updatedLeave = await Leave.findOneAndUpdate(
    { _id: leaveId, status: 'pending' },
    {
      $set: {
        status: 'approved',
        reviewedBy: founderUser._id,
        reviewedAt: new Date(),
        reviewComment: comment ? comment.trim() : ''
      }
    },
    { new: true }
  )
    .populate('employee', '_id name email role department')
    .populate('reviewedBy', '_id name email role');

  if (!updatedLeave) {
    const error = new Error('Leave request has already been processed.');
    error.statusCode = 409;
    throw error;
  }

  // Attendance Integration: Mark attendance session as 'leave' for every day in leave range
  try {
    const start = getStartOfDay(updatedLeave.startDate);
    const end = getEndOfDay(updatedLeave.endDate);
    let cur = new Date(start);

    while (cur <= end) {
      const dayStart = getStartOfDay(cur);
      await Attendance.findOneAndUpdate(
        { employee: updatedLeave.employee._id, date: dayStart },
        {
          $set: {
            'morning.status': 'leave',
            'morning.markedBy': founderUser._id,
            'morning.markedAt': new Date(),
            'evening.status': 'leave',
            'evening.markedBy': founderUser._id,
            'evening.markedAt': new Date()
          }
        },
        { upsert: true, new: true }
      );
      cur.setDate(cur.getDate() + 1);
    }
  } catch (err) {
    console.error('Failed to sync attendance for approved leave:', err.message);
  }

  // ActivityLog
  try {
    await ActivityLog.create({
      performedBy: founderUser._id,
      targetUser: updatedLeave.employee._id,
      leave: updatedLeave._id,
      action: 'LEAVE_APPROVED',
      description: `Founder ${founderUser.name} approved leave request for ${updatedLeave.employee.name}`,
      metadata: {
        comment: updatedLeave.reviewComment,
        startDate: updatedLeave.startDate,
        endDate: updatedLeave.endDate
      }
    });
  } catch (err) {
    console.error('Failed to log leave approval activity:', err.message);
  }

  // Notify Employee
  await notifyEmployeeOnApprove(updatedLeave, founderUser);

  return updatedLeave;
};

/**
 * 7. Founder reject leave request
 */
const rejectLeave = async (leaveId, founderUser, comment) => {
  // STRICT RULE: ONLY FOUNDER CAN REJECT
  if (founderUser.role !== 'founder') {
    const error = new Error('Only Founder can reject leave requests.');
    error.statusCode = 403;
    throw error;
  }

  if (!comment || typeof comment !== 'string' || !comment.trim()) {
    const error = new Error('Review comment is required when rejecting a leave request.');
    error.statusCode = 400;
    throw error;
  }

  const leave = await Leave.findById(leaveId);
  if (!leave) {
    const error = new Error('Leave request not found');
    error.statusCode = 404;
    throw error;
  }

  if (leave.status !== 'pending') {
    const error = new Error('Leave request has already been processed.');
    error.statusCode = 409;
    throw error;
  }

  // Atomic update using status condition
  const updatedLeave = await Leave.findOneAndUpdate(
    { _id: leaveId, status: 'pending' },
    {
      $set: {
        status: 'rejected',
        reviewedBy: founderUser._id,
        reviewedAt: new Date(),
        reviewComment: comment.trim()
      }
    },
    { new: true }
  )
    .populate('employee', '_id name email role department')
    .populate('reviewedBy', '_id name email role');

  if (!updatedLeave) {
    const error = new Error('Leave request has already been processed.');
    error.statusCode = 409;
    throw error;
  }

  // ActivityLog
  try {
    await ActivityLog.create({
      performedBy: founderUser._id,
      targetUser: updatedLeave.employee._id,
      leave: updatedLeave._id,
      action: 'LEAVE_REJECTED',
      description: `Founder ${founderUser.name} rejected leave request for ${updatedLeave.employee.name}`,
      metadata: {
        comment: updatedLeave.reviewComment,
        startDate: updatedLeave.startDate,
        endDate: updatedLeave.endDate
      }
    });
  } catch (err) {
    console.error('Failed to log leave rejection activity:', err.message);
  }

  // Notify Employee
  await notifyEmployeeOnReject(updatedLeave, founderUser, comment.trim());

  return updatedLeave;
};

/**
 * 8. List all leave requests for Admin & Founder with search, filters, pagination, sorting
 */
const getAllLeaves = async (queryParams = {}) => {
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = Math.min(parseInt(queryParams.limit, 10) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = {};

  if (queryParams.status) {
    filter.status = queryParams.status;
  }

  if (queryParams.leaveType) {
    filter.leaveType = queryParams.leaveType;
  }

  if (queryParams.employee) {
    filter.employee = queryParams.employee;
  }

  if (queryParams.month) {
    const { startOfMonth, endOfMonth } = getMonthRange(queryParams.month);
    filter.startDate = { $lte: endOfMonth };
    filter.endDate = { $gte: startOfMonth };
  } else {
    if (queryParams.startDate && queryParams.endDate) {
      filter.startDate = { $lte: getEndOfDay(queryParams.endDate) };
      filter.endDate = { $gte: getStartOfDay(queryParams.startDate) };
    } else if (queryParams.startDate) {
      filter.endDate = { $gte: getStartOfDay(queryParams.startDate) };
    } else if (queryParams.endDate) {
      filter.startDate = { $lte: getEndOfDay(queryParams.endDate) };
    }
  }

  // Search filter by Employee Name, Email, or Reason
  if (queryParams.search && queryParams.search.trim()) {
    const searchRegex = new RegExp(queryParams.search.trim(), 'i');

    const matchingUsers = await User.find({
      $or: [
        { name: searchRegex },
        { email: searchRegex }
      ]
    }).select('_id');

    const userIds = matchingUsers.map((u) => u._id);

    filter.$or = [
      { employee: { $in: userIds } },
      { reason: searchRegex }
    ];
  }

  // Department filter
  if (queryParams.department && queryParams.department.trim()) {
    const deptRegex = new RegExp(queryParams.department.trim(), 'i');
    const deptUsers = await User.find({ department: deptRegex }).select('_id');
    const deptUserIds = deptUsers.map((u) => u._id);

    if (filter.employee) {
      filter.employee = { $in: [filter.employee].filter((id) => deptUserIds.some((dId) => dId.toString() === id.toString())) };
    } else {
      filter.employee = { $in: deptUserIds };
    }
  }

  // Sorting logic
  const sortOptions = {};
  const allowedSortFields = ['createdAt', 'startDate', 'endDate', 'status'];
  let sortField = queryParams.sortBy || 'createdAt';
  let sortOrder = queryParams.sortOrder === 'asc' ? 1 : -1;

  if (!allowedSortFields.includes(sortField)) {
    sortField = 'createdAt';
  }
  sortOptions[sortField] = sortOrder;

  const totalLeaves = await Leave.countDocuments(filter);
  const totalPages = Math.ceil(totalLeaves / limit) || 1;

  const leaves = await Leave.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .populate('employee', '_id name email role department')
    .populate('reviewedBy', '_id name email role')
    .lean();

  return {
    leaves,
    pagination: {
      page,
      limit,
      totalLeaves,
      totalPages
    }
  };
};

/**
 * 9. Convenience method to get pending leaves
 */
const getPendingLeaves = async (queryParams = {}) => {
  return await getAllLeaves({ ...queryParams, status: 'pending' });
};

/**
 * 10. Leave Analytics (Total requests, pending, approved, rejected, cancelled, total days)
 */
const getLeaveAnalytics = async (queryParams = {}) => {
  const matchFilter = {};

  if (queryParams.month) {
    const { startOfMonth, endOfMonth } = getMonthRange(queryParams.month);
    matchFilter.startDate = { $lte: endOfMonth };
    matchFilter.endDate = { $gte: startOfMonth };
  } else if (queryParams.startDate && queryParams.endDate) {
    matchFilter.startDate = { $lte: getEndOfDay(queryParams.endDate) };
    matchFilter.endDate = { $gte: getStartOfDay(queryParams.startDate) };
  }

  const aggregation = await Leave.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const statsMap = {
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0
  };

  let totalRequests = 0;
  aggregation.forEach((item) => {
    statsMap[item._id] = item.count;
    totalRequests += item.count;
  });

  // Calculate total leave days across approved leaves
  const approvedLeaves = await Leave.find({ ...matchFilter, status: 'approved' }).select('startDate endDate');
  let totalLeaveDays = 0;
  approvedLeaves.forEach((l) => {
    totalLeaveDays += calculateLeaveDays(l.startDate, l.endDate);
  });

  const response = {
    totalRequests,
    pending: statsMap.pending,
    approved: statsMap.approved,
    rejected: statsMap.rejected,
    cancelled: statsMap.cancelled,
    totalLeaveDays
  };

  if (queryParams.month) {
    response.month = queryParams.month;
  }

  return response;
};

/**
 * 11. Employee-wise Leave Analytics
 */
const getEmployeeLeaveAnalytics = async (queryParams = {}) => {
  const matchFilter = {};

  if (queryParams.month) {
    const { startOfMonth, endOfMonth } = getMonthRange(queryParams.month);
    matchFilter.startDate = { $lte: endOfMonth };
    matchFilter.endDate = { $gte: startOfMonth };
  }

  const activeEmployees = await User.find({
    role: 'employee',
    isActive: true,
    deletedAt: null
  }).select('_id name email department').sort({ name: 1 }).lean();

  const activeEmployeeIds = activeEmployees.map((e) => e._id);

  // Match leaves for active employees
  matchFilter.employee = { $in: activeEmployeeIds };

  const allLeaves = await Leave.find(matchFilter).lean();

  const empMap = new Map();
  activeEmployees.forEach((emp) => {
    empMap.set(emp._id.toString(), {
      employee: {
        _id: emp._id,
        name: emp.name,
        email: emp.email,
        department: emp.department || 'General'
      },
      casual: 0,
      sick: 0,
      annual: 0,
      emergency: 0,
      other: 0,
      totalLeaveDays: 0,
      approvedRequests: 0,
      rejectedRequests: 0
    });
  });

  allLeaves.forEach((l) => {
    const empId = l.employee.toString();
    if (empMap.has(empId)) {
      const record = empMap.get(empId);
      if (l.status === 'approved') {
        record.approvedRequests++;
        const days = calculateLeaveDays(l.startDate, l.endDate);
        record.totalLeaveDays += days;

        if (l.leaveType === 'casual') record.casual += days;
        else if (l.leaveType === 'sick') record.sick += days;
        else if (l.leaveType === 'annual') record.annual += days;
        else if (l.leaveType === 'emergency') record.emergency += days;
        else if (l.leaveType === 'other') record.other += days;
      } else if (l.status === 'rejected') {
        record.rejectedRequests++;
      }
    }
  });

  return {
    employees: Array.from(empMap.values())
  };
};

module.exports = {
  calculateLeaveDays,
  checkOverlap,
  checkDuplicatePending,
  createLeave,
  getMyLeaves,
  getLeaveById,
  updateLeave,
  cancelLeave,
  approveLeave,
  rejectLeave,
  getAllLeaves,
  getPendingLeaves,
  getLeaveAnalytics,
  getEmployeeLeaveAnalytics
};
