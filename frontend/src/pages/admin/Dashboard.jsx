import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ShieldAlert, LogOut, ShieldCheck, Users, LayoutDashboard } from 'lucide-react';
import Button from '../../components/common/Button';
import UserManagement from '../../components/admin/UserManagement';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-10 selection:bg-indigo-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="glass-card rounded-3xl p-6 md:p-8 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-slate-900/90 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">Admin Control Center</h1>
                <span className="bg-indigo-950/80 text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                  Role: Admin
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Welcome back, <span className="text-slate-200 font-semibold">{user?.name || 'Administrator'}</span> ({user?.email})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button to="/" variant="outline" size="sm">
              View Website
            </Button>
            <Button onClick={handleLogout} variant="secondary" size="sm" icon={LogOut}>
              Sign Out
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 space-x-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-slate-900 text-indigo-400 border-t-2 border-x border-indigo-500 border-x-slate-800'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <Users className="w-4 h-4" /> User Controls & Management
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-indigo-400 border-t-2 border-x border-indigo-500 border-x-slate-800'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> System Overview
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && <UserManagement />}

        {activeTab === 'overview' && (
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6 bg-slate-900/80">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>Role-Based System Operational Summary</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Administrative role-based controls and user management are actively integrated with the Express/MongoDB backend using HTTP-Only session cookies.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-xs font-medium mb-1">User Management API</div>
                <div className="text-lg font-bold text-emerald-400">/api/users Connected</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-xs font-medium mb-1">Authentication</div>
                <div className="text-lg font-bold text-indigo-400">HTTP-Only Cookies</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-xs font-medium mb-1">Security Guards</div>
                <div className="text-lg font-bold text-amber-400">Self-Lockout Protected</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
