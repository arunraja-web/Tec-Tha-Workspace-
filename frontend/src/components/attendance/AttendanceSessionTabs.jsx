import React from 'react';
import { Sun, Moon } from 'lucide-react';

/**
 * Morning vs Evening session tab switcher component
 * Zoho Dashboard Light Theme (rounded-none, font-montserrat)
 */
export const AttendanceSessionTabs = ({ activeSession = 'morning', onSelectSession }) => {
  return (
    <div className="inline-flex p-1 bg-white border border-slate-300 rounded-none font-montserrat shadow-2xs">
      <button
        type="button"
        onClick={() => onSelectSession('morning')}
        className={`flex items-center gap-2 px-4 py-2 rounded-none text-xs font-bold transition-all uppercase tracking-wider cursor-pointer ${
          activeSession === 'morning'
            ? 'bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        }`}
      >
        <Sun className={`w-4 h-4 ${activeSession === 'morning' ? 'text-amber-600' : 'text-slate-400'}`} />
        <span>Morning Session</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectSession('evening')}
        className={`flex items-center gap-2 px-4 py-2 rounded-none text-xs font-bold transition-all uppercase tracking-wider cursor-pointer ${
          activeSession === 'evening'
            ? 'bg-indigo-50 text-indigo-800 border border-indigo-300 shadow-2xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        }`}
      >
        <Moon className={`w-4 h-4 ${activeSession === 'evening' ? 'text-indigo-600' : 'text-slate-400'}`} />
        <span>Evening Session</span>
      </button>
    </div>
  );
};

export default AttendanceSessionTabs;
