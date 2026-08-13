import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
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
  LogOut,
  Globe,
  CheckCircle,
  XCircle,
  X
} from 'lucide-react';

import AttendanceSummaryCards from '../../components/attendance/AttendanceSummaryCards';
import AttendanceTable from '../../components/attendance/AttendanceTable';
import AttendanceAnalytics from '../../components/attendance/AttendanceAnalytics';
import AttendanceExportList from '../../components/attendance/AttendanceExportList';
import AttendanceSkeleton from '../../components/attendance/AttendanceSkeleton';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatFriendlyDate, getCurrentYYYYMM } from '../../utils/formatDate';

export const AdminAttendancePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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

  const handleLogout = () => {
    setConfirmModal({
      open: true,
      type: 'signout_confirm',
      variant: 'rose',
      icon: LogOut,
      title: 'Confirm Sign Out',
      message: 'Are you sure you want to sign out of TEC THA Workspace? You will need to sign in again to access your dashboard.',
      action: () => {
        logout();
        navigate('/');
      },
    });
  };

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
        message: `${unmarkedCount} employee(s) do not have a status selected for ${selectedSession} session. Save for marked employees?`,
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
      message: `Generating this report will compile attendance data and generate an Excel report. Proceed?`,
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
    <div className="min-h-screen flex flex-col justify-between relative bg-slate-100 font-montserrat selection:bg-[#0562ff] selection:text-white">

      {/* Faint diagonal-panel background matching light enterprise sign-in aesthetic */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg">
          <rect width="1600" height="900" fill="#f4f5f7" />
          <polygon points="0,0 650,0 250,900 0,900" fill="#eceef1" />
          <polygon points="700,0 1000,0 500,900 300,900" fill="#e6e9ed" />
          <polygon points="1600,0 1600,300 900,900 700,900" fill="#eceef1" />
        </svg>
      </div>

      {/* Sticky Top Navbar Header */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-md sticky top-0 z-50">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">

          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/logo1.webp"
                alt="TEC THA Workspace Logo"
                className="h-10 w-auto object-contain max-w-[160px]"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </Link>
            <div className="h-7 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-lg sm:text-xl font-bold font-montserrat text-slate-900 leading-tight">
                  ATTENDANCE MANAGEMENT
                </h1>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  TEC THA Workspace Enterprise Attendance System
                </p>
              </div>
            </div>
          </div>

          {/* Right: Profile Info & Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <Link
              to="/admin/dashboard"
              className="p-2.5 text-slate-700 hover:text-[#0562ff] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-none transition-colors text-sm font-semibold flex items-center gap-2 font-montserrat"
            >
              <span>User Directory</span>
            </Link>

            {/* External Website Link */}
            <a
              href="https://tectha.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 text-slate-700 hover:text-[#0562ff] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-none transition-colors text-sm font-semibold flex items-center gap-2"
              title="Official Website"
            >
              <Globe className="w-4.5 h-4.5" />
              <span className="hidden sm:inline">Website</span>
            </a>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              className="bg-[#0562ff] hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-none shadow-sm transition-all flex items-center gap-2 cursor-pointer font-montserrat"
            >
              <LogOut className="w-4.5 h-4.5" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Layout Container */}
      <div className="relative z-10 w-full flex-grow flex flex-col">

        {/* Toast Alert Banner */}
        {notification.show && (
          <div className="max-w-[1500px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <div
              className={`p-4 rounded-none border text-sm font-semibold flex items-center justify-between shadow-sm font-montserrat ${notification.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
            >
              <div className="flex items-center gap-2.5">
                {notification.type === 'error' ? (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                <span>{notification.message}</span>
              </div>
              <button onClick={() => setNotification({ show: false, message: '', type: 'success' })} className="cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <main className="max-w-[1500px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-grow">

          {/* Navigation Bar / Tabs (Zoho Style) */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-none p-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('daily')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-none transition-all cursor-pointer font-montserrat ${activeTab === 'daily'
                  ? 'bg-[#0562ff] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <Calendar className="w-4.5 h-4.5" /> Daily Attendance
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-none transition-all cursor-pointer font-montserrat ${activeTab === 'analytics'
                  ? 'bg-[#0562ff] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <BarChart3 className="w-4.5 h-4.5" /> Attendance Analytics
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('exports')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-none transition-all cursor-pointer font-montserrat ${activeTab === 'exports'
                  ? 'bg-[#0562ff] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
            >
              <FileSpreadsheet className="w-4.5 h-4.5" /> Monthly Export Reports
            </button>
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

          {/* Tab 2: Monthly Analytics */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-none border border-slate-200 shadow-sm font-montserrat">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-bold text-slate-800 uppercase tracking-wider">Select Month:</label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-slate-50 text-sm font-bold text-slate-900 border border-slate-300 rounded-none px-3.5 py-2 outline-none focus:border-[#0562ff] focus:ring-1 focus:ring-[#0562ff] font-montserrat"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleTriggerExport(selectedMonth)}
                  disabled={exportLoading}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-none bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer font-montserrat uppercase tracking-wider disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{exportLoading ? 'Generating Export...' : 'Export Monthly Excel'}</span>
                </button>
              </div>

              <AttendanceAnalytics
                analytics={analytics}
                departmentAnalytics={departmentAnalytics}
                loading={analyticsLoading}
              />
            </div>
          )}

          {/* Tab 3: Export History */}
          {activeTab === 'exports' && (
            <AttendanceExportList
              exports={exports}
              loading={exportLoading}
              onExportTrigger={() => handleTriggerExport(selectedMonth)}
            />
          )}

        </main>

        {/* Footer Bar */}
        <footer className="relative z-10 w-full text-center py-5 text-sm text-slate-500 font-medium space-y-1 border-t border-slate-200/80 bg-white/60 backdrop-blur-xs mt-auto">
          <div>
            © {new Date().getFullYear()}, TEC THA Workspace Pvt. Ltd. All Rights Reserved.
          </div>
          <div>
            <a href="mailto:support@tectha.com" className="hover:text-[#0562ff] transition-colors font-semibold">
              support@tectha.com
            </a>
          </div>
        </footer>

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
