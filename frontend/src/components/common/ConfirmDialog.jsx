import React from 'react';
import { LogOut, AlertCircle, FileSpreadsheet, X } from 'lucide-react';

/**
 * ConfirmDialog - Light Enterprise Theme (Zoho Dashboard Aesthetic)
 * Rounded-none, font-montserrat, #0562ff primary blue action buttons, zero emojis.
 */
export const ConfirmDialog = ({
  isOpen,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  icon: CustomIcon,
  variant = 'blue', // 'blue' | 'rose' | 'amber' | 'emerald'
  onConfirm,
  onCancel,
  loading = false
}) => {
  if (!isOpen) return null;

  const IconComponent = CustomIcon || (variant === 'rose' ? LogOut : AlertCircle);

  // Variant color mapping matching dashboard theme
  const variantStyles = {
    blue: {
      badge: 'bg-blue-50 border-blue-200 text-[#0562ff]',
      button: 'bg-[#0562ff] hover:bg-blue-700 text-white',
      title: 'text-slate-900',
    },
    rose: {
      badge: 'bg-rose-50 border-rose-200 text-rose-700',
      button: 'bg-rose-600 hover:bg-rose-700 text-white',
      title: 'text-slate-900',
    },
    amber: {
      badge: 'bg-amber-50 border-amber-200 text-amber-700',
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
      title: 'text-slate-900',
    },
    emerald: {
      badge: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      title: 'text-slate-900',
    },
  };

  const style = variantStyles[variant] || variantStyles.blue;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-montserrat animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-none shadow-2xl p-6 sm:p-7 space-y-5 relative font-montserrat">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-none border flex items-center justify-center font-bold shrink-0 ${style.badge}`}>
              <IconComponent className="w-5.5 h-5.5" />
            </div>
            <div>
              <h3 className={`text-lg font-bold font-montserrat uppercase tracking-wide ${style.title}`}>
                {title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed font-montserrat">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 font-montserrat">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 rounded-none bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer font-montserrat uppercase tracking-wider"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-6 py-2.5 rounded-none font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer font-montserrat uppercase tracking-wider disabled:opacity-50 ${style.button}`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmDialog;
