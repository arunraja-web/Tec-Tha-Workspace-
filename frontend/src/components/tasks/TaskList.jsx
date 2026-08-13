import React from 'react';
import TaskCard from './TaskCard';
import TaskStatusBadge from './TaskStatusBadge';
import TaskPriorityBadge from './TaskPriorityBadge';
import TaskProgress from './TaskProgress';
import { Eye, Edit3, Archive, Calendar, User, Users } from 'lucide-react';

export const TaskList = ({
  tasks = [],
  viewMode = 'grid',
  onViewDetails,
  onEdit,
  onArchiveToggle,
  canManage = false,
}) => {
  if (!tasks || tasks.length === 0) return null;

  if (viewMode === 'table') {
    return (
      <div className="bg-white border border-slate-200 shadow-xs overflow-x-auto font-montserrat">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <th className="py-3 px-4">Task</th>
              <th className="py-3 px-4">Assigned To</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 w-40">Progress</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {tasks.map((task) => {
              const taskId = task.id || task._id;
              const isOverdue =
                task.overdue ||
                (task.dueDate &&
                  new Date(task.dueDate) < new Date() &&
                  task.status !== 'completed' &&
                  task.status !== 'cancelled');

              return (
                <tr
                  key={taskId}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    task.isArchived ? 'opacity-70 bg-slate-50/50' : ''
                  }`}
                >
                  {/* Task Title & Group */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div
                      onClick={() => onViewDetails && onViewDetails(task)}
                      className="hover:text-[#0562ff] cursor-pointer transition-colors line-clamp-1 max-w-md"
                    >
                      {task.title}
                    </div>
                    {task.group?.name && (
                      <span className="text-xs text-slate-500 font-normal">
                        Group: {task.group.name}
                      </span>
                    )}
                  </td>

                  {/* Assignee */}
                  <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#0562ff]" />
                      <span>{task.assignedTo?.name || 'Unassigned'}</span>
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4">
                    <TaskPriorityBadge priority={task.priority} />
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <TaskStatusBadge status={task.status} />
                  </td>

                  {/* Progress */}
                  <td className="py-3.5 px-4">
                    <TaskProgress progress={task.progress || 0} size="sm" showLabel={true} />
                  </td>

                  {/* Due Date */}
                  <td className="py-3.5 px-4 text-xs font-medium">
                    <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'No due date'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {canManage && onEdit && !task.isArchived && (
                        <button
                          onClick={() => onEdit(task)}
                          className="p-1 text-slate-600 hover:text-[#0562ff] p-1.5 hover:bg-slate-100 transition-colors"
                          title="Edit Task"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      {canManage && onArchiveToggle && (
                        <button
                          onClick={() => onArchiveToggle(task)}
                          className="p-1 text-slate-600 hover:text-amber-600 p-1.5 hover:bg-slate-100 transition-colors"
                          title={task.isArchived ? 'Restore' : 'Archive'}
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onViewDetails && onViewDetails(task)}
                        className="bg-[#0562ff] hover:bg-blue-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-none shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {tasks.map((task) => (
        <TaskCard
          key={task.id || task._id}
          task={task}
          onViewDetails={onViewDetails}
          onEdit={onEdit}
          onArchiveToggle={onArchiveToggle}
          canManage={canManage}
        />
      ))}
    </div>
  );
};

export default TaskList;
