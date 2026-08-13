import React, { useState, useEffect } from 'react';
import { Search, X, User, MessageSquare, Loader2 } from 'lucide-react';
import { userService } from '../../services/userService';
import Button from '../common/Button';

export const NewConversationModal = ({ isOpen, onClose, onSelectUser, currentUserId }) => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startingChatId, setStartingChatId] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUserList = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await userService.getChatDirectory({ search, limit: 50 });
        let list = [];
        if (Array.isArray(response)) {
          list = response;
        } else if (Array.isArray(response.data)) {
          list = response.data;
        } else if (response.data && Array.isArray(response.data.users)) {
          list = response.data.users;
        } else if (Array.isArray(response.users)) {
          list = response.users;
        }

        // The API serializes users with `id`; normalize once for this UI.
        const normalizedUsers = list.map((user) => ({ ...user, _id: user._id || user.id }));
        setUsers(normalizedUsers.filter((user) => user._id !== currentUserId));
      } catch (err) {
        setError(err.message || 'Failed to load employees');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchUserList, 300);
    return () => clearTimeout(timer);
  }, [isOpen, search, currentUserId]);

  if (!isOpen) return null;

  const handleStartChat = async (user) => {
    setStartingChatId(user._id);
    try {
      await onSelectUser(user._id);
      onClose();
    } catch (err) {
      setError(err.message || 'Could not start conversation');
    } finally {
      setStartingChatId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#0562ff]" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              New Direct Conversation
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-950/40">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search colleagues by name or email..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0562ff]"
              autoFocus
            />
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 font-medium">
            {error}
          </div>
        )}

        {/* Users List Container */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar min-h-[250px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-[#0562ff]" />
              <span className="text-xs">Loading workspace directory...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center p-4">
              <User className="w-8 h-8 text-slate-300 dark:text-neutral-700 mb-2" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                No matching colleagues found
              </p>
            </div>
          ) : (
            users.map((user) => (
              <button
                key={user._id}
                type="button"
                onClick={() => handleStartChat(user)}
                disabled={startingChatId === user._id}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800/80 transition-colors text-left group border border-transparent hover:border-slate-200 dark:hover:border-neutral-800"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0562ff] to-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {user.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {user.email} • <span className="capitalize">{user.role}</span>
                    </p>
                  </div>
                </div>

                <div className="shrink-0 ml-2">
                  {startingChatId === user._id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#0562ff]" />
                  ) : (
                    <span className="text-xs font-semibold text-[#0562ff] group-hover:underline">
                      Chat
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NewConversationModal;
