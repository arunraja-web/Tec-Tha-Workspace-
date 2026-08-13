import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useChatSocket from '../../hooks/useChatSocket';
import socketService from '../../services/socketService';
import ChatLayout from '../../components/chat/ChatLayout';
import {
  fetchConversations,
  createDirectConversation,
  setSelectedConversation,
  fetchMessages,
  sendMessageRest,
  editMessage,
  deleteMessage,
  markConversationRead,
  receiveNewMessage,
} from '../../redux/slices/chatSlice';
import { ArrowLeft, MessageSquare, Shield, User } from 'lucide-react';
import Button from '../../components/common/Button';

export const ChatPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    conversations,
    selectedConversationId,
    messagesByConversation,
    paginationByConversation,
    onlineUsers,
    typingUsers,
    loading,
    messagesLoading,
    error,
  } = useSelector((state) => state.chat);

  const currentUserId = user?._id || user?.id;

  // Initialize Socket.IO connection and handlers
  const { sendMessage, startTyping, stopTyping, markRead } =
    useChatSocket(selectedConversationId);

  // Initial load: Fetch conversations list
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // When selected conversation changes, fetch recent messages and mark as read
  useEffect(() => {
    if (selectedConversationId) {
      dispatch(fetchMessages({ conversationId: selectedConversationId, limit: 30 }));
      dispatch(markConversationRead(selectedConversationId));
      markRead(selectedConversationId);
    }
  }, [selectedConversationId, dispatch]);

  const selectedConversation = conversations.find(
    (c) => c._id === selectedConversationId
  );

  const activeMessages = selectedConversationId
    ? messagesByConversation[selectedConversationId] || []
    : [];

  const pagination = selectedConversationId
    ? paginationByConversation[selectedConversationId]
    : null;

  const hasMoreMessages = pagination ? pagination.hasMore : false;

  // Handler for starting a new direct chat
  const handleStartDirectChat = async (targetUserId) => {
    const action = await dispatch(createDirectConversation(targetUserId));
    if (createDirectConversation.fulfilled.match(action)) {
      const newConv = action.payload;
      if (newConv && newConv._id) {
        dispatch(setSelectedConversation(newConv._id));
      }
    }
  };

  // Handler for sending a message
  const handleSendMessage = (payload) => {
    if (!selectedConversationId) return;

    const fullPayload = {
      conversationId: selectedConversationId,
      ...payload,
    };

    if (socketService.isConnected()) {
      let ackReceived = false;

      // 1000ms timeout fallback to REST API if socket response is delayed
      const fallbackTimer = setTimeout(() => {
        if (!ackReceived) {
          dispatch(sendMessageRest(fullPayload));
        }
      }, 1000);

      sendMessage(fullPayload, (ack) => {
        ackReceived = true;
        clearTimeout(fallbackTimer);

        if (ack && ack.success && ack.message) {
          dispatch(receiveNewMessage(ack.message));
        } else {
          dispatch(sendMessageRest(fullPayload));
        }
      });
    } else {
      // Socket not connected: Send via REST API directly
      dispatch(sendMessageRest(fullPayload));
    }
  };

  // Handler for loading older messages
  const handleLoadOlderMessages = () => {
    if (!selectedConversationId || activeMessages.length === 0) return;
    const oldestMsg = activeMessages[0];
    if (oldestMsg && oldestMsg.createdAt) {
      dispatch(
        fetchMessages({
          conversationId: selectedConversationId,
          before: oldestMsg._id,
          limit: 30,
        })
      );
    }
  };

  // Handler for message editing
  const handleEditMessage = (messageId, content) => {
    dispatch(editMessage({ messageId, content }));
  };

  // Handler for message deleting
  const handleDeleteMessage = (messageId) => {
    dispatch(deleteMessage(messageId));
  };

  // Role dashboard back navigation helper
  const handleBackToDashboard = () => {
    if (user?.role === 'founder') navigate('/founder/dashboard');
    else if (user?.role === 'admin') navigate('/admin/dashboard');
    else navigate('/employee/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-3 sm:p-6 flex flex-col justify-between selection:bg-[#0562ff] selection:text-white">
      <div className="max-w-[1600px] w-full mx-auto flex flex-col h-[calc(100vh-2.5rem)] sm:h-[calc(100vh-3rem)]">
        {/* Header Navigation Bar */}
        <header className="mb-3 flex items-center justify-between gap-4 bg-white dark:bg-neutral-900 px-4 py-3 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBackToDashboard}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 rounded-xl transition-colors text-xs font-semibold flex items-center gap-2"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-neutral-800" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#0562ff]/10 text-[#0562ff] flex items-center justify-center font-bold">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                  TEC THA CHAT
                </h1>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                  Real-time direct & team messaging workspace
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700/60 rounded-xl text-xs">
              <div className="w-6 h-6 rounded-full bg-[#0562ff] text-white flex items-center justify-center font-bold text-[10px]">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {user?.name || 'User'}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 border-l border-slate-200 dark:border-neutral-700 pl-2">
                {user?.role || 'Employee'}
              </span>
            </div>
          </div>
        </header>

        {/* Main Chat Layout Container */}
        <main className="flex-1 overflow-hidden min-h-0">
          <ChatLayout
            conversations={conversations}
            selectedConversation={selectedConversation}
            messages={activeMessages}
            currentUserId={currentUserId}
            currentUserEmail={user?.email}
            onlineUsers={onlineUsers}
            typingUsers={typingUsers}
            loading={loading}
            messagesLoading={messagesLoading}
            hasMoreMessages={hasMoreMessages}
            onSelectConversation={(id) => dispatch(setSelectedConversation(id))}
            onStartDirectChat={handleStartDirectChat}
            onSendMessage={handleSendMessage}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
            onLoadOlderMessages={handleLoadOlderMessages}
            onTypingStart={() => startTyping(selectedConversationId)}
            onTypingStop={() => stopTyping(selectedConversationId)}
            onDeselectConversation={() => dispatch(setSelectedConversation(null))}
          />
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
