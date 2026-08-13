import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import socketService from '../services/socketService';
import {
  setSocketConnected,
  receiveNewMessage,
  receiveMessageEdited,
  receiveMessageDeleted,
  receiveMessageRead,
  setTypingUser,
  clearTypingUser,
  setUserPresence,
  setOnlineUsersList,
} from '../redux/slices/chatSlice';

export const useChatSocket = (selectedConversationId) => {
  const dispatch = useDispatch();
  const selectedConversationIdRef = useRef(selectedConversationId);

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  useEffect(() => {
    // 1. Connect socket
    const socket = socketService.connect();

    // Connection lifecycle handlers
    const handleConnect = () => {
      dispatch(setSocketConnected(true));
      // Rejoin currently selected conversation if any
      if (selectedConversationIdRef.current) {
        socketService.joinConversation(selectedConversationIdRef.current);
      }
    };

    const handleDisconnect = () => {
      dispatch(setSocketConnected(false));
    };

    // Message event handlers
    const handleNewMessage = (message) => {
      dispatch(receiveNewMessage(message));
    };

    const handleMessageEdited = (editedMessage) => {
      dispatch(receiveMessageEdited(editedMessage));
    };

    const handleMessageDeleted = (data) => {
      dispatch(receiveMessageDeleted(data));
    };

    const handleMessageRead = (data) => {
      dispatch(receiveMessageRead(data));
    };

    // Typing event handlers
    const handleUserTyping = (data) => {
      if (data && data.user) {
        dispatch(
          setTypingUser({
            conversationId: data.conversationId,
            user: data.user,
          })
        );
      }
    };

    const handleUserTypingStop = (data) => {
      if (data && data.userId) {
        dispatch(
          clearTypingUser({
            conversationId: data.conversationId,
            userId: data.userId,
          })
        );
      }
    };

    // Presence event handlers
    const handleUserOnline = (data) => {
      if (data && data.userId) {
        dispatch(
          setUserPresence({
            userId: data.userId,
            isOnline: true,
          })
        );
      }
    };

    const handleUserOffline = (data) => {
      if (data && data.userId) {
        dispatch(
          setUserPresence({
            userId: data.userId,
            isOnline: false,
            lastSeen: data.lastSeen,
          })
        );
      }
    };

    const handleOnlineUsersList = (data) => {
      if (data && Array.isArray(data.onlineUserIds)) {
        dispatch(setOnlineUsersList(data));
      }
    };

    // Attach listeners
    if (socket) {
      if (socket.connected) {
        dispatch(setSocketConnected(true));
      }

      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      socket.on('new_message', handleNewMessage);
      socket.on('message_edited', handleMessageEdited);
      socket.on('message_deleted', handleMessageDeleted);
      socket.on('message_read', handleMessageRead);
      socket.on('user_typing', handleUserTyping);
      socket.on('user_typing_stop', handleUserTypingStop);
      socket.on('user_online', handleUserOnline);
      socket.on('user_offline', handleUserOffline);
      socket.on('online_users_list', handleOnlineUsersList);
    }

    // Clean up listeners on unmount
    return () => {
      if (socket) {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
        socket.off('new_message', handleNewMessage);
        socket.off('message_edited', handleMessageEdited);
        socket.off('message_deleted', handleMessageDeleted);
        socket.off('message_read', handleMessageRead);
        socket.off('user_typing', handleUserTyping);
        socket.off('user_typing_stop', handleUserTypingStop);
        socket.off('user_online', handleUserOnline);
        socket.off('user_offline', handleUserOffline);
        socket.off('online_users_list', handleOnlineUsersList);
      }
    };
  }, [dispatch]);

  // Handle joining/leaving room when active conversation changes
  useEffect(() => {
    if (selectedConversationId && socketService.isConnected()) {
      socketService.joinConversation(selectedConversationId);

      return () => {
        socketService.leaveConversation(selectedConversationId);
      };
    }
  }, [selectedConversationId]);

  return {
    socketService,
    sendMessage: (payload, callback) => socketService.sendMessage(payload, callback),
    startTyping: (convId) => socketService.startTyping(convId),
    stopTyping: (convId) => socketService.stopTyping(convId),
    markRead: (convId, msgId, callback) => socketService.markRead(convId, msgId, callback),
  };
};

export default useChatSocket;
