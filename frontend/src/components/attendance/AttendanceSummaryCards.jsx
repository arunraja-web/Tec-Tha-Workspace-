import React from 'react';
import { Users, CheckCircle2, XCircle, CalendarOff, Palmtree, HelpCircle } from 'lucide-react';

/**
 * Daily Attendance summary cards component with Zoho Dashboard aesthetic
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
      title: 'Total Workforce',
      value: total,
      subtext: 'Active accounts',
      icon: Users,
      color: 'text-slate-900',
      bg: 'bg-slate-50 border-slate-200',
      iconBg: 'bg-slate-100 text-slate-700 border-slate-300',
    },
    {
      title: 'Present Today',
      value: present,
      subtext: `${session === 'morning' ? 'Morning' : 'Evening'} session`,
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50/60 border-emerald-200',
      iconBg: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    },
    {
      title: 'Absent',
      value: absent,
      subtext: `${session === 'morning' ? 'Morning' : 'Evening'} session`,
      icon: XCircle,
      color: 'text-rose-700',
      bg: 'bg-rose-50/60 border-rose-200',
      iconBg: 'bg-rose-100 text-rose-700 border-rose-300',
    },
    {
      title: 'On Leave',
      value: leave,
      subtext: 'Approved leaves',
      icon: CalendarOff,
      color: 'text-amber-700',
      bg: 'bg-amber-50/60 border-amber-200',
      iconBg: 'bg-amber-100 text-amber-700 border-amber-300',
    },
    {
      title: 'Not Marked',
      value: notMarked,
      subtext: 'Pending status',
      icon: HelpCircle,
      color: 'text-slate-700',
      bg: 'bg-slate-50 border-slate-200',
      iconBg: 'bg-slate-100 text-slate-500 border-slate-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 font-montserrat">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-none border shadow-2xs flex items-center justify-between transition-all bg-white ${card.bg}`}
          >
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">{card.title}</div>
              <div className={`text-2xl font-extrabold font-montserrat ${card.color}`}>
                {card.value}
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{card.subtext}</p>
            </div>

            <div className={`w-9 h-9 rounded-none flex items-center justify-center font-bold border shrink-0 ${card.iconBg}`}>
              <IconComponent className="w-4.5 h-4.5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AttendanceSummaryCards;
