import React from 'react';
import { Calendar, Plus } from 'lucide-react';

/**
 * MeetingEmptyState Component - Light Enterprise Theme (rounded-none, font-montserrat)
 */
export const MeetingEmptyState = ({ onCreateClick }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-none p-10 md:p-14 text-center flex flex-col items-center justify-center space-y-4 my-4 font-montserrat shadow-sm">
      <div className="w-16 h-16 rounded-none bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0562ff]">
        <Calendar className="w-8 h-8" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h3 className="text-xl font-bold text-slate-900 tracking-wide font-montserrat uppercase">
          No Meetings Found
        </h3>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          There are currently no active team meetings. Create a new meeting link to share with your team.
        </p>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onCreateClick}
          className="px-6 py-3 rounded-none bg-[#0562ff] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer font-montserrat uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          <span>Create Meeting</span>
        </button>
      </div>
    </div>
  );
};

export default MeetingEmptyState;
