import React from 'react';
import { MessageSquare, Plus, MessagesSquare } from 'lucide-react';
import Button from '../common/Button';

export const EmptyConversationSelection = () => (
  <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-[#202c33]">
    <div className="w-16 h-16 rounded-2xl bg-[#005c4b]/30 border border-[#005c4b]/50 flex items-center justify-center text-[#25d366] mb-4 shadow-sm">
      <MessagesSquare className="w-8 h-8" />
    </div>
    <h3 className="text-lg font-bold text-[#e9edef]">TEC THA WhatsApp Chat</h3>
    <p className="text-xs text-[#8696a0] max-w-sm mt-1">
      Select a direct message or group conversation from the sidebar to start messaging in real-time.
    </p>
  </div>
);

export const EmptyConversationList = ({ onNewChat }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 bg-[#111b21]">
    <div className="w-12 h-12 rounded-full bg-[#202c33] border border-neutral-700/60 flex items-center justify-center text-[#8696a0]">
      <MessageSquare className="w-6 h-6" />
    </div>
    <h4 className="text-sm font-semibold text-[#e9edef]">No Conversations Yet</h4>
    <p className="text-xs text-[#8696a0] max-w-xs">
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
    <div className="w-10 h-10 rounded-full bg-[#005c4b]/30 text-[#25d366] flex items-center justify-center">
      <MessageSquare className="w-5 h-5" />
    </div>
    <p className="text-xs font-semibold text-[#e9edef]">No messages yet</p>
    <p className="text-xs text-[#8696a0]">Send a message to start the conversation!</p>
  </div>
);

export default { EmptyConversationSelection, EmptyConversationList, EmptyMessageHistory };
