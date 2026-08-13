import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  UserCheck,
  LogOut,
  Globe,
  Clock,
  CheckSquare,
  Calendar,
  CalendarCheck2,
  MessageSquare,
  Users
} from 'lucide-react';
import MeetingSection from '../../components/meetings/MeetingSection';
import AttendanceSummaryWidget from '../../components/attendance/AttendanceSummaryWidget';

export const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative bg-slate-100 font-montserrat selection:bg-[#0562ff] selection:text-white">

      {/* Faint diagonal-panel background matching light enterprise sign-in aesthetic */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg">
          <rect width="1600" height="900" fill="#f4f5f7" />
          <polygon points="0,0 650,0 250,900 0,900" fill="#eceef1" />
          <polygon points="700,0 1000,0 500,900 300,900" fill="#e6e9ed" />
          <polygon points="1600,0 1600,300 900,900 700,900" fill="#eceef1" />
        </svg>
      </div>

      {/* Sticky Top Navbar Header */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-md sticky top-0 z-50">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">

          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/logo1.webp"
                alt="TEC THA Workspace Logo"
                className="h-10 w-auto object-contain max-w-[160px]"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </Link>
            <div className="h-7 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-lg sm:text-xl font-bold font-montserrat text-slate-900 leading-tight">
                  EMPLOYEE DASHBOARD
                </h1>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  TEC THA Workspace Employee Portal & Operations
                </p>
              </div>
            </div>
          </div>

          {/* Right: Profile Info & Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* User Profile Pill */}
            <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-none">
              <div className="w-8 h-8 rounded-none bg-[#0562ff] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'E'}
              </div>
              <div className="text-left text-sm">
                <div className="font-semibold text-slate-900 leading-none">{user?.name || 'Employee User'}</div>
                <div className="text-xs text-slate-500 font-medium max-w-[150px] truncate">{user?.email || 'employee@tectha.com'}</div>
              </div>
            </div>

            {/* Chat Navigation Link */}
            <Link
              to="/chat"
              className="p-2.5 text-white bg-[#0562ff] hover:bg-blue-700 rounded-none transition-colors text-sm font-semibold flex items-center gap-2 font-montserrat shadow-xs"
            >
              <MessageSquare className="w-4.5 h-4.5" />
              <span>Chat</span>
            </Link>

            {/* My Groups Navigation Link */}
            <Link
              to="/employee/groups"
              className="p-2.5 text-slate-700 hover:text-[#0562ff] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-none transition-colors text-sm font-semibold flex items-center gap-2 font-montserrat"
            >
              <Users className="w-4.5 h-4.5" />
              <span className="hidden sm:inline">My Groups</span>
            </Link>

            {/* Attendance Navigation Link */}
            <Link
              to="/employee/attendance"
              className="p-2.5 text-slate-700 hover:text-[#0562ff] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-none transition-colors text-sm font-semibold flex items-center gap-2 font-montserrat"
            >
              <CalendarCheck2 className="w-4.5 h-4.5" />
              <span className="hidden sm:inline">My Attendance</span>
            </Link>

            {/* External Website Link */}
            <a
              href="https://tectha.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 text-slate-700 hover:text-[#0562ff] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-none transition-colors text-sm font-semibold flex items-center gap-2"
              title="Official Website"
            >
              <Globe className="w-4.5 h-4.5" />
              <span className="hidden sm:inline">Website</span>
            </a>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-4 py-2.5 rounded-none shadow-sm transition-all flex items-center gap-2 cursor-pointer font-montserrat"
            >
              <LogOut className="w-4.5 h-4.5" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Layout Container */}
      <div className="relative z-10 w-full flex-grow flex flex-col">

        {/* Content Body */}
        <main className="max-w-[1500px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 flex-grow">

          {/* Section 1: Employee Attendance Summary Widget */}
          <AttendanceSummaryWidget role="employee" />

          {/* Section 2: Employee Quick Operational Overview */}
          <div className="bg-white border border-slate-200 rounded-none shadow-sm font-montserrat p-6 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-none bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
                    Employee Operational Overview
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Role Detected: <span className="text-emerald-700 font-bold uppercase">Employee</span> • Email: <span className="text-slate-700 font-semibold">{user?.email || 'employee@tectha.com'}</span>
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                <UserCheck className="w-4 h-4" /> Account Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 sm:p-5 rounded-none bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">My Assigned Tasks</div>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#0562ff] font-montserrat">8 In Progress</div>
                </div>
                <div className="w-10 h-10 rounded-none bg-blue-50 text-[#0562ff] border border-blue-200 flex items-center justify-center font-bold">
                  <CheckSquare className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-none bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">Clock-In Status</div>
                  <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 font-montserrat">Active (08:30 AM)</div>
                </div>
                <div className="w-10 h-10 rounded-none bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-none bg-purple-50/70 border border-purple-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">Next Team Sync</div>
                  <div className="text-xl sm:text-2xl font-extrabold text-purple-700 font-montserrat">11:00 AM Sync</div>
                </div>
                <div className="w-10 h-10 rounded-none bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Employee Team Meetings & Syncs */}
          <MeetingSection />

        </main>

        {/* Footer Bar */}
        <footer className="relative z-10 w-full text-center py-5 text-sm text-slate-500 font-medium space-y-1 border-t border-slate-200/80 bg-white/60 backdrop-blur-xs mt-auto">
          <div>
            © {new Date().getFullYear()}, TEC THA Workspace Pvt. Ltd. All Rights Reserved.
          </div>
          <div>
            <a href="mailto:support@tectha.com" className="hover:text-[#0562ff] transition-colors font-semibold">
              support@tectha.com
            </a>
          </div>
        </footer>

      </div>

    </div>
  );
};

export default EmployeeDashboard;
