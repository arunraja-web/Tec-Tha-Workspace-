import React from 'react';
import HeroSection from '../../components/landing/HeroSection';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-100/90 dark:bg-black text-slate-900 dark:text-slate-100 flex flex-col selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-300">
      <main className="flex-grow flex flex-col">
        <HeroSection />
      </main>
    </div>
  );
};

export default LandingPage;
