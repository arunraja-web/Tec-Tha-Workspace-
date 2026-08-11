import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import Button from '../common/Button';

export const FinalCta = () => {
  return (
    <section className="py-24 relative bg-slate-50 dark:bg-neutral-950 border-t border-slate-200 dark:border-neutral-800/90 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-3xl p-8 sm:p-12 md:p-16 text-center shadow-md relative overflow-hidden">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready for Modern Remote Work</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
            Everything your team needs. <br className="hidden sm:inline" />
            <span>One workspace.</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto mb-10">
            Streamline communication, tasks, attendance, and everyday company operations with your unified digital hub.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button to="/login" variant="primary" size="lg" icon={ArrowRight} iconPosition="right" className="w-full sm:w-auto">
              Enter Workspace
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            <span>Unified single sign-on • Enterprise workspace</span>
          </div>

        </div>
      </div>
    </section>
  );
};

export default FinalCta;
