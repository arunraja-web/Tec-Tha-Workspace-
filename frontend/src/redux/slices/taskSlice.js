import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskService } from '../../services/taskService';

// Async Thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await taskService.getTasks(params);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch tasks');
    }
  }
);

export const fetchMyTasks = createAsyncThunk(
  'tasks/fetchMyTasks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await taskService.getMyTasks(params);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch assigned tasks');
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await taskService.getTaskById(id);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch task details');
    }
  }
);

export const createTaskThunk = createAsyncThunk(
  'tasks/createTask',
  async (data, { rejectWithValue }) => {
    try {
      const response = await taskService.createTask(data);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create task');
    }
  }
);

export const updateTaskThunk = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await taskService.updateTask(id, data);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update task');
    }
  }
);

export const assignTaskThunk = createAsyncThunk(
  'tasks/assignTask',
  async ({ id, assignedTo }, { rejectWithValue }) => {
    try {
      const response = await taskService.assignTask(id, assignedTo);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to reassign task');
    }
  }
);

export const updateStatusThunk = createAsyncThunk(
  'tasks/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await taskService.updateStatus(id, status);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update status');
    }
  }
);

export const updateProgressThunk = createAsyncThunk(
  'tasks/updateProgress',
  async ({ id, progress }, { rejectWithValue }) => {
    try {
      const response = await taskService.updateProgress(id, progress);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update progress');
    }
  }
);

export const completeTaskThunk = createAsyncThunk(
  'tasks/completeTask',
  async (id, { rejectWithValue }) => {
    try {
      const response = await taskService.completeTask(id);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to complete task');
    }
  }
);

export const reopenTaskThunk = createAsyncThunk(
  'tasks/reopenTask',
  async (id, { rejectWithValue }) => {
    try {
      const response = await taskService.reopenTask(id);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to reopen task');
    }
  }
);

export const cancelTaskThunk = createAsyncThunk(
  'tasks/cancelTask',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await taskService.cancelTask(id, reason);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to cancel task');
    }
  }
);

export const archiveTaskThunk = createAsyncThunk(
  'tasks/archiveTask',
  async (id, { rejectWithValue }) => {
    try {
      const response = await taskService.archiveTask(id);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to archive task');
    }
  }
);

export const restoreTaskThunk = createAsyncThunk(
  'tasks/restoreTask',
  async (id, { rejectWithValue }) => {
    try {
      const response = await taskService.restoreTask(id);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to restore task');
    }
  }
);

export const deleteTaskThunk = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      const response = await taskService.deleteTask(id);
      return { id, ...response };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete task');
    }
  }
);

export const duplicateTaskThunk = createAsyncThunk(
  'tasks/duplicateTask',
  async (id, { rejectWithValue }) => {
    try {
      const response = await taskService.duplicateTask(id);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to duplicate task');
    }
  }
);

export const fetchTaskHistory = createAsyncThunk(
  'tasks/fetchTaskHistory',
  async (id, { rejectWithValue }) => {
    try {
      const response = await taskService.getTaskHistory(id);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch task audit history');
    }
  }
);

export const fetchTaskComments = createAsyncThunk(
  'tasks/fetchTaskComments',
  async (id, { rejectWithValue }) => {
    try {
      const response = await taskService.getComments(id);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch comments');
    }
  }
);

export const addCommentThunk = createAsyncThunk(
  'tasks/addComment',
  async ({ id, text }, { rejectWithValue }) => {
    try {
      const response = await taskService.addComment(id, text);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to add comment');
    }
  }
);

export const updateCommentThunk = createAsyncThunk(
  'tasks/updateComment',
  async ({ taskId, commentId, text }, { rejectWithValue }) => {
    try {
      const response = await taskService.updateComment(taskId, commentId, text);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update comment');
    }
  }
);

export const deleteCommentThunk = createAsyncThunk(
  'tasks/deleteComment',
  async ({ taskId, commentId }, { rejectWithValue }) => {
    try {
      const response = await taskService.deleteComment(taskId, commentId);
      return { commentId, ...response };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete comment');
    }
  }
);

export const uploadAttachmentThunk = createAsyncThunk(
  'tasks/uploadAttachment',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await taskService.uploadAttachment(id, formData);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to upload attachment');
    }
  }
);

export const deleteAttachmentThunk = createAsyncThunk(
  'tasks/deleteAttachment',
  async ({ taskId, attachmentId }, { rejectWithValue }) => {
    try {
      const response = await taskService.deleteAttachment(taskId, attachmentId);
      return { attachmentId, ...response };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete attachment');
    }
  }
);

export const fetchSubtasks = createAsyncThunk(
  'tasks/fetchSubtasks',
  async (id, { rejectWithValue }) => {
    try {
      const response = await taskService.getSubtasks(id);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch subtasks');
    }
  }
);

export const createSubtaskThunk = createAsyncThunk(
  'tasks/createSubtask',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await taskService.createSubtask(id, data);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create subtask');
    }
  }
);

export const updateSubtaskThunk = createAsyncThunk(
  'tasks/updateSubtask',
  async ({ taskId, subtaskId, data }, { rejectWithValue }) => {
    try {
      const response = await taskService.updateSubtask(taskId, subtaskId, data);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update subtask');
    }
  }
);

