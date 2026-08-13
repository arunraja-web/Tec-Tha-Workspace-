import React, { useState } from 'react';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import NewConversationModal from './NewConversationModal';

export const ChatLayout = ({
  conversations = [],
  selectedConversation = null,
  messages = [],
  currentUserId,
  currentUserEmail,
  onlineUsers = {},
  typingUsers = {},
  loading = false,
  messagesLoading = false,
  hasMoreMessages = false,
  onSelectConversation,
  onStartDirectChat,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onLoadOlderMessages,
  onTypingStart,
  onTypingStop,
  onDeselectConversation,
}) => {
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  return (
    <div className="w-full h-full flex flex-row overflow-hidden bg-[#111b21] border border-neutral-800 rounded-2xl shadow-xl">
      {/* Sidebar Panel - Conversation List */}
      <div
        className={`w-full md:w-auto h-full ${
          selectedConversation ? 'hidden md:flex' : 'flex'
        }`}
      >
        <ConversationList
          conversations={conversations}
          selectedConversationId={selectedConversation?._id}
          currentUserId={currentUserId}
          currentUserEmail={currentUserEmail}
          onlineUsers={onlineUsers}
          loading={loading}
          onSelectConversation={onSelectConversation}
          onOpenNewChatModal={() => setIsNewChatModalOpen(true)}
        />
      </div>

      {/* Main Panel - Active Chat Window */}
      <div
        className={`flex-1 h-full ${
          !selectedConversation ? 'hidden md:flex' : 'flex'
        }`}
      >
        <ChatWindow
          conversation={selectedConversation}
          messages={messages}
          currentUserId={currentUserId}
          currentUserEmail={currentUserEmail}
          onlineUsers={onlineUsers}
          typingUsers={typingUsers}
          loading={messagesLoading}
          hasMore={hasMoreMessages}
          onSendMessage={onSendMessage}
          onEditMessage={onEditMessage}
          onDeleteMessage={onDeleteMessage}
          onLoadOlder={onLoadOlderMessages}
          onTypingStart={onTypingStart}
          onTypingStop={onTypingStop}
          onBack={onDeselectConversation}
        />
      </div>

      {/* New Conversation Modal */}
      <NewConversationModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onSelectUser={onStartDirectChat}
        currentUserId={currentUserId}
      />
    </div>
  );
};

export default ChatLayout;
