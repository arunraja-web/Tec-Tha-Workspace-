import React from 'react';

export const MeetingSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="glass-card rounded-2xl p-6 border-slate-800 space-y-4 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="h-5 bg-slate-800 rounded-md w-3/4" />
            <div className="h-4 bg-slate-800 rounded-full w-16" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-800/80 rounded w-full" />
            <div className="h-3 bg-slate-800/80 rounded w-5/6" />
          </div>
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3 bg-slate-800 rounded w-1/3" />
              <div className="h-3 bg-slate-800 rounded w-1/3" />
            </div>
            <div className="flex justify-between items-center gap-2 pt-2">
              <div className="h-8 bg-slate-800 rounded-xl w-28" />
              <div className="flex gap-2">
                <div className="h-8 bg-slate-800 rounded-xl w-14" />
                <div className="h-8 bg-slate-800 rounded-xl w-20" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MeetingSkeleton;
