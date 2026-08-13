import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyAttendance } from '../../redux/slices/attendanceSlice';
import { useAuth } from '../../hooks/useAuth';
import { CalendarCheck, CheckCircle2, XCircle, CalendarOff, Percent, Calendar } from 'lucide-react';
import AttendanceCalendar from '../../components/attendance/AttendanceCalendar';
import AttendanceSkeleton from '../../components/attendance/AttendanceSkeleton';
import { getCurrentYYYYMM } from '../../utils/formatDate';

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
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 space-y-6 font-montserrat text-slate-900 selection:bg-[#0562ff] selection:text-white">
      <div className="max-w-[1500px] mx-auto space-y-6">
        
        {/* Page Top Header */}
        <div className="bg-white rounded-none p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 font-montserrat">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-none bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0562ff] shrink-0">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 uppercase tracking-wide">My Personal Attendance</h1>
                <span className="bg-blue-50 text-[#0562ff] text-xs font-bold px-3 py-1 rounded-none border border-blue-200 uppercase tracking-wider">
                  Employee Dashboard
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Track your personal attendance records, session check-ins, and monthly performance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-none border border-slate-200">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Month:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white text-xs font-bold text-slate-900 border border-slate-300 rounded-none px-3 py-1.5 outline-none focus:border-[#0562ff] focus:ring-1 focus:ring-[#0562ff] font-montserrat"
            />
          </div>
        </div>

        {/* Summary Metrics */}
        {loading ? (
          <AttendanceSkeleton count={4} type="cards" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-montserrat">
            <div className="p-4 rounded-none bg-emerald-50/60 border border-emerald-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Present Sessions</span>
                <span className="text-2xl font-extrabold text-emerald-700 font-montserrat">{presentCount}</span>
              </div>
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>

            <div className="p-4 rounded-none bg-rose-50/60 border border-rose-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">Absent Sessions</span>
                <span className="text-2xl font-extrabold text-rose-700 font-montserrat">{absentCount}</span>
              </div>
              <XCircle className="w-6 h-6 text-rose-600" />
            </div>

            <div className="p-4 rounded-none bg-amber-50/60 border border-amber-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">Leave Sessions</span>
                <span className="text-2xl font-extrabold text-amber-700 font-montserrat">{leaveCount}</span>
              </div>
              <CalendarOff className="w-6 h-6 text-amber-600" />
            </div>

            <div className="p-4 rounded-none bg-blue-50 border border-blue-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#0562ff] uppercase tracking-wider block">Attendance Rate</span>
                <span className="text-2xl font-extrabold text-[#0562ff] font-montserrat">{attendancePercentage}%</span>
              </div>
              <Percent className="w-6 h-6 text-[#0562ff]" />
            </div>
          </div>
        )}

        {/* Personal Calendar View Grid */}
        <div className="bg-white rounded-none p-6 border border-slate-200 shadow-sm font-montserrat">
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
