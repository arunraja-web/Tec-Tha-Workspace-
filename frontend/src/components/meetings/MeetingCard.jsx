import React from 'react';
import { ExternalLink, Calendar, Edit3, Power, CheckCircle, Clock } from 'lucide-react';
import Button from '../common/Button';

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
    <div className="glass-card rounded-2xl p-6 border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all duration-200 shadow-lg">
      <div className="space-y-3">
        {/* Header & Status Pill */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-white tracking-tight line-clamp-2">
            {title}
          </h3>
          <span
            className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
              isActive
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-950/80 text-rose-300 border-rose-500/30'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
              }`}
            />
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Description */}
        {description ? (
          <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
            {description}
          </p>
        ) : (
          <p className="text-xs text-slate-500 italic">No description provided</p>
        )}
      </div>

      <div className="pt-3 border-t border-slate-800/80 space-y-4">
        {/* Creation Info & Link Preview */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Created {formattedDate}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 truncate max-w-[200px]" title={meetingLink}>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{meetingLink}</span>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            onClick={handleJoin}
            variant="primary"
            size="sm"
            icon={ExternalLink}
            iconPosition="right"
            className="bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-500 text-xs font-bold"
          >
            Join Meeting
          </Button>

          {canModify && (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => onEdit(meeting)}
                variant="outline"
                size="sm"
                icon={Edit3}
                className="text-xs border-slate-700 hover:bg-slate-800 text-slate-200"
              >
                Edit
              </Button>
              <Button
                onClick={() => onDeactivate(meeting)}
                variant="secondary"
                size="sm"
                icon={Power}
                className="text-xs bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-800/40"
              >
                {isActive ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingCard;
