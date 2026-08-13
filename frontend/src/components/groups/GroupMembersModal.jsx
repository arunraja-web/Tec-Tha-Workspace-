import React from 'react';
import { Users, UserPlus, X, Trash2, Lock, ShieldCheck, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';

export const GroupMembersModal = ({
  isOpen,
  onClose,
  group,
  members = [],
  currentUser,
  onOpenAddMembers,
  onRemoveMember,
  loading = false,
  removingId = null,
  errorMessage = null,
}) => {
  if (!isOpen || !group) return null;

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200 font-montserrat">
      <div className="bg-white border border-slate-200 rounded-none max-w-lg w-full p-6 space-y-4 shadow-2xl relative flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div>
            <h3 className="text-lg font-bold font-montserrat text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0562ff]" /> Group Members
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {group.name} ({members.length} Member{members.length !== 1 ? 's' : ''})
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                type="button"
                onClick={onOpenAddMembers}
                className="px-3 py-1.5 bg-[#0562ff] hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add Employees</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Members List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 border border-slate-200 min-h-[220px]">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#0562ff] mb-2" />
              Loading group members...
            </div>
          ) : members.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs font-medium px-4">
              No members found in this group.
            </div>
          ) : (
            members.map((member) => {
              const memberId = member._id || member.id;
              const isFounder = member.role === 'founder';
              const isMemberAdmin = member.role === 'admin';
              const isRemovingThis = removingId === memberId;

              return (
                <div
                  key={memberId}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* User Initials Avatar */}
                    <div className="w-9 h-9 rounded-none bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-[#0562ff] text-xs uppercase font-montserrat shrink-0">
                      {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        {member.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {member.email}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Role Badge or Action Button */}
                  <div className="flex items-center gap-2">
                    {isFounder ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 rounded-none uppercase">
                        <Lock className="w-3 h-3 text-amber-600" />
                        Founder (Mandatory)
                      </span>
                    ) : isMemberAdmin ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-blue-50 text-[#0562ff] border border-blue-200 rounded-none uppercase">
                        <ShieldCheck className="w-3 h-3 text-[#0562ff]" />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-none uppercase">
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                        Employee
                      </span>
                    )}

                    {/* Admin Remove Button (Allowed for Employee members only) */}
                    {isAdmin && !isFounder && !isMemberAdmin && (
                      <button
                        type="button"
                        onClick={() => onRemoveMember(member)}
                        disabled={isRemovingThis}
                        className="p-1.5 rounded-none bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
                        title={`Remove ${member.name} from group`}
                      >
                        {isRemovingThis ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default GroupMembersModal;
