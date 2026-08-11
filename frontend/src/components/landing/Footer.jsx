import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowUpRight } from 'lucide-react';

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-white dark:bg-black border-t border-slate-200 dark:border-neutral-800 pt-16 pb-12 text-slate-600 dark:text-slate-400 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-200 dark:border-neutral-800">
          
          {/* Col 1: Brand & Logo */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-1 flex items-center justify-center">
                <img 
                  src="/logo1.webp" 
                  alt="Virtual Workspace Logo" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <span className="font-bold text-xs text-slate-900 dark:text-white hidden">VW</span>
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                Virtual Workspace
              </span>
            </Link>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              The unified digital platform for virtual companies. Connect team communication, task tracking, meetings, attendance, and everyday operations in one secure workspace.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium pt-1">
              <Shield className="w-4 h-4" />
              <span>Enterprise Security & Modular Architecture</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="/#hero" className="hover:text-slate-900 dark:hover:text-white transition-colors">Home Overview</a>
              </li>
              <li>
                <a href="/#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Core Features</a>
              </li>
              <li>
                <a href="/#about" className="hover:text-slate-900 dark:hover:text-white transition-colors">About Workspace</a>
              </li>
              <li>
                <Link to="/login" className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1">
                  <span>Sign In Portal</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Core Features List */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Workspace Capabilities
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <span>Task Management</span>
              <span>Attendance Tracking</span>
              <span>Virtual Meetings</span>
              <span>Team Chat & Channels</span>
              <span>Daily Work Reports</span>
              <span>Leave Approvals</span>
              <span>Employee Profiles</span>
              <span>Company Broadcasts</span>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {year} Virtual Workspace. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Security Overview</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
