import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ShieldAlert, LogOut, ShieldCheck, Users, Clock, FileCheck } from 'lucide-react';
import Button from '../../components/common/Button';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="glass-card rounded-3xl p-6 md:p-8 border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">Admin Dashboard</h1>
                <span className="bg-indigo-950/80 text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                  Role Detected: Admin
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Welcome back, <span className="text-slate-200 font-semibold">{user?.name || 'Sarah Jenkins'}</span> ({user?.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button to="/" variant="outline" size="sm">
              View Public Website
            </Button>
            <Button onClick={handleLogout} variant="secondary" size="sm" icon={LogOut}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Dashboard Preview Banner */}
        <div className="glass-card rounded-2xl p-6 border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>Successful Role-Based Authentication & Navigation</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            You were automatically redirected to the <strong className="text-white">Admin Dashboard</strong> after authentication. Organizational controls, attendance audits, leave approvals, and employee management tools will load here.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-slate-400 text-xs font-medium mb-1">Pending Leave Requests</div>
              <div className="text-xl font-bold text-amber-400">5 Requests</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-slate-400 text-xs font-medium mb-1">Daily Work Reports</div>
              <div className="text-xl font-bold text-emerald-400">42 Submitted</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-slate-400 text-xs font-medium mb-1">System Health</div>
              <div className="text-xl font-bold text-indigo-400">100% Operational</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
