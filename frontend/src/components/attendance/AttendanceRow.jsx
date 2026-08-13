import React from 'react';
import { User } from 'lucide-react';
import AttendanceStatusSelect from './AttendanceStatusSelect';

/**
 * Individual Employee Attendance Row in Admin Daily Table
 */
export const AttendanceRow = ({
  employeeData,
  activeSession = 'morning',
  onStatusChange,
  disabled = false,
}) => {
  const { employee, morning, evening } = employeeData;
  const currentSessionData = activeSession === 'morning' ? morning : evening;
  const currentStatus = currentSessionData ? currentSessionData.status : '';

  const otherSession = activeSession === 'morning' ? 'evening' : 'morning';
  const otherSessionData = activeSession === 'morning' ? evening : morning;
  const otherStatus = otherSessionData ? otherSessionData.status : 'Not Marked';

  return (
    <tr className="border-b border-slate-800/60 hover:bg-slate-900/50 transition-colors group">
      {/* Employee Details */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-300 font-bold text-xs group-hover:border-indigo-500/40 group-hover:bg-indigo-950/30 transition-all">
            {employee.name ? employee.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
              {employee.name || 'Unknown Employee'}
            </div>
            <div className="text-[11px] text-slate-400">{employee.email}</div>
          </div>
        </div>
      </td>

      {/* Department */}
      <td className="py-3.5 px-4 hidden md:table-cell">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-900 text-slate-300 border border-slate-800">
          {employee.department || 'General'}
        </span>
      </td>

      {/* Other Session Status Summary (Read Only Context) */}
      <td className="py-3.5 px-4 text-xs capitalize text-slate-400 hidden sm:table-cell">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
          {otherSession}
        </span>
        <span className={`font-semibold ${otherStatus === 'present' ? 'text-emerald-400' : otherStatus === 'absent' ? 'text-rose-400' : 'text-slate-400'}`}>
          {otherStatus}
        </span>
      </td>

      {/* Active Session Status Select Control */}
      <td className="py-3.5 px-4 text-right">
        <AttendanceStatusSelect
          value={currentStatus}
          onChange={(newStatus) => onStatusChange(employee._id, newStatus)}
          disabled={disabled}
        />
      </td>
    </tr>
  );
};

export default AttendanceRow;
