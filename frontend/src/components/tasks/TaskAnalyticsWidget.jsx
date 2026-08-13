import React, { useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Play,
  AlertCircle,
  XCircle,
  AlertTriangle,
  Users,
  Calendar,
  Filter
} from 'lucide-react';

export const TaskAnalyticsWidget = ({
  analytics = null,
  employeeAnalytics = [],
  onDateFilterApply,
  loading = false,
}) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const handleApply = (e) => {
    e.preventDefault();
    if (onDateFilterApply) {
      onDateFilterApply({ from: fromDate || undefined, to: toDate || undefined });
    }
  };

  const handleReset = () => {
    setFromDate('');
    setToDate('');
    if (onDateFilterApply) {
      onDateFilterApply({});
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 p-8 text-center animate-pulse font-montserrat">
        <div className="h-6 bg-slate-200 w-1/3 mx-auto mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-20 bg-slate-100" />
          <div className="h-20 bg-slate-100" />
          <div className="h-20 bg-slate-100" />
          <div className="h-20 bg-slate-100" />
        </div>
      </div>
    );
  }

  const data = analytics || {};
  const totalTasks = data.totalTasks || 0;
  const todo = data.todo || 0;
  const inProgress = data.inProgress || 0;
  const inReview = data.inReview || 0;
  const completed = data.completed || 0;
  const cancelled = data.cancelled || 0;
  const overdue = data.overdue || 0;
  const completionPercentage = data.completionPercentage || (totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 0);

  const priority = data.priorityBreakdown || {};

  return (
    <div className="space-y-6 font-montserrat">
      {/* Top Header & Date Filter Bar */}
      <div className="bg-white border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#0562ff]" />
            <span>Company Task Analytics & Insights</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Real-time aggregate performance metrics and team task distribution
          </p>
        </div>

        {/* Date Range Picker Form */}
        <form onSubmit={handleApply} className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-transparent text-slate-800 focus:outline-none"
            />
          </div>
          <span className="text-slate-400">to</span>
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-transparent text-slate-800 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#0562ff] hover:bg-blue-700 text-white font-semibold cursor-pointer transition-colors"
          >
            Apply
          </button>
          {(fromDate || toDate) && (
            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1.5 border border-slate-300 text-slate-600 hover:bg-slate-100"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Total Tasks */}
        <div className="bg-white border border-slate-200 p-4 text-center shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Total</span>
          <span className="text-2xl font-extrabold text-slate-900">{totalTasks}</span>
        </div>

        {/* To Do */}
        <div className="bg-white border border-slate-200 p-4 text-center shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase block mb-1">To Do</span>
          <span className="text-2xl font-extrabold text-slate-700">{todo}</span>
        </div>

        {/* In Progress */}
        <div className="bg-white border border-slate-200 p-4 text-center shadow-xs">
          <span className="text-xs font-bold text-[#0562ff] uppercase block mb-1">In Progress</span>
          <span className="text-2xl font-extrabold text-[#0562ff]">{inProgress}</span>
        </div>

        {/* In Review */}
        <div className="bg-white border border-slate-200 p-4 text-center shadow-xs">
          <span className="text-xs font-bold text-amber-600 uppercase block mb-1">In Review</span>
          <span className="text-2xl font-extrabold text-amber-600">{inReview}</span>
        </div>

        {/* Completed */}
        <div className="bg-white border border-slate-200 p-4 text-center shadow-xs">
          <span className="text-xs font-bold text-emerald-600 uppercase block mb-1">Completed</span>
          <span className="text-2xl font-extrabold text-emerald-600">{completed}</span>
        </div>

        {/* Cancelled */}
        <div className="bg-white border border-slate-200 p-4 text-center shadow-xs">
          <span className="text-xs font-bold text-rose-600 uppercase block mb-1">Cancelled</span>
          <span className="text-2xl font-extrabold text-rose-600">{cancelled}</span>
        </div>

        {/* Overdue */}
        <div className="bg-white border border-slate-200 p-4 text-center shadow-xs">
          <span className="text-xs font-bold text-rose-700 uppercase block mb-1">Overdue</span>
          <span className="text-2xl font-extrabold text-rose-700">{overdue}</span>
        </div>

        {/* Completion % */}
        <div className="bg-emerald-50 border border-emerald-200 p-4 text-center shadow-xs">
          <span className="text-xs font-bold text-emerald-700 uppercase block mb-1">Completion</span>
          <span className="text-2xl font-extrabold text-emerald-700">{completionPercentage}%</span>
        </div>
      </div>

      {/* Priority Breakdown Bar */}
      {priority && (
        <div className="bg-white border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Task Priority Distribution
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
            <div className="p-3 bg-slate-50 border border-slate-200 flex justify-between items-center">
              <span>Low Priority</span>
              <strong className="text-slate-700 font-bold">{priority.low || 0}</strong>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 flex justify-between items-center">
              <span className="text-blue-700">Medium Priority</span>
              <strong className="text-blue-800 font-bold">{priority.medium || 0}</strong>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 flex justify-between items-center">
              <span className="text-amber-700">High Priority</span>
              <strong className="text-amber-800 font-bold">{priority.high || 0}</strong>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-200 flex justify-between items-center">
              <span className="text-rose-700">Urgent Priority</span>
              <strong className="text-rose-800 font-bold">{priority.urgent || 0}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Employee Breakdown Analytics Table */}
      {employeeAnalytics.length > 0 && (
        <div className="bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#0562ff]" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Employee Performance & Task Completion Breakdown
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Employee</th>
                  <th className="py-2.5 px-4 text-center">Total Tasks</th>
                  <th className="py-2.5 px-4 text-center">Completed</th>
                  <th className="py-2.5 px-4 text-center">In Progress</th>
                  <th className="py-2.5 px-4 text-center">Overdue</th>
                  <th className="py-2.5 px-4 text-right">Completion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {employeeAnalytics.map((emp) => {
                  const empObj = emp.employee || emp.user || {};
                  const total = emp.total || emp.totalTasks || 0;
                  const comp = emp.completed || 0;
                  const rate = emp.completionPercentage || (total > 0 ? Math.round((comp / total) * 100) : 0);

                  return (
                    <tr key={empObj._id || empObj.id || emp.name} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {empObj.name || emp.name || 'Employee'}
                        {empObj.email && (
                          <span className="text-[11px] text-slate-500 font-normal block">{empObj.email}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-700">{total}</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">{comp}</td>
                      <td className="py-3 px-4 text-center font-semibold text-[#0562ff]">
                        {emp.inProgress || 0}
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-rose-600">
                        {emp.overdue || 0}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                        {rate}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskAnalyticsWidget;
