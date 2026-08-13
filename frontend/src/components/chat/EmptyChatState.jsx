import React from 'react';
import { MessageSquare, Plus, MessagesSquare } from 'lucide-react';
import Button from '../common/Button';

export const EmptyConversationSelection = () => (
  <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-neutral-950/40">
    <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
      <MessagesSquare className="w-8 h-8" />
    </div>
    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Select a Conversation</h3>
    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
      Choose a direct message or group conversation from the list on the left to start chatting in real time.
    </p>
  </div>
);

export const EmptyConversationList = ({ onNewChat }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex items-center justify-center text-slate-400">
      <MessageSquare className="w-6 h-6" />
    </div>
    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Conversations Yet</h4>
    <p className="text-xs text-slate-500 max-w-xs">
      Start a direct conversation with a colleague or access your assigned team groups.
    </p>
    {onNewChat && (
      <Button onClick={onNewChat} variant="primary" size="sm" icon={Plus}>
        New Chat
      </Button>
    )}
  </div>
);

export const EmptyMessageHistory = () => (
  <div className="flex flex-col items-center justify-center h-64 text-center p-6 space-y-2">
    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center">
      <MessageSquare className="w-5 h-5" />
    </div>
    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No messages yet</p>
    <p className="text-xs text-slate-500">Send a message to start the conversation!</p>
  </div>
);

export default { EmptyConversationSelection, EmptyConversationList, EmptyMessageHistory };
