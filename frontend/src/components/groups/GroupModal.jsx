import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit2, X, AlertCircle } from 'lucide-react';

export const GroupModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  submitting = false,
  errorMessage = null,
}) => {
  const isEditMode = Boolean(initialData);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    const cleanName = formData.name.trim();
    const cleanDesc = formData.description.trim();

    if (!cleanName) {
      errs.name = 'Group name is required.';
    } else if (cleanName.length < 3) {
      errs.name = 'Group name must contain at least 3 characters.';
    } else if (cleanName.length > 100) {
      errs.name = 'Group name cannot exceed 100 characters.';
    }

    if (cleanDesc.length > 500) {
      errs.description = 'Description cannot exceed 500 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200 font-montserrat">
      <div className="bg-white border border-slate-200 rounded-none max-w-md w-full p-6 space-y-5 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold font-montserrat text-slate-900 flex items-center gap-2.5">
            {isEditMode ? (
              <>
                <Edit2 className="w-5 h-5 text-[#0562ff]" /> Edit Group
              </>
            ) : (
              <>
                <PlusCircle className="w-5 h-5 text-[#0562ff]" /> Create New Group
              </>
            )}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-sm font-montserrat">
          {/* Group Name */}
          <div>
            <label className="block text-slate-800 font-semibold mb-1.5 text-xs">
              Group Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Development Team"
              className={`w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 text-sm rounded-none border ${
                errors.name ? 'border-rose-400 focus:border-rose-500' : 'border-slate-300 focus:border-[#0562ff]'
              } focus:ring-1 focus:ring-[#0562ff] focus:outline-none transition-all font-medium font-montserrat`}
            />
            {errors.name && (
              <p className="text-rose-600 text-xs font-semibold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Group Description */}
          <div>
            <label className="block text-slate-800 font-semibold mb-1.5 text-xs">
              Description (Optional)
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a short overview of this group..."
              className={`w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 text-sm rounded-none border ${
                errors.description ? 'border-rose-400 focus:border-rose-500' : 'border-slate-300 focus:border-[#0562ff]'
              } focus:ring-1 focus:ring-[#0562ff] focus:outline-none transition-all font-medium font-montserrat resize-none`}
            />
            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
              {errors.description ? (
                <p className="text-rose-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.description}
                </p>
              ) : (
                <span />
              )}
              <span>{formData.description.length}/500</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-[#0562ff] hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-70 flex items-center gap-2"
            >
              {submitting ? (
                <span>{isEditMode ? 'Saving...' : 'Creating...'}</span>
              ) : (
                <span>{isEditMode ? 'Save Changes' : 'Create Group'}</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default GroupModal;
