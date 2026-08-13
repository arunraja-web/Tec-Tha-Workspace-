import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  fetchMyGroups,
  fetchGroupMembers,
} from '../../redux/slices/groupSlice';

import {
  Users,
  UserCheck,
  Search,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Info
} from 'lucide-react';

import GroupCard from '../../components/groups/GroupCard';
import GroupDetailsModal from '../../components/groups/GroupDetailsModal';

export const EmployeeMyGroupsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const {
    myGroups,
    myGroupsLoading,
    members,
    membersLoading,
  } = useSelector((state) => state.groups);

  const [searchQuery, setSearchQuery] = useState('');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);

  useEffect(() => {
    dispatch(fetchMyGroups());
  }, [dispatch]);

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

  const filteredGroups = myGroups.filter((group) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      group.name?.toLowerCase().includes(q) ||
      group.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-montserrat selection:bg-indigo-500 selection:text-white flex flex-col justify-between">
      <div className="max-w-6xl mx-auto space-y-8 w-full">
        
        {/* Header Bar */}
        <div className="glass-card rounded-3xl p-6 md:p-8 border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">My Groups</h1>
                <span className="bg-emerald-950/80 text-emerald-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Role: Employee
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                View your assigned company groups, team members, and group details.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/employee/dashboard"
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

        {/* Search Bar */}
        <div className="glass-card rounded-2xl p-5 border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search my groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-900/90 text-white text-xs font-medium rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => dispatch(fetchMyGroups())}
            disabled={myGroupsLoading}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh My Groups"
          >
            <RefreshCw className={`w-4 h-4 ${myGroupsLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Groups Grid / Empty State */}
        {myGroupsLoading ? (
          <div className="py-20 text-center text-slate-400 text-xs font-medium glass-card rounded-2xl border-slate-800">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-400 mb-3" />
            Loading your assigned groups...
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center border-slate-800 space-y-3">
            <Users className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">
              {searchQuery ? 'No matching groups found.' : "You haven't been added to any groups yet."}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {searchQuery
                ? 'Try adjusting your search query.'
                : 'System Administrators add employees to company groups. Once added, your groups will appear here.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group._id || group.id}
                group={group}
                currentUser={user}
                onViewDetails={handleViewDetails}
              />
            ))}
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

export default EmployeeMyGroupsPage;
