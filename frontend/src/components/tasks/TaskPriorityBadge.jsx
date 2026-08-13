import React from 'react';

const PRIORITY_CONFIG = {
  low: {
    label: 'Low',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
  },
  medium: {
    label: 'Medium',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  high: {
    label: 'High',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  urgent: {
    label: 'Urgent',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    dot: 'bg-rose-600 animate-pulse',
  },
};

export const TaskPriorityBadge = ({ priority = 'medium', className = '' }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-none border border-slate-200/80 ${config.bg} ${config.text} font-montserrat ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span className="capitalize">{config.label}</span>
    </span>
  );
};

export default TaskPriorityBadge;
