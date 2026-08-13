import React, { useEffect } from 'react';
import { X, Calendar } from 'lucide-react';

/**
 * MeetingModal Component - Light Enterprise Theme (rounded-none, font-montserrat)
 */
export const MeetingModal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-montserrat animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white border border-slate-200 rounded-none p-6 sm:p-7 shadow-2xl space-y-5 relative font-montserrat"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-none bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0562ff] shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold font-montserrat text-slate-900 tracking-tight">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="pt-1 font-montserrat">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MeetingModal;
