import React, { useState } from 'react';
import { Eye, ExternalLink, FileText, Image as ImageIcon, X, Download } from 'lucide-react';
import { formatFileSize, downloadFile } from '../../utils/chatUtils';

const getExtension = (fileName = '') => fileName.split('.').pop()?.toLowerCase();

export const AttachmentMessage = ({ attachment }) => {
  const [previewOpen, setPreviewOpen] = useState(false);

  if (!attachment) return null;

  const url = attachment.fileUrl || attachment.url;
  const fileName = attachment.fileName || attachment.originalName || 'Attachment File';
  const { fileSize } = attachment;
  const extension = getExtension(fileName);
  const isImage = attachment.fileType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension);
  const isPdf = attachment.fileType === 'application/pdf' || extension === 'pdf';
  const canUseDocumentViewer = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension) && !url?.startsWith('data:');

  if (!url) {
    return <p className="mt-2 text-xs text-rose-200">This attachment is unavailable.</p>;
  }

  const documentViewerUrl = canUseDocumentViewer
    ? `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`
    : null;

  const handleDownload = (e) => {
    e.stopPropagation();
    downloadFile(url, fileName);
  };

  return (
    <>
      <div className="mt-2">
        {isImage ? (
          <div className="group relative block overflow-hidden rounded-xl border border-white/20">
            <img
              src={url}
              alt={fileName}
              className="block w-full max-h-64 object-cover transition-transform duration-200 group-hover:scale-[1.02] cursor-pointer"
              onClick={() => setPreviewOpen(true)}
              loading="lazy"
            />
            {/* Hover overlay with Preview + Download buttons */}
            <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-xs transition-colors cursor-pointer"
                title={`Preview ${fileName}`}
              >
                <Eye className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-xs transition-colors cursor-pointer"
                title={`Download ${fileName}`}
              >
                <Download className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex w-full max-w-xs items-center gap-3 rounded-xl border border-white/20 bg-black/10 p-2.5 text-left">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{fileName}</p>
              <p className="text-[10px] opacity-75">{formatFileSize(fileSize)}</p>
            </div>
            {/* Action buttons: Preview & Download */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                title={`Preview ${fileName}`}
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                title={`Download ${fileName}`}
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Lightbox Preview */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Preview ${fileName}`}
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="flex h-[min(85vh,760px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl dark:bg-neutral-900"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-neutral-800">
              <div className="flex min-w-0 items-center gap-2 text-slate-900 dark:text-white">
                {isImage ? <ImageIcon className="h-5 w-5 text-[#0562ff]" /> : <FileText className="h-5 w-5 text-[#0562ff]" />}
                <span className="truncate text-sm font-semibold">{fileName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white bg-[#0562ff] hover:bg-blue-700 transition-colors cursor-pointer"
                  title="Download file"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#0562ff] dark:text-slate-300 dark:hover:bg-neutral-800"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-neutral-800 dark:hover:text-white cursor-pointer"
                  title="Close preview"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>

            <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-100 p-3 dark:bg-neutral-950">
              {isImage ? (
                <img src={url} alt={fileName} className="max-h-full max-w-full rounded-lg object-contain" />
              ) : isPdf ? (
                <iframe title={fileName} src={url} className="h-full w-full rounded-lg bg-white" />
              ) : documentViewerUrl ? (
                <iframe title={fileName} src={documentViewerUrl} className="h-full w-full rounded-lg bg-white" />
              ) : (
                <div className="max-w-md text-center text-slate-600 dark:text-slate-300">
                  <FileText className="mx-auto mb-3 h-12 w-12 text-[#0562ff]" />
                  <p className="font-semibold">A browser preview is not available for this file type.</p>
                  <div className="mt-3 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 text-sm font-semibold bg-[#0562ff] text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      <Download className="h-4 w-4" /> Download File
                    </button>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0562ff] hover:underline">
                      Open in new tab <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AttachmentMessage;

