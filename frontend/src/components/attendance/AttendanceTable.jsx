import React, { useState } from 'react';
import { CheckCheck, Save, Search, RefreshCw, Calendar, Sun, Moon } from 'lucide-react';
import AttendanceRow from './AttendanceRow';
import AttendanceSessionTabs from './AttendanceSessionTabs';

/**
 * Attendance Table Component for Admin Daily Attendance Management
 * Zoho Dashboard Layout (rounded-none, S.NO, User Initials, font-montserrat)
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
    <div className="bg-white border border-slate-200 rounded-none shadow-sm divide-y divide-slate-200 font-montserrat w-full">
      
      {/* Section 1: Controls Toolbar & Session Switcher */}
      <div className="p-4 sm:p-5 bg-slate-50/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Date Selector & Session Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-none border border-slate-300 shadow-2xs">
            <Calendar className="w-4 h-4 text-[#0562ff]" />
            <label htmlFor="attendance-date" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Date:
            </label>
            <input
              id="attendance-date"
              type="date"
              value={selectedDate || ''}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 outline-none cursor-pointer font-montserrat"
            />
          </div>

          <AttendanceSessionTabs activeSession={activeSession} onSelectSession={onSessionChange} />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onMarkAllPresent}
            disabled={saving || loading || employees.length === 0}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-semibold text-xs rounded-none transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-montserrat uppercase tracking-wider disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Mark All Present</span>
          </button>

          <button
            type="button"
            onClick={onSaveAttendance}
            disabled={saving || loading}
            className={`px-5 py-2.5 rounded-none text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer font-montserrat disabled:opacity-50 ${
              hasUnsavedChanges
                ? 'bg-[#0562ff] hover:bg-blue-700 ring-2 ring-blue-400 animate-pulse'
                : 'bg-[#0562ff] hover:bg-blue-700'
            }`}
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
          </button>
        </div>
      </div>

      {/* Section 2: Table Search Bar */}
      <div className="p-4 flex items-center justify-between gap-4 bg-white">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee name, email or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 text-xs font-medium text-slate-900 placeholder-slate-400 pl-10 pr-3.5 py-2.5 rounded-none border border-slate-300 outline-none focus:border-[#0562ff] focus:ring-1 focus:ring-[#0562ff] font-montserrat"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="text-slate-900 font-bold">{filteredEmployees.length}</span> of{' '}
          <span className="text-slate-900 font-bold">{employees.length}</span> workforce accounts
        </div>
      </div>

      {/* Section 3: Attendance Table with S.NO and User Initials */}
      <div className="w-full">
        <table className="w-full text-left text-sm border-collapse font-montserrat table-auto">
          <thead>
            <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-xs">
              <th className="py-3.5 px-3 w-12 text-center">S.No</th>
              <th className="py-3.5 px-3 w-12 text-center">User</th>
              <th className="py-3.5 px-4 min-w-[160px]">Employee Name</th>
              <th className="py-3.5 px-4 min-w-[130px] hidden md:table-cell">Department</th>
              <th className="py-3.5 px-4 min-w-[130px] hidden sm:table-cell">Alternate Session</th>
              <th className="py-3.5 px-4 text-right min-w-[160px]">
                {activeSession === 'morning' ? 'Morning Session Status' : 'Evening Session Status'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-xs text-slate-500 font-medium">
                  No employees matching search criteria.
                </td>
              </tr>
            ) : (
              filteredEmployees.map((empData, index) => (
                <AttendanceRow
                  key={empData.employee._id || empData.employee}
                  index={index}
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
  );
};

export default AttendanceTable;
