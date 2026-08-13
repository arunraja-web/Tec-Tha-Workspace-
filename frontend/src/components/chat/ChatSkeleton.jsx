import React from 'react';

export const ConversationListSkeleton = () => (
  <div className="space-y-3 p-3 animate-pulse">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200/50 dark:border-neutral-800">
        <div className="w-11 h-11 rounded-full bg-slate-300 dark:bg-neutral-800 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-300 dark:bg-neutral-800 rounded w-1/2" />
          <div className="h-3 bg-slate-200 dark:bg-neutral-800/60 rounded w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

export const MessageListSkeleton = () => (
  <div className="space-y-4 p-4 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-neutral-800 shrink-0" />
      <div className="space-y-2 max-w-[60%]">
        <div className="h-3 bg-slate-300 dark:bg-neutral-800 rounded w-24" />
        <div className="h-12 bg-slate-200 dark:bg-neutral-800 rounded-2xl p-3 w-64" />
      </div>
    </div>
    <div className="flex items-start justify-end gap-3">
      <div className="space-y-2 max-w-[60%] flex flex-col items-end">
        <div className="h-3 bg-slate-300 dark:bg-neutral-800 rounded w-20" />
        <div className="h-10 bg-indigo-200 dark:bg-indigo-950 rounded-2xl p-3 w-48" />
      </div>
    </div>
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-neutral-800 shrink-0" />
      <div className="space-y-2 max-w-[60%]">
        <div className="h-3 bg-slate-300 dark:bg-neutral-800 rounded w-28" />
        <div className="h-16 bg-slate-200 dark:bg-neutral-800 rounded-2xl p-3 w-72" />
      </div>
    </div>
  </div>
);

export default { ConversationListSkeleton, MessageListSkeleton };
