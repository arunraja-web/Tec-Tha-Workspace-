import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAttendanceAnalytics,
  fetchDepartmentAnalytics,
  fetchExportsHistory,
} from '../../redux/slices/attendanceSlice';

import { BarChart3, FileSpreadsheet, ShieldCheck, Calendar } from 'lucide-react';
import AttendanceAnalytics from '../../components/attendance/AttendanceAnalytics';
import AttendanceExportList from '../../components/attendance/AttendanceExportList';
import { getCurrentYYYYMM, formatFriendlyMonth } from '../../utils/formatDate';

export const FounderAttendanceAnalyticsPage = () => {
  const dispatch = useDispatch();

  const {
    analytics,
    departmentAnalytics,
    exports,
    analyticsLoading,
    exportLoading,
  } = useSelector((state) => state.attendance);

  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'exports'
  const [selectedMonth, setSelectedMonth] = useState(getCurrentYYYYMM());

  useEffect(() => {
    dispatch(fetchAttendanceAnalytics(selectedMonth));
    dispatch(fetchDepartmentAnalytics(selectedMonth));
  }, [dispatch, selectedMonth]);

  useEffect(() => {
    if (activeTab === 'exports') {
      dispatch(fetchExportsHistory());
    }
  }, [dispatch, activeTab]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-6 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Page Top Header */}
        <div className="glass-card rounded-3xl p-6 border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white">Attendance Executive Analytics</h1>
                <span className="bg-indigo-950/80 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/30 uppercase">
                  Founder Workspace (Read-Only)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Organizational attendance metrics, employee performance, department breakdowns, and export reports.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Company Analytics</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('exports')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'exports'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export History</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Company Analytics */}
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

              <span className="text-xs text-slate-400 font-semibold">
                Viewing report for: <strong className="text-white">{formatFriendlyMonth(selectedMonth)}</strong>
              </span>
            </div>

            <AttendanceAnalytics
              analytics={analytics}
              departmentAnalytics={departmentAnalytics}
              loading={analyticsLoading}
            />
          </div>
        )}

        {/* Tab 2: Export History (Read-only download) */}
        {activeTab === 'exports' && (
          <AttendanceExportList
            exports={exports}
            loading={exportLoading}
          />
        )}

      </div>
    </div>
  );
};

export default FounderAttendanceAnalyticsPage;
