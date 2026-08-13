import React from 'react';
import { ExternalLink, Calendar, Edit3, Power, Clock } from 'lucide-react';

/**
 * MeetingCard Component - Light Enterprise Theme (rounded-none, font-montserrat)
 */
export const MeetingCard = ({ meeting, currentUser, onEdit, onDeactivate }) => {
  const {
    id,
    _id,
    title,
    description,
    meetingLink,
    isActive,
    createdBy,
    createdAt
  } = meeting;

  const meetingId = id || _id;

  // Ownership verification
  const creatorId = typeof createdBy === 'object' && createdBy !== null ? createdBy._id || createdBy.id : createdBy;
  const currentUserId = currentUser?._id || currentUser?.id;
  const isCreator = creatorId && currentUserId && String(creatorId) === String(currentUserId);
  const isAdmin = currentUser?.role === 'admin';
  const canModify = isCreator || isAdmin;

  const handleJoin = () => {
    if (meetingLink) {
      window.open(meetingLink, '_blank', 'noopener,noreferrer');
    }
  };

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Recently';

  return (
    <div className="bg-white rounded-none p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 font-montserrat hover:border-slate-300 transition-all">
      <div className="space-y-2.5">
        {/* Header & Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold text-slate-900 leading-snug font-montserrat line-clamp-2">
            {title}
          </h3>
          <span
            className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-none border uppercase tracking-wider ${
              isActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Description */}
        {description ? (
          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-medium">
            {description}
          </p>
        ) : (
          <p className="text-xs text-slate-400 italic">No description provided</p>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 space-y-4 font-montserrat">
        {/* Creation Info & Link Preview */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#0562ff]" />
            <span>Created {formattedDate}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 truncate max-w-[180px]" title={meetingLink}>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{meetingLink}</span>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between gap-2 pt-1 font-montserrat">
          <button
            type="button"
            onClick={handleJoin}
            className="px-4 py-2 rounded-none bg-[#0562ff] hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer font-montserrat uppercase tracking-wider"
          >
            <span>Join Meeting</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {canModify && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit(meeting)}
                className="px-3 py-2 rounded-none bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer font-montserrat uppercase tracking-wider flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => onDeactivate(meeting)}
                className="px-3 py-2 rounded-none bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs transition-colors cursor-pointer font-montserrat uppercase tracking-wider flex items-center gap-1"
              >
                <Power className="w-3.5 h-3.5" />
                <span>{isActive ? 'Deactivate' : 'Activate'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingCard;
