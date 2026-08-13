import React from 'react';
import { Users, CheckCircle2, XCircle, CalendarOff, Palmtree, HelpCircle } from 'lucide-react';

/**
 * Daily Attendance summary cards component
 */
export const AttendanceSummaryCards = ({ employees = [], session = 'morning' }) => {
  let total = employees.length;
  let present = 0;
  let absent = 0;
  let leave = 0;
  let holiday = 0;
  let notMarked = 0;

  employees.forEach((emp) => {
    const sessionData = emp[session];
    const status = sessionData ? sessionData.status : null;
    if (status === 'present') present++;
    else if (status === 'absent') absent++;
    else if (status === 'leave') leave++;
    else if (status === 'holiday') holiday++;
    else notMarked++;
  });

  const cards = [
    {
      title: 'Total Employees',
      value: total,
      subtext: 'Active workforce',
      icon: Users,
      color: 'text-indigo-400',
      bg: 'bg-indigo-950/40 border-indigo-500/20',
    },
    {
      title: 'Present',
      value: present,
      subtext: `${session === 'morning' ? 'Morning' : 'Evening'} session`,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/40 border-emerald-500/20',
    },
    {
      title: 'Absent',
      value: absent,
      subtext: `${session === 'morning' ? 'Morning' : 'Evening'} session`,
      icon: XCircle,
      color: 'text-rose-400',
      bg: 'bg-rose-950/40 border-rose-500/20',
    },
    {
      title: 'On Leave',
      value: leave,
      subtext: 'Approved leaves',
      icon: CalendarOff,
      color: 'text-amber-400',
      bg: 'bg-amber-950/40 border-amber-500/20',
    },
    {
      title: 'Not Marked',
      value: notMarked,
      subtext: 'Pending status',
      icon: HelpCircle,
      color: 'text-slate-400',
      bg: 'bg-slate-900 border-slate-800',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl border backdrop-blur-md flex flex-col justify-between space-y-2 transition-all hover:scale-[1.02] ${card.bg}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">{card.title}</span>
              <IconComponent className={`w-4 h-4 ${card.color}`} />
            </div>
            <div>
              <div className={`text-2xl font-extrabold tracking-tight ${card.color}`}>
                {card.value}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">{card.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AttendanceSummaryCards;
