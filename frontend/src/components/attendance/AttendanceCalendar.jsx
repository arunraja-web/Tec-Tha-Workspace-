import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployeeCalendar } from '../../redux/slices/attendanceSlice';
import { formatFriendlyMonth } from '../../utils/formatDate';
import { Sun, Moon, CheckCircle2, XCircle, CalendarOff, Palmtree, HelpCircle } from 'lucide-react';

/**
 * Monthly Attendance Calendar Grid Component
 */
export const AttendanceCalendar = ({ employeeId, month, isSelf = false }) => {
  const dispatch = useDispatch();
  const { selectedEmployeeCalendar } = useSelector((state) => state.attendance);

  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    if (employeeId && month) {
      dispatch(fetchEmployeeCalendar({ employeeId, month }));
    }
  }, [dispatch, employeeId, month]);

  const calendarData = selectedEmployeeCalendar.calendar || [];

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40';
      case 'absent':
        return 'bg-rose-950/80 text-rose-400 border-rose-500/40';
      case 'leave':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/40';
      case 'holiday':
        return 'bg-indigo-950/80 text-indigo-400 border-indigo-500/40';
      default:
        return 'bg-slate-900 text-slate-500 border-slate-800';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'present':
        return <span className="text-emerald-400 font-bold">P</span>;
      case 'absent':
        return <span className="text-rose-400 font-bold">A</span>;
      case 'leave':
        return <span className="text-amber-400 font-bold">L</span>;
      case 'holiday':
        return <span className="text-indigo-400 font-bold">H</span>;
      default:
        return <span className="text-slate-600 font-normal">-</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-300">
          Monthly Attendance Grid — {formatFriendlyMonth(month)}
        </h4>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Present (P)</span>
          <span className="flex items-center gap-1 text-rose-400 font-semibold"><span className="w-2 h-2 rounded-full bg-rose-400" /> Absent (A)</span>
          <span className="flex items-center gap-1 text-amber-400 font-semibold"><span className="w-2 h-2 rounded-full bg-amber-400" /> Leave (L)</span>
        </div>
      </div>

      {/* Calendar Grid Header */}
      <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-900/80 py-2 rounded-xl border border-slate-800">
        <div>Day</div>
        <div>Date</div>
        <div className="flex items-center justify-center gap-1"><Sun className="w-3 h-3 text-amber-400" /> Morning</div>
        <div className="flex items-center justify-center gap-1"><Moon className="w-3 h-3 text-indigo-400" /> Evening</div>
        <div className="col-span-3">Details</div>
      </div>

      {/* Days List */}
      <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
        {calendarData.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">No attendance data for this month.</div>
        ) : (
          calendarData.map((dayItem) => {
            const dayNum = dayItem.date ? dayItem.date.split('-')[2] : '';
            return (
              <div
                key={dayItem.date}
                onClick={() => setSelectedDay(dayItem)}
                className="grid grid-cols-7 gap-2 items-center text-center p-2 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:bg-slate-800/60 transition-all cursor-pointer text-xs"
              >
                <div className="text-slate-400 font-semibold">{dayNum}</div>
                <div className="text-slate-300 font-medium text-[11px]">{dayItem.date}</div>
                
                {/* Morning Status */}
                <div className="flex justify-center">
                  <span className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs ${getStatusColor(dayItem.morning)}`}>
                    {getStatusBadge(dayItem.morning)}
                  </span>
                </div>

                {/* Evening Status */}
                <div className="flex justify-center">
                  <span className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs ${getStatusColor(dayItem.evening)}`}>
                    {getStatusBadge(dayItem.evening)}
                  </span>
                </div>

                {/* Detail Summary */}
                <div className="col-span-3 text-left text-[11px] text-slate-400 pl-2">
                  Morning: <span className="text-white capitalize">{dayItem.morning || 'Not Marked'}</span> | Evening: <span className="text-white capitalize">{dayItem.evening || 'Not Marked'}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Day Inspector */}
      {selectedDay && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-2">
          <div className="text-xs font-bold text-indigo-300">
            Inspection for Date: {selectedDay.date}
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Morning Session</span>
              <span className="font-bold text-white capitalize">{selectedDay.morning || 'Not Marked'}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Evening Session</span>
              <span className="font-bold text-white capitalize">{selectedDay.evening || 'Not Marked'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceCalendar;
