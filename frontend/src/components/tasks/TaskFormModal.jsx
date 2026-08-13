import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Users, AlertCircle, PlusCircle, Save } from 'lucide-react';

export const TaskFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  employees = [],
  groups = [],
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    group: '',
    priority: 'medium',
    startDate: '',
    dueDate: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        assignedTo: initialData.assignedTo?.id || initialData.assignedTo?._id || initialData.assignedTo || '',
        group: initialData.group?.id || initialData.group?._id || initialData.group || '',
        priority: initialData.priority || 'medium',
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
        dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        assignedTo: employees.length > 0 ? (employees[0].id || employees[0]._id) : '',
        group: '',
        priority: 'medium',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen, employees]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.title || formData.title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters long.';
    } else if (formData.title.trim().length > 150) {
      errs.title = 'Title cannot exceed 150 characters.';
    }

    if (formData.description && formData.description.length > 3000) {
      errs.description = 'Description cannot exceed 3000 characters.';
    }

    if (!formData.assignedTo) {
      errs.assignedTo = 'Please select an assigned employee.';
    }

    if (formData.startDate && formData.dueDate) {
      if (new Date(formData.startDate) > new Date(formData.dueDate)) {
        errs.dueDate = 'Due date cannot be before start date.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-montserrat">
      <div className="bg-white border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {initialData ? (
              <Save className="w-5 h-5 text-[#0562ff]" />
            ) : (
              <PlusCircle className="w-5 h-5 text-[#0562ff]" />
            )}
            <h2 className="text-lg font-bold text-slate-900">
              {initialData ? 'Edit Task Details' : 'Create New Task'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-grow">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Implement Authentication System"
              className={`w-full px-3 py-2 bg-white border text-sm text-slate-900 focus:outline-none rounded-none ${
                errors.title
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-slate-300 focus:border-[#0562ff]'
              }`}
            />
            {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide clear technical details and expectations for this task..."
              className={`w-full px-3 py-2 bg-white border text-sm text-slate-900 focus:outline-none rounded-none ${
                errors.description
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-slate-300 focus:border-[#0562ff]'
              }`}
            />
            {errors.description && <p className="text-xs text-rose-600 mt-1">{errors.description}</p>}
          </div>

          {/* Assignee & Group Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Assignee */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assigned Employee <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className={`w-full px-3 py-2 bg-white border text-sm text-slate-900 focus:outline-none rounded-none ${
                    errors.assignedTo
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-slate-300 focus:border-[#0562ff]'
                  }`}
                >
                  <option value="">Select Employee...</option>
                  {employees.map((emp) => (
                    <option key={emp.id || emp._id} value={emp.id || emp._id}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>
              {errors.assignedTo && <p className="text-xs text-rose-600 mt-1">{errors.assignedTo}</p>}
            </div>

            {/* Group */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Group (Optional)
              </label>
              <select
                value={formData.group}
                onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#0562ff] rounded-none"
              >
                <option value="">No Group</option>
                {groups.map((grp) => (
                  <option key={grp.id || grp._id} value={grp.id || grp._id}>
                    {grp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority & Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#0562ff] rounded-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#0562ff] rounded-none"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className={`w-full px-3 py-2 bg-white border text-sm text-slate-900 focus:outline-none rounded-none ${
                  errors.dueDate
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-slate-300 focus:border-[#0562ff]'
                }`}
              />
              {errors.dueDate && <p className="text-xs text-rose-600 mt-1">{errors.dueDate}</p>}
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 bg-[#0562ff] hover:bg-blue-700 text-white text-sm font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <span>Saving...</span>
            ) : (
              <span>{initialData ? 'Update Task' : 'Create Task'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskFormModal;
