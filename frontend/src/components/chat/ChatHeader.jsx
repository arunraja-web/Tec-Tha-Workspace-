import React, { useState } from 'react';
import { ArrowLeft, Users, User, Shield, Info } from 'lucide-react';
import { getDirectRecipient, getIsUserOnline, getGroupMembers } from '../../utils/chatUtils';
import { OnlineStatusDot, OnlineStatusText } from './OnlineStatus';
import { useAuth } from '../../hooks/useAuth';

export const ChatHeader = ({
  conversation,
  currentUserId,
  currentUserEmail,
  onlineUsers = {},
  onBack,
}) => {
  const { user: authUser } = useAuth();
  const [showMembersPopover, setShowMembersPopover] = useState(false);

  if (!conversation) return null;

  const isGroup = conversation.type === 'group';
  const groupMembers = isGroup ? getGroupMembers(conversation) : [];
  const memberNamesTooltip = isGroup
    ? groupMembers.map((m) => m.name || m.email || 'Member').join(', ')
    : '';

  let title = 'Chat';
  let subtitle = null;
  let isOnline = false;
  let lastSeen = null;

  if (isGroup) {
    title = conversation.group?.name || conversation.name || 'Group Conversation';
    const memberCount =
      groupMembers.length ||
      conversation.group?.members?.length ||
      conversation.participants?.length ||
      0;
    subtitle = (
      <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
        <Users className="w-3.5 h-3.5 inline" />
        {memberCount} members
      </span>
    );
  } else {
    const recipient = getDirectRecipient(conversation, currentUserId, currentUserEmail, authUser);
    title = recipient?.name || 'Direct Conversation';

    const presence = getIsUserOnline(recipient, onlineUsers);
    isOnline = presence.isOnline;
    lastSeen = presence.lastSeen;

    subtitle = <OnlineStatusText isOnline={isOnline} lastSeen={lastSeen} />;
  }

  const onlineMembersCount = groupMembers.filter(
    (m) => getIsUserOnline(m, onlineUsers).isOnline
  ).length;

  return (
    <div className="relative flex items-center justify-between px-4 py-3 bg-white dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 shrink-0 select-none">
      <div className="flex items-center gap-3">
        {/* Mobile Back Button */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="md:hidden p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
            title="Back to conversation list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {/* Avatar & Title Group Container with Hover for Group Members */}
        <div
          className="relative flex items-center gap-3 cursor-pointer group"
          onMouseEnter={() => isGroup && setShowMembersPopover(true)}
          onMouseLeave={() => isGroup && setShowMembersPopover(false)}
          title={isGroup ? `Members: ${memberNamesTooltip}` : title}
        >
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0562ff] to-indigo-700 text-white flex items-center justify-center font-bold text-sm shadow-xs transition-transform group-hover:scale-105">
              {isGroup ? <Users className="w-5 h-5" /> : title.charAt(0).toUpperCase()}
            </div>
            {!isGroup && (
              <div className="absolute -bottom-0.5 -right-0.5">
                <OnlineStatusDot isOnline={isOnline} />
              </div>
            )}
          </div>

          {/* Title & Details */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight group-hover:text-[#0562ff] transition-colors">
                {title}
              </h2>
              {isGroup && (
                <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-indigo-950/60 text-[#0562ff] dark:text-indigo-400 text-[10px] font-bold border border-[#0562ff]/20">
                  Group
                </span>
              )}
            </div>
            <div className="mt-0.5">{subtitle}</div>
          </div>

          {/* Hover Popover Card for Group Members */}
          {isGroup && showMembersPopover && (
            <div className="absolute left-0 top-full mt-2 w-80 bg-white dark:bg-[#202c33] border border-slate-200 dark:border-neutral-700/80 rounded-2xl shadow-xl z-50 p-3.5 animate-in fade-in-50 zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-neutral-700/60">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                  <Users className="w-4 h-4 text-[#0562ff]" />
                  <span>Group Members ({groupMembers.length})</span>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                  {onlineMembersCount} online
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                {groupMembers.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No member info available.</p>
                ) : (
                  groupMembers.map((m, idx) => {
                    const memberName = m.name || m.email || `Member ${idx + 1}`;
                    const { isOnline: mOnline } = getIsUserOnline(m, onlineUsers);

                    return (
                      <div
                        key={m._id || m.id || idx}
                        className="flex items-center justify-between text-xs py-1.5 px-2 rounded-xl hover:bg-slate-50 dark:hover:bg-neutral-800/60 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              mOnline
                                ? 'bg-emerald-500 shadow-xs ring-2 ring-emerald-500/20'
                                : 'bg-slate-300 dark:bg-neutral-600'
                            }`}
                          />
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {memberName}
                          </span>
                        </div>
                        {m.role && (
                          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400 shrink-0 border border-slate-200 dark:border-neutral-700/80 px-1.5 py-0.5 rounded-md">
                            {m.role}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
