import React from 'react';
import { 
  CheckSquare, 
  Clock, 
  Video, 
  MessageSquare, 
  Megaphone, 
  FileText, 
  UserCheck, 
  CalendarOff,
  Sparkles
} from 'lucide-react';

export const CoreFeatures = () => {
  const features = [
    {
      icon: CheckSquare,
      title: 'Task Management',
      description: 'Create, assign, and track project tasks with real-time status updates, priorities, and deadlines.',
    },
    {
      icon: Clock,
      title: 'Attendance Management',
      description: 'Effortless automated clock-in/out tracking with real-time active status across teams.',
    },
    {
      icon: Video,
      title: 'Meetings',
      description: 'Schedule company syncs, 1-on-1s, and department huddles with direct video link integrations.',
    },
    {
      icon: MessageSquare,
      title: 'Team Communication',
      description: 'Contextual group channels and direct messaging designed for focused workplace collaboration.',
    },
    {
      icon: Megaphone,
      title: 'Company Announcements',
      description: 'Broadcast important organizational news, policy updates, and executive briefings instantly.',
    },
    {
      icon: FileText,
      title: 'Daily Work Reports',
      description: 'Standardized end-of-day work summaries ensuring transparency and aligned progress.',
    },
    {
      icon: UserCheck,
      title: 'Employee Profiles',
      description: 'Centralized directory with contact details, designations, teams, and skills overview.',
    },
    {
      icon: CalendarOff,
      title: 'Leave Management',
      description: 'Transparent leave application workflows, balance tracking, and manager approvals.',
    },
  ];

  return (
    <section id="features" className="py-24 relative bg-white dark:bg-black text-slate-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built for Modern Workflows</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-5">
            Core Workspace Features
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Everything your distributed team needs to manage operations, stay connected, and deliver high-impact work.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 flex flex-col justify-between group shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-neutral-700 transition-all duration-200"
              >
                <div>
                  {/* Minimal Icon */}
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 flex items-center justify-center text-slate-900 dark:text-white group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors duration-200 mb-5">
                    <IconComponent className="w-5 h-5" />
                  </div>

                  {/* Feature Title */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>

                  {/* Short Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-neutral-800/80 flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  <span>Learn more</span>
                  <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default CoreFeatures;
