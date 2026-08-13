import React from 'react';
import { Sun, Moon } from 'lucide-react';

/**
 * Morning vs Evening session tab switcher component
 */
export const AttendanceSessionTabs = ({ activeSession = 'morning', onSelectSession }) => {
  return (
    <div className="inline-flex p-1 bg-slate-900/90 border border-slate-800 rounded-2xl">
      <button
        type="button"
        onClick={() => onSelectSession('morning')}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
          activeSession === 'morning'
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-950/40'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
        }`}
      >
        <Sun className={`w-4 h-4 ${activeSession === 'morning' ? 'text-amber-400' : 'text-slate-400'}`} />
        <span>Morning Session</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectSession('evening')}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
          activeSession === 'evening'
            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-lg shadow-indigo-950/40'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
        }`}
      >
        <Moon className={`w-4 h-4 ${activeSession === 'evening' ? 'text-indigo-400' : 'text-slate-400'}`} />
        <span>Evening Session</span>
      </button>
    </div>
  );
};

export default AttendanceSessionTabs;
