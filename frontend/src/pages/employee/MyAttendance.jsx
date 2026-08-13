import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyAttendance } from '../../redux/slices/attendanceSlice';
import { useAuth } from '../../hooks/useAuth';
import { CalendarCheck, CheckCircle2, XCircle, CalendarOff, Percent, Calendar } from 'lucide-react';
import AttendanceCalendar from '../../components/attendance/AttendanceCalendar';
import AttendanceSkeleton from '../../components/attendance/AttendanceSkeleton';
import { getCurrentYYYYMM, formatFriendlyMonth } from '../../utils/formatDate';

export const MyAttendancePage = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { myAttendance, loading } = useSelector((state) => state.attendance);

  const [selectedMonth, setSelectedMonth] = useState(getCurrentYYYYMM());

  useEffect(() => {
    dispatch(fetchMyAttendance(selectedMonth));
  }, [dispatch, selectedMonth]);

  const records = myAttendance?.records || [];

  // Calculate personal metrics
  let presentCount = 0;
  let absentCount = 0;
  let leaveCount = 0;

  records.forEach((rec) => {
    if (rec.morning?.status === 'present') presentCount++;
    if (rec.morning?.status === 'absent') absentCount++;
    if (rec.morning?.status === 'leave') leaveCount++;

    if (rec.evening?.status === 'present') presentCount++;
    if (rec.evening?.status === 'absent') absentCount++;
    if (rec.evening?.status === 'leave') leaveCount++;
  });

  const totalApplicable = presentCount + absentCount;
  const attendancePercentage = totalApplicable > 0 ? ((presentCount / totalApplicable) * 100).toFixed(1) : 100;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-6 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Page Top Header */}
        <div className="glass-card rounded-3xl p-6 border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white">My Attendance</h1>
                <span className="bg-indigo-950/80 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/30 uppercase">
                  Employee Dashboard
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Track your personal attendance records, session logs, and monthly statistics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800">
            <label className="text-xs font-semibold text-slate-300">Month:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-950 text-xs font-bold text-white border border-slate-700 rounded-xl px-3 py-1.5 outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Summary Metrics */}
        {loading ? (
          <AttendanceSkeleton count={4} type="cards" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl glass-card border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">Present Sessions</span>
                <span className="text-2xl font-extrabold text-emerald-400">{presentCount}</span>
              </div>
              <CheckCircle2 className="w-6 h-6 text-emerald-400/80" />
            </div>

            <div className="p-4 rounded-2xl glass-card border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">Absent Sessions</span>
                <span className="text-2xl font-extrabold text-rose-400">{absentCount}</span>
              </div>
              <XCircle className="w-6 h-6 text-rose-400/80" />
            </div>

            <div className="p-4 rounded-2xl glass-card border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block">Leave Sessions</span>
                <span className="text-2xl font-extrabold text-amber-400">{leaveCount}</span>
              </div>
              <CalendarOff className="w-6 h-6 text-amber-400/80" />
            </div>

            <div className="p-4 rounded-2xl glass-card border-indigo-500/30 bg-indigo-950/20 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-indigo-300 block">Attendance Rate</span>
                <span className="text-2xl font-extrabold text-indigo-400">{attendancePercentage}%</span>
              </div>
              <Percent className="w-6 h-6 text-indigo-400/80" />
            </div>
          </div>
        )}

        {/* Personal Calendar View Grid */}
        <div className="glass-card rounded-3xl p-6 border-slate-800">
          <AttendanceCalendar
            employeeId={user?._id}
            month={selectedMonth}
            isSelf={true}
          />
        </div>

      </div>
    </div>
  );
};

export default MyAttendancePage;
