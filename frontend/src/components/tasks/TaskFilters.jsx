import React from 'react';
import { Filter, RotateCcw, LayoutGrid, List } from 'lucide-react';

export const TaskFilters = ({
  filters = {},
  onFilterChange,
  onResetFilters,
  employees = [],
  groups = [],
  showAdminFilters = true,
  viewMode = 'grid',
  onViewModeChange,
}) => {
  const handleChange = (field, value) => {
    if (onFilterChange) {
      onFilterChange({ [field]: value });
    }
  };

  return (
    <div className="bg-white border border-slate-200 p-4 shadow-xs mb-6 font-montserrat space-y-3">
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-[#0562ff]" />
          <span>Filters & Controls</span>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle Button */}
          {onViewModeChange && (
            <div className="flex items-center border border-slate-200 bg-slate-50">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-1.5 transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-[#0562ff] text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('table')}
                className={`p-1.5 transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-[#0562ff] text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Reset Filters */}
          {onResetFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#0562ff] font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Selectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
        {/* Status Dropdown */}
        <div>
          <label className="block text-slate-600 font-semibold mb-1">Status</label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-[#0562ff] rounded-none"
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Priority Dropdown */}
        <div>
          <label className="block text-slate-600 font-semibold mb-1">Priority</label>
          <select
            value={filters.priority || ''}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-[#0562ff] rounded-none"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Employee Dropdown (Admin/Founder only) */}
        {showAdminFilters && (
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Assigned Employee</label>
            <select
              value={filters.assignedTo || ''}
              onChange={(e) => handleChange('assignedTo', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-[#0562ff] rounded-none"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id || emp._id} value={emp.id || emp._id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Group Dropdown */}
        <div>
          <label className="block text-slate-600 font-semibold mb-1">Group</label>
          <select
            value={filters.group || ''}
            onChange={(e) => handleChange('group', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-[#0562ff] rounded-none"
          >
            <option value="">All Groups</option>
            {groups.map((grp) => (
              <option key={grp.id || grp._id} value={grp.id || grp._id}>
                {grp.name}
              </option>
            ))}
          </select>
        </div>

        {/* Overdue Checkbox */}
        <div className="flex items-end pb-1.5">
          <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              checked={Boolean(filters.overdue)}
              onChange={(e) => handleChange('overdue', e.target.checked)}
              className="w-4 h-4 text-[#0562ff] accent-[#0562ff] rounded-none"
            />
            <span>Overdue Only</span>
          </label>
        </div>

        {/* Archived Checkbox (Admin/Founder only) */}
        {showAdminFilters && (
          <div className="flex items-end pb-1.5">
            <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={Boolean(filters.isArchived)}
                onChange={(e) => handleChange('isArchived', e.target.checked)}
                className="w-4 h-4 text-[#0562ff] accent-[#0562ff] rounded-none"
              />
              <span>Archived Tasks</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskFilters;
