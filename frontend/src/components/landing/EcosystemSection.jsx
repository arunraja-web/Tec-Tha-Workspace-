import React from 'react';
import { Building2, Users, Briefcase, MessageSquare, ShieldCheck, ArrowDown } from 'lucide-react';

export const EcosystemSection = () => {
  const flowNodes = [
    {
      step: '01',
      title: 'People',
      description: 'Distributed Teams & Profiles',
      icon: Users,
    },
    {
      step: '02',
      title: 'Work',
      description: 'Tasks, Projects & Reports',
      icon: Briefcase,
    },
    {
      step: '03',
      title: 'Communication',
      description: 'Chat & Company Channels',
      icon: MessageSquare,
    },
    {
      step: '04',
      title: 'Meetings',
      description: 'Video Huddles & Syncs',
      icon: Building2,
    },
    {
      step: '05',
      title: 'Operations',
      description: 'Leaves & Governance',
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="py-24 relative bg-slate-50 dark:bg-neutral-950 border-t border-slate-200 dark:border-neutral-800/90 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
            Product Ecosystem
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-5">
            Workspace Experience
          </h3>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            A cohesive product architecture where individuals, daily tasks, communication, and company governance flow together without silos.
          </p>
        </div>

        {/* Visual Relationship Diagram */}
        <div className="max-w-5xl mx-auto">
          
          {/* Desktop Connected Flow */}
          <div className="hidden lg:grid grid-cols-5 gap-3 items-center relative z-10">
            {flowNodes.map((node) => {
              const IconComp = node.icon;
              return (
                <div key={node.title} className="flex flex-col items-center text-center group">
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex items-center justify-center mb-4 text-slate-900 dark:text-white shadow-xs group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors duration-200">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                    Stage {node.step}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    {node.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    {node.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Desktop Horizontal Line */}
          <div className="hidden lg:block h-0.5 bg-slate-200 dark:bg-neutral-800 -mt-24 mx-16 z-0" />

          {/* Mobile Vertical Flow */}
          <div className="lg:hidden flex flex-col items-center gap-3">
            {flowNodes.map((node, index) => {
              const IconComp = node.icon;
              return (
                <React.Fragment key={node.title}>
                  <div className="w-full max-w-sm bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 flex items-center justify-center text-slate-900 dark:text-white shrink-0">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Stage {node.step}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{node.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{node.description}</p>
                    </div>
                  </div>

                  {index < flowNodes.length - 1 && (
                    <ArrowDown className="w-4 h-4 text-slate-400 dark:text-slate-600 my-1" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};

export default EcosystemSection;
