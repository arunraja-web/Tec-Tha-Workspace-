import React from 'react';
import Navbar from '../../components/layout/Navbar';
import HeroSection from '../../components/landing/HeroSection';
import WhatIsWorkspace from '../../components/landing/WhatIsWorkspace';
import CoreFeatures from '../../components/landing/CoreFeatures';
import EcosystemSection from '../../components/landing/EcosystemSection';
import HowItWorks from '../../components/landing/HowItWorks';
import FinalCta from '../../components/landing/FinalCta';
import Footer from '../../components/landing/Footer';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-slate-100 flex flex-col selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-300">
      {/* Common Navbar */}
      <Navbar />

      {/* Main Landing Page Content */}
      <main className="flex-grow">
        <HeroSection />
        <WhatIsWorkspace />
        <CoreFeatures />
        <EcosystemSection />
        <HowItWorks />
        <FinalCta />
      </main>

      {/* Common Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
