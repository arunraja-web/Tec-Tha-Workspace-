import React, { useState } from 'react';
import { ListTodo, Plus, CheckSquare, Square, Trash2, Calendar, User } from 'lucide-react';

export const TaskSubtasks = ({
  subtasks = [],
  onCreateSubtask,
  onUpdateSubtaskStatus,
  onDeleteSubtask,
  employees = [],
  canManage = false,
  loading = false,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (onCreateSubtask) {
      onCreateSubtask({
        title: title.trim(),
        assignedTo: assignedTo || undefined,
        dueDate: dueDate || undefined,
      });
      setTitle('');
      setAssignedTo('');
      setDueDate('');
      setShowAddForm(false);
    }
  };

  const handleToggleStatus = (subtask) => {
    const subtaskId = subtask.id || subtask._id;
    const newStatus = subtask.status === 'completed' ? 'todo' : 'completed';
    const newProgress = newStatus === 'completed' ? 100 : 0;
    if (onUpdateSubtaskStatus) {
      onUpdateSubtaskStatus(subtaskId, { status: newStatus, progress: newProgress });
    }
  };

  const completedCount = subtasks.filter((s) => s.status === 'completed').length;
  const completionRate = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  return (
    <div className="space-y-5 font-montserrat">
      {/* Subtasks Header & Progress */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <ListTodo className="w-4 h-4 text-[#0562ff]" />
            <span>Subtasks ({completedCount}/{subtasks.length})</span>
          </div>
          {subtasks.length > 0 && (
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Completion Rate: {completionRate}%
            </p>
          )}
        </div>

        {canManage && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 bg-[#0562ff] hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-none shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Cancel' : 'Add Subtask'}</span>
          </button>
        )}
      </div>

      {/* Add Subtask Form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="bg-slate-50 border border-slate-200 p-4 space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Subtask Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter subtask title..."
              className="w-full px-3 py-1.5 bg-white border border-slate-300 text-sm focus:outline-none focus:border-[#0562ff]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assigned Employee
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 text-xs focus:outline-none focus:border-[#0562ff]"
              >
                <option value="">Unassigned</option>
                {employees.map((emp) => (
                  <option key={emp.id || emp._id} value={emp.id || emp._id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 text-xs focus:outline-none focus:border-[#0562ff]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 text-xs border border-slate-300 text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-4 py-1 text-xs bg-[#0562ff] text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              Save Subtask
            </button>
          </div>
        </form>
      )}

      {/* Subtasks List */}
      {subtasks.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm italic border border-dashed border-slate-200">
          No subtasks defined for this task.
        </div>
      ) : (
        <div className="space-y-2">
          {subtasks.map((sub) => {
            const subtaskId = sub.id || sub._id;
            const isDone = sub.status === 'completed';

            return (
              <div
                key={subtaskId}
                className={`flex items-center justify-between gap-3 p-3 border transition-colors ${
                  isDone ? 'bg-slate-50/70 border-slate-200 opacity-80' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => handleToggleStatus(sub)}
                    className="text-[#0562ff] hover:scale-105 transition-transform cursor-pointer"
                  >
                    {isDone ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <span
                      className={`text-sm font-semibold block truncate ${
                        isDone ? 'line-through text-slate-500' : 'text-slate-900'
                      }`}
                    >
                      {sub.title}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      {sub.assignedTo?.name && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-[#0562ff]" />
                          <span>{sub.assignedTo.name}</span>
                        </span>
                      )}
                      {sub.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(sub.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {canManage && (
                  <button
                    onClick={() => onDeleteSubtask && onDeleteSubtask(subtaskId)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete Subtask"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskSubtasks;
