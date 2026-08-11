import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import { Link2, Type, AlignLeft, AlertCircle, Loader2 } from 'lucide-react';

export const MeetingForm = ({ initialValues, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meetingLink: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setFormData({
        title: initialValues.title || '',
        description: initialValues.description || '',
        meetingLink: initialValues.meetingLink || '',
      });
    }
  }, [initialValues]);

  const validate = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Meeting title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    } else if (formData.title.trim().length > 150) {
      newErrors.title = 'Title cannot exceed 150 characters';
    }

    // Description validation
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }

    // Meeting Link validation
    if (!formData.meetingLink.trim()) {
      newErrors.meetingLink = 'Meeting link is required';
    } else {
      const urlPattern = /^https?:\/\/.+/i;
      if (!urlPattern.test(formData.meetingLink.trim())) {
        newErrors.meetingLink = 'Please enter a valid HTTP or HTTPS meeting URL (e.g. https://meet.google.com/abc-defg-hij)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    if (validate()) {
      onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim(),
        meetingLink: formData.meetingLink.trim(),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title Field */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-200 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-indigo-400" />
          <span>Meeting Title <span className="text-rose-400">*</span></span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Weekly Engineering Sync"
          className={`w-full px-4 py-2.5 rounded-xl bg-slate-900 border text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
            errors.title
              ? 'border-rose-500/80 focus:ring-rose-500/40'
              : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/30'
          }`}
          disabled={loading}
        />
        {errors.title && (
          <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.title}</span>
          </p>
        )}
      </div>

      {/* Description Field */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-200 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-indigo-400" />
            <span>Description</span>
            <span className="text-slate-500 text-[11px] font-normal">(Optional)</span>
          </span>
          <span className="text-[11px] text-slate-500">
            {formData.description.length}/1000
          </span>
        </label>
        <textarea
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          placeholder="Brief summary of meeting objectives..."
          className={`w-full px-4 py-2.5 rounded-xl bg-slate-900 border text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
            errors.description
              ? 'border-rose-500/80 focus:ring-rose-500/40'
              : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/30'
          }`}
          disabled={loading}
        />
        {errors.description && (
          <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.description}</span>
          </p>
        )}
      </div>

      {/* Meeting Link Field */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-200 flex items-center gap-1.5">
          <Link2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Meeting Link <span className="text-rose-400">*</span></span>
        </label>
        <input
          type="url"
          name="meetingLink"
          value={formData.meetingLink}
          onChange={handleChange}
          placeholder="https://meet.google.com/abc-defg-hij"
          className={`w-full px-4 py-2.5 rounded-xl bg-slate-900 border text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
            errors.meetingLink
              ? 'border-rose-500/80 focus:ring-rose-500/40'
              : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/30'
          }`}
          disabled={loading}
        />
        {errors.meetingLink && (
          <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.meetingLink}</span>
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          size="sm"
          disabled={loading}
          className="border-slate-700 hover:bg-slate-800 text-slate-300"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 text-white dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-500 font-bold"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </span>
          ) : initialValues ? (
            'Save Changes'
          ) : (
            'Create Meeting'
          )}
        </Button>
      </div>
    </form>
  );
};

export default MeetingForm;
