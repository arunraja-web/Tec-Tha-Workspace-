import React from 'react';
import { History, User, Clock, CheckCircle2 } from 'lucide-react';

export const TaskHistory = ({ history = [] }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4 font-montserrat">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-3">
        <History className="w-4 h-4 text-[#0562ff]" />
        <span>Task Audit History ({history.length})</span>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm italic border border-dashed border-slate-200">
          No audit history records found for this task.
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
          {history.map((item, idx) => {
            const historyId = item.id || item._id || idx;
            const performerName = item.performedBy?.name || item.user?.name || 'System';

            return (
              <div key={historyId} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[31px] top-0.5 w-4 h-4 bg-white border-2 border-[#0562ff] rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-[#0562ff] rounded-full" />
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3.5 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 capitalize">
                      {item.action ? item.action.replace(/_/g, ' ') : item.type || 'Activity'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {formatDate(item.createdAt || item.timestamp)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium">
                    {item.description || item.details || item.message}
                  </p>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 mt-2">
                    <User className="w-3 h-3 text-[#0562ff]" />
                    <span>Performed by: <strong className="text-slate-700">{performerName}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskHistory;
