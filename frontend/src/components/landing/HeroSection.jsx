import React from 'react';
import { Link } from 'react-router-dom';

export const HeroSection = () => {
  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-between items-center bg-slate-100/90 dark:bg-neutral-950 text-slate-900 dark:text-white transition-colors duration-300 pt-12 pb-8 px-4 w-full">

      {/* Subtle Background Mesh Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-40 pointer-events-none" />

      {/* Centered Gateway Login Card (Matching Reference Design with Workspace Logo) */}
      <div className="my-auto relative z-10 max-w-3xl w-full px-2 sm:px-0">
        <div className="bg-white dark:bg-neutral-900 border border-slate-200/90 dark:border-neutral-800 rounded-10px shadow-xl p-8 sm:p-12 text-center flex flex-col items-center gap-6">

          {/* Workspace Brand Logo */}
          <div className="flex flex-col items-center gap-2">
            <img
              src="/logo1.webp"
              alt="TEC THA Workspace Logo"
              className="h-14 w-auto object-contain max-w-[180px]"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          {/* Heading with Reference Font Styling */}
          <h1 className="text-2xl sm:text-4xl font-semibold text-slate-900 dark:text-white tracking-tight font-Montserrat">
            Sign in to access TEC THA
          </h1>

          {/* SIGN IN Action Button */}
          <div className="pt-2 w-full flex justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center bg-[#0562ff] hover:bg-blue-700 text-white font-semibold text-sm sm:text-lg px-10 py-3  shadow-sm hover:shadow transition-all duration-200 uppercase tracking-wider w-full sm:w-auto min-w-[140px]"
            >
              SIGN IN
            </Link>
          </div>

          {/* Card Footer: No Sign Up Access & Vector Brand Icons */}
          <div className="w-full border-t border-dashed border-slate-200 dark:border-neutral-800 pt-5 mt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Don't have an account? <span className="text-slate-700 dark:text-slate-300 font-semibold">Contact your workspace administrator</span>
            </p>

            {/* Real Website & LinkedIn Vector Brand Icons */}
            <div className="flex items-center gap-2">
              {/* Website Icon */}
              <a
                href="https://tectha.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-slate-500 hover:text-[#0562ff] bg-slate-50 dark:bg-neutral-800 hover:bg-slate-100 transition-all border border-slate-200 dark:border-neutral-700"
                title="Official Website"
                aria-label="Official Website"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </a>

              {/* Real LinkedIn Brand SVG Vector Icon */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-slate-50 dark:bg-neutral-800 hover:bg-slate-100 transition-all border border-slate-200 dark:border-neutral-700"
                title="LinkedIn Page"
                aria-label="LinkedIn Page"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#0A66C2">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Page Footer Bar */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-200/60 dark:border-neutral-900 text-lg text-slate-500 dark:text-slate-400 font-medium">
        {/* Left: Copyright */}
        <div className="text-sm sm:text-normal">
          © {new Date().getFullYear()}, TEC THA Workspace Pvt. Ltd. All Rights Reserved.
        </div>

        {/* Right: Support Email */}
        <div>
          <a href="mailto:support@tectha.com" className="hover:text-slate-900 dark:hover:text-white transition-colors font-semibold">
            support@tectha.com
          </a>
        </div>
      </div>

    </section>
  );
};

export default HeroSection;