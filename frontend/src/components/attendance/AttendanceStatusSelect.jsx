import React from 'react';
import { CheckCircle2, XCircle, CalendarOff, Clock, HelpCircle } from 'lucide-react';

/**
 * Attendance Status Dropdown Select Component
 * Light Enterprise Dashboard Theme (rounded-none, font-montserrat, clean Lucide icons)
 */
const STATUS_CONFIG = {
  present: {
    label: 'Present',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
  },
  absent: {
    label: 'Absent',
    bg: 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100',
    icon: XCircle,
    iconColor: 'text-rose-600',
  },
  leave: {
    label: 'Leave',
    bg: 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100',
    icon: CalendarOff,
    iconColor: 'text-amber-600',
  },
  holiday: {
    label: 'Holiday',
    bg: 'bg-blue-50 text-[#0562ff] border-blue-300 hover:bg-blue-100',
    icon: Clock,
    iconColor: 'text-[#0562ff]',
  },
  not_marked: {
    label: 'Not Marked',
    bg: 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100',
    icon: HelpCircle,
    iconColor: 'text-slate-500',
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
    <div className={`relative inline-block font-montserrat ${className}`}>
      <div className="flex items-center gap-1.5 justify-end">
        <IconComponent className={`w-4 h-4 shrink-0 ${config.iconColor}`} />
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`bg-white text-xs font-bold px-3 py-1.5 rounded-none border shadow-2xs transition-all outline-none focus:border-[#0562ff] focus:ring-1 focus:ring-[#0562ff] cursor-pointer disabled:opacity-50 font-montserrat ${config.bg}`}
        >
          <option value="" disabled className="bg-white text-slate-400">
            -- Select Status --
          </option>
          <option value="present" className="bg-white text-emerald-700 font-bold">
            Present
          </option>
          <option value="absent" className="bg-white text-rose-700 font-bold">
            Absent
          </option>
          <option value="leave" className="bg-white text-amber-700 font-bold">
            Leave
          </option>
          <option value="holiday" className="bg-white text-[#0562ff] font-bold">
            Holiday
          </option>
        </select>
      </div>
    </div>
  );
};

export default AttendanceStatusSelect;
