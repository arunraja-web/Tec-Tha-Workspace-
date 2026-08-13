import React from 'react';
import { X, FileText, Image as ImageIcon } from 'lucide-react';
import { formatFileSize } from '../../utils/chatUtils';

export const AttachmentPreview = ({ file, onRemove, uploading = false }) => {
  if (!file) return null;

  const isImage = file.type?.startsWith('image/') || file.fileType?.startsWith('image/');

  return (
    <div className="flex items-center gap-3 p-2.5 bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl relative max-w-sm animate-in slide-in-from-bottom-2 duration-150">
      <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200/50 dark:border-indigo-800/50">
        {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
      </div>

      <div className="flex-1 min-w-0 pr-6">
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
          {file.name || file.originalName || 'Attachment'}
        </p>
        <p className="text-[11px] text-slate-400">
          {uploading ? 'Uploading...' : formatFileSize(file.size || file.fileSize)}
        </p>
      </div>

      {!uploading && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-500 rounded-full hover:bg-slate-200 dark:hover:bg-neutral-800 transition-colors"
          title="Remove attachment"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default AttachmentPreview;
