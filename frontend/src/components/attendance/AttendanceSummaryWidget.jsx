import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CalendarCheck2, ArrowRight, Sun, Moon } from 'lucide-react';
import Button from '../common/Button';
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
    (state) => state.attendance
  );

  const todayStr = getTodayYYYYMMDD();
  const currentMonthStr = getCurrentYYYYMM();

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
      <div className="glass-card rounded-3xl p-6 border-slate-800 space-y-4 hover:border-indigo-500/30 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Attendance Overview</h3>
              <p className="text-[11px] text-slate-400">Today's workforce status (Database Live)</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/admin/attendance')}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Manage <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium">Total</div>
            <div className="text-lg font-bold text-white">{totalCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium">Present</div>
            <div className="text-lg font-bold text-emerald-400">{presentCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium">Absent</div>
            <div className="text-lg font-bold text-rose-400">{absentCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium">On Leave</div>
            <div className="text-lg font-bold text-amber-400">{leaveCount}</div>
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
      <div className="glass-card rounded-3xl p-6 border-slate-800 space-y-4 hover:border-indigo-500/30 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Monthly Attendance Analytics</h3>
              <p className="text-[11px] text-slate-400">Company-wide metric (Database Live)</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/founder/attendance')}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Analytics <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium">Overall Attendance</div>
            <div className="text-xl font-bold text-indigo-400">{overallPct}%</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-medium">Working Days</div>
            <div className="text-xl font-bold text-emerald-400">{workingDays} Days</div>
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
    <div className="glass-card rounded-3xl p-6 border-slate-800 space-y-4 hover:border-indigo-500/30 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <CalendarCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">My Attendance Today</h3>
            <p className="text-[11px] text-slate-400">Daily session log (Database Live)</p>
          </div>
        </div>
        <Button
          onClick={() => navigate('/employee/attendance')}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          My Attendance <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-300 font-medium">Morning</span>
          </div>
          <span className="text-xs font-bold text-emerald-400 capitalize">{morningStatus}</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-400" />
            <span className="text-xs text-slate-300 font-medium">Evening</span>
          </div>
          <span className="text-xs font-bold text-emerald-400 capitalize">{eveningStatus}</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSummaryWidget;
