import React from 'react';
import { Users, X, Calendar, User, CheckCircle, XCircle, ShieldCheck, Lock, UserCheck } from 'lucide-react';
import { formatFriendlyDate } from '../../utils/formatDate';

export const GroupDetailsModal = ({
  isOpen,
  onClose,
  group,
  members = [],
  loadingMembers = false,
}) => {
  if (!isOpen || !group) return null;

  const isGroupActive = group.isActive ?? true;
  const creatorName = group.createdBy?.name || 'Admin';
  const creatorEmail = group.createdBy?.email || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200 font-montserrat">
      <div className="bg-white border border-slate-200 rounded-none max-w-lg w-full p-6 space-y-4 shadow-2xl relative flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-none bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0562ff] font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-montserrat text-slate-900 leading-tight">
                {group.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Group Details & Overview</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata Details Grid */}
        <div className="bg-slate-50 p-4 border border-slate-200 space-y-3 shrink-0 text-xs">
          <div>
            <span className="text-slate-500 font-semibold block mb-0.5">Description:</span>
            <p className="text-slate-800 font-medium leading-relaxed">
              {group.description || <span className="text-slate-400 italic">No description provided.</span>}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/70">
            <div>
              <span className="text-slate-500 font-semibold block mb-0.5">Status:</span>
              <span className={`inline-flex items-center gap-1 font-bold ${
                isGroupActive ? 'text-emerald-700' : 'text-slate-500'
              }`}>
                {isGroupActive ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Active
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-slate-400" /> Inactive
                  </>
                )}
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block mb-0.5">Created By:</span>
              <div className="font-bold text-slate-900 truncate" title={`${creatorName} (${creatorEmail})`}>
                {creatorName}
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block mb-0.5">Created Date:</span>
              <div className="font-medium text-slate-800">
                {formatFriendlyDate(group.createdAt)}
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-semibold block mb-0.5">Total Members:</span>
              <div className="font-bold text-slate-900">
                {members.length > 0 ? members.length : (group.members?.length || 0)} Members
              </div>
            </div>
          </div>
        </div>

        {/* Members Roster List */}
        <div className="flex-1 overflow-hidden flex flex-col border border-slate-200">
          <div className="bg-slate-100 px-3.5 py-2 font-bold text-slate-700 text-xs border-b border-slate-200 flex items-center justify-between shrink-0">
            <span>Group Members List</span>
            <span className="text-slate-500 font-medium">
              {members.length > 0 ? members.length : (group.members?.length || 0)} Total
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-h-[160px]">
            {loadingMembers ? (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">
                Loading members...
              </div>
            ) : members.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">
                No members found.
              </div>
            ) : (
              members.map((member) => {
                const isFounder = member.role === 'founder';
                const isAdmin = member.role === 'admin';
                return (
                  <div key={member._id || member.id} className="p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-none bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-[#0562ff] text-xs uppercase font-montserrat shrink-0">
                        {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{member.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{member.email}</div>
                      </div>
                    </div>

                    {isFounder ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 rounded-none uppercase">
                        <Lock className="w-3 h-3 text-amber-600" />
                        Founder
                      </span>
                    ) : isAdmin ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-[#0562ff] border border-blue-200 rounded-none uppercase">
                        <ShieldCheck className="w-3 h-3 text-[#0562ff]" />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-none uppercase">
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                        Employee
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
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

export default GroupDetailsModal;
