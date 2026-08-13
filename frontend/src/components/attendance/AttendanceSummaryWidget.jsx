import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CalendarCheck2, ArrowRight, Sun, Moon } from 'lucide-react';
import {
  fetchDailyAttendance,
  fetchAttendanceAnalytics,
  fetchMyAttendance,
} from '../../redux/slices/attendanceSlice';
import { getTodayYYYYMMDD, getCurrentYYYYMM } from '../../utils/formatDate';

/**
 * Attendance Summary Widget for Role Dashboards (Admin, Founder, Employee)
 * Fetches real attendance metrics from database via Redux store
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
      <div className="bg-white border border-slate-200 rounded-none p-5 shadow-sm space-y-3 font-montserrat">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0562ff]">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Attendance Summary & Workforce Overview</h3>
              <p className="text-xs text-slate-500 font-medium">Real-time daily check-in logs & employee attendance tracking</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/attendance')}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs rounded-none transition-colors flex items-center gap-1.5 cursor-pointer font-montserrat"
          >
            <span>Attendance Log</span> <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 rounded-none bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500 font-semibold uppercase">Total Tracked</div>
            <div className="text-xl font-bold text-slate-900 font-montserrat">{totalCount}</div>
          </div>
          <div className="p-3.5 rounded-none bg-emerald-50/60 border border-emerald-200">
            <div className="text-xs text-emerald-700 font-semibold uppercase">Present Today</div>
            <div className="text-xl font-bold text-emerald-700 font-montserrat">{presentCount}</div>
          </div>
          <div className="p-3.5 rounded-none bg-rose-50/60 border border-rose-200">
            <div className="text-xs text-rose-700 font-semibold uppercase">Absent</div>
            <div className="text-xl font-bold text-rose-700 font-montserrat">{absentCount}</div>
          </div>
          <div className="p-3.5 rounded-none bg-amber-50/60 border border-amber-200">
            <div className="text-xs text-amber-700 font-semibold uppercase">On Leave</div>
            <div className="text-xl font-bold text-amber-700 font-montserrat">{leaveCount}</div>
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
      <div className="bg-white border border-slate-200 rounded-none p-5 shadow-sm space-y-3 font-montserrat">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Monthly Attendance Analytics</h3>
              <p className="text-xs text-slate-500 font-medium">Company-wide attendance metrics (Live Database)</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/founder/attendance')}
            className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs rounded-none transition-colors flex items-center gap-1.5 cursor-pointer font-montserrat"
          >
            <span>Analytics Log</span> <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-none bg-purple-50/50 border border-purple-200">
            <div className="text-xs text-purple-700 font-semibold uppercase">Overall Attendance</div>
            <div className="text-xl font-bold text-purple-700 font-montserrat">{overallPct}%</div>
          </div>
          <div className="p-3.5 rounded-none bg-emerald-50/50 border border-emerald-200">
            <div className="text-xs text-emerald-700 font-semibold uppercase">Working Days</div>
            <div className="text-xl font-bold text-emerald-700 font-montserrat">{workingDays} Days</div>
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
    <div className="bg-white border border-slate-200 rounded-none p-5 shadow-sm space-y-3 font-montserrat">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-none bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0562ff]">
            <CalendarCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">My Attendance Today</h3>
            <p className="text-xs text-slate-500 font-medium">Daily session log</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/employee/attendance')}
          className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs rounded-none transition-colors flex items-center gap-1.5 cursor-pointer font-montserrat"
        >
          <span>My Attendance</span> <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="p-3 rounded-none bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-slate-700 font-semibold">Morning Session</span>
          </div>
          <span className="text-xs font-bold text-emerald-700 capitalize">{morningStatus}</span>
        </div>
        <div className="p-3 rounded-none bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-500" />
            <span className="text-xs text-slate-700 font-semibold">Evening Session</span>
          </div>
          <span className="text-xs font-bold text-emerald-700 capitalize">{eveningStatus}</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSummaryWidget;
