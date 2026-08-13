import React, { useState } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageComposer from './MessageComposer';
import ConfirmDialog from '../common/ConfirmDialog';
import { EmptyConversationSelection } from './EmptyChatState';

export const ChatWindow = ({
  conversation,
  messages = [],
  currentUserId,
  currentUserEmail,
  onlineUsers = {},
  typingUsers = {},
  loading = false,
  hasMore = false,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onLoadOlder,
  onTypingStart,
  onTypingStop,
  onBack,
}) => {
  const [editingMessage, setEditingMessage] = useState(null);
  const [deletingMessage, setDeletingMessage] = useState(null);

  if (!conversation) {
    return <EmptyConversationSelection />;
  }

  const handleInitiateEdit = (message) => {
    setEditingMessage(message);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
  };

  const handleSaveEdit = (messageId, newContent) => {
    if (onEditMessage) {
      onEditMessage(messageId, newContent);
    }
    setEditingMessage(null);
  };

  const handleInitiateDelete = (message) => {
    setDeletingMessage(message);
  };

  const handleConfirmDelete = () => {
    if (deletingMessage && onDeleteMessage) {
      onDeleteMessage(deletingMessage._id);
    }
    setDeletingMessage(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-neutral-900 overflow-hidden relative">
      {/* Header */}
      <ChatHeader
        conversation={conversation}
        currentUserId={currentUserId}
        currentUserEmail={currentUserEmail}
        onlineUsers={onlineUsers}
        onBack={onBack}
      />

      {/* Messages Scroll Area */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        currentUserEmail={currentUserEmail}
        conversationType={conversation.type}
        loading={loading}
        hasMore={hasMore}
        onLoadOlder={onLoadOlder}
        typingUsers={typingUsers[conversation._id] || {}}
        onEditMessage={handleInitiateEdit}
        onDeleteMessage={handleInitiateDelete}
      />

      {/* Composer Input */}
      <MessageComposer
        onSendMessage={onSendMessage}
        onTypingStart={onTypingStart}
        onTypingStop={onTypingStop}
        editingMessage={editingMessage}
        onCancelEdit={handleCancelEdit}
        onSaveEdit={handleSaveEdit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deletingMessage}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action will soft-delete the message content."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingMessage(null)}
      />
    </div>
  );
};

export default ChatWindow;
