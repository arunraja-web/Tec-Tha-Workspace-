import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CalendarCheck2, ArrowRight, Sun, Moon, CheckCircle2, UserX, Clock, Users } from 'lucide-react';
import {
  fetchDailyAttendance,
  fetchAttendanceAnalytics,
  fetchMyAttendance,
} from '../../redux/slices/attendanceSlice';
import { getTodayYYYYMMDD, getCurrentYYYYMM } from '../../utils/formatDate';

/**
 * Attendance Summary Widget for Role Dashboards (Admin, Founder, Employee)
 * Designed with exact Zoho Dashboard aesthetic (rounded-none, clean borders, font-montserrat)
 */
export const AttendanceSummaryWidget = ({ role = 'employee' }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { dailyAttendance, analytics, myAttendance, loading, analyticsLoading } = useSelector(
    (state) => state.attendance || {}
  );

  const todayStr = getTodayYYYYMMDD ? getTodayYYYYMMDD() : new Date().toISOString().split('T')[0];
  const currentMonthStr = getCurrentYYYYMM ? getCurrentYYYYMM() : new Date().toISOString().slice(0, 7);

  useEffect(() => {
    if (role === 'admin') {
      dispatch(fetchDailyAttendance(todayStr));
    } else if (role === 'founder') {
      dispatch(fetchAttendanceAnalytics(currentMonthStr));
    } else if (role === 'employee') {
      dispatch(fetchMyAttendance(currentMonthStr));
    }
  }, [dispatch, role, todayStr, currentMonthStr]);

  if (role === 'admin') {
    const employees = dailyAttendance?.employees || [];
    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;
    const totalCount = employees.length;

    employees.forEach((emp) => {
      const status = emp.morning?.status || emp.evening?.status;
      if (status === 'present') presentCount++;
      else if (status === 'absent') absentCount++;
      else if (status === 'leave') leaveCount++;
    });

    return (
      <div className="bg-white border border-slate-200 rounded-none shadow-sm font-montserrat divide-y divide-slate-200">

        {/* Header Bar */}
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-none bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0562ff] shrink-0">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
                Attendance & Workforce Summary
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Real-time daily workforce check-ins, presence audit, and leave status
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/attendance')}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 font-semibold text-xs rounded-none transition-all flex items-center justify-center gap-2 cursor-pointer font-montserrat uppercase tracking-wider"
          >
            <span>View Full Attendance Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Metric Cards */}
        <div className="p-5 bg-slate-50/50 grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Total Tracked */}
          <div className="p-4 rounded-none bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Workforce</div>
              <div className="text-2xl font-extrabold text-slate-900 font-montserrat">{totalCount}</div>
            </div>
            <div className="w-9 h-9 rounded-none bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>

          {/* Present Today */}
          <div className="p-4 rounded-none bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Present Today</div>
              <div className="text-2xl font-extrabold text-emerald-700 font-montserrat">{presentCount}</div>
            </div>
            <div className="w-9 h-9 rounded-none bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>

          {/* Absent */}
          <div className="p-4 rounded-none bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">Absent</div>
              <div className="text-2xl font-extrabold text-rose-700 font-montserrat">{absentCount}</div>
            </div>
            <div className="w-9 h-9 rounded-none bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-bold">
              <UserX className="w-4.5 h-4.5" />
            </div>
          </div>

          {/* On Leave */}
          <div className="p-4 rounded-none bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">On Leave</div>
              <div className="text-2xl font-extrabold text-amber-700 font-montserrat">{leaveCount}</div>
            </div>
            <div className="w-9 h-9 rounded-none bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
        </div>

      </div>
    );
  }

  if (role === 'founder') {
    const summary = analytics?.summary;
    const overallPct = summary?.overallAttendancePercentage !== undefined ? summary.overallAttendancePercentage : 100;
    const workingDays = summary?.workingDays || 0;

    return (
      <div className="bg-white border border-slate-200 rounded-none shadow-sm font-montserrat divide-y divide-slate-200">
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-none bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
                Monthly Attendance Analytics
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Executive company-wide attendance percentage and operational working days
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/founder/attendance')}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 font-semibold text-xs rounded-none transition-all flex items-center justify-center gap-2 cursor-pointer font-montserrat uppercase tracking-wider"
          >
            <span>View Analytics Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-5 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-none bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">Overall Attendance</div>
              <div className="text-2xl font-extrabold text-purple-700 font-montserrat">{overallPct}%</div>
            </div>
            <div className="w-9 h-9 rounded-none bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center font-bold">
              <CalendarCheck2 className="w-4.5 h-4.5" />
            </div>
          </div>

          <div className="p-4 rounded-none bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Working Days</div>
              <div className="text-2xl font-extrabold text-emerald-700 font-montserrat">{workingDays} Days</div>
            </div>
            <div className="w-9 h-9 rounded-none bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default: Employee
  const records = myAttendance?.records || [];
  const todayRecord = records.find((r) => r.date === todayStr);

  const morningStatus = todayRecord?.morning?.status || 'Not Marked';
  const eveningStatus = todayRecord?.evening?.status || 'Not Marked';

  return (
    <div className="bg-white border border-slate-200 rounded-none shadow-sm font-montserrat divide-y divide-slate-200">
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-none bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0562ff] shrink-0">
            <CalendarCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
              My Attendance Today
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Daily morning and evening check-in status log
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/employee/attendance')}
          className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 font-semibold text-xs rounded-none transition-all flex items-center justify-center gap-2 cursor-pointer font-montserrat uppercase tracking-wider"
        >
          <span>My Attendance Log</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="p-5 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="p-4 rounded-none bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-none bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <Sun className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Morning Session</span>
          </div>
          <span className="text-sm font-extrabold text-emerald-700 uppercase tracking-wider font-montserrat">{morningStatus}</span>
        </div>

        <div className="p-4 rounded-none bg-white border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-none bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
              <Moon className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Evening Session</span>
          </div>
          <span className="text-sm font-extrabold text-emerald-700 uppercase tracking-wider font-montserrat">{eveningStatus}</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSummaryWidget;
