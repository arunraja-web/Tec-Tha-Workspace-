import React from 'react';
import { CheckCircle2, XCircle, CalendarOff, Palmtree, HelpCircle } from 'lucide-react';

/**
 * Attendance Status Dropdown Select
 * Uses exact backend values: 'present', 'absent', 'leave', 'holiday'
 */
const STATUS_CONFIG = {
  present: {
    label: 'Present',
    bg: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/60',
    icon: CheckCircle2,
  },
  absent: {
    label: 'Absent',
    bg: 'bg-rose-950/60 text-rose-400 border-rose-500/30 hover:bg-rose-900/60',
    icon: XCircle,
  },
  leave: {
    label: 'Leave',
    bg: 'bg-amber-950/60 text-amber-400 border-amber-500/30 hover:bg-amber-900/60',
    icon: CalendarOff,
  },
  holiday: {
    label: 'Holiday',
    bg: 'bg-indigo-950/60 text-indigo-400 border-indigo-500/30 hover:bg-indigo-900/60',
    icon: Palmtree,
  },
  not_marked: {
    label: 'Not Marked',
    bg: 'bg-slate-900 text-slate-400 border-slate-700/50 hover:bg-slate-800',
    icon: HelpCircle,
  },
};

export const AttendanceStatusSelect = ({
  value,
  onChange,
  disabled = false,
  className = '',
}) => {
  const currentKey = value && STATUS_CONFIG[value] ? value : 'not_marked';
  const config = STATUS_CONFIG[currentKey];
  const IconComponent = config.icon;

  return (
    <div className={`relative inline-block ${className}`}>
      <div className="flex items-center gap-1.5">
        <IconComponent className={`w-4 h-4 shrink-0 ${config.bg.split(' ')[1]}`} />
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`appearance-none bg-slate-900 text-xs font-semibold px-3 py-1.5 pr-7 rounded-xl border transition-all outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${config.bg}`}
        >
          <option value="" disabled className="bg-slate-900 text-slate-400">
            -- Select Status --
          </option>
          <option value="present" className="bg-slate-900 text-emerald-400 font-medium">
            Present
          </option>
          <option value="absent" className="bg-slate-900 text-rose-400 font-medium">
            Absent
          </option>
          <option value="leave" className="bg-slate-900 text-amber-400 font-medium">
            Leave
          </option>
          <option value="holiday" className="bg-slate-900 text-indigo-400 font-medium">
            Holiday
          </option>
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
          ▼
        </span>
      </div>
    </div>
  );
};

export default AttendanceStatusSelect;
