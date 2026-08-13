import React from 'react';
import { CalendarX2 } from 'lucide-react';

/**
 * Empty state component for Attendance screens
 */
export const AttendanceEmptyState = ({
  title = 'No Attendance Records Found',
  description = 'No attendance data is available for the selected filter or date.',
  icon: IconComponent = CalendarX2,
  action,
}) => {
  return (
    <div className="glass-card rounded-3xl p-10 border-slate-800 text-center flex flex-col items-center justify-center space-y-4 my-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
        <IconComponent className="w-8 h-8 text-indigo-400/80" />
      </div>
      <div className="max-w-md space-y-1">
        <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};

export default AttendanceEmptyState;
