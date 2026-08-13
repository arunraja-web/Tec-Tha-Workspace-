import React, { useState } from 'react';
import { Send, Edit2, Trash2, Check, X, MessageSquare, User } from 'lucide-react';

export const TaskComments = ({
  comments = [],
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  currentUser,
  loading = false,
}) => {
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (onAddComment) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  const handleStartEdit = (comment) => {
    setEditingCommentId(comment.id || comment._id);
    setEditText(comment.text || comment.content || '');
  };

  const handleSaveEdit = (commentId) => {
    if (!editText.trim()) return;
    if (onUpdateComment) {
      onUpdateComment(commentId, editText.trim());
      setEditingCommentId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 font-montserrat">
      {/* Add Comment Form */}
      <form onSubmit={handleAdd} className="space-y-2">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Add Comment
        </label>
        <div className="flex gap-2">
          <textarea
            rows={2}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Type your comment or update..."
            className="flex-grow p-3 bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:border-[#0562ff] rounded-none"
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="px-4 bg-[#0562ff] hover:bg-blue-700 text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Post</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
          <MessageSquare className="w-4 h-4 text-[#0562ff]" />
          <span>Comments ({comments.length})</span>
        </div>

        {comments.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm italic border border-dashed border-slate-200">
            No comments yet. Be the first to share an update!
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => {
              const commentId = c.id || c._id;
              const author = c.author || c.user || {};
              const authorName = author.name || 'User';
              const isOwn =
                currentUser &&
                (author.id === currentUser._id || author._id === currentUser._id || author.id === currentUser.id);
              const canModify = isOwn || currentUser?.role === 'admin' || currentUser?.role === 'founder';

              return (
                <div
                  key={commentId}
                  className="bg-slate-50 border border-slate-200 p-4 transition-colors hover:border-slate-300"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-[#0562ff] text-white flex items-center justify-center font-bold text-xs">
                        {authorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900">{authorName}</span>
                        <span className="text-[11px] text-slate-500 ml-2">
                          {formatDate(c.createdAt)}
                        </span>
                      </div>
                    </div>

                    {canModify && editingCommentId !== commentId && (
                      <div className="flex items-center gap-1 text-slate-400">
                        {isOwn && (
                          <button
                            onClick={() => handleStartEdit(c)}
                            className="p-1 hover:text-[#0562ff] transition-colors cursor-pointer"
                            title="Edit Comment"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteComment && onDeleteComment(commentId)}
                          className="p-1 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {editingCommentId === commentId ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        rows={2}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 text-sm focus:outline-none focus:border-[#0562ff]"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingCommentId(null)}
                          className="px-2.5 py-1 text-xs border border-slate-300 text-slate-600 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(commentId)}
                          className="px-2.5 py-1 text-xs bg-[#0562ff] text-white font-semibold hover:bg-blue-700"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                      {c.text || c.content}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskComments;
