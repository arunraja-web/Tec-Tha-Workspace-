import React from 'react';
import { Users, CheckSquare, MessageSquare, Video, Building2, ArrowUpRight } from 'lucide-react';

export const WhatIsWorkspace = () => {
  const pillars = [
    {
      icon: Users,
      title: 'People',
      description: 'Centralized directory, employee profiles, attendance status, and team structures.',
      step: '01',
    },
    {
      icon: CheckSquare,
      title: 'Tasks',
      description: 'Streamlined task management, progress tracking, and daily work reports.',
      step: '02',
    },
    {
      icon: MessageSquare,
      title: 'Communication',
      description: 'Instant team messaging, group discussions, and company-wide announcements.',
      step: '03',
    },
    {
      icon: Video,
      title: 'Meetings',
      description: 'Integrated meeting scheduling, virtual room links, and collaborative agenda notes.',
      step: '04',
    },
    {
      icon: Building2,
      title: 'Operations',
      description: 'Leave approvals, performance tracking, operational reports, and administrative management.',
      step: '05',
    },
  ];

  return (
    <section id="about" className="py-24 relative bg-slate-50 dark:bg-neutral-950 border-y border-slate-200 dark:border-neutral-800/90 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
            Unified Virtual Environment
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-5">
            What is the Workspace?
          </h3>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            A single, comprehensive digital headquarters engineered to seamlessly connect every aspect of modern virtual companies without friction.
          </p>
        </div>

        {/* Pillars Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {pillars.map((pillar) => {
            const IconComponent = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 flex flex-col justify-between group relative shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-neutral-700 transition-all duration-200"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 flex items-center justify-center mb-5 text-slate-900 dark:text-white group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors duration-200">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  
                  <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
                    <span>{pillar.title}</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                  </h4>
                  
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  <span>Module</span>
                  <span>{pillar.step}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default WhatIsWorkspace;
