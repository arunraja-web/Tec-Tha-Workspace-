import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import meetingService from '../../services/meetingService';

// Async Thunks
export const fetchMeetings = createAsyncThunk(
  'meetings/fetchMeetings',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await meetingService.getMeetings(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch meetings');
    }
  }
);

export const fetchMeetingById = createAsyncThunk(
  'meetings/fetchMeetingById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await meetingService.getMeetingById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch meeting details');
    }
  }
);

export const createMeeting = createAsyncThunk(
  'meetings/createMeeting',
  async (data, { rejectWithValue }) => {
    try {
      const response = await meetingService.createMeeting(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create meeting');
    }
  }
);

export const updateMeeting = createAsyncThunk(
  'meetings/updateMeeting',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await meetingService.updateMeeting(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update meeting');
    }
  }
);

export const updateMeetingStatus = createAsyncThunk(
  'meetings/updateMeetingStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await meetingService.updateMeetingStatus(id, isActive);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update meeting status');
    }
  }
);

export const deleteMeeting = createAsyncThunk(
  'meetings/deleteMeeting',
  async (id, { rejectWithValue }) => {
    try {
      const response = await meetingService.deleteMeeting(id);
      return { id, response };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to deactivate meeting');
    }
  }
);

const initialState = {
  meetings: [],
  selectedMeeting: null,
  loading: false,
  error: null,
  success: false,
  pagination: {
    page: 1,
    limit: 20,
    totalMeetings: 0,
    totalPages: 1
  }
};

const meetingSlice = createSlice({
  name: 'meetings',
  initialState,
  reducers: {
    resetMeetingState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearSelectedMeeting: (state) => {
      state.selectedMeeting = null;
    },
    clearMeetingError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Meetings
      .addCase(fetchMeetings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMeetings.fulfilled, (state, action) => {
        state.loading = false;
        const resData = action.payload.data || action.payload;
        state.meetings = resData.meetings || [];
        if (resData.pagination) {
          state.pagination = resData.pagination;
        }
      })
      .addCase(fetchMeetings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Single Meeting
      .addCase(fetchMeetingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMeetingById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMeeting = action.payload.data || action.payload;
      })
      .addCase(fetchMeetingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Meeting
      .addCase(createMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createMeeting.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const newMeeting = action.payload.data || action.payload;
        if (newMeeting) {
          state.meetings.unshift(newMeeting);
        }
      })
      .addCase(createMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Update Meeting
      .addCase(updateMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateMeeting.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const updated = action.payload.data || action.payload;
        if (updated) {
          const index = state.meetings.findIndex(m => (m.id || m._id) === (updated.id || updated._id));
          if (index !== -1) {
            state.meetings[index] = updated;
          }
          if (state.selectedMeeting && (state.selectedMeeting.id || state.selectedMeeting._id) === (updated.id || updated._id)) {
            state.selectedMeeting = updated;
          }
        }
      })
      .addCase(updateMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Update Meeting Status
      .addCase(updateMeetingStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateMeetingStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const updated = action.payload.data || action.payload;
        if (updated) {
          if (updated.isActive === false) {
            // Remove inactive meeting from active dashboard view
            state.meetings = state.meetings.filter(m => (m.id || m._id) !== (updated.id || updated._id));
          } else {
            const index = state.meetings.findIndex(m => (m.id || m._id) === (updated.id || updated._id));
            if (index !== -1) {
              state.meetings[index] = updated;
            } else {
              state.meetings.unshift(updated);
            }
          }
        }
      })
      .addCase(updateMeetingStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Delete Meeting (Soft Delete)
      .addCase(deleteMeeting.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteMeeting.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const deletedId = action.payload.id;
        state.meetings = state.meetings.filter(m => (m.id || m._id) !== deletedId);
      })
      .addCase(deleteMeeting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  }
});

export const { resetMeetingState, clearSelectedMeeting, clearMeetingError } = meetingSlice.actions;
export default meetingSlice.reducer;
