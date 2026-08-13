import React, { useState } from 'react';
import TaskStatusBadge from './TaskStatusBadge';
import TaskPriorityBadge from './TaskPriorityBadge';
import TaskProgress from './TaskProgress';
import TaskComments from './TaskComments';
import TaskAttachments from './TaskAttachments';
import TaskSubtasks from './TaskSubtasks';
import TaskHistory from './TaskHistory';
import ConfirmDialog from '../common/ConfirmDialog';
import {
  X,
  Calendar,
  User,
  Users,
  AlertTriangle,
  CheckCircle,
  Play,
  RotateCcw,
  XCircle,
  Archive,
  Trash2,
  Copy,
  UserPlus,
  Paperclip,
  MessageSquare,
  ListTodo,
  History,
  Info
} from 'lucide-react';

export const TaskDetailsModal = ({
  isOpen,
  onClose,
  task,
  currentUser,
  comments = [],
  attachments = [],
  subtasks = [],
  history = [],
  employees = [],
  onUpdateStatus,
  onUpdateProgress,
  onComplete,
  onReopen,
  onCancel,
  onArchiveToggle,
  onDelete,
  onDuplicate,
  onReassign,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onUploadAttachment,
  onDeleteAttachment,
  onCreateSubtask,
  onUpdateSubtaskStatus,
  onDeleteSubtask,
  actionLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Reason Modal State for Cancellation
  const [showCancelReasonModal, setShowCancelReasonModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Reassign Modal State
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('');

  // Confirm Dialog State for Deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !task) return null;

  const taskId = task.id || task._id;
  const isOverdue =
    task.overdue ||
    (task.dueDate &&
      new Date(task.dueDate) < new Date() &&
      task.status !== 'completed' &&
      task.status !== 'cancelled');

  const userRole = currentUser?.role || 'employee';
  const isAdminOrFounder = userRole === 'admin' || userRole === 'founder';
  const isAssignedEmployee =
    currentUser &&
    (task.assignedTo?.id === currentUser._id ||
      task.assignedTo?._id === currentUser._id ||
      task.assignedTo?.id === currentUser.id);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleCancelSubmit = (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;
    if (onCancel) {
      onCancel(taskId, cancelReason.trim());
      setShowCancelReasonModal(false);
      setCancelReason('');
    }
  };

  const handleReassignSubmit = (e) => {
    e.preventDefault();
    if (!selectedAssignee) return;
    if (onReassign) {
      onReassign(taskId, selectedAssignee);
      setShowReassignModal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-montserrat">
      <div className="bg-white border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <TaskPriorityBadge priority={task.priority} />
              <TaskStatusBadge status={task.status} />
              {isOverdue && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 border border-rose-200">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Overdue</span>
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-snug break-words">
              {task.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100/80 border-b border-slate-200 px-6 flex items-center gap-1 overflow-x-auto text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#0562ff] text-[#0562ff] bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('subtasks')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'subtasks'
                ? 'border-[#0562ff] text-[#0562ff] bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <ListTodo className="w-4 h-4" />
            <span>Subtasks ({subtasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'comments'
                ? 'border-[#0562ff] text-[#0562ff] bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Comments ({comments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('attachments')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'attachments'
                ? 'border-[#0562ff] text-[#0562ff] bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Paperclip className="w-4 h-4" />
            <span>Attachments ({attachments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-[#0562ff] text-[#0562ff] bg-white font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>History</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Task Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Description
                </h3>
                <div className="p-4 bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                  {task.description || <em className="text-slate-400">No description provided for this task.</em>}
                </div>
              </div>

              {/* Task Meta Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Assigned To</span>
                  <div className="flex items-center gap-1.5 text-slate-900 font-bold mt-1">
                    <User className="w-4 h-4 text-[#0562ff]" />
                    <span>{task.assignedTo?.name || 'Unassigned'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-medium block">Assigned By</span>
                  <div className="flex items-center gap-1.5 text-slate-900 font-bold mt-1">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>{task.assignedBy?.name || 'System Admin'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-medium block">Group</span>
                  <div className="flex items-center gap-1.5 text-slate-900 font-bold mt-1">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>{task.group?.name || 'No Group'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-medium block">Due Date</span>
                  <div className={`flex items-center gap-1.5 font-bold mt-1 ${isOverdue ? 'text-rose-600' : 'text-slate-900'}`}>
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                </div>
              </div>

              {/* Progress Tracker Section */}
              <div className="space-y-3 p-4 bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Task Completion Progress
                  </h3>
                  <span className="text-sm font-bold text-slate-900">{task.progress || 0}%</span>
                </div>
                <TaskProgress progress={task.progress || 0} size="lg" showLabel={false} />

                {/* Progress Slider (For Assigned Employee or Admin/Founder) */}
                {(isAssignedEmployee || isAdminOrFounder) && task.status !== 'completed' && task.status !== 'cancelled' && (
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                      Update Progress:
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={task.progress || 0}
                      onChange={(e) => onUpdateProgress && onUpdateProgress(taskId, Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-none accent-[#0562ff] cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Workflow Actions Section */}
              <div className="p-4 bg-slate-100/90 border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Available Workflow Actions
                </h3>
                <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
                  {/* Employee Workflow Buttons */}
                  {task.status === 'todo' && (isAssignedEmployee || isAdminOrFounder) && (
                    <button
                      onClick={() => onUpdateStatus && onUpdateStatus(taskId, 'in_progress')}
                      disabled={actionLoading}
                      className="px-3.5 py-2 bg-[#0562ff] hover:bg-blue-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Task (In Progress)</span>
                    </button>
                  )}

                  {task.status === 'in_progress' && (isAssignedEmployee || isAdminOrFounder) && (
                    <button
                      onClick={() => onUpdateStatus && onUpdateStatus(taskId, 'in_review')}
                      disabled={actionLoading}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Submit for Review</span>
                    </button>
                  )}

                  {/* Admin / Founder Executive Workflow Actions */}
                  {isAdminOrFounder && (
                    <>
                      {task.status !== 'completed' && task.status !== 'cancelled' && (
                        <button
                          onClick={() => onComplete && onComplete(taskId)}
                          disabled={actionLoading}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve & Complete</span>
                        </button>
                      )}

                      {(task.status === 'completed' || task.status === 'cancelled') && (
                        <button
                          onClick={() => onReopen && onReopen(taskId)}
                          disabled={actionLoading}
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reopen Task</span>
                        </button>
                      )}

                      {task.status !== 'cancelled' && (
                        <button
                          onClick={() => setShowCancelReasonModal(true)}
                          disabled={actionLoading}
                          className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel Task</span>
                        </button>
                      )}

                      <button
                        onClick={() => setShowReassignModal(true)}
                        disabled={actionLoading}
                        className="px-3.5 py-2 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-[#0562ff]" />
                        <span>Reassign</span>
                      </button>

                      <button
                        onClick={() => onDuplicate && onDuplicate(taskId)}
                        disabled={actionLoading}
                        className="px-3.5 py-2 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Copy className="w-3.5 h-3.5 text-slate-600" />
                        <span>Duplicate</span>
                      </button>

                      <button
                        onClick={() => onArchiveToggle && onArchiveToggle(task)}
                        disabled={actionLoading}
                        className="px-3.5 py-2 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Archive className="w-3.5 h-3.5 text-amber-600" />
                        <span>{task.isArchived ? 'Restore Task' : 'Archive'}</span>
                      </button>

                      {userRole === 'admin' && (
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          disabled={actionLoading}
                          className="px-3.5 py-2 border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ml-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Task</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subtasks' && (
            <TaskSubtasks
              subtasks={subtasks}
              onCreateSubtask={(data) => onCreateSubtask && onCreateSubtask(taskId, data)}
              onUpdateSubtaskStatus={(subId, data) => onUpdateSubtaskStatus && onUpdateSubtaskStatus(taskId, subId, data)}
              onDeleteSubtask={(subId) => onDeleteSubtask && onDeleteSubtask(taskId, subId)}
              employees={employees}
              canManage={isAdminOrFounder}
              loading={actionLoading}
            />
          )}

          {activeTab === 'comments' && (
            <TaskComments
              comments={comments}
              onAddComment={(text) => onAddComment && onAddComment(taskId, text)}
              onUpdateComment={(cId, text) => onUpdateComment && onUpdateComment(taskId, cId, text)}
              onDeleteComment={(cId) => onDeleteComment && onDeleteComment(taskId, cId)}
              currentUser={currentUser}
              loading={actionLoading}
            />
          )}

          {activeTab === 'attachments' && (
            <TaskAttachments
              attachments={attachments}
              onUpload={(formData) => onUploadAttachment && onUploadAttachment(taskId, formData)}
              onDelete={(aId) => onDeleteAttachment && onDeleteAttachment(taskId, aId)}
              currentUser={currentUser}
              loading={actionLoading}
            />
          )}

          {activeTab === 'history' && <TaskHistory history={history} />}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Created on {formatDate(task.createdAt)}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Cancel Task Reason Modal */}
      {showCancelReasonModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 font-montserrat">
          <div className="bg-white border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Cancel Task Reason</h3>
            <p className="text-xs text-slate-600">
              Please provide a mandatory reason for cancelling this task:
            </p>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              className="w-full p-2.5 bg-white border border-slate-300 text-sm focus:outline-none focus:border-rose-500"
              required
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelReasonModal(false)}
                className="px-3 py-1.5 border border-slate-300 text-xs text-slate-700"
              >
                Back
              </button>
              <button
                onClick={handleCancelSubmit}
                disabled={!cancelReason.trim()}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold disabled:opacity-50"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reassign Employee Modal */}
      {showReassignModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 font-montserrat">
          <div className="bg-white border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Reassign Task</h3>
            <p className="text-xs text-slate-600">Select target employee to assign this task to:</p>
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 text-sm focus:outline-none focus:border-[#0562ff]"
            >
              <option value="">Select Employee...</option>
              {employees.map((emp) => (
                <option key={emp.id || emp._id} value={emp.id || emp._id}>
                  {emp.name} ({emp.email})
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowReassignModal(false)}
                className="px-3 py-1.5 border border-slate-300 text-xs text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleReassignSubmit}
                disabled={!selectedAssignee}
                className="px-4 py-1.5 bg-[#0562ff] hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50"
              >
                Confirm Reassign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Task Confirm Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Confirm Soft Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmLabel="Delete Task"
        cancelLabel="Cancel"
        variant="rose"
        icon={Trash2}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          if (onDelete) onDelete(taskId);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default TaskDetailsModal;
