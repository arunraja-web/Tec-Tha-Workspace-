import React from 'react';
import TaskStatusBadge from './TaskStatusBadge';
import TaskPriorityBadge from './TaskPriorityBadge';
import TaskProgress from './TaskProgress';
import { Calendar, User, Users, Paperclip, MessageSquare, AlertTriangle, Eye, Edit3, Archive, RefreshCw } from 'lucide-react';

export const TaskCard = ({
  task,
  onViewDetails,
  onEdit,
  onArchiveToggle,
  canManage = false,
}) => {
  if (!task) return null;

  const taskId = task.id || task._id;
  const isOverdue =
    task.overdue ||
    (task.dueDate &&
      new Date(task.dueDate) < new Date() &&
      task.status !== 'completed' &&
      task.status !== 'cancelled');

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const assignedName = task.assignedTo?.name || 'Unassigned';
  const groupName = task.group?.name || null;
  const commentCount = task.commentsCount || (task.comments ? task.comments.length : 0);
  const attachmentCount = task.attachmentsCount || (task.attachments ? task.attachments.length : 0);

  return (
    <div
      className={`bg-white border transition-all duration-200 hover:shadow-md flex flex-col justify-between font-montserrat ${
        task.isArchived
          ? 'border-slate-300 opacity-75 bg-slate-50/80'
          : isOverdue
          ? 'border-rose-300 shadow-rose-100/50'
          : 'border-slate-200/90 shadow-xs'
      }`}
    >
      {/* Card Header & Content */}
      <div className="p-5">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <TaskPriorityBadge priority={task.priority} />
          <div className="flex items-center gap-2">
            {isOverdue && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 border border-rose-200">
                <AlertTriangle className="w-3 h-3" />
                <span>Overdue</span>
              </span>
            )}
            <TaskStatusBadge status={task.status} />
          </div>
        </div>

        {/* Task Title */}
        <h3
          onClick={() => onViewDetails && onViewDetails(task)}
          className="text-base font-bold text-slate-900 leading-snug hover:text-[#0562ff] cursor-pointer transition-colors line-clamp-2 mb-2"
        >
          {task.title}
        </h3>

        {/* Task Description Preview */}
        {task.description && (
          <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Group & Assignee Meta Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 border border-slate-200 text-slate-700 font-medium">
            <User className="w-3.5 h-3.5 text-[#0562ff]" />
            <span className="truncate max-w-[140px]">{assignedName}</span>
          </div>

          {groupName && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 border border-slate-200 text-slate-600 font-medium">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span className="truncate max-w-[120px]">{groupName}</span>
            </div>
          )}
        </div>

        {/* Task Progress Bar */}
        <TaskProgress progress={task.progress || 0} size="sm" showLabel={true} />
      </div>

      {/* Card Footer Bar */}
      <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-200/80 flex items-center justify-between gap-3 text-xs text-slate-500">
        {/* Due Date & Counters */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-rose-600 font-bold' : ''}`}>
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(task.dueDate)}</span>
          </div>

          {attachmentCount > 0 && (
            <div className="flex items-center gap-1 text-slate-500" title={`${attachmentCount} attachments`}>
              <Paperclip className="w-3.5 h-3.5" />
              <span>{attachmentCount}</span>
            </div>
          )}

          {commentCount > 0 && (
            <div className="flex items-center gap-1 text-slate-500" title={`${commentCount} comments`}>
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{commentCount}</span>
            </div>
          )}
        </div>

        {/* Card Action Buttons */}
        <div className="flex items-center gap-1.5">
          {canManage && onEdit && !task.isArchived && (
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 text-slate-600 hover:text-[#0562ff] hover:bg-slate-200/60 rounded-none transition-colors"
              title="Edit Task"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {canManage && onArchiveToggle && (
            <button
              onClick={() => onArchiveToggle(task)}
              className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-200/60 rounded-none transition-colors"
              title={task.isArchived ? 'Restore Task' : 'Archive Task'}
            >
              {task.isArchived ? <RefreshCw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={() => onViewDetails && onViewDetails(task)}
            className="flex items-center gap-1 bg-[#0562ff] hover:bg-blue-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-none shadow-xs transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
