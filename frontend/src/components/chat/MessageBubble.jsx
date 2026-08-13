import React, { useState } from 'react';
import { MoreVertical, Edit2, Trash2, Check, CheckCheck } from 'lucide-react';
import { formatChatTime, getSenderColor } from '../../utils/chatUtils';
import AttachmentMessage from './AttachmentMessage';

export const MessageBubble = ({
  message,
  isOwn = false,
  showSender = false,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  if (!message) return null;

  const senderName =
    typeof message.sender === 'object'
      ? message.sender.name || 'User'
      : 'User';

  const isDeleted = message.isDeleted;
  const isEdited = message.isEdited;

  return (
    <div
      className={`flex flex-col group relative my-1 ${
        isOwn ? 'items-end' : 'items-start'
      }`}
    >
      <div className={`flex items-end gap-1.5 max-w-[85%] sm:max-w-[75%] md:max-w-[65%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Actions Menu for Own Message (Desktop Hover / Toggle) */}
        {isOwn && !isDeleted && (
          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-neutral-800 cursor-pointer"
              title="Message options"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 bottom-full mb-1 w-32 bg-white dark:bg-[#202c33] border border-slate-200 dark:border-neutral-700 rounded-xl shadow-lg z-20 py-1 text-xs"
                onMouseLeave={() => setShowMenu(false)}
              >
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(message);
                    }}
                    className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-indigo-500" />
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(message);
                    }}
                    className="w-full px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Message Bubble Container */}
        <div
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm leading-relaxed shadow-xs relative break-words transition-all ${
            isOwn
              ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-xs shadow-sm'
              : 'bg-[#202c33] text-[#e9edef] border-none rounded-tl-xs shadow-xs'
          } ${isDeleted ? 'italic text-[#8696a0] bg-[#111b21] border-dashed border-neutral-700' : ''}`}
        >
          {/* Colored Sender Name for Group Chats (Opponent Messages) */}
          {showSender && !isOwn && !isDeleted && (
            <span
              className="text-[12px] font-bold mb-1 block truncate select-none"
              style={{ color: getSenderColor(senderName) }}
            >
              {senderName}
            </span>
          )}

          {/* Main Content */}
          {isDeleted ? (
            <span className="text-[#8696a0]">This message was deleted.</span>
          ) : (
            <>
              {message.content && <div className="whitespace-pre-wrap">{message.content}</div>}

              {/* File Attachment */}
              {message.attachment && (
                <AttachmentMessage attachment={message.attachment} />
              )}
            </>
          )}

          {/* Footer Metadata (Timestamp + Edited + Read Checkmarks) */}
          <div
            className="flex items-center justify-end gap-1.5 mt-1 text-[10px] select-none text-[#8696a0]"
          >
            {isEdited && !isDeleted && (
              <span className="italic opacity-80">(edited)</span>
            )}

            <span>{formatChatTime(message.createdAt)}</span>

            {isOwn && !isDeleted && (
              <span title="Delivered">
                <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] inline opacity-90" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;

