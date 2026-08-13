import React, { useRef, useState } from 'react';
import { Paperclip, Upload, Trash2, ExternalLink, FileText, Image as ImageIcon, FileSpreadsheet, FileCode } from 'lucide-react';

export const TaskAttachments = ({
  attachments = [],
  onUpload,
  onDelete,
  currentUser,
  loading = false,
}) => {
  const fileInputRef = useRef(null);
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit: 10MB = 10 * 1024 * 1024 bytes
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB limit.');
      return;
    }

    setUploadError('');
    const formData = new FormData();
    formData.append('file', file);

    if (onUpload) {
      onUpload(formData);
    }
    // reset input
    e.target.value = '';
  };

  const getFileIcon = (fileType, fileName = '') => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext) || fileType?.includes('image')) {
      return <ImageIcon className="w-5 h-5 text-emerald-600" />;
    }
    if (['xls', 'xlsx', 'csv'].includes(ext) || fileType?.includes('excel') || fileType?.includes('spreadsheet')) {
      return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
    }
    if (['pdf', 'doc', 'docx'].includes(ext) || fileType?.includes('pdf') || fileType?.includes('word')) {
      return <FileText className="w-5 h-5 text-blue-600" />;
    }
    return <FileCode className="w-5 h-5 text-slate-500" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 font-montserrat">
      {/* Upload Header */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Paperclip className="w-4 h-4 text-[#0562ff]" />
          <span>Task Attachments ({attachments.length})</span>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="*/*"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="flex items-center gap-1.5 bg-[#0562ff] hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-none shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{loading ? 'Uploading...' : 'Upload File'}</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
          {uploadError}
        </div>
      )}

      {/* Attachments List */}
      {attachments.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm italic border border-dashed border-slate-200">
          No attachments uploaded yet. Supports PDF, DOC, XLS, PNG, JPG, ZIP (Max 10MB).
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {attachments.map((att) => {
            const attachmentId = att.id || att._id;
            const uploaderId = typeof att.uploadedBy === 'object' ? (att.uploadedBy?._id || att.uploadedBy?.id) : att.uploadedBy;
            const currentUserId = currentUser?._id || currentUser?.id;
            const isUploader = currentUserId && uploaderId && (String(uploaderId) === String(currentUserId));
            const canDelete = isUploader || currentUser?.role === 'admin' || currentUser?.role === 'founder';

            return (
              <div
                key={attachmentId}
                className="bg-slate-50 border border-slate-200 p-3.5 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {getFileIcon(att.fileType, att.fileName || att.name)}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate" title={att.fileName || att.name}>
                      {att.fileName || att.name || 'Attachment'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {formatFileSize(att.fileSize)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={att.fileUrl || att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-600 hover:text-[#0562ff] hover:bg-slate-200/60 transition-colors"
                    title="Open Attachment"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {canDelete && (
                    <button
                      onClick={() => onDelete && onDelete(attachmentId)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                      title="Delete Attachment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskAttachments;
