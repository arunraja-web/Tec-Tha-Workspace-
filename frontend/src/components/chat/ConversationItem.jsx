import React from 'react';
import { Users, FileText } from 'lucide-react';
import { formatChatTime, getDirectRecipient, getGroupMembers } from '../../utils/chatUtils';
import { OnlineStatusDot } from './OnlineStatus';
import { useAuth } from '../../hooks/useAuth';

export const ConversationItem = ({
  conversation,
  currentUserId,
  currentUserEmail,
  isSelected = false,
  isOnline = false,
  onClick,
}) => {
  const { user: authUser } = useAuth();
  if (!conversation) return null;

  const isGroup = conversation.type === 'group';
  const groupMembers = isGroup ? getGroupMembers(conversation) : [];
  const memberNamesTooltip = isGroup
    ? groupMembers.map((m) => m.name || m.email || 'Member').join(', ')
    : '';

  let title = 'Conversation';
  let avatarText = 'C';

  if (isGroup) {
    title = conversation.group?.name || conversation.name || 'Group Chat';
    avatarText = title.charAt(0).toUpperCase();
  } else {
    const recipient = getDirectRecipient(conversation, currentUserId, currentUserEmail, authUser);
    title = recipient?.name || 'Direct User';
    avatarText = title.charAt(0).toUpperCase();
  }

  const lastMsg = conversation.lastMessage;
  let lastMessagePreview = 'No messages yet';
  if (lastMsg) {
    if (lastMsg.isDeleted) {
      lastMessagePreview = 'This message was deleted.';
    } else if (lastMsg.content) {
      lastMessagePreview = lastMsg.content;
    } else if (lastMsg.attachment) {
      lastMessagePreview = `📎 Attachment: ${lastMsg.attachment.originalName || 'File'}`;
    }
  }

  const timeString = formatChatTime(conversation.lastMessageAt || conversation.updatedAt);
  const unreadCount = conversation.unreadCount || 0;

  return (
    <button
      type="button"
      onClick={onClick}
      title={isGroup ? `${title} • Members (${groupMembers.length}): ${memberNamesTooltip}` : title}
      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all cursor-pointer border ${
        isSelected
          ? 'bg-blue-50/80 dark:bg-indigo-950/40 border-[#0562ff]/30 dark:border-indigo-500/40 shadow-xs'
          : 'bg-white dark:bg-neutral-900 hover:bg-slate-100 dark:hover:bg-neutral-800/80 border-slate-200/60 dark:border-neutral-800'
      }`}
    >
      {/* Avatar Container */}
      <div className="relative shrink-0">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-xs ${
            isGroup
              ? 'bg-gradient-to-br from-indigo-600 to-purple-700'
              : 'bg-gradient-to-br from-[#0562ff] to-blue-700'
          }`}
        >
          {isGroup ? <Users className="w-5 h-5" /> : avatarText}
        </div>
        {!isGroup && (
          <div className="absolute -bottom-0.5 -right-0.5">
            <OnlineStatusDot isOnline={isOnline} />
          </div>
        )}
      </div>

      {/* Title & Preview Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-1">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
            {title}
          </h3>
          {timeString && (
            <span className="text-[10px] font-semibold text-slate-400 shrink-0">
              {timeString}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {lastMessagePreview}
          </p>

          {/* Unread Counter Badge */}
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#0562ff] text-white text-[10px] font-bold shrink-0 shadow-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ConversationItem;
