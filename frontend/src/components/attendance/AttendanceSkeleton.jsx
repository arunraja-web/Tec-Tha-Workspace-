import React from 'react';

/**
 * Skeleton loading state component for Attendance Module
 */
export const AttendanceSkeleton = ({ count = 5, type = 'table' }) => {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-slate-900/80 rounded-2xl border border-slate-800 p-4" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 animate-pulse">
      <div className="h-10 bg-slate-900/80 rounded-xl border border-slate-800 w-full" />
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-14 bg-slate-900/60 rounded-2xl border border-slate-800/80 w-full flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800" />
            <div className="space-y-1">
              <div className="w-32 h-3.5 bg-slate-800 rounded" />
              <div className="w-20 h-2.5 bg-slate-800/60 rounded" />
            </div>
          </div>
          <div className="w-24 h-8 bg-slate-800 rounded-xl" />
        </div>
      ))}
    </div>
  );
};

export default AttendanceSkeleton;
