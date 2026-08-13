import React, { useState } from 'react';
import { FileSpreadsheet, Download, CheckCircle2, Clock, Calendar, Plus } from 'lucide-react';
import AttendanceSkeleton from './AttendanceSkeleton';
import AttendanceEmptyState from './AttendanceEmptyState';
import Button from '../common/Button';
import { formatFriendlyMonth, getCurrentYYYYMM } from '../../utils/formatDate';

/**
 * Attendance Exports List & Manual Trigger Component
 */
export const AttendanceExportList = ({
  exports = [],
  loading = false,
  onExportTrigger,
}) => {
  const [exportMonth, setExportMonth] = useState(getCurrentYYYYMM());

  if (loading) {
    return <AttendanceSkeleton count={4} />;
  }

  return (
    <div className="space-y-6">
      {/* Top Manual Export Card */}
      <div className="glass-card rounded-3xl p-6 border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Generate Monthly Report</h3>
            <p className="text-xs text-slate-400">
              Compile monthly attendance records into an Excel spreadsheet & store report history.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="month"
            value={exportMonth}
            onChange={(e) => setExportMonth(e.target.value)}
            className="bg-slate-900 text-xs font-bold text-white border border-slate-700 rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
          />
          <Button
            type="button"
            onClick={() => onExportTrigger && onExportTrigger(exportMonth)}
            variant="primary"
            size="sm"
            icon={Plus}
            className="bg-emerald-600 hover:bg-emerald-500 font-bold text-xs"
          >
            Export Month
          </Button>
        </div>
      </div>

      {/* Export History Section */}
      <div className="glass-card rounded-3xl p-6 border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Export Reports History
            </h3>
            <p className="text-xs text-slate-400">View and download compiled Excel monthly attendance reports</p>
          </div>
          <span className="text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
            {exports.length} Reports Available
          </span>
        </div>

        {exports.length === 0 ? (
          <AttendanceEmptyState
            title="No Export Reports Available"
            description="No monthly attendance report exports have been generated yet."
            icon={FileSpreadsheet}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exports.map((exp) => {
              const downloadUrl = exp.cloudStorage?.url || exp.fileUrl;
              const isCompleted = exp.status === 'completed';

              return (
                <div
                  key={exp._id || exp.month}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <div className="text-sm font-extrabold text-white">
                        {formatFriendlyMonth(exp.month)}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Records: <strong className="text-slate-200">{exp.recordCount || 0}</strong>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isCompleted
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-950/80 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {exp.status || 'Completed'}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span>Generated: {exp.createdAt ? new Date(exp.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>

                  {downloadUrl ? (
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/40 transition-all text-center"
                    >
                      <Download className="w-4 h-4" />
                      Download Excel Report
                    </a>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2 rounded-xl text-xs font-semibold bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed"
                    >
                      Download Unavailable
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceExportList;
