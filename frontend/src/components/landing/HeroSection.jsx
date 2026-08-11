import React from 'react';
import { ArrowRight, CheckCircle2, MessageSquare, Video, CheckSquare, Sparkles } from 'lucide-react';
import Button from '../common/Button';

export const HeroSection = () => {
  return (
    <section id="hero" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-white dark:bg-black text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Side-by-Side Desktop Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Typography & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* Small Eyebrow Text */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-slate-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Unified Enterprise Workspace</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] text-slate-900 dark:text-white">
              Your company, <br className="hidden sm:inline" />
              <span className="text-slate-900 dark:text-slate-100 underline decoration-slate-300 dark:decoration-slate-700 decoration-4 underline-offset-8">
                connected
              </span> in one workspace.
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-xl">
              Manage work, communication, meetings, tasks and everyday company operations — all in one place.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Button to="/login" variant="primary" size="lg" icon={ArrowRight} iconPosition="right" className="w-full sm:w-auto">
                Get Started
              </Button>
              <Button href="#features" variant="outline" size="lg" className="w-full sm:w-auto">
                Explore Workspace
              </Button>
            </div>

            {/* Trust Bullet Highlights */}
            <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-medium text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <span>Single Central Gateway</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <span>Real-time Workspace Sync</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <span>Enterprise Security</span>
              </div>
            </div>

          </div>

          {/* Right Column: High-Quality Unsplash Workspace Photography with Micro UI accents */}
          <div className="lg:col-span-6 relative">
            
            {/* Unsplash Workspace Image Container */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-neutral-800 shadow-2xl bg-slate-100 dark:bg-neutral-900 group">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
                alt="Modern Remote Team Workspace Collaboration"
                className="w-full h-[420px] sm:h-[480px] object-cover object-center filter grayscale-[10%] contrast-[105%] group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              
              {/* Subtle Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-50 pointer-events-none" />

              {/* Floating Micro UI Accent 1: Tasks Completed */}
              <div className="absolute top-6 left-6 bg-white/95 dark:bg-neutral-900/95 rounded-xl p-3.5 shadow-xl flex items-center gap-3 border border-slate-200 dark:border-neutral-700 backdrop-blur-md">
                <div className="w-8 h-8 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">12 tasks completed</div>
                  <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Engineering sprint</div>
                </div>
              </div>

              {/* Floating Micro UI Accent 2: Team Meeting */}
              <div className="absolute bottom-6 left-6 bg-white/95 dark:bg-neutral-900/95 rounded-xl p-3.5 shadow-xl flex items-center gap-3 border border-slate-200 dark:border-neutral-700 backdrop-blur-md">
                <div className="w-8 h-8 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Team meeting · 10:30 AM</div>
                  <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">All-hands sync active</div>
                </div>
              </div>

              {/* Floating Micro UI Accent 3: Messages */}
              <div className="absolute top-1/2 -right-2 -translate-y-1/2 hidden sm:flex bg-white/95 dark:bg-neutral-900/95 rounded-xl p-3.5 shadow-xl items-center gap-3 border border-slate-200 dark:border-neutral-700 backdrop-blur-md">
                <div className="w-8 h-8 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">3 new messages</div>
                  <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">#general channel</div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default HeroSection;
