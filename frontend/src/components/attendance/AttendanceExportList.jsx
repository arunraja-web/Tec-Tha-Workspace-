import React, { useState } from 'react';
import { FileSpreadsheet, Download, CheckCircle2, Clock, Calendar, Plus } from 'lucide-react';
import AttendanceSkeleton from './AttendanceSkeleton';
import AttendanceEmptyState from './AttendanceEmptyState';
import { formatFriendlyMonth, getCurrentYYYYMM } from '../../utils/formatDate';

/**
 * Attendance Exports List & Manual Trigger Component (Light Dashboard Theme, rounded-none)
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
    <div className="space-y-6 font-montserrat">
      {/* Top Manual Export Card */}
      <div className="bg-white border border-slate-200 rounded-none p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-montserrat">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-none bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide">Generate Monthly Attendance Report</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Compile monthly attendance records into an Excel spreadsheet & store report history.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="month"
            value={exportMonth}
            onChange={(e) => setExportMonth(e.target.value)}
            className="bg-slate-50 text-sm font-bold text-slate-900 border border-slate-300 rounded-none px-3.5 py-2.5 outline-none focus:border-[#0562ff] focus:ring-1 focus:ring-[#0562ff] font-montserrat"
          />
          <button
            type="button"
            onClick={() => onExportTrigger && onExportTrigger(exportMonth)}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-none shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer font-montserrat uppercase tracking-wider whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Export Month</span>
          </button>
        </div>
      </div>

      {/* Export History Section */}
      <div className="bg-white border border-slate-200 rounded-none shadow-sm divide-y divide-slate-200 font-montserrat">
        <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-[#0562ff]" />
              Export Reports History
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">View and download compiled Excel monthly attendance reports</p>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-none uppercase">
            {exports.length} Reports Available
          </span>
        </div>

        <div className="p-5">
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
                    className="p-5 rounded-none bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="text-base font-bold text-slate-900 font-montserrat">
                          {formatFriendlyMonth(exp.month)}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          Records: <strong className="text-slate-900">{exp.recordCount || 0}</strong>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-none border uppercase tracking-wider ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {exp.status || 'Completed'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 pt-2 border-t border-slate-200 flex items-center justify-between font-medium">
                      <span>Generated: {exp.createdAt ? new Date(exp.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>

                    {downloadUrl ? (
                      <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-none text-xs font-bold bg-[#0562ff] text-white hover:bg-blue-700 shadow-2xs transition-all text-center uppercase tracking-wider font-montserrat"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Excel Report</span>
                      </a>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-none text-xs font-semibold bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed uppercase font-montserrat"
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
    </div>
  );
};

export default AttendanceExportList;
