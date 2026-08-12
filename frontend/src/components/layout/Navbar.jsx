import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import Button from '../common/Button';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme, isDark } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
      ? 'bg-white/95 dark:bg-black/95 border-b border-slate-200 dark:border-neutral-800 shadow-sm backdrop-blur-md py-3.5'
      : 'bg-white/80 dark:bg-black/80 border-b border-slate-200/60 dark:border-neutral-900/80 backdrop-blur-md py-4'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Left: Logo & Workspace Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-md bg-slate-900 dark:bg-white p-1 flex items-center justify-center border border-slate-800 dark:border-neutral-200 transition-colors">
              <img
                src="/logo1.webp"
                alt="Virtual Workspace Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />

            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight leading-none text-slate-900 dark:text-white uppercase font-sans">
                TEC THA
              </span>
              <span className="text-[10px] tracking-widest font-bold uppercase text-slate-500 dark:text-slate-400 mt-1">
                Workspace
              </span>
            </div>
          </Link>

          {/* Center: Desktop Navigation Links (if any) */}
          {navLinks.length > 0 && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 px-3 py-1.5 rounded-md">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-200 dark:hover:bg-neutral-800 rounded-md transition-all"
                >
                  {link.name}
                </a>
              ))}
            </nav>
          )}

          {/* Right: Theme Toggle & Square Login CTA */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-md bg-slate-100 dark:bg-neutral-900 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-neutral-800 border border-slate-300 dark:border-neutral-800 transition-all flex items-center gap-2 text-xs font-bold uppercase cursor-pointer"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden lg:inline text-[11px]">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-800" />
                  <span className="hidden lg:inline text-[11px]">Dark</span>
                </>
              )}
            </button>

            {/* Login Button */}
            <Button to="/login" variant="primary" size="md" icon={ArrowRight} iconPosition="right">
              Login
            </Button>
          </div>

          {/* Mobile Menu & Theme Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-md bg-slate-100 dark:bg-neutral-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-neutral-800"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-800" />}
            </button>

            <Button to="/login" variant="primary" size="sm">
              Login
            </Button>

            {navLinks.length > 0 && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-900 rounded-md focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-neutral-950 border-b border-slate-200 dark:border-neutral-800 px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-900 rounded-md transition-all"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-3 border-t border-slate-200 dark:border-neutral-800 mt-1 flex flex-col gap-3">
              <Button to="/login" variant="primary" size="lg" className="w-full justify-center">
                Login to Workspace
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
