import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  fetchMyTasks,
  fetchTaskById,
  updateStatusThunk,
  updateProgressThunk,
  fetchTaskComments,
  addCommentThunk,
  updateCommentThunk,
  deleteCommentThunk,
  uploadAttachmentThunk,
  deleteAttachmentThunk,
  fetchSubtasks,
  updateSubtaskStatusThunk,
  fetchTaskHistory,
  fetchMyAnalytics,
  setFilters,
  resetFilters,
  setPage,
  clearTaskError,
  clearTaskSuccess,
} from '../../redux/slices/taskSlice';

import { groupService } from '../../services/groupService';

import TaskList from '../../components/tasks/TaskList';
import TaskSearch from '../../components/tasks/TaskSearch';
import TaskFilters from '../../components/tasks/TaskFilters';
import TaskDetailsModal from '../../components/tasks/TaskDetailsModal';
import TaskSkeleton from '../../components/tasks/TaskSkeleton';
import TaskEmptyState from '../../components/tasks/TaskEmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

import {
  ListTodo,
  LogOut,
  User,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';

export const EmployeeMyTasksPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const {
    myTasks,
    pagination,
    filters,
    selectedTask,
    comments,
    attachments,
    subtasks,
    taskHistory,
    myAnalytics,
    loading,
    actionLoading,
    error,
    successMessage,
  } = useSelector((state) => state.tasks);

  // Local States
  const [groups, setGroups] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  // Load Groups for filtering
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const groupsRes = await groupService.getMyGroups();
        setGroups(groupsRes.data?.groups || groupsRes.groups || []);
      } catch (err) {
        console.error('Failed to load my groups:', err);
      }
    };
    loadGroups();
    dispatch(fetchMyAnalytics());
  }, [dispatch]);

  // Fetch Assigned Tasks
  const loadTasks = useCallback(() => {
    dispatch(
      fetchMyTasks({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      })
    );
  }, [dispatch, pagination.page, pagination.limit, filters]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Auto dismiss notifications
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearTaskError());
        dispatch(clearTaskSuccess());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, dispatch]);

  const handleOpenDetails = (task) => {
    const taskId = task.id || task._id;
    dispatch(fetchTaskById(taskId));
    dispatch(fetchTaskComments(taskId));
    dispatch(fetchSubtasks(taskId));
    dispatch(fetchTaskHistory(taskId));
    setShowDetailsModal(true);
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

  const analyticsData = myAnalytics || {};

  return (
    <div className="min-h-screen flex flex-col justify-between relative bg-slate-100 font-montserrat selection:bg-[#0562ff] selection:text-white">
      {/* Background Panel SVG */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg">
          <rect width="1600" height="900" fill="#f4f5f7" />
          <polygon points="0,0 650,0 250,900 0,900" fill="#eceef1" />
          <polygon points="700,0 1000,0 500,900 300,900" fill="#e6e9ed" />
          <polygon points="1600,0 1600,300 900,900 700,900" fill="#eceef1" />
        </svg>
      </div>

      {/* Sticky Header Navbar */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-md sticky top-0 z-40">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/employee/dashboard" className="flex items-center gap-2">
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
                  MY TASKS
                </h1>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  Personal Task Queue & Submission Workspace
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-none">
              <div className="w-8 h-8 rounded-none bg-[#0562ff] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'E'}
              </div>
              <div className="text-left text-sm">
                <div className="font-semibold text-slate-900 leading-none">{user?.name || 'Employee'}</div>
                <div className="text-xs text-slate-500 font-medium max-w-[150px] truncate">{user?.email || 'employee@tectha.com'}</div>
              </div>
            </div>

            <Link
              to="/employee/dashboard"
              className="p-2.5 text-slate-700 hover:text-[#0562ff] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-none transition-colors text-sm font-semibold flex items-center gap-2"
              title="Dashboard"
            >
              <User className="w-4.5 h-4.5 text-[#0562ff]" />
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

      {/* Main Content */}
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

          {/* Personal Task Performance Metrics Banner */}
          <div className="bg-white border border-slate-200 p-5 shadow-xs grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Total Assigned</span>
              <span className="text-2xl font-extrabold text-slate-900">{analyticsData.totalTasks || myTasks.length}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-[#0562ff] uppercase block mb-1">In Progress</span>
              <span className="text-2xl font-extrabold text-[#0562ff]">{analyticsData.inProgress || 0}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase block mb-1">In Review</span>
              <span className="text-2xl font-extrabold text-amber-600">{analyticsData.inReview || 0}</span>
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase block mb-1">Completed</span>
              <span className="text-2xl font-extrabold text-emerald-600">{analyticsData.completed || 0}</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-xs font-bold text-rose-600 uppercase block mb-1">Overdue</span>
              <span className="text-2xl font-extrabold text-rose-600">{analyticsData.overdue || 0}</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white border border-slate-200 p-4 shadow-xs">
            <TaskSearch
              value={filters.search}
              onChange={(val) => handleFilterChange({ search: val })}
              placeholder="Search your assigned tasks..."
            />
          </div>

          {/* Filters Bar */}
          <TaskFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            groups={groups}
            showAdminFilters={false}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Task Grid/Table */}
          {loading ? (
            <TaskSkeleton count={6} />
          ) : myTasks.length === 0 ? (
            <TaskEmptyState
              title="No assigned tasks"
              message="You currently do not have any active tasks matching your filter criteria."
              canCreate={false}
            />
          ) : (
            <>
              <TaskList
                tasks={myTasks}
                viewMode={viewMode}
                onViewDetails={handleOpenDetails}
                canManage={false}
              />

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between bg-white border border-slate-200 px-4 py-3 shadow-xs text-xs font-semibold text-slate-700">
                  <span>
                    Showing Page {pagination.page} of {pagination.totalPages} ({pagination.totalTasks} Total Assigned Tasks)
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

      {/* Task Details Modal */}
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
          onUpdateStatus={async (id, st) => { await dispatch(updateStatusThunk({ id, status: st })); loadTasks(); }}
          onUpdateProgress={async (id, pr) => { await dispatch(updateProgressThunk({ id, progress: pr })); loadTasks(); }}
          onAddComment={async (id, txt) => { await dispatch(addCommentThunk({ id, text: txt })); }}
          onUpdateComment={async (tId, cId, txt) => { await dispatch(updateCommentThunk({ taskId: tId, commentId: cId, text: txt })); }}
          onDeleteComment={async (tId, cId) => { await dispatch(deleteCommentThunk({ taskId: tId, commentId: cId })); }}
          onUploadAttachment={async (id, fd) => { await dispatch(uploadAttachmentThunk({ id, formData: fd })); await dispatch(fetchTaskById(id)); }}
          onDeleteAttachment={async (tId, aId) => { await dispatch(deleteAttachmentThunk({ taskId: tId, attachmentId: aId })); await dispatch(fetchTaskById(tId)); }}
          onUpdateSubtaskStatus={async (tId, sId, data) => { await dispatch(updateSubtaskStatusThunk({ taskId: tId, subtaskId: sId, data })); }}
          actionLoading={actionLoading}
        />
      )}

      {/* Sign Out Confirmation Dialog */}
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

export default EmployeeMyTasksPage;
