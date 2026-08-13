import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { groupService } from '../../services/groupService';

// Async Thunks
export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await groupService.getGroups(params);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch groups');
    }
  }
);

export const fetchMyGroups = createAsyncThunk(
  'groups/fetchMyGroups',
  async (_, { rejectWithValue }) => {
    try {
      const response = await groupService.getMyGroups();
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch my groups');
    }
  }
);

export const fetchGroupById = createAsyncThunk(
  'groups/fetchGroupById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await groupService.getGroupById(id);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch group details');
    }
  }
);

export const fetchGroupMembers = createAsyncThunk(
  'groups/fetchGroupMembers',
  async (id, { rejectWithValue }) => {
    try {
      const response = await groupService.getGroupMembers(id);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch group members');
    }
  }
);

export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (data, { rejectWithValue }) => {
    try {
      const response = await groupService.createGroup(data);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create group');
    }
  }
);

export const updateGroup = createAsyncThunk(
  'groups/updateGroup',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await groupService.updateGroup(id, data);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update group');
    }
  }
);

export const updateGroupStatus = createAsyncThunk(
  'groups/updateGroupStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await groupService.updateGroupStatus(id, isActive);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update group status');
    }
  }
);

export const addGroupMember = createAsyncThunk(
  'groups/addGroupMember',
  async ({ groupId, userId }, { rejectWithValue }) => {
    try {
      const response = await groupService.addMember(groupId, userId);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to add member to group');
    }
  }
);

export const bulkAddGroupMembers = createAsyncThunk(
  'groups/bulkAddGroupMembers',
  async ({ groupId, userIds }, { rejectWithValue }) => {
    try {
      const response = await groupService.bulkAddMembers(groupId, userIds);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to bulk add members');
    }
  }
);

export const removeGroupMember = createAsyncThunk(
  'groups/removeGroupMember',
  async ({ groupId, userId }, { rejectWithValue }) => {
    try {
      const response = await groupService.removeMember(groupId, userId);
      return { groupId, userId, response };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to remove member');
    }
  }
);

export const joinGroup = createAsyncThunk(
  'groups/joinGroup',
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await groupService.joinGroup(groupId);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to join group');
    }
  }
);

export const leaveGroup = createAsyncThunk(
  'groups/leaveGroup',
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await groupService.leaveGroup(groupId);
      return { groupId, response };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to leave group');
    }
  }
);

const initialState = {
  groups: [],
  myGroups: [],
  selectedGroup: null,
  members: [],
  pagination: {
    page: 1,
    limit: 20,
    totalGroups: 0,
    totalPages: 1,
  },
  loading: false,
  myGroupsLoading: false,
  membersLoading: false,
  actionLoading: false,
  error: null,
  actionSuccess: null,
};

const groupSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearGroupError: (state) => {
      state.error = null;
    },
    clearGroupSuccess: (state) => {
      state.actionSuccess = null;
    },
    clearSelectedGroup: (state) => {
      state.selectedGroup = null;
      state.members = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchGroups
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data) {
          state.groups = action.payload.data.groups || [];
          if (action.payload.data.pagination) {
            state.pagination = action.payload.data.pagination;
          }
        }
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchMyGroups
      .addCase(fetchMyGroups.pending, (state) => {
        state.myGroupsLoading = true;
        state.error = null;
      })
      .addCase(fetchMyGroups.fulfilled, (state, action) => {
        state.myGroupsLoading = false;
        state.myGroups = action.payload?.data || [];
      })
      .addCase(fetchMyGroups.rejected, (state, action) => {
        state.myGroupsLoading = false;
        state.error = action.payload;
      })

      // fetchGroupById
      .addCase(fetchGroupById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroupById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedGroup = action.payload?.data || null;
      })
      .addCase(fetchGroupById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchGroupMembers
      .addCase(fetchGroupMembers.pending, (state) => {
        state.membersLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupMembers.fulfilled, (state, action) => {
        state.membersLoading = false;
        state.members = action.payload?.data || [];
      })
      .addCase(fetchGroupMembers.rejected, (state, action) => {
        state.membersLoading = false;
        state.error = action.payload;
      })

      // createGroup
      .addCase(createGroup.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = action.payload?.message || 'Group created successfully';
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // updateGroup
      .addCase(updateGroup.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateGroup.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = action.payload?.message || 'Group updated successfully';
        if (action.payload?.data) {
          const updated = action.payload.data;
          state.groups = state.groups.map((g) =>
            (g._id || g.id) === (updated._id || updated.id) ? updated : g
          );
          if (state.selectedGroup && (state.selectedGroup._id || state.selectedGroup.id) === (updated._id || updated.id)) {
            state.selectedGroup = updated;
          }
        }
      })
      .addCase(updateGroup.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // updateGroupStatus
      .addCase(updateGroupStatus.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateGroupStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = action.payload?.message || 'Group status updated successfully';
        if (action.payload?.data) {
          const updated = action.payload.data;
          state.groups = state.groups.map((g) =>
            (g._id || g.id) === (updated._id || updated.id) ? updated : g
          );
        }
      })
      .addCase(updateGroupStatus.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // addGroupMember
      .addCase(addGroupMember.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(addGroupMember.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = action.payload?.message || 'Member added successfully';
      })
      .addCase(addGroupMember.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // bulkAddGroupMembers
      .addCase(bulkAddGroupMembers.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(bulkAddGroupMembers.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = action.payload?.message || 'Members added successfully';
      })
      .addCase(bulkAddGroupMembers.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // removeGroupMember
      .addCase(removeGroupMember.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(removeGroupMember.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = action.payload?.response?.message || 'Member removed successfully';
        state.members = state.members.filter(
          (m) => (m._id || m.id) !== action.meta.arg.userId
        );
      })
      .addCase(removeGroupMember.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // joinGroup
      .addCase(joinGroup.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(joinGroup.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = action.payload?.message || 'Joined group successfully';
        if (action.payload?.data) {
          const updated = action.payload.data;
          state.groups = state.groups.map((g) =>
            (g._id || g.id) === (updated._id || updated.id) ? updated : g
          );
        }
      })
      .addCase(joinGroup.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // leaveGroup
      .addCase(leaveGroup.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(leaveGroup.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = action.payload?.response?.message || 'Left group successfully';
        const leftGroupId = action.meta.arg;
        state.myGroups = state.myGroups.filter((g) => (g._id || g.id) !== leftGroupId);
      })
      .addCase(leaveGroup.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearGroupError, clearGroupSuccess, clearSelectedGroup } = groupSlice.actions;
export default groupSlice.reducer;
