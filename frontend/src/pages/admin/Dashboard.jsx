import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LogOut,
  Globe,
  Users
} from 'lucide-react';
import UserManagement from '../../components/admin/UserManagement';
import AttendanceSummaryWidget from '../../components/attendance/AttendanceSummaryWidget';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const handleLogout = () => {
    setShowSignOutConfirm(true);
  };

  const confirmSignOut = () => {
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
                  ADMIN DASHBOARD
                </h1>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  TEC THA Workspace Management System
                </p>
              </div>
            </div>
          </div>

          {/* Right: Profile Info & Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* User Profile Pill */}
            <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-none">
              <div className="w-8 h-8 rounded-none bg-[#0562ff] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="text-left text-sm">
                <div className="font-semibold text-slate-900 leading-none">{user?.name || 'Administrator'}</div>
                <div className="text-xs text-slate-500 font-medium max-w-[150px] truncate">{user?.email || 'admin@tectha.com'}</div>
              </div>
            </div>

            {/* Groups Navigation Link */}
            <Link
              to="/admin/groups"
              className="p-2.5 text-slate-700 hover:text-[#0562ff] bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-none transition-colors text-sm font-semibold flex items-center gap-2"
              title="Group Management"
            >
              <Users className="w-4.5 h-4.5" />
              <span className="hidden sm:inline">Groups</span>
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
              className="bg-[#0562ff] hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-none shadow-sm transition-all flex items-center gap-2 cursor-pointer font-montserrat"
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
        <main className="max-w-[1500px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-grow">
          {/* Attendance Summary Widget */}
          <AttendanceSummaryWidget role="admin" />

          {/* User Controls & Directory */}
          <UserManagement />
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

      {/* Sign Out Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showSignOutConfirm}
        title="Confirm Sign Out"
        message="Are you sure you want to sign out of TEC THA Workspace? You will need to sign in again to access your dashboard."
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        variant="rose"
        icon={LogOut}
        onConfirm={confirmSignOut}
        onCancel={() => setShowSignOutConfirm(false)}
      />

    </div>
  );
};

export default AdminDashboard;
