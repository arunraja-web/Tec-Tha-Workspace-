import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  fetchGroups,
  fetchGroupMembers,
  createGroup,
  updateGroup,
  updateGroupStatus,
  bulkAddGroupMembers,
  removeGroupMember,
  joinGroup,
  leaveGroup,
  clearGroupError,
  clearGroupSuccess,
} from '../../redux/slices/groupSlice';

import {
  Users,
  PlusCircle,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  Globe,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react';

import GroupCard from '../../components/groups/GroupCard';
import GroupModal from '../../components/groups/GroupModal';
import GroupMembersModal from '../../components/groups/GroupMembersModal';
import AddMembersModal from '../../components/groups/AddMembersModal';
import GroupDetailsModal from '../../components/groups/GroupDetailsModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export const AdminGroupsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const {
    groups,
    pagination,
    members,
    loading,
    membersLoading,
    actionLoading,
    error,
    actionSuccess,
  } = useSelector((state) => state.groups);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Modal States
  const [modalState, setModalState] = useState({
    createEdit: false,
    members: false,
    addMembers: false,
    details: false,
  });

  const [activeGroup, setActiveGroup] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ open: false, title: '', message: '', action: null });
  const [removingMemberId, setRemovingMemberId] = useState(null);

  // Show notification toast
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  // Load Groups
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

  useEffect(() => {
    if (actionSuccess) {
      showToast(actionSuccess, 'success');
      dispatch(clearGroupSuccess());
      loadGroups(page);
    }
  }, [actionSuccess, dispatch, loadGroups, page]);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
      dispatch(clearGroupError());
    }
  }, [error, dispatch]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Create & Edit Modal Openers
  const openCreateModal = () => {
    setActiveGroup(null);
    setModalState((prev) => ({ ...prev, createEdit: true }));
  };

  const openEditModal = (group) => {
    setActiveGroup(group);
    setModalState((prev) => ({ ...prev, createEdit: true }));
  };

  // Submit Create or Edit Group
  const handleSaveGroup = (data) => {
    if (activeGroup) {
      const groupId = activeGroup._id || activeGroup.id;
      dispatch(updateGroup({ id: groupId, data }))
        .unwrap()
        .then(() => {
          setModalState((prev) => ({ ...prev, createEdit: false }));
          setActiveGroup(null);
        });
    } else {
      dispatch(createGroup(data))
        .unwrap()
        .then(() => {
          setModalState((prev) => ({ ...prev, createEdit: false }));
        });
    }
  };

  // View Details
  const handleViewDetails = (group) => {
    setActiveGroup(group);
    const groupId = group._id || group.id;
    dispatch(fetchGroupMembers(groupId));
    setModalState((prev) => ({ ...prev, details: true }));
  };

  // Manage Members
  const handleManageMembers = (group) => {
    setActiveGroup(group);
    const groupId = group._id || group.id;
    dispatch(fetchGroupMembers(groupId));
    setModalState((prev) => ({ ...prev, members: true }));
  };

  // Open Add Members Modal from Members Modal
  const handleOpenAddMembers = () => {
    setModalState((prev) => ({ ...prev, addMembers: true }));
  };

  // Bulk Add Members Submit
  const handleAddMembersSubmit = (userIds) => {
    if (!activeGroup) return;
    const groupId = activeGroup._id || activeGroup.id;
    dispatch(bulkAddGroupMembers({ groupId, userIds }))
      .unwrap()
      .then((res) => {
        setModalState((prev) => ({ ...prev, addMembers: false }));
        dispatch(fetchGroupMembers(groupId));
        loadGroups(page);
      });
  };

  // Remove Member Confirm
  const handleRemoveMember = (member) => {
    if (!activeGroup) return;
    const groupId = activeGroup._id || activeGroup.id;
    const userId = member._id || member.id;

    setConfirmModal({
      open: true,
      title: 'Remove Member',
      message: `Are you sure you want to remove ${member.name} from '${activeGroup.name}'?`,
      action: () => {
        setRemovingMemberId(userId);
        dispatch(removeGroupMember({ groupId, userId }))
          .unwrap()
          .then(() => {
            dispatch(fetchGroupMembers(groupId));
            loadGroups(page);
          })
          .finally(() => {
            setRemovingMemberId(null);
          });
      },
    });
  };

  // Admin Join Group
  const handleJoinGroup = (group) => {
    const groupId = group._id || group.id;
    dispatch(joinGroup(groupId))
      .unwrap()
      .then(() => {
        loadGroups(page);
      });
  };

  // Admin Leave Group Confirm
  const handleLeaveGroup = (group) => {
    const groupId = group._id || group.id;
    setConfirmModal({
      open: true,
      title: 'Leave Group',
      message: `Are you sure you want to leave '${group.name}'?`,
      action: () => {
        dispatch(leaveGroup(groupId))
          .unwrap()
          .then(() => {
            loadGroups(page);
          });
      },
    });
  };

  // Toggle Group Status (Deactivate / Reactivate)
  const handleToggleStatus = (group) => {
    const groupId = group._id || group.id;
    const newStatus = !group.isActive;

    setConfirmModal({
      open: true,
      title: `${newStatus ? 'Reactivate' : 'Deactivate'} Group`,
      message: `Are you sure you want to ${newStatus ? 'reactivate' : 'deactivate'} '${group.name}'? ${
        !newStatus ? 'Members will no longer see this group in normal active group lists.' : ''
      }`,
      action: () => {
        dispatch(updateGroupStatus({ id: groupId, isActive: newStatus }))
          .unwrap()
          .then(() => {
            loadGroups(page);
          });
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative bg-slate-100 font-montserrat selection:bg-[#0562ff] selection:text-white">
      
      {/* Toast Alert */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-none shadow-2xl backdrop-blur-md border flex items-center gap-3 transition-all ${
            toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-emerald-900 text-white border-emerald-700'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-300" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-300" />
          )}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Sticky Top Navbar Header */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-md sticky top-0 z-40">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <img
                src="/logo1.webp"
                alt="TEC THA Workspace Logo"
                className="h-10 w-auto object-contain max-w-[160px]"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </Link>
            <div className="h-7 w-px bg-slate-200 hidden sm:block" />
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0562ff]" /> GROUP MANAGEMENT
              </h1>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                TEC THA Workspace • Admin Control Center
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <Link
              to="/admin/dashboard"
              className="px-3.5 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors"
            >
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="bg-[#0562ff] hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-[1500px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-grow">
        
        {/* Header Toolbar */}
        <div className="bg-white border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
              <Shield className="w-6 h-6 text-[#0562ff]" />
              Company Workspace Groups
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Create and configure organizational teams, manage membership rosters, and control group access.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => loadGroups(page)}
              disabled={loading}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Groups"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={openCreateModal}
              className="w-full sm:w-auto bg-[#0562ff] hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Create Group</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white border border-slate-200 p-4 shadow-sm">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search groups by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-50 text-slate-900 text-xs font-medium rounded-none border border-slate-300 focus:border-[#0562ff] focus:outline-none"
            />
          </div>
        </div>

        {/* Groups Grid / Empty State / Loading State */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 font-medium text-xs bg-white border border-slate-200 shadow-sm">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#0562ff] mb-3" />
            Loading company groups...
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-white border border-slate-200 p-12 text-center shadow-sm space-y-4 font-montserrat">
            <div className="w-14 h-14 rounded-none bg-blue-50 border border-blue-200 text-[#0562ff] flex items-center justify-center mx-auto">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {searchQuery ? 'No groups match your search criteria.' : 'No groups created yet.'}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {searchQuery ? 'Try adjusting your search query.' : 'Create your first company group to start organizing your team members.'}
              </p>
            </div>

            {!searchQuery && (
              <button
                type="button"
                onClick={openCreateModal}
                className="bg-[#0562ff] hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Create Group</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {groups.map((group) => (
              <GroupCard
                key={group._id || group.id}
                group={group}
                currentUser={user}
                onViewDetails={handleViewDetails}
                onEditGroup={openEditModal}
                onManageMembers={handleManageMembers}
                onJoinGroup={handleJoinGroup}
                onLeaveGroup={handleLeaveGroup}
                onToggleStatus={handleToggleStatus}
                loadingAction={actionLoading}
              />
            ))}
          </div>
        )}

        {/* Server-Side Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="bg-white border border-slate-200 px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-600 shadow-sm">
            <div>
              Showing <strong className="text-slate-900">{(pagination.page - 1) * pagination.limit + 1}</strong> to{' '}
              <strong className="text-slate-900">{Math.min(pagination.page * pagination.limit, pagination.totalGroups)}</strong> of{' '}
              <strong className="text-slate-900">{pagination.totalGroups}</strong> groups
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 font-bold text-slate-900">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Modals */}
      <GroupModal
        isOpen={modalState.createEdit}
        onClose={() => setModalState((prev) => ({ ...prev, createEdit: false }))}
        onSubmit={handleSaveGroup}
        initialData={activeGroup}
        submitting={actionLoading}
      />

      <GroupMembersModal
        isOpen={modalState.members}
        onClose={() => setModalState((prev) => ({ ...prev, members: false }))}
        group={activeGroup}
        members={members}
        currentUser={user}
        onOpenAddMembers={handleOpenAddMembers}
        onRemoveMember={handleRemoveMember}
        loading={membersLoading}
        removingId={removingMemberId}
      />

      <AddMembersModal
        isOpen={modalState.addMembers}
        onClose={() => setModalState((prev) => ({ ...prev, addMembers: false }))}
        onAddMembers={handleAddMembersSubmit}
        currentMemberIds={members.map((m) => m._id || m.id)}
        submitting={actionLoading}
      />

      <GroupDetailsModal
        isOpen={modalState.details}
        onClose={() => setModalState((prev) => ({ ...prev, details: false }))}
        group={activeGroup}
        members={members}
        loadingMembers={membersLoading}
      />

      <ConfirmDialog
        isOpen={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={() => {
          if (confirmModal.action) confirmModal.action();
          setConfirmModal({ open: false, title: '', message: '', action: null });
        }}
        onCancel={() => setConfirmModal({ open: false, title: '', message: '', action: null })}
      />

      {/* Footer */}
      <footer className="relative z-10 w-full text-center py-5 text-xs text-slate-500 font-medium space-y-1 border-t border-slate-200 bg-white mt-auto">
        <div>
          © {new Date().getFullYear()}, TEC THA Workspace Pvt. Ltd. All Rights Reserved.
        </div>
      </footer>

    </div>
  );
};

export default AdminGroupsPage;
