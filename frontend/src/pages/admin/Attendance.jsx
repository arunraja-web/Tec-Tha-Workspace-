import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDailyAttendance,
  saveBulkAttendance,
  setSelectedDate,
  setSelectedSession,
  updateLocalEmployeeStatus,
  markAllPresent,
  fetchAttendanceAnalytics,
  fetchDepartmentAnalytics,
  fetchExportsHistory,
  exportMonthlyReport,
} from '../../redux/slices/attendanceSlice';

import {
  CalendarCheck,
  BarChart3,
  FileSpreadsheet,
  AlertTriangle,
  RefreshCw,
  Download,
  Calendar,
} from 'lucide-react';

import AttendanceSummaryCards from '../../components/attendance/AttendanceSummaryCards';
import AttendanceTable from '../../components/attendance/AttendanceTable';
import AttendanceAnalytics from '../../components/attendance/AttendanceAnalytics';
import AttendanceExportList from '../../components/attendance/AttendanceExportList';
import AttendanceSkeleton from '../../components/attendance/AttendanceSkeleton';
import AttendanceEmptyState from '../../components/attendance/AttendanceEmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Button from '../../components/common/Button';
import { formatFriendlyDate, getCurrentYYYYMM } from '../../utils/formatDate';

export const AdminAttendancePage = () => {
  const dispatch = useDispatch();

  const {
    dailyAttendance,
    selectedDate,
    selectedSession,
    analytics,
    departmentAnalytics,
    exports,
    loading,
    saving,
    analyticsLoading,
    exportLoading,
    error,
    hasUnsavedChanges,
  } = useSelector((state) => state.attendance);

  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'analytics' | 'exports'
  const [selectedMonth, setSelectedMonth] = useState(getCurrentYYYYMM());
  const [confirmModal, setConfirmModal] = useState({ open: false, type: null, title: '', message: '', action: null });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Show auto-dismiss notification
  const showToast = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  // Initial load
  useEffect(() => {
    dispatch(fetchDailyAttendance(selectedDate));
  }, [dispatch, selectedDate]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      dispatch(fetchAttendanceAnalytics(selectedMonth));
      dispatch(fetchDepartmentAnalytics(selectedMonth));
    } else if (activeTab === 'exports') {
      dispatch(fetchExportsHistory());
    }
  }, [dispatch, activeTab, selectedMonth]);

  // Handle local status dropdown change
  const handleStatusChange = (employeeId, status) => {
    dispatch(updateLocalEmployeeStatus({ employeeId, status }));
  };

  // Handle Mark All Present
  const handleMarkAllPresent = () => {
    dispatch(markAllPresent());
    showToast(`All active employees marked present for ${selectedSession} session locally.`);
  };

  // Handle Bulk Save Attendance
  const handleSaveAttendance = () => {
    const sessionEmployees = dailyAttendance.employees || [];
    const attendancePayload = [];
    let unmarkedCount = 0;

    sessionEmployees.forEach((empData) => {
      const empId = empData.employee._id || empData.employee;
      const sessionObj = empData[selectedSession];
      const status = sessionObj ? sessionObj.status : null;

      if (status && ['present', 'absent', 'leave', 'holiday'].includes(status)) {
        attendancePayload.push({
          employeeId: empId,
          status,
        });
      } else {
        unmarkedCount++;
      }
    });

    if (attendancePayload.length === 0) {
      showToast('Please select attendance status for at least one employee before saving.', 'error');
      return;
    }

    const executeSave = () => {
      dispatch(
        saveBulkAttendance({
          date: selectedDate,
          session: selectedSession,
          attendance: attendancePayload,
        })
      )
        .unwrap()
        .then((res) => {
          showToast(res.message || 'Attendance saved successfully!');
          dispatch(fetchDailyAttendance(selectedDate));
        })
        .catch((err) => {
          showToast(err || 'Failed to save attendance', 'error');
        });
    };

    if (unmarkedCount > 0) {
      setConfirmModal({
        open: true,
        type: 'unmarked_warning',
        title: 'Unmarked Employees Warning',
        message: `${unmarkedCount} employee(s) do not have a status selected for ${selectedSession} session. Do you want to save attendance for the marked employees?`,
        action: executeSave,
      });
    } else {
      executeSave();
    }
  };

  // Handle Export Monthly Report
  const handleTriggerExport = (monthStr) => {
    setConfirmModal({
      open: true,
      type: 'export_confirm',
      title: `Export Report for ${monthStr}`,
      message: `Generating this report will compile attendance data, export an Excel file, and upload it securely. Proceed?`,
      action: () => {
        dispatch(exportMonthlyReport(monthStr))
          .unwrap()
          .then(() => {
            showToast(`Monthly report for ${monthStr} exported successfully!`);
            dispatch(fetchExportsHistory());
          })
          .catch((err) => {
            showToast(err || 'Export failed', 'error');
          });
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-6 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Toast Alert Banner */}
        {notification.show && (
          <div
            className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border flex items-center gap-3 transition-all ${
              notification.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
            }`}
          >
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="text-xs font-semibold">{notification.message}</span>
          </div>
        )}

        {/* Page Top Header */}
        <div className="glass-card rounded-3xl p-6 border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white">Attendance Management</h1>
                <span className="bg-indigo-950/80 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/30 uppercase">
                  Admin Workspace
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Mark daily attendance, inspect monthly analytics, and generate export reports.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('daily')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'daily'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Daily Attendance</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('exports')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'exports'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Reports</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Daily Attendance Management */}
        {activeTab === 'daily' && (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <AttendanceSummaryCards
              employees={dailyAttendance.employees || []}
              session={selectedSession}
            />

            {/* Attendance Table */}
            {loading ? (
              <AttendanceSkeleton count={6} />
            ) : (
              <AttendanceTable
                employees={dailyAttendance.employees || []}
                selectedDate={selectedDate}
                onDateChange={(date) => dispatch(setSelectedDate(date))}
                activeSession={selectedSession}
                onSessionChange={(session) => dispatch(setSelectedSession(session))}
                onStatusChange={handleStatusChange}
                onMarkAllPresent={handleMarkAllPresent}
                onSaveAttendance={handleSaveAttendance}
                saving={saving}
                loading={loading}
                hasUnsavedChanges={hasUnsavedChanges}
              />
            )}
          </div>
        )}

        {/* Tab 2: Monthly & Department Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-300">Select Analytics Month:</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-slate-950 text-xs font-bold text-white border border-slate-700 rounded-xl px-3 py-1.5 outline-none focus:border-indigo-500"
                />
              </div>

              <Button
                onClick={() => handleTriggerExport(selectedMonth)}
                variant="primary"
                size="sm"
                icon={Download}
                disabled={exportLoading}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 font-bold"
              >
                {exportLoading ? 'Exporting...' : 'Export Month Excel'}
              </Button>
            </div>

            <AttendanceAnalytics
              analytics={analytics}
              departmentAnalytics={departmentAnalytics}
              loading={analyticsLoading}
            />
          </div>
        )}

        {/* Tab 3: Export History & Reports */}
        {activeTab === 'exports' && (
          <AttendanceExportList
            exports={exports}
            loading={exportLoading}
            onExportTrigger={() => handleTriggerExport(selectedMonth)}
          />
        )}

      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel="Proceed"
        onConfirm={() => {
          if (confirmModal.action) confirmModal.action();
          setConfirmModal({ open: false, type: null, title: '', message: '', action: null });
        }}
        onCancel={() => setConfirmModal({ open: false, type: null, title: '', message: '', action: null })}
      />
    </div>
  );
};

export default AdminAttendancePage;
