import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  fetchTasks,
  fetchTaskById,
  createTaskThunk,
  updateTaskThunk,
  assignTaskThunk,
  updateStatusThunk,
  updateProgressThunk,
  completeTaskThunk,
  reopenTaskThunk,
  cancelTaskThunk,
  archiveTaskThunk,
  restoreTaskThunk,
  duplicateTaskThunk,
  fetchTaskComments,
  addCommentThunk,
  updateCommentThunk,
  deleteCommentThunk,
  uploadAttachmentThunk,
  deleteAttachmentThunk,
  fetchSubtasks,
  createSubtaskThunk,
  updateSubtaskStatusThunk,
  deleteSubtaskThunk,
  fetchTaskHistory,
  fetchCompanyAnalytics,
  fetchEmployeeAnalytics,
  setFilters,
  resetFilters,
  setPage,
  clearTaskError,
  clearTaskSuccess,
} from '../../redux/slices/taskSlice';

import { userService } from '../../services/userService';
import { groupService } from '../../services/groupService';

import TaskList from '../../components/tasks/TaskList';
import TaskSearch from '../../components/tasks/TaskSearch';
import TaskFilters from '../../components/tasks/TaskFilters';
import TaskFormModal from '../../components/tasks/TaskFormModal';
import TaskDetailsModal from '../../components/tasks/TaskDetailsModal';
import TaskAnalyticsWidget from '../../components/tasks/TaskAnalyticsWidget';
import TaskSkeleton from '../../components/tasks/TaskSkeleton';
import TaskEmptyState from '../../components/tasks/TaskEmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

