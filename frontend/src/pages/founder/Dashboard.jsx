import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Crown, LogOut, ShieldCheck, Activity, Users, TrendingUp, Sparkles } from 'lucide-react';
import Button from '../../components/common/Button';

export const FounderDashboard = () => {
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
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Crown className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">Founder Dashboard</h1>
                <span className="bg-amber-950/80 text-amber-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Role Detected: Founder
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Welcome back, <span className="text-slate-200 font-semibold">{user?.name || 'Alex Morgan'}</span> ({user?.email})
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
            You were automatically redirected to the <strong className="text-white">Founder Dashboard</strong> after authentication. Executive analytics, company performance metrics, and founder oversight controls will load here.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-slate-400 text-xs font-medium mb-1">Company Growth</div>
              <div className="text-xl font-bold text-emerald-400">+24.8% YoY</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-slate-400 text-xs font-medium mb-1">Total Team Members</div>
              <div className="text-xl font-bold text-indigo-400">48 Active</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-slate-400 text-xs font-medium mb-1">Active Projects</div>
              <div className="text-xl font-bold text-purple-400">12 Operations</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FounderDashboard;
