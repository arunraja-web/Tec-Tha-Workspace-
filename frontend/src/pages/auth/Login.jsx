import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowRight, Lock, Mail, Sun, Moon, AlertCircle } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';

export const Login = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme, isDark } = useTheme();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      // Execute live backend login endpoint POST /api/auth/login
      const result = await login(email, password);
      
      // Auto-redirect to the dashboard corresponding to backend user.role
      navigate(result.redirectUrl);
    } catch (err) {
      console.error('Login Error:', err);
      // Clean user-friendly error message
      const message = err.message || 'Login failed. Please check your primary email and password.';
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preset default seed credentials documented in backend README.md
  const handlePreFillSeedAccount = (type) => {
    setErrorMsg('');
    if (type === 'admin') {
      setEmail('admin@tectha.com');
      setPassword('Admin@123');
    } else if (type === 'employee') {
      setEmail('test@tectha.com');
      setPassword('12345678');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-black relative overflow-hidden transition-colors duration-300">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern-dark opacity-30 pointer-events-none" />

      {/* Header Bar */}
      <header className="p-6 relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-1 flex items-center justify-center">
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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-neutral-900 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-800 transition-colors"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-800" />}
            </button>

            <Button to="/" variant="ghost" size="sm">
              ← Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-grow flex items-center justify-center p-4 relative z-10 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-3xl p-8 shadow-xl relative">
            
            {/* Title & Subtitle */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 flex items-center justify-center text-slate-900 dark:text-white mx-auto mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                Sign In to Workspace
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Single sign-on for Founders, Admins, and Employees.
              </p>
            </div>

            {/* Default Seed Accounts Quick Chips */}
            <div className="mb-6 p-3 rounded-2xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 text-center">
                Quick Pre-fill Seed Credentials
              </span>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handlePreFillSeedAccount('admin')}
                  className="py-1.5 px-2 rounded-xl text-xs font-semibold bg-white dark:bg-neutral-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  Admin Seed (`admin@tectha.com`)
                </button>
                <button
                  type="button"
                  onClick={() => handlePreFillSeedAccount('employee')}
                  className="py-1.5 px-2 rounded-xl text-xs font-semibold bg-white dark:bg-neutral-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  Employee Seed (`test@tectha.com`)
                </button>
              </div>
            </div>

            {/* Error Message Banner */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Primary Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@tectha.com"
                    className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full justify-center mt-2"
                disabled={isSubmitting}
                icon={ArrowRight}
                iconPosition="right"
              >
                {isSubmitting ? 'Authenticating with Server...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-neutral-800 text-center text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center justify-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                Connected to Live Backend Auth Endpoint (`/api/auth/login`)
              </span>
            </div>

          </div>
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="p-4 text-center text-xs text-slate-500 relative z-10">
        © {new Date().getFullYear()} Virtual Workspace. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;
