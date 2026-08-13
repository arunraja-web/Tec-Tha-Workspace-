import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import { MessageListSkeleton } from './ChatSkeleton';
import { EmptyMessageHistory } from './EmptyChatState';
import TypingIndicator from './TypingIndicator';
import { useAuth } from '../../hooks/useAuth';
import { checkIsOwnMessage, formatDateDivider } from '../../utils/chatUtils';

export const MessageList = ({
  messages = [],
  currentUserId,
  currentUserEmail,
  conversationType = 'direct',
  loading = false,
  hasMore = false,
  onLoadOlder,
  typingUsers = {},
  onEditMessage,
  onDeleteMessage,
}) => {
  const { user: authUser } = useAuth();
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  if (loading && messages.length === 0) {
    return <MessageListSkeleton />;
  }

  if (messages.length === 0) {
    return <EmptyMessageHistory />;
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1 bg-[#0b141a] custom-scrollbar"
    >
      {/* Load Older Messages Trigger */}
      {hasMore && (
        <div className="flex justify-center my-2">
          <button
            type="button"
            onClick={onLoadOlder}
            className="px-3 py-1.5 bg-[#182229] hover:bg-[#202c33] text-[#8696a0] text-xs font-semibold rounded-full border border-white/5 transition-colors cursor-pointer shadow-xs"
          >
            Load older messages
          </button>
        </div>
      )}

      {/* Message Bubbles List */}
      {messages.map((message, index) => {
        const isOwn = checkIsOwnMessage(
          message.sender,
          currentUserId,
          currentUserEmail,
          authUser
        );

        const prevMessage = messages[index - 1];

        // In group chats, label all opposite sender messages with their name
        const showSender = conversationType === 'group' && !isOwn;

        // Centered Date Divider Pill (Today, Yesterday, 03/08/2026)
        const currentDateStr = formatDateDivider(message.createdAt);
        const prevDateStr = prevMessage ? formatDateDivider(prevMessage.createdAt) : null;
        const showDateDivider = currentDateStr && currentDateStr !== prevDateStr;

        return (
          <React.Fragment key={message._id || index}>
            {showDateDivider && (
              <div className="flex justify-center my-3 select-none">
                <span className="px-3 py-1 bg-[#182229] text-[#8696a0] text-[11px] font-semibold rounded-lg shadow-xs border border-white/5">
                  {currentDateStr}
                </span>
              </div>
            )}
            <MessageBubble
              message={message}
              isOwn={isOwn}
              showSender={showSender}
              onEdit={onEditMessage}
              onDelete={onDeleteMessage}
            />
          </React.Fragment>
        );
      })}

      {/* Realtime Typing Indicator */}
      <TypingIndicator typingUsersMap={typingUsers} />

      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
