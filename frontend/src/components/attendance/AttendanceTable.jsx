import React, { useState } from 'react';
import { CheckCheck, Save, Search, RefreshCw } from 'lucide-react';
import AttendanceRow from './AttendanceRow';
import AttendanceSessionTabs from './AttendanceSessionTabs';
import Button from '../common/Button';

/**
 * Attendance Table Component for Admin Daily Attendance Management
 */
export const AttendanceTable = ({
  employees = [],
  selectedDate,
  onDateChange,
  activeSession = 'morning',
  onSessionChange,
  onStatusChange,
  onMarkAllPresent,
  onSaveAttendance,
  saving = false,
  loading = false,
  hasUnsavedChanges = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = employees.filter((item) => {
    const name = item.employee?.name || '';
    const email = item.employee?.email || '';
    const dept = item.employee?.department || '';
    const term = searchTerm.toLowerCase();
    return name.toLowerCase().includes(term) || email.toLowerCase().includes(term) || dept.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="glass-card rounded-2xl p-4 border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Date Selector & Session Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <label htmlFor="attendance-date" className="text-xs font-semibold text-slate-400">
              Date:
            </label>
            <input
              id="attendance-date"
              type="date"
              value={selectedDate || ''}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
            />
          </div>

          <AttendanceSessionTabs activeSession={activeSession} onSelectSession={onSessionChange} />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={onMarkAllPresent}
            variant="outline"
            size="sm"
            disabled={saving || loading || employees.length === 0}
            icon={CheckCheck}
            className="text-xs border-slate-700 hover:bg-slate-800 text-slate-200"
          >
            Mark All Present
          </Button>

          <Button
            type="button"
            onClick={onSaveAttendance}
            variant="primary"
            size="sm"
            disabled={saving || loading}
            icon={saving ? RefreshCw : Save}
            className={`text-xs font-bold ${
              hasUnsavedChanges
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-950/60 animate-pulse'
                : 'bg-indigo-700 hover:bg-indigo-600 text-white'
            }`}
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="glass-card rounded-3xl border-slate-800 overflow-hidden">
        {/* Table Search & Filter Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/40">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search employee or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/90 text-xs text-white placeholder-slate-500 pl-9 pr-4 py-2 rounded-xl border border-slate-800 outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Showing <span className="text-white font-bold">{filteredEmployees.length}</span> of{' '}
            <span className="text-slate-300 font-bold">{employees.length}</span> employees
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4 hidden md:table-cell">Department</th>
                <th className="py-3 px-4 hidden sm:table-cell">Alternate Session</th>
                <th className="py-3 px-4 text-right">
                  {activeSession === 'morning' ? 'Morning Status' : 'Evening Status'}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-xs text-slate-400">
                    No employees matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((empData) => (
                  <AttendanceRow
                    key={empData.employee._id || empData.employee}
                    employeeData={empData}
                    activeSession={activeSession}
                    onStatusChange={onStatusChange}
                    disabled={saving || loading}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTable;
