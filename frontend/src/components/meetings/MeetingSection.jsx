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
import { Video, Plus, Search, RefreshCw, AlertCircle, CheckCircle2, X } from 'lucide-react';

export const MeetingSection = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { meetings, loading, error } = useSelector((state) => state.meetings);

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
    <div className="space-y-6 font-montserrat">
      {/* Toast Feedback Notification */}
      {toast && (
        <div
          className={`p-4 rounded-none border text-sm font-semibold flex items-center justify-between shadow-sm font-montserrat ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Section Header Card */}
      <div className="bg-white border border-slate-200 rounded-none p-6 shadow-sm space-y-5 font-montserrat">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-none bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0562ff] shrink-0">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
                Upcoming / Active Meetings
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Join scheduled Google Meet links or schedule new employee syncs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadMeetings(searchTerm)}
              className="p-2.5 rounded-none bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 transition-colors cursor-pointer"
              title="Refresh meetings"
            >
              <RefreshCw className={`w-4.5 h-4.5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 rounded-none bg-[#0562ff] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer font-montserrat uppercase tracking-wider whitespace-nowrap"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Create Meeting</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search meetings by title or description..."
            className="w-full pl-10 pr-4 py-2.5 rounded-none bg-slate-50 text-xs font-medium text-slate-900 placeholder-slate-400 border border-slate-300 outline-none focus:border-[#0562ff] focus:ring-1 focus:ring-[#0562ff] transition-all font-montserrat"
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
        variant="rose"
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setDeactivatingMeeting(null)}
        loading={loading}
      />
    </div>
  );
};

export default MeetingSection;
