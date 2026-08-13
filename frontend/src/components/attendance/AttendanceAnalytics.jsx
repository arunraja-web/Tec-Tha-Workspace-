import React, { useState } from 'react';
import { Users, Calendar, CheckCircle2, XCircle, CalendarOff, Percent, Building2, Eye } from 'lucide-react';
import AttendanceSkeleton from './AttendanceSkeleton';
import AttendanceEmptyState from './AttendanceEmptyState';
import AttendanceCalendar from './AttendanceCalendar';

/**
 * Attendance Analytics Component for Admin & Founder
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
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl glass-card border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400">Total Employees</div>
          <div className="text-xl font-bold text-white mt-1">{summary.totalEmployees || 0}</div>
        </div>

        <div className="p-4 rounded-2xl glass-card border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400">Working Days</div>
          <div className="text-xl font-bold text-indigo-400 mt-1">{summary.workingDays || 0}</div>
        </div>

        <div className="p-4 rounded-2xl glass-card border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400">Total Present</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{summary.totalPresent || 0}</div>
        </div>

        <div className="p-4 rounded-2xl glass-card border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400">Total Absent</div>
          <div className="text-xl font-bold text-rose-400 mt-1">{summary.totalAbsent || 0}</div>
        </div>

        <div className="p-4 rounded-2xl glass-card border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400">Total Leave</div>
          <div className="text-xl font-bold text-amber-400 mt-1">{summary.totalLeave || 0}</div>
        </div>

        <div className="p-4 rounded-2xl glass-card border-indigo-500/30 bg-indigo-950/20">
          <div className="text-[11px] font-semibold text-indigo-300">Overall Attendance</div>
          <div className="text-xl font-extrabold text-indigo-400 mt-1">
            {summary.overallAttendancePercentage || 100}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Breakdown Table (2 cols) */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Employee Monthly Breakdown
            </h3>
            <span className="text-xs text-slate-400">{employees.length} Employees</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-extrabold uppercase text-slate-400">
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3 text-center">Present</th>
                  <th className="py-2.5 px-3 text-center">Absent</th>
                  <th className="py-2.5 px-3 text-right">Attendance %</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {employees.map((empStat) => {
                  const emp = empStat.employee;
                  const pct = empStat.attendancePercentage;
                  return (
                    <tr key={emp._id} className="hover:bg-slate-900/40 text-xs">
                      <td className="py-3 px-3 font-semibold text-white">
                        {emp.name}
                        <div className="text-[10px] font-normal text-slate-400">{emp.email}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{emp.department}</td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-400">
                        {empStat.totalPresent}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-rose-400">
                        {empStat.totalAbsent}
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-indigo-400">
                        {pct}%
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedEmployee(emp)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="View Calendar"
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
        <div className="glass-card rounded-3xl p-6 border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            Department Attendance
          </h3>

          <div className="space-y-4">
            {departments.length === 0 ? (
              <p className="text-xs text-slate-400">No department breakdown available.</p>
            ) : (
              departments.map((dept) => {
                const pct = dept.attendancePercentage || 0;
                return (
                  <div key={dept.department} className="space-y-1.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{dept.department}</span>
                      <span className="font-extrabold text-indigo-400">{pct}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          pct >= 90 ? 'bg-emerald-500' : pct >= 75 ? 'bg-indigo-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-2xl glass-card rounded-3xl p-6 border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  {selectedEmployee.name} — Attendance Calendar
                </h3>
                <p className="text-xs text-slate-400">{selectedEmployee.email} • {selectedEmployee.department}</p>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-slate-400 hover:text-white text-xs font-bold px-3 py-1 rounded-xl bg-slate-900 border border-slate-800"
              >
                Close
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
