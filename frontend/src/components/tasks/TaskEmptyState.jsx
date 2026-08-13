import React from 'react';
import { ListTodo, Plus } from 'lucide-react';

export const TaskEmptyState = ({
  title = 'No tasks found',
  message = 'There are currently no tasks matching your search or filter criteria.',
  onCreateTask,
  canCreate = false,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 p-12 text-center shadow-xs my-6 font-montserrat">
      <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-none flex items-center justify-center mx-auto mb-4 border border-slate-200">
        <ListTodo className="w-8 h-8 text-[#0562ff]" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">{message}</p>
      {canCreate && onCreateTask && (
        <button
          onClick={onCreateTask}
          className="inline-flex items-center gap-2 bg-[#0562ff] hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-none transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Task</span>
        </button>
      )}
    </div>
  );
};

export default TaskEmptyState;
