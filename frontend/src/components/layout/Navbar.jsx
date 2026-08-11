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
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/#hero' },
    { name: 'Features', href: '/#features' },
    { name: 'About', href: '/#about' },
    { name: 'Contact', href: '/#contact' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/90 dark:bg-slate-950/90 border-b border-slate-200 dark:border-neutral-800/90 py-3 shadow-xs backdrop-blur-md' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Left: Product Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-1 group-hover:border-slate-400 dark:group-hover:border-slate-600 transition-colors">
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
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight leading-none">
                Workspace
              </span>
              <span className="text-[10px] tracking-wider font-semibold uppercase text-slate-500 dark:text-slate-400 mt-0.5">
                Virtual Company
              </span>
            </div>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 dark:bg-neutral-900/90 border border-slate-200/90 dark:border-neutral-800 px-4 py-1.5 rounded-full backdrop-blur-md shadow-xs">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-4 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-neutral-800/80 rounded-full transition-all duration-200"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right: Theme Toggle & Login CTA */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-neutral-900 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-800 transition-colors focus:outline-none cursor-pointer"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-800" />}
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
              className="p-2 rounded-lg bg-slate-100 dark:bg-neutral-900 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-800"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-800" />}
            </button>

            <Button to="/login" variant="primary" size="sm">
              Login
            </Button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 mt-3 px-4 pt-3 pb-6 mx-4 rounded-2xl shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl transition-all"
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
