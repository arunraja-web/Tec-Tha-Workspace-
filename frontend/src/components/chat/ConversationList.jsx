import React, { useState } from 'react';
import { Search, Plus, MessageSquare } from 'lucide-react';
import ConversationItem from './ConversationItem';
import { ConversationListSkeleton } from './ChatSkeleton';
import { EmptyConversationList } from './EmptyChatState';
import { getDirectRecipient, getIsUserOnline } from '../../utils/chatUtils';
import Button from '../common/Button';
import { useAuth } from '../../hooks/useAuth';

export const ConversationList = ({
  conversations = [],
  selectedConversationId = null,
  currentUserId,
  currentUserEmail,
  onlineUsers = {},
  loading = false,
  onSelectConversation,
  onOpenNewChatModal,
}) => {
  const { user: authUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Local filter for conversation search
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();

    if (conv.type === 'group') {
      const groupName = (conv.group?.name || conv.name || '').toLowerCase();
      return groupName.includes(query);
    } else {
      const recipient = getDirectRecipient(conv, currentUserId, currentUserEmail, authUser);
      const recipientName = (recipient?.name || '').toLowerCase();
      const recipientEmail = (recipient?.email || '').toLowerCase();
      const lastMsgText = (conv.lastMessage?.content || '').toLowerCase();
      return (
        recipientName.includes(query) ||
        recipientEmail.includes(query) ||
        lastMsgText.includes(query)
      );
    }
  });

  return (
    <div className="flex flex-col h-full bg-[#111b21] border-r border-neutral-800 w-full md:w-80 lg:w-96 shrink-0">
      {/* Header & New Chat CTA */}
      <div className="p-4 border-b border-neutral-800 bg-[#202c33] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#00a884]" />
            <h1 className="text-base font-bold text-[#e9edef]">
              Conversations
            </h1>
          </div>
          <Button
            onClick={onOpenNewChatModal}
            variant="primary"
            size="sm"
            icon={Plus}
          >
            New Chat
          </Button>
        </div>

        {/* Local Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8696a0]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-4 py-2 bg-[#2a3942] border border-neutral-700/60 rounded-xl text-xs text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:ring-2 focus:ring-[#00a884]"
          />
        </div>
      </div>

      {/* Conversation Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {loading && conversations.length === 0 ? (
          <ConversationListSkeleton />
        ) : filteredConversations.length === 0 ? (
          <EmptyConversationList onNewChat={onOpenNewChatModal} />
        ) : (
          filteredConversations.map((conv) => {
            const recipient = getDirectRecipient(conv, currentUserId, currentUserEmail, authUser);
            const { isOnline } = getIsUserOnline(recipient, onlineUsers);

            return (
              <ConversationItem
                key={conv._id}
                conversation={conv}
                currentUserId={currentUserId}
                currentUserEmail={currentUserEmail}
                isSelected={conv._id === selectedConversationId}
                isOnline={isOnline}
                onClick={() => onSelectConversation(conv._id)}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;
