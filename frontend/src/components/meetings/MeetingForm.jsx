import React, { useState, useEffect } from 'react';
import { Link2, Type, AlignLeft, AlertCircle, Loader2 } from 'lucide-react';

/**
 * MeetingForm Component - Light Enterprise Theme (rounded-none, font-montserrat)
 */
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
    <form onSubmit={handleSubmit} className="space-y-4 font-montserrat">
      {/* Title Field */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
          <Type className="w-4 h-4 text-[#0562ff]" />
          <span>Meeting Title <span className="text-rose-500">*</span></span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Weekly Engineering Sync"
          className={`w-full px-4 py-2.5 rounded-none bg-slate-50 border text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all font-medium font-montserrat ${
            errors.title
              ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
              : 'border-slate-300 focus:border-[#0562ff] focus:ring-1 focus:ring-[#0562ff]'
          }`}
          disabled={loading}
        />
        {errors.title && (
          <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.title}</span>
          </p>
        )}
      </div>

      {/* Description Field */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-800 flex items-center justify-between uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <AlignLeft className="w-4 h-4 text-[#0562ff]" />
            <span>Description</span>
            <span className="text-slate-400 text-xs font-medium lowercase">(optional)</span>
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {formData.description.length}/1000
          </span>
        </label>
        <textarea
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          placeholder="Brief summary of meeting objectives..."
          className={`w-full px-4 py-2.5 rounded-none bg-slate-50 border text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all font-medium font-montserrat ${
            errors.description
              ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
              : 'border-slate-300 focus:border-[#0562ff] focus:ring-1 focus:ring-[#0562ff]'
          }`}
          disabled={loading}
        />
        {errors.description && (
          <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.description}</span>
          </p>
        )}
      </div>

      {/* Meeting Link Field */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
          <Link2 className="w-4 h-4 text-[#0562ff]" />
          <span>Meeting Link <span className="text-rose-500">*</span></span>
        </label>
        <input
          type="url"
          name="meetingLink"
          value={formData.meetingLink}
          onChange={handleChange}
          placeholder="https://meet.google.com/abc-defg-hij"
          className={`w-full px-4 py-2.5 rounded-none bg-slate-50 border text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all font-medium font-montserrat ${
            errors.meetingLink
              ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
              : 'border-slate-300 focus:border-[#0562ff] focus:ring-1 focus:ring-[#0562ff]'
          }`}
          disabled={loading}
        />
        {errors.meetingLink && (
          <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.meetingLink}</span>
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 font-montserrat">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-5 py-2.5 rounded-none bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer font-montserrat uppercase tracking-wider"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-none bg-[#0562ff] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer font-montserrat uppercase tracking-wider disabled:opacity-70"
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
        </button>
      </div>
    </form>
  );
};

export default MeetingForm;
