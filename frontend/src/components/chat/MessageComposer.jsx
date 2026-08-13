import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Check, Loader2 } from 'lucide-react';
import chatService from '../../services/chatService';
import AttachmentPreview from './AttachmentPreview';

export const MessageComposer = ({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  editingMessage = null,
  onCancelEdit,
  onSaveEdit,
  disabled = false,
}) => {
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [uploadedAttachment, setUploadedAttachment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Populate input if editing a message
  useEffect(() => {
    if (editingMessage) {
      setContent(editingMessage.content || '');
    } else {
      setContent('');
    }
  }, [editingMessage]);

  // Clean typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleTextChange = (e) => {
    const value = e.target.value;
    setContent(value);

    if (disabled || editingMessage) return;

    // Trigger typing indicator with debounce
    if (onTypingStart) {
      onTypingStart();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (onTypingStop) {
        onTypingStop();
      }
    }, 2000);
  };

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setUploadError(null);

    // Client-side file size check (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB limit.');
      return;
    }

    setFile(selectedFile);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await chatService.uploadMessageAttachment(formData);
      const attachmentData = response.data || response.attachment || response;

      setUploadedAttachment(attachmentData);
    } catch (err) {
      setUploadError(err.message || 'Failed to upload attachment.');
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAttachment = () => {
    setFile(null);
    setUploadedAttachment(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (disabled || uploading) return;

    if (editingMessage) {
      if (!content.trim()) return;
      onSaveEdit(editingMessage._id, content.trim());
      setContent('');
      return;
    }

    if (!content.trim() && !uploadedAttachment) return;

    const payload = {
      content: content.trim(),
      attachment: uploadedAttachment || null,
      messageType: uploadedAttachment ? 'file' : 'text',
    };

    onSendMessage(payload);

    // Reset input
    setContent('');
    setFile(null);
    setUploadedAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (onTypingStop) {
      onTypingStop();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-slate-200 dark:border-neutral-800 bg-white dark:bg-[#202c33] p-3 sm:p-4 space-y-2">
      {/* Editing State Banner */}
      {editingMessage && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg text-xs text-amber-800 dark:text-amber-300">
          <span>Editing message</span>
          <button
            type="button"
            onClick={onCancelEdit}
            className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900 rounded-md font-semibold"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Attachment Preview Bar */}
      {file && (
        <AttachmentPreview
          file={file}
          onRemove={handleRemoveAttachment}
          uploading={uploading}
        />
      )}

      {/* Error Message */}
      {uploadError && (
        <p className="text-xs text-rose-500 font-medium px-1">{uploadError}</p>
      )}

      {/* Main Composer Form */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading || !!editingMessage}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
        />

        {/* Paperclip Attachment Button */}
        {!editingMessage && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="p-2.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2a3942] rounded-xl transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
        )}

        {/* Text Input Area */}
        <div className="flex-1 relative">
          <textarea
            value={content}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={
              editingMessage
                ? 'Edit your message...'
                : 'Type a message... (Shift+Enter for newline)'
            }
            rows={1}
            className="w-full resize-none py-2.5 px-4 rounded-2xl bg-slate-100 dark:bg-[#2a3942] border border-slate-200 dark:border-neutral-700/60 text-xs sm:text-sm text-slate-900 dark:text-[#e9edef] placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#005c4b] dark:focus:ring-[#008069] max-h-32 min-h-[42px]"
          />
        </div>

        {/* Send / Save Button */}
        <button
          type="submit"
          disabled={disabled || uploading || (!content.trim() && !uploadedAttachment)}
          className="p-2.5 bg-[#005c4b] hover:bg-[#008069] text-white rounded-2xl shadow-sm transition-all disabled:opacity-40 disabled:hover:bg-[#005c4b] shrink-0 cursor-pointer"
          title={editingMessage ? 'Save edit' : 'Send message'}
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : editingMessage ? (
            <Check className="w-5 h-5" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageComposer;
