import React from 'react';
import AttendanceStatusSelect from './AttendanceStatusSelect';

// Helper for 2-letter user initials
const getUserInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Individual Employee Attendance Row in Admin Daily Table
 * Includes Serial Number (S.NO) and User Initials Badge (rounded-none)
 */
export const AttendanceRow = ({
  index = 0,
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

  const initials = getUserInitials(employee.name);
  const serialNumber = index + 1;

  return (
    <tr className="hover:bg-slate-50/80 transition-colors font-montserrat">
      {/* Serial Number S.NO */}
      <td className="py-3.5 px-3 text-center font-bold text-slate-600 text-xs sm:text-sm font-mono">
        {serialNumber}
      </td>

      {/* User Letters / Initials Badge */}
      <td className="py-3.5 px-3 text-center">
        <div className="w-9 h-9 rounded-none bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-[#0562ff] uppercase text-xs font-montserrat shadow-2xs mx-auto">
          {initials}
        </div>
      </td>

      {/* Employee Name & Email */}
      <td className="py-3.5 px-4">
        <div className="font-bold text-slate-900 text-sm font-montserrat leading-tight">
          {employee.name || 'Unknown Employee'}
        </div>
        <div className="text-xs text-slate-500 font-mono">{employee.email}</div>
      </td>

      {/* Department */}
      <td className="py-3.5 px-4 hidden md:table-cell">
        <span className="inline-flex items-center px-2.5 py-1 rounded-none text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider font-montserrat">
          {employee.department || 'General'}
        </span>
      </td>

      {/* Other Session Status Summary */}
      <td className="py-3.5 px-4 text-xs capitalize text-slate-600 hidden sm:table-cell font-montserrat">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
          {otherSession}
        </span>
        <span className={`font-bold ${otherStatus === 'present' ? 'text-emerald-700' : otherStatus === 'absent' ? 'text-rose-700' : 'text-slate-600'}`}>
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
