import React from 'react';

export const TaskSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white border border-slate-200 p-5 shadow-xs animate-pulse flex flex-col justify-between h-56"
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-5 bg-slate-200 rounded w-1/3" />
              <div className="h-5 bg-slate-200 rounded w-1/4" />
            </div>
            <div className="h-6 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-2/3" />
          </div>
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <div className="h-2 bg-slate-200 rounded w-full" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-6 bg-slate-200 rounded w-24" />
              <div className="h-8 bg-slate-200 rounded w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskSkeleton;