export const updateSubtaskStatusThunk = createAsyncThunk(
  'tasks/updateSubtaskStatus',
  async ({ taskId, subtaskId, data }, { rejectWithValue }) => {
    try {
      const response = await taskService.updateSubtaskStatus(taskId, subtaskId, data);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update subtask status');
    }
  }
);

export const deleteSubtaskThunk = createAsyncThunk(
  'tasks/deleteSubtask',
  async ({ taskId, subtaskId }, { rejectWithValue }) => {
    try {
      const response = await taskService.deleteSubtask(taskId, subtaskId);
      return { subtaskId, ...response };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete subtask');
    }
  }
);

export const fetchCompanyAnalytics = createAsyncThunk(
  'tasks/fetchCompanyAnalytics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await taskService.getCompanyAnalytics(params);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch company analytics');
    }
  }
);

export const fetchEmployeeAnalytics = createAsyncThunk(
  'tasks/fetchEmployeeAnalytics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await taskService.getEmployeeAnalytics(params);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch employee analytics');
    }
  }
);

export const fetchMyAnalytics = createAsyncThunk(
  'tasks/fetchMyAnalytics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await taskService.getMyAnalytics(params);
      return response;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch personal analytics');
    }
  }
);

const initialState = {
  tasks: [],
  myTasks: [],
  selectedTask: null,
  taskHistory: [],
  comments: [],
  subtasks: [],
  analytics: null,
  employeeAnalytics: [],
  myAnalytics: null,
  pagination: {
    page: 1,
    limit: 20,
    totalTasks: 0,
    totalPages: 1,
  },
  filters: {
    search: '',
    status: '',
    priority: '',
    assignedTo: '',
    group: '',
    overdue: false,
    isArchived: false,
    startDate: '',
    dueDate: '',
  },
  loading: false,
  detailsLoading: false,
  commentsLoading: false,
  subtasksLoading: false,
  analyticsLoading: false,
  actionLoading: false,
  error: null,
  successMessage: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTaskError: (state) => {
      state.error = null;
    },
    clearTaskSuccess: (state) => {
      state.successMessage = null;
    },
    setSelectedTask: (state, action) => {
      state.selectedTask = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.data?.tasks || action.payload.tasks || [];
        state.pagination = action.payload.data?.pagination || action.payload.pagination || state.pagination;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchMyTasks
      .addCase(fetchMyTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.myTasks = action.payload.data?.tasks || action.payload.tasks || [];
        state.pagination = action.payload.data?.pagination || action.payload.pagination || state.pagination;
      })
      .addCase(fetchMyTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchTaskById
      .addCase(fetchTaskById.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.detailsLoading = false;
        const task = action.payload.data?.task || action.payload.task || action.payload.data;
        state.selectedTask = task;
        if (task && task.attachments) {
          state.attachments = task.attachments;
        }
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload;
      })

      // createTaskThunk
      .addCase(createTaskThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createTaskThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = action.payload.message || 'Task created successfully';
        const newTask = action.payload.data?.task || action.payload.data;
        if (newTask) {
          state.tasks.unshift(newTask);
        }
      })
      .addCase(createTaskThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // updateTaskThunk
      .addCase(updateTaskThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateTaskThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = action.payload.message || 'Task updated successfully';
        const updated = action.payload.data?.task || action.payload.data;
        if (updated) {
          state.tasks = state.tasks.map((t) => (t.id === updated.id || t._id === updated._id ? updated : t));
          state.myTasks = state.myTasks.map((t) => (t.id === updated.id || t._id === updated._id ? updated : t));
          if (state.selectedTask && (state.selectedTask.id === updated.id || state.selectedTask._id === updated._id)) {
            state.selectedTask = updated;
          }
        }
      })
      .addCase(updateTaskThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // assignTaskThunk
      .addCase(assignTaskThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = action.payload.message || 'Task reassigned successfully';
        const updated = action.payload.data?.task || action.payload.data;
        if (updated) {
          state.tasks = state.tasks.map((t) => (t.id === updated.id || t._id === updated._id ? updated : t));
          if (state.selectedTask) state.selectedTask = updated;
        }
      })

      // deleteTaskThunk
      .addCase(deleteTaskThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = action.payload.message || 'Task deleted successfully';
        state.tasks = state.tasks.filter((t) => t.id !== action.payload.id && t._id !== action.payload.id);
        state.myTasks = state.myTasks.filter((t) => t.id !== action.payload.id && t._id !== action.payload.id);
        if (state.selectedTask && (state.selectedTask.id === action.payload.id || state.selectedTask._id === action.payload.id)) {
          state.selectedTask = null;
        }
      })

      // fetchTaskHistory
      .addCase(fetchTaskHistory.fulfilled, (state, action) => {
        state.taskHistory = action.payload.data?.history || action.payload.history || action.payload.data || [];
      })

      // fetchTaskComments & addCommentThunk & updateCommentThunk & deleteCommentThunk
      .addCase(fetchTaskComments.pending, (state) => {
        state.commentsLoading = true;
      })
      .addCase(fetchTaskComments.fulfilled, (state, action) => {
        state.commentsLoading = false;
        state.comments = action.payload.data?.comments || action.payload.comments || action.payload.data || [];
      })
      .addCase(fetchTaskComments.rejected, (state, action) => {
        state.commentsLoading = false;
        state.error = action.payload;
      })
      .addCase(addCommentThunk.fulfilled, (state, action) => {
        const newComment = action.payload.data?.comment || action.payload.data;
        if (newComment) state.comments.push(newComment);
      })
      .addCase(updateCommentThunk.fulfilled, (state, action) => {
        const updated = action.payload.data?.comment || action.payload.data;
        if (updated) {
          state.comments = state.comments.map((c) => (c.id === updated.id || c._id === updated._id ? updated : c));
        }
      })
      .addCase(deleteCommentThunk.fulfilled, (state, action) => {
        state.comments = state.comments.filter((c) => c.id !== action.payload.commentId && c._id !== action.payload.commentId);
      })

      // fetchSubtasks & createSubtaskThunk & updateSubtaskThunk & updateSubtaskStatusThunk & deleteSubtaskThunk
      .addCase(fetchSubtasks.pending, (state) => {
        state.subtasksLoading = true;
      })
      .addCase(fetchSubtasks.fulfilled, (state, action) => {
        state.subtasksLoading = false;
        state.subtasks = action.payload.data?.subtasks || action.payload.subtasks || action.payload.data || [];
      })
      .addCase(fetchSubtasks.rejected, (state, action) => {
        state.subtasksLoading = false;
        state.error = action.payload;
      })
      .addCase(createSubtaskThunk.fulfilled, (state, action) => {
        const newSubtask = action.payload.data?.subtask || action.payload.data;
        if (newSubtask) state.subtasks.push(newSubtask);
      })
      .addCase(updateSubtaskThunk.fulfilled, (state, action) => {
        const updated = action.payload.data?.subtask || action.payload.data;
        if (updated) {
          state.subtasks = state.subtasks.map((s) => (s.id === updated.id || s._id === updated._id ? updated : s));
        }
      })
      .addCase(updateSubtaskStatusThunk.fulfilled, (state, action) => {
        const updated = action.payload.data?.subtask || action.payload.data;
        if (updated) {
          state.subtasks = state.subtasks.map((s) => (s.id === updated.id || s._id === updated._id ? updated : s));
        }
      })
      .addCase(deleteSubtaskThunk.fulfilled, (state, action) => {
        state.subtasks = state.subtasks.filter((s) => s.id !== action.payload.subtaskId && s._id !== action.payload.subtaskId);
      })

      // Attachments
      .addCase(uploadAttachmentThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        const newAttachment = action.payload.data?.attachment || action.payload.data || action.payload;
        if (newAttachment && (newAttachment._id || newAttachment.id)) {
          state.attachments.push(newAttachment);
        }
      })
      .addCase(deleteAttachmentThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        const attachmentId = action.meta?.arg?.attachmentId;
        if (attachmentId) {
          state.attachments = state.attachments.filter((a) => a._id !== attachmentId && a.id !== attachmentId);
        }
      })

      // Analytics
      .addCase(fetchCompanyAnalytics.pending, (state) => {
        state.analyticsLoading = true;
      })
      .addCase(fetchCompanyAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics = action.payload.data || action.payload;
      })
      .addCase(fetchCompanyAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchEmployeeAnalytics.fulfilled, (state, action) => {
        state.employeeAnalytics = action.payload.data?.employees || action.payload.data || [];
      })
      .addCase(fetchMyAnalytics.fulfilled, (state, action) => {
        state.myAnalytics = action.payload.data || action.payload;
      })

      // Status/Progress/Workflow Actions Matcher (Must be at the END after all addCase calls)
      .addMatcher(
        (action) =>
          [
            updateStatusThunk.fulfilled.type,
            updateProgressThunk.fulfilled.type,
            completeTaskThunk.fulfilled.type,
            reopenTaskThunk.fulfilled.type,
            cancelTaskThunk.fulfilled.type,
            archiveTaskThunk.fulfilled.type,
            restoreTaskThunk.fulfilled.type,
            duplicateTaskThunk.fulfilled.type,
          ].includes(action.type),
        (state, action) => {
          state.actionLoading = false;
          state.successMessage = action.payload.message || 'Action completed successfully';
          const updated = action.payload.data?.task || action.payload.data;
          if (updated) {
            state.tasks = state.tasks.map((t) => (t.id === updated.id || t._id === updated._id ? updated : t));
            state.myTasks = state.myTasks.map((t) => (t.id === updated.id || t._id === updated._id ? updated : t));
            if (state.selectedTask && (state.selectedTask.id === updated.id || state.selectedTask._id === updated._id)) {
              state.selectedTask = updated;
            }
          }
        }
      );
  },
});

export const {
  clearTaskError,
  clearTaskSuccess,
  setSelectedTask,
  setFilters,
  resetFilters,
  setPage,
} = taskSlice.actions;

export default taskSlice.reducer;
