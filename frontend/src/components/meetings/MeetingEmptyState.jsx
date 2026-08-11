import React from 'react';
import { Calendar, Plus } from 'lucide-react';
import Button from '../common/Button';

export const MeetingEmptyState = ({ onCreateClick }) => {
  return (
    <div className="glass-card rounded-3xl p-10 md:p-14 border-slate-800 text-center flex flex-col items-center justify-center space-y-4 my-4">
      <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
        <Calendar className="w-8 h-8" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h3 className="text-xl font-bold text-white tracking-tight">
          No meetings yet
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          There are currently no active team meetings. Create a new meeting link to share with your team.
        </p>
      </div>

      <div className="pt-2">
        <Button
          onClick={onCreateClick}
          variant="primary"
          size="md"
          icon={Plus}
          className="bg-indigo-600 hover:bg-indigo-500 text-white dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-500 font-bold px-5"
        >
          Create Meeting
        </Button>
      </div>
    </div>
  );
};

export default MeetingEmptyState;
