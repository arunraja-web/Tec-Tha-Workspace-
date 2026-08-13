import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  fetchGroups,
  fetchGroupMembers,
} from '../../redux/slices/groupSlice';

import {
  Crown,
  Users,
  Search,
  RefreshCw,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

import GroupCard from '../../components/groups/GroupCard';
import GroupDetailsModal from '../../components/groups/GroupDetailsModal';

export const FounderGroupsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const {
    groups,
    pagination,
    members,
    loading,
    membersLoading,
  } = useSelector((state) => state.groups);

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);

  const loadGroups = useCallback((targetPage = page) => {
    dispatch(fetchGroups({ search: searchQuery, page: targetPage, limit: 12 }));
  }, [dispatch, searchQuery, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadGroups(1);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleViewDetails = (group) => {
    setActiveGroup(group);
    const groupId = group._id || group.id;
    dispatch(fetchGroupMembers(groupId));
    setDetailsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-montserrat selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
      <div className="max-w-6xl mx-auto space-y-8 w-full">
        
        {/* Header Bar */}
        <div className="glass-card rounded-3xl p-6 md:p-8 border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Crown className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">All Company Groups</h1>
                <span className="bg-amber-950/80 text-amber-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Role: Founder
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Executive view of all active company workspace groups and automatic membership rosters.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/founder/dashboard"
              className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl transition-colors"
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 text-xs font-bold bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/30 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Search & Info Banner */}
        <div className="glass-card rounded-2xl p-5 border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search groups by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-900/90 text-white text-xs font-medium rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Automatic Founder Membership Active</span>
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs font-medium glass-card rounded-2xl border-slate-800">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-400 mb-3" />
            Loading active groups...
          </div>
        ) : groups.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center border-slate-800 space-y-3">
            <Users className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">
              {searchQuery ? 'No groups match your search.' : 'No active groups available.'}
            </h3>
            <p className="text-xs text-slate-400">
              {searchQuery ? 'Try clearing your search keyword.' : 'Groups created by Administrators will automatically include you.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {groups.map((group) => (
              <GroupCard
                key={group._id || group.id}
                group={group}
                currentUser={user}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="glass-card rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-400 border-slate-800">
            <div>
              Showing <strong className="text-white">{(pagination.page - 1) * pagination.limit + 1}</strong> to{' '}
              <strong className="text-white">{Math.min(pagination.page * pagination.limit, pagination.totalGroups)}</strong> of{' '}
              <strong className="text-white">{pagination.totalGroups}</strong> active groups
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 rounded-lg cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 font-bold text-white">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 rounded-lg cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      <GroupDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        group={activeGroup}
        members={members}
        loadingMembers={membersLoading}
      />
    </div>
  );
};

export default FounderGroupsPage;
