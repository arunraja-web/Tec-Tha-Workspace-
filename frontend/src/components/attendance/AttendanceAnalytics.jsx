import React, { useState } from 'react';
import { Users, Calendar, CheckCircle2, XCircle, CalendarOff, Percent, Building2, Eye, X } from 'lucide-react';
import AttendanceSkeleton from './AttendanceSkeleton';
import AttendanceEmptyState from './AttendanceEmptyState';
import AttendanceCalendar from './AttendanceCalendar';

// User Initials helper
const getUserInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Attendance Analytics Component for Admin & Founder (Light Enterprise Dashboard Theme)
 */
export const AttendanceAnalytics = ({
  analytics = null,
  departmentAnalytics = null,
  loading = false,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  if (loading) {
    return <AttendanceSkeleton count={5} type="cards" />;
  }

  if (!analytics || !analytics.summary) {
    return (
      <AttendanceEmptyState
        title="No Analytics Data"
        description="No attendance data is available for the selected month."
      />
    );
  }

  const { summary, employees = [] } = analytics;
  const departments = departmentAnalytics?.departments || [];

  return (
    <div className="space-y-6 font-montserrat">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-none bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Workforce</div>
          <div className="text-xl font-bold text-slate-900 font-montserrat mt-1">{summary.totalEmployees || 0}</div>
        </div>

        <div className="p-4 rounded-none bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Working Days</div>
          <div className="text-xl font-bold text-[#0562ff] font-montserrat mt-1">{summary.workingDays || 0}</div>
        </div>

        <div className="p-4 rounded-none bg-emerald-50/60 border border-emerald-200 shadow-2xs">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Total Present</div>
          <div className="text-xl font-bold text-emerald-700 font-montserrat mt-1">{summary.totalPresent || 0}</div>
        </div>

        <div className="p-4 rounded-none bg-rose-50/60 border border-rose-200 shadow-2xs">
          <div className="text-xs font-bold text-rose-700 uppercase tracking-wider">Total Absent</div>
          <div className="text-xl font-bold text-rose-700 font-montserrat mt-1">{summary.totalAbsent || 0}</div>
        </div>

        <div className="p-4 rounded-none bg-amber-50/60 border border-amber-200 shadow-2xs">
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">Total Leave</div>
          <div className="text-xl font-bold text-amber-700 font-montserrat mt-1">{summary.totalLeave || 0}</div>
        </div>

        <div className="p-4 rounded-none bg-blue-50 border border-blue-200 shadow-2xs">
          <div className="text-xs font-bold text-[#0562ff] uppercase tracking-wider">Attendance %</div>
          <div className="text-xl font-extrabold text-[#0562ff] font-montserrat mt-1">
            {summary.overallAttendancePercentage || 100}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Breakdown Table (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-none shadow-sm divide-y divide-slate-200 font-montserrat">
          <div className="p-5 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2.5">
              <Users className="w-5 h-5 text-[#0562ff]" />
              Employee Monthly Breakdown
            </h3>
            <span className="text-xs font-semibold text-slate-500">{employees.length} Workforce Accounts</span>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse font-montserrat table-auto">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 text-xs">
                  <th className="py-3 px-3 w-12 text-center">S.No</th>
                  <th className="py-3 px-3 w-12 text-center">User</th>
                  <th className="py-3 px-4">Employee Name</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3 text-center">Present</th>
                  <th className="py-3 px-3 text-center">Absent</th>
                  <th className="py-3 px-3 text-right">Attendance %</th>
                  <th className="py-3 px-3 text-center">Calendar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((empStat, idx) => {
                  const emp = empStat.employee;
                  const pct = empStat.attendancePercentage;
                  const initials = getUserInitials(emp.name);
                  return (
                    <tr key={emp._id} className="hover:bg-slate-50/80 transition-colors text-sm">
                      <td className="py-3 px-3 text-center font-bold text-slate-600 text-xs font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="w-8 h-8 rounded-none bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-[#0562ff] uppercase text-xs font-montserrat mx-auto">
                          {initials}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 text-sm font-montserrat">{emp.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{emp.email}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex px-2 py-0.5 rounded-none text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                          {emp.department || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-700">
                        {empStat.totalPresent}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-rose-700">
                        {empStat.totalAbsent}
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-[#0562ff] font-montserrat">
                        {pct}%
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedEmployee(emp)}
                          className="p-1.5 rounded-none bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
                          title="View Attendance Calendar"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Department Analytics List (1 col) */}
        <div className="bg-white border border-slate-200 rounded-none shadow-sm divide-y divide-slate-200 font-montserrat">
          <div className="p-5">
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-[#0562ff]" />
              Department Attendance
            </h3>
          </div>

          <div className="p-5 space-y-4">
            {departments.length === 0 ? (
              <p className="text-xs text-slate-500">No department breakdown available.</p>
            ) : (
              departments.map((dept) => {
                const pct = dept.attendancePercentage || 0;
                return (
                  <div key={dept.department} className="space-y-2 p-3.5 rounded-none bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-bold text-slate-900 font-montserrat uppercase">{dept.department}</span>
                      <span className="font-extrabold text-[#0562ff] font-montserrat">{pct}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-200 rounded-none overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          pct >= 90 ? 'bg-emerald-600' : pct >= 75 ? 'bg-[#0562ff]' : 'bg-rose-600'
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>{dept.totalEmployees} Employees</span>
                      <span>{dept.totalPresent} Present Sessions</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Employee Calendar View Dialog */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-montserrat">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-none p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-montserrat">
                  {selectedEmployee.name} — Attendance Calendar
                </h3>
                <p className="text-xs text-slate-500 font-medium">{selectedEmployee.email} • {selectedEmployee.department}</p>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <AttendanceCalendar
              employeeId={selectedEmployee._id}
              month={analytics.month}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceAnalytics;
