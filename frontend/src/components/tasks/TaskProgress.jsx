import React from 'react';

export const TaskProgress = ({ progress = 0, size = 'md', showLabel = true, className = '' }) => {
  const percentage = Math.min(100, Math.max(0, Number(progress) || 0));

  const getBarColor = (val) => {
    if (val >= 100) return 'bg-emerald-500';
    if (val >= 70) return 'bg-[#0562ff]';
    if (val >= 35) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className={`w-full font-montserrat ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1">
          <span>Progress</span>
          <span className="text-slate-900">{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-200/90 rounded-none overflow-hidden ${heightClass}`}>
        <div
          className={`h-full transition-all duration-500 ease-out ${getBarColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default TaskProgress;
