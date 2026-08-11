import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchMeetings,
  createMeeting,
  updateMeeting,
  updateMeetingStatus,
  deleteMeeting,
  clearMeetingError,
  resetMeetingState
} from '../../redux/slices/meetingSlice';
import { useAuth } from '../../hooks/useAuth';
import MeetingCard from './MeetingCard';
import MeetingModal from './MeetingModal';
import MeetingForm from './MeetingForm';
import MeetingSkeleton from './MeetingSkeleton';
import MeetingEmptyState from './MeetingEmptyState';
import ConfirmDialog from '../common/ConfirmDialog';
import Button from '../common/Button';
import { Video, Plus, Search, RefreshCw, AlertCircle, CheckCircle2, X } from 'lucide-react';

export const MeetingSection = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { meetings, loading, error, success } = useSelector((state) => state.meetings);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [deactivatingMeeting, setDeactivatingMeeting] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loadMeetings = useCallback(
    (search = '') => {
      dispatch(fetchMeetings({ search }));
    },
    [dispatch]
  );

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  // Handle toast notifications on success or error
  useEffect(() => {
    if (error) {
      showToast('error', error);
      dispatch(clearMeetingError());
    }
  }, [error, dispatch]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    loadMeetings(val);
  };

  const handleOpenCreateModal = () => {
    setEditingMeeting(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (meeting) => {
    setEditingMeeting(meeting);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMeeting(null);
  };

  const handleFormSubmit = async (formData) => {
    if (editingMeeting) {
      const meetingId = editingMeeting.id || editingMeeting._id;
      const action = await dispatch(updateMeeting({ id: meetingId, data: formData }));
      if (updateMeeting.fulfilled.match(action)) {
        showToast('success', 'Meeting updated successfully');
        handleCloseModal();
      }
    } else {
      const action = await dispatch(createMeeting(formData));
      if (createMeeting.fulfilled.match(action)) {
        showToast('success', 'Meeting created successfully');
        handleCloseModal();
      }
    }
  };

  const handlePromptDeactivate = (meeting) => {
    setDeactivatingMeeting(meeting);
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivatingMeeting) return;
    const meetingId = deactivatingMeeting.id || deactivatingMeeting._id;
    const isCurrentlyActive = deactivatingMeeting.isActive !== false;

    // Use status toggle or soft delete
    const action = await dispatch(
      updateMeetingStatus({ id: meetingId, isActive: !isCurrentlyActive })
    );

    if (updateMeetingStatus.fulfilled.match(action)) {
      showToast(
        'success',
        isCurrentlyActive
          ? 'Meeting deactivated successfully'
          : 'Meeting activated successfully'
      );
    }
    setDeactivatingMeeting(null);
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Toast Feedback Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl border shadow-2xl flex items-center gap-3 text-xs font-semibold animate-slide-up ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
              : 'bg-rose-950/90 text-rose-200 border-rose-500/40'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-80"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Section Header Card */}
      <div className="glass-card rounded-3xl p-6 md:p-8 border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Upcoming / Active Meetings
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Join scheduled Google Meet links or schedule new employee syncs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => loadMeetings(searchTerm)}
              variant="outline"
              size="sm"
              icon={RefreshCw}
              className={`border-slate-800 text-slate-300 hover:bg-slate-900 ${
                loading ? 'animate-spin' : ''
              }`}
              title="Refresh meetings"
            />
            <Button
              onClick={handleOpenCreateModal}
              variant="primary"
              size="sm"
              icon={Plus}
              className="bg-indigo-600 hover:bg-indigo-500 text-white dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-500 font-bold px-4 shadow-md"
            >
              Create Meeting
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search meetings by title or description..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all"
          />
        </div>
      </div>

      {/* Content Area */}
      {loading && meetings.length === 0 ? (
        <MeetingSkeleton count={3} />
      ) : meetings.length === 0 ? (
        <MeetingEmptyState onCreateClick={handleOpenCreateModal} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((meeting) => (
            <MeetingCard
              key={meeting.id || meeting._id}
              meeting={meeting}
              currentUser={user}
              onEdit={handleOpenEditModal}
              onDeactivate={handlePromptDeactivate}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <MeetingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingMeeting ? 'Edit Meeting' : 'Create Meeting'}
      >
        <MeetingForm
          initialValues={editingMeeting}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          loading={loading}
        />
      </MeetingModal>

      {/* Deactivate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deactivatingMeeting}
        title="Deactivate Meeting"
        message={`Are you sure you want to deactivate "${deactivatingMeeting?.title}"? Deactivated meetings will no longer be visible on the active dashboard.`}
        confirmLabel="Deactivate"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setDeactivatingMeeting(null)}
        loading={loading}
      />
    </div>
  );
};

export default MeetingSection;
