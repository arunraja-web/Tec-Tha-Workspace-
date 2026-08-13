import React from 'react';

export const OnlineStatusDot = ({ isOnline, className = 'w-3 h-3' }) => {
  return (
    <span
      className={`rounded-full border-2 border-white dark:border-neutral-900 inline-block transition-colors ${
        isOnline ? 'bg-emerald-500 shadow-xs' : 'bg-slate-300 dark:bg-neutral-600'
      } ${className}`}
      title={isOnline ? 'Online' : 'Offline'}
    />
  );
};

export const OnlineStatusText = ({ isOnline, lastSeen }) => {
  if (isOnline) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
        Online
      </span>
    );
  }

  if (lastSeen) {
    const date = new Date(lastSeen);
    const formatted = !isNaN(date.getTime())
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';
    return <span className="text-xs text-slate-400">Offline {formatted ? `• Last seen ${formatted}` : ''}</span>;
  }

  return <span className="text-xs text-slate-400">Offline</span>;
};

export default OnlineStatusDot;
