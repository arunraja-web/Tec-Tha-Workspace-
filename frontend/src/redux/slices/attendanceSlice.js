import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import attendanceService from '../../services/attendanceService';
import { getTodayYYYYMMDD, getCurrentYYYYMM } from '../../utils/formatDate';

// -------------------------------------------------------------------
// Async Thunks
// -------------------------------------------------------------------

export const fetchDailyAttendance = createAsyncThunk(
  'attendance/fetchDailyAttendance',
  async (date, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getDailyAttendance(date);
      return response; // { success: true, date: "YYYY-MM-DD", employees: [...] }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch daily attendance');
    }
  }
);

export const saveBulkAttendance = createAsyncThunk(
  'attendance/saveBulkAttendance',
  async ({ date, session, attendance }, { rejectWithValue }) => {
    try {
      const response = await attendanceService.markBulkAttendance({ date, session, attendance });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to save bulk attendance');
    }
  }
);

export const markSingleAttendance = createAsyncThunk(
  'attendance/markSingleAttendance',
  async ({ employeeId, date, session, status }, { rejectWithValue }) => {
    try {
      const response = await attendanceService.markAttendance({ employeeId, date, session, status });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to mark attendance');
    }
  }
);

export const updateAttendanceRecord = createAsyncThunk(
  'attendance/updateAttendanceRecord',
  async ({ id, morning, evening }, { rejectWithValue }) => {
    try {
      const response = await attendanceService.updateAttendanceRecord(id, { morning, evening });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update attendance record');
    }
  }
);

export const updateSessionStatus = createAsyncThunk(
  'attendance/updateSessionStatus',
  async ({ id, session, status }, { rejectWithValue }) => {
    try {
      const response = await attendanceService.updateSessionStatus(id, session, status);
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update session status');
    }
  }
);

export const fetchMyAttendance = createAsyncThunk(
  'attendance/fetchMyAttendance',
  async (month, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getMyAttendance(month);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch employee attendance');
    }
  }
);

export const fetchEmployeeCalendar = createAsyncThunk(
  'attendance/fetchEmployeeCalendar',
  async ({ employeeId, month }, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getEmployeeMonthlyCalendar(employeeId, month);
      return { employeeId, month, calendar: Array.isArray(response) ? response : (response.data || []) };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch employee calendar');
    }
  }
);

export const fetchAttendanceAnalytics = createAsyncThunk(
  'attendance/fetchAttendanceAnalytics',
  async (month, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getAttendanceAnalytics(month);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch attendance analytics');
    }
  }
);

export const fetchDepartmentAnalytics = createAsyncThunk(
  'attendance/fetchDepartmentAnalytics',
  async (month, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getDepartmentAnalytics(month);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch department analytics');
    }
  }
);

export const exportMonthlyReport = createAsyncThunk(
  'attendance/exportMonthlyReport',
  async (month, { rejectWithValue }) => {
    try {
      const response = await attendanceService.exportMonthlyReport(month);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to export monthly report');
    }
  }
);

export const fetchExportsHistory = createAsyncThunk(
  'attendance/fetchExportsHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getAttendanceExports();
      return response.exports || response.data || [];
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch export history');
    }
  }
);

// -------------------------------------------------------------------
// Initial State
// -------------------------------------------------------------------

const initialState = {
  dailyAttendance: {
    date: getTodayYYYYMMDD(),
    employees: [],
  },
  selectedDate: getTodayYYYYMMDD(),
  selectedSession: 'morning',

  myAttendance: {
    month: getCurrentYYYYMM(),
    records: [],
  },
  selectedEmployeeCalendar: {
    employeeId: null,
    month: getCurrentYYYYMM(),
    calendar: [],
  },

  analytics: null,
  departmentAnalytics: null,

  exports: [],

  loading: false,
  saving: false,
  analyticsLoading: false,
  exportLoading: false,

  error: null,
  hasUnsavedChanges: false,
};

