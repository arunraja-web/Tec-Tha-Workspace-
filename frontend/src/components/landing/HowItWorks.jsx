import React from 'react';
import { LogIn, LayoutDashboard, CheckCircle2, ArrowRight } from 'lucide-react';
import Button from '../common/Button';

export const HowItWorks = () => {
  const steps = [
    {
      num: '01',
      title: 'Login',
      description: 'Access the single, common login gateway using your company credentials.',
      icon: LogIn,
    },
    {
      num: '02',
      title: 'Enter your workspace',
      description: 'Your authenticated session automatically grants you access to your assigned environment.',
      icon: LayoutDashboard,
    },
    {
      num: '03',
      title: 'Get work done',
      description: 'Collaborate with your team, manage daily tasks, attend meetings, and track operations.',
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="py-24 relative bg-white dark:bg-black text-slate-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
            Simple Workflow
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-5">
            How It Works
          </h3>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Getting started takes seconds with our single, streamlined entry point.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {steps.map((step) => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-8 flex flex-col justify-between relative group shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-neutral-700 transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-neutral-800 px-3 py-1 rounded-full border border-slate-200 dark:border-neutral-700">
                      Step {step.num}
                    </span>
                    <span className="text-3xl font-extrabold text-slate-300 dark:text-neutral-800">
                      {step.num}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 flex items-center justify-center text-slate-900 dark:text-white mb-5 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors duration-200">
                    <IconComponent className="w-6 h-6" />
                  </div>

                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {step.title}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Box */}
        <div className="max-w-xl mx-auto text-center">
          <Button to="/login" variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
            Proceed to Login
          </Button>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;
