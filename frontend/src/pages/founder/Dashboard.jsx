import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Crown, LogOut, ShieldCheck, Activity, Users, TrendingUp, Sparkles, MessageSquare } from 'lucide-react';
import Button from '../../components/common/Button';
import AttendanceSummaryWidget from '../../components/attendance/AttendanceSummaryWidget';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export const FounderDashboard = () => {
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
                  FOUNDER DASHBOARD
                </h1>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  TEC THA Workspace Executive Management Portal
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button to="/chat" variant="primary" size="sm" icon={MessageSquare}>
              Chat
            </Button>
            <Button to="/founder/groups" variant="outline" size="sm">
              Groups
            </Button>
            <Button to="/" variant="outline" size="sm">
              View Public Website
            </Button>
            <Button onClick={handleLogout} variant="secondary" size="sm" icon={LogOut}>
              Sign Out
            </Button>
          </div>

        </div>
      </header >

      {/* Main Layout Container */}
      < div className="relative z-10 w-full flex-grow flex flex-col" >

        {/* Content Body */}
        < main className="max-w-[1500px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 flex-grow" >

          {/* Executive Attendance Widget */}
          < AttendanceSummaryWidget role="founder" />

        </main >

        {/* Footer Bar */}
        < footer className="relative z-10 w-full text-center py-5 text-sm text-slate-500 font-medium space-y-1 border-t border-slate-200/80 bg-white/60 backdrop-blur-xs mt-auto" >
          <div>
            © {new Date().getFullYear()}, TEC THA Workspace Pvt. Ltd. All Rights Reserved.
          </div>
          <div>
            <a href="mailto:support@tectha.com" className="hover:text-[#0562ff] transition-colors font-semibold">
              support@tectha.com
            </a>
          </div>
        </footer >

      </div >

      {/* Sign Out Confirmation Dialog */}
      < ConfirmDialog
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

    </div >
  );
};

export default FounderDashboard;