// -------------------------------------------------------------------
// Slice Definition
// -------------------------------------------------------------------

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
      state.hasUnsavedChanges = false;
    },
    setSelectedSession: (state, action) => {
      state.selectedSession = action.payload;
    },
    updateLocalEmployeeStatus: (state, action) => {
      const { employeeId, status } = action.payload;
      const session = state.selectedSession;

      const empIndex = state.dailyAttendance.employees.findIndex(
        (e) => (e.employee._id || e.employee) === employeeId
      );

      if (empIndex !== -1) {
        if (!state.dailyAttendance.employees[empIndex][session]) {
          state.dailyAttendance.employees[empIndex][session] = { status };
        } else {
          state.dailyAttendance.employees[empIndex][session].status = status;
        }
        state.hasUnsavedChanges = true;
      }
    },
    markAllPresent: (state) => {
      const session = state.selectedSession;
      state.dailyAttendance.employees.forEach((emp) => {
        if (!emp[session]) {
          emp[session] = { status: 'present' };
        } else {
          emp[session].status = 'present';
        }
      });
      state.hasUnsavedChanges = true;
    },
    resetUnsavedChanges: (state) => {
      state.hasUnsavedChanges = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchDailyAttendance
      .addCase(fetchDailyAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDailyAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.dailyAttendance = {
          date: action.payload.date || state.selectedDate,
          employees: action.payload.employees || [],
        };
        state.hasUnsavedChanges = false;
      })
      .addCase(fetchDailyAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // saveBulkAttendance
      .addCase(saveBulkAttendance.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveBulkAttendance.fulfilled, (state) => {
        state.saving = false;
        state.hasUnsavedChanges = false;
      })
      .addCase(saveBulkAttendance.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // markSingleAttendance
      .addCase(markSingleAttendance.fulfilled, (state, action) => {
        const updatedRecord = action.payload.data || action.payload;
        if (updatedRecord && updatedRecord.employee) {
          const empId = updatedRecord.employee._id || updatedRecord.employee;
          const idx = state.dailyAttendance.employees.findIndex(
            (e) => (e.employee._id || e.employee) === empId
          );
          if (idx !== -1) {
            if (updatedRecord.morning) state.dailyAttendance.employees[idx].morning = updatedRecord.morning;
            if (updatedRecord.evening) state.dailyAttendance.employees[idx].evening = updatedRecord.evening;
            if (updatedRecord._id) state.dailyAttendance.employees[idx].attendanceId = updatedRecord._id;
          }
        }
      })

      // fetchMyAttendance
      .addCase(fetchMyAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.myAttendance = action.payload;
      })
      .addCase(fetchMyAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchEmployeeCalendar
      .addCase(fetchEmployeeCalendar.fulfilled, (state, action) => {
        state.selectedEmployeeCalendar = action.payload;
      })

      // fetchAttendanceAnalytics
      .addCase(fetchAttendanceAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAttendanceAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.error = action.payload;
      })

      // fetchDepartmentAnalytics
      .addCase(fetchDepartmentAnalytics.fulfilled, (state, action) => {
        state.departmentAnalytics = action.payload;
      })

      // exportMonthlyReport
      .addCase(exportMonthlyReport.pending, (state) => {
        state.exportLoading = true;
        state.error = null;
      })
      .addCase(exportMonthlyReport.fulfilled, (state, action) => {
        state.exportLoading = false;
        if (action.payload) {
          state.exports.unshift(action.payload);
        }
      })
      .addCase(exportMonthlyReport.rejected, (state, action) => {
        state.exportLoading = false;
        state.error = action.payload;
      })

      // fetchExportsHistory
      .addCase(fetchExportsHistory.pending, (state) => {
        state.exportLoading = true;
      })
      .addCase(fetchExportsHistory.fulfilled, (state, action) => {
        state.exportLoading = false;
        state.exports = action.payload;
      })
      .addCase(fetchExportsHistory.rejected, (state, action) => {
        state.exportLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedDate,
  setSelectedSession,
  updateLocalEmployeeStatus,
  markAllPresent,
  resetUnsavedChanges,
  clearError,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;
