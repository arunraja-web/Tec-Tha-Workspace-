import React from 'react';
import {
  Users,
  Eye,
  Edit2,
  UserPlus,
  UserCheck,
  LogOut,
  Power,
  Shield,
  Calendar,
  User
} from 'lucide-react';
import { formatFriendlyDate } from '../../utils/formatDate';

export const GroupCard = ({
  group,
  currentUser,
  onViewDetails,
  onEditGroup,
  onManageMembers,
  onJoinGroup,
  onLeaveGroup,
  onToggleStatus,
  loadingAction = false,
}) => {
  const isGroupActive = group.isActive ?? true;
  const memberCount = group.members ? group.members.length : 0;
  
  // Check if current user is member of this group
  const isMember = group.members?.some((m) => {
    const memberId = typeof m === 'object' ? (m._id || m.id) : m;
    const currentUserId = currentUser?._id || currentUser?.id;
    return memberId?.toString() === currentUserId?.toString();
  });

  const isAdmin = currentUser?.role === 'admin';
  const isFounder = currentUser?.role === 'founder';
  const isEmployee = currentUser?.role === 'employee';

  const creatorName = group.createdBy?.name || 'Admin';

  return (
    <div className={`bg-white border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between p-5 font-montserrat ${
      !isGroupActive ? 'border-slate-300 opacity-75 bg-slate-50/50' : 'border-slate-200'
    }`}>
      <div className="space-y-3">
        {/* Top Header Row: Group Name & Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-none bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0562ff] shrink-0 font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-1 font-montserrat">
                {group.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  {creatorName}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {formatFriendlyDate(group.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-none shrink-0 font-montserrat ${
            isGroupActive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-600 border border-slate-300'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isGroupActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {isGroupActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed min-h-[36px]">
          {group.description || <span className="text-slate-400 italic">No description provided.</span>}
        </p>

        {/* Member Count & Join Status Badge */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Users className="w-4 h-4 text-[#0562ff]" />
            <span>{memberCount} Member{memberCount !== 1 ? 's' : ''}</span>
          </div>

          {isMember && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-none uppercase">
              Joined
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="pt-4 mt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
        {/* View Details Button (Available to all permitted roles) */}
        <button
          type="button"
          onClick={() => onViewDetails(group)}
          className="flex-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View</span>
        </button>

        {/* Admin Actions */}
        {isAdmin && (
          <>
            {/* Edit Group */}
            <button
              type="button"
              onClick={() => onEditGroup(group)}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Edit Group Details"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </button>

            {/* Manage Members */}
            <button
              type="button"
              onClick={() => onManageMembers(group)}
              className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-[#0562ff] text-xs font-bold border border-blue-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Manage Group Members"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Members</span>
            </button>

            {/* Admin Join / Leave */}
            {!isMember ? (
              <button
                type="button"
                onClick={() => onJoinGroup(group)}
                disabled={loadingAction}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Voluntarily Join Group"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Join</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onLeaveGroup(group)}
                disabled={loadingAction}
                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Leave Group"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Leave</span>
              </button>
            )}

            {/* Deactivate / Reactivate */}
            <button
              type="button"
              onClick={() => onToggleStatus(group)}
              disabled={loadingAction}
              className={`p-2 text-xs font-bold border transition-colors cursor-pointer disabled:opacity-50 ${
                isGroupActive
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}
              title={isGroupActive ? 'Deactivate Group' : 'Reactivate Group'}
            >
              <Power className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default GroupCard;