import {
  Crown,
  PlusCircle,
  BarChart3,
  LogOut,
  Users,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

export const FounderTasksPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const {
    tasks,
    pagination,
    filters,
    selectedTask,
    comments,
    attachments,
    subtasks,
    taskHistory,
    analytics,
    employeeAnalytics,
    loading,
    actionLoading,
    analyticsLoading,
    error,
    successMessage,
  } = useSelector((state) => state.tasks);

  // Local States
  const [employees, setEmployees] = useState([]);
  const [groups, setGroups] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  // Load Employees and Groups
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const usersRes = await userService.getUsers({ limit: 100 });
        const allUsers = usersRes.data?.users || usersRes.users || [];
        setEmployees(allUsers.filter((u) => u.role === 'employee' || u.role === 'admin' || u.role === 'founder'));

        const groupsRes = await groupService.getGroups({ limit: 100 });
        setGroups(groupsRes.data?.groups || groupsRes.groups || []);
      } catch (err) {
        console.error('Failed to load dropdown users/groups:', err);
      }
    };
    loadDropdownData();
  }, []);

  // Fetch Tasks with filters & pagination
  const loadTasks = useCallback(() => {
    dispatch(
      fetchTasks({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      })
    );
  }, [dispatch, pagination.page, pagination.limit, filters]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Load Analytics if toggle enabled
  useEffect(() => {
    if (showAnalytics) {
      dispatch(fetchCompanyAnalytics());
      dispatch(fetchEmployeeAnalytics());
    }
  }, [dispatch, showAnalytics]);

  // Auto-dismiss alert notifications
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearTaskError());
        dispatch(clearTaskSuccess());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, dispatch]);

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setShowCreateModal(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setShowCreateModal(true);
  };

  const handleOpenDetails = (task) => {
    const taskId = task.id || task._id;
    dispatch(fetchTaskById(taskId));
    dispatch(fetchTaskComments(taskId));
    dispatch(fetchSubtasks(taskId));
    dispatch(fetchTaskHistory(taskId));
    setShowDetailsModal(true);
  };

  const handleCreateOrUpdateSubmit = async (formData) => {
    if (editingTask) {
      const taskId = editingTask.id || editingTask._id;
      await dispatch(updateTaskThunk({ id: taskId, data: formData }));
    } else {
      await dispatch(createTaskThunk(formData));
    }
    setShowCreateModal(false);
    loadTasks();
  };

  const handleArchiveToggle = async (task) => {
    const taskId = task.id || task._id;
    if (task.isArchived) {
      await dispatch(restoreTaskThunk(taskId));
    } else {
      await dispatch(archiveTaskThunk(taskId));
    }
    loadTasks();
  };

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
  };

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  const confirmSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative bg-slate-100 font-montserrat selection:bg-[#0562ff] selection:text-white">
      {/* Background SVG */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg">
          <rect width="1600" height="900" fill="#f4f5f7" />
          <polygon points="0,0 650,0 250,900 0,900" fill="#eceef1" />
          <polygon points="700,0 1000,0 500,900 300,900" fill="#e6e9ed" />
          <polygon points="1600,0 1600,300 900,900 700,900" fill="#eceef1" />
        </svg>
      </div>

      {/* Header */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-md sticky top-0 z-40">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/founder/dashboard" className="flex items-center gap-2">
              <img
                src="/logo1.webp"
                alt="TEC THA Workspace Logo"
                className="h-10 w-auto object-contain max-w-[160px]"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </Link>
            <div className="h-7 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-lg sm:text-xl font-bold font-montserrat text-slate-900 leading-tight">
                  EXECUTIVE TASK MANAGEMENT
                </h1>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  TEC THA Executive Operations & Strategic Task Oversight
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-none">
              <div className="w-8 h-8 rounded-none bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'F'}
              </div>
              <div className="text-left text-sm">
                <div className="font-semibold text-slate-900 leading-none">{user?.name || 'Founder User'}</div>
                <div className="text-xs text-slate-500 font-medium max-w-[150px] truncate">{user?.email || 'founder@tectha.com'}</div>
              </div>
            </div>

            <Link
              to="/founder/dashboard"
              className="p-2.5 text-slate-700 hover:text-[#0562ff] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-none transition-colors text-sm font-semibold flex items-center gap-2"
              title="Dashboard"
            >
              <Crown className="w-4.5 h-4.5 text-amber-500" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>

            <button
              onClick={() => setShowSignOutConfirm(true)}
              className="bg-[#0562ff] hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-none shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4.5 h-4.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <div className="relative z-10 w-full flex-grow flex flex-col">
        <main className="max-w-[1500px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 flex-grow">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
              <button onClick={() => dispatch(clearTaskError())} className="text-rose-500 hover:text-rose-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
              <button onClick={() => dispatch(clearTaskSuccess())} className="text-emerald-500 hover:text-emerald-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 shadow-xs">
            <TaskSearch
              value={filters.search}
              onChange={(val) => handleFilterChange({ search: val })}
              placeholder="Search executive tasks..."
            />

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2.5 border transition-colors cursor-pointer ${
                  showAnalytics
                    ? 'bg-[#0562ff] text-white border-[#0562ff]'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>{showAnalytics ? 'Hide Executive Analytics' : 'Executive Analytics'}</span>
              </button>

              <button
                onClick={handleOpenCreateModal}
                className="flex items-center gap-2 bg-[#0562ff] hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-none shadow-xs transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Task</span>
              </button>
            </div>
          </div>

          {showAnalytics && (
            <TaskAnalyticsWidget
              analytics={analytics}
              employeeAnalytics={employeeAnalytics}
              onDateFilterApply={(range) => {
                dispatch(fetchCompanyAnalytics(range));
                dispatch(fetchEmployeeAnalytics(range));
              }}
              loading={analyticsLoading}
            />
          )}

          <TaskFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            employees={employees}
            groups={groups}
            showAdminFilters={true}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {loading ? (
            <TaskSkeleton count={6} />
          ) : tasks.length === 0 ? (
            <TaskEmptyState
              title="No executive tasks found"
              message="No tasks found matching your filter parameters."
              canCreate={true}
              onCreateTask={handleOpenCreateModal}
            />
          ) : (
            <>
              <TaskList
                tasks={tasks}
                viewMode={viewMode}
                onViewDetails={handleOpenDetails}
                onEdit={handleOpenEditModal}
                onArchiveToggle={handleArchiveToggle}
                canManage={true}
              />

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between bg-white border border-slate-200 px-4 py-3 shadow-xs text-xs font-semibold text-slate-700">
                  <span>
                    Showing Page {pagination.page} of {pagination.totalPages} ({pagination.totalTasks} Total Tasks)
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="p-1.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="p-1.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>

        <footer className="relative z-10 w-full text-center py-5 text-sm text-slate-500 font-medium space-y-1 border-t border-slate-200/80 bg-white/60 backdrop-blur-xs mt-auto">
          <div>© {new Date().getFullYear()}, TEC THA Workspace Pvt. Ltd. All Rights Reserved.</div>
        </footer>
      </div>

      {showCreateModal && (
        <TaskFormModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateOrUpdateSubmit}
          initialData={editingTask}
          employees={employees}
          groups={groups}
          loading={actionLoading}
        />
      )}

      {showDetailsModal && selectedTask && (
        <TaskDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          task={selectedTask}
          currentUser={user}
          comments={comments}
          attachments={attachments}
          subtasks={subtasks}
          history={taskHistory}
          employees={employees}
          onUpdateStatus={async (id, st) => { await dispatch(updateStatusThunk({ id, status: st })); loadTasks(); }}
          onUpdateProgress={async (id, pr) => { await dispatch(updateProgressThunk({ id, progress: pr })); loadTasks(); }}
          onComplete={async (id) => { await dispatch(completeTaskThunk(id)); loadTasks(); }}
          onReopen={async (id) => { await dispatch(reopenTaskThunk(id)); loadTasks(); }}
          onCancel={async (id, rs) => { await dispatch(cancelTaskThunk({ id, reason: rs })); loadTasks(); }}
          onArchiveToggle={handleArchiveToggle}
          onDuplicate={async (id) => { await dispatch(duplicateTaskThunk(id)); loadTasks(); }}
          onReassign={async (id, emp) => { await dispatch(assignTaskThunk({ id, assignedTo: emp })); loadTasks(); }}
          onAddComment={async (id, txt) => { await dispatch(addCommentThunk({ id, text: txt })); }}
          onUpdateComment={async (tId, cId, txt) => { await dispatch(updateCommentThunk({ taskId: tId, commentId: cId, text: txt })); }}
          onDeleteComment={async (tId, cId) => { await dispatch(deleteCommentThunk({ taskId: tId, commentId: cId })); }}
          onUploadAttachment={async (id, fd) => { await dispatch(uploadAttachmentThunk({ id, formData: fd })); await dispatch(fetchTaskById(id)); }}
          onDeleteAttachment={async (tId, aId) => { await dispatch(deleteAttachmentThunk({ taskId: tId, attachmentId: aId })); await dispatch(fetchTaskById(tId)); }}
          onCreateSubtask={async (id, data) => { await dispatch(createSubtaskThunk({ id, data })); }}
          onUpdateSubtaskStatus={async (tId, sId, data) => { await dispatch(updateSubtaskStatusThunk({ taskId: tId, subtaskId: sId, data })); }}
          onDeleteSubtask={async (tId, sId) => { await dispatch(deleteSubtaskThunk({ taskId: tId, subtaskId: sId })); }}
          actionLoading={actionLoading}
        />
      )}

      <ConfirmDialog
        isOpen={showSignOutConfirm}
        title="Confirm Sign Out"
        message="Are you sure you want to sign out of TEC THA Workspace?"
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        variant="rose"
        icon={LogOut}
        onConfirm={confirmSignOut}
        onCancel={() => setShowSignOutConfirm(false)}
      />
    </div>
  );
};

export default FounderTasksPage;
