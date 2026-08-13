import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const SHOWCASE_CARDS = [
  {
    id: 1,
    title: 'Your Complete Virtual Operating System',
    description: 'Streamline operations, track daily attendance, manage employee tasks, and enforce administrative controls — all in one unified workspace.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
    alt: 'TEC THA Enterprise Team Collaboration'
  },
  {
    id: 2,
    title: 'Automated Attendance & Leave Audits',
    description: 'Seamlessly monitor employee check-ins, process leave approvals, review work submissions, and track daily progress — all in one unified workspace.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80',
    alt: 'Modern Office Management & Operations'
  },
  {
    id: 3,
    title: 'Real-Time Team Messaging & Video Sync',
    description: 'Connect instantly across departments with integrated channel chats, live video conference rooms, and file sharing — all in one unified workspace.',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80',
    alt: 'Real-Time Team Collaboration & Meetings'
  },
  {
    id: 4,
    title: 'Enterprise Role Security & Audit Logs',
    description: 'Enforce granular access controls across Admin, Founder, and Employee roles with HTTP-Only cookie security — all in one unified workspace.',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80',
    alt: 'Enterprise Security & System Control'
  }
];

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-rotating 4 Showcase Cards (changes every 4 seconds)
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SHOWCASE_CARDS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      navigate(result.redirectUrl);
    } catch (err) {
      console.error('Login Error:', err);
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
    <div className="min-h-screen flex flex-col justify-between items-center relative overflow-hidden bg-slate-100 font-montserrat">

      {/* Faint diagonal-panel background matching light enterprise sign-in aesthetic */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg">
          <rect width="1600" height="900" fill="#f4f5f7" />
          <polygon points="0,0 650,0 250,900 0,900" fill="#eceef1" />
          <polygon points="700,0 1000,0 500,900 300,900" fill="#e6e9ed" />
          <polygon points="1600,0 1600,300 900,900 700,900" fill="#eceef1" />
        </svg>
      </div>

      {/* Main Split Card Container */}
      <main className="my-auto relative z-10 max-w-5xl w-full py-10 px-4">
        <div className="bg-white shadow-xl rounded-none overflow-hidden grid grid-cols-1 md:grid-cols-2">

          {/* Left Column: Sign In Form */}
          <div className="p-8 sm:p-10 flex flex-col justify-between gap-6">

            {/* Header: Real Workspace Logo */}
            <div className="flex items-center justify-between">
              <Link to="/">
                <img
                  src="/logo1.webp"
                  alt="TEC THA Workspace Logo"
                  className="h-10 w-auto object-contain max-w-[160px]"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </Link>
            </div>

            {/* Form & Content */}
            <div className="space-y-5 my-auto">
              <div>
                <h1 className="text-4xl font-semibold font-montserrat text-slate-900 tracking-tight">
                  Sign in
                </h1>
                <p className="text-lg text-slate-500 mt-3 font-medium">
                  to access TEC THA Workspace
                </p>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3.5 rounded-none bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-center gap-2.5">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Input Fields */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full bg-slate-50 border border-slate-300 rounded-none pl-11 pr-3.5 py-3 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0562ff] focus:ring-1 focus:ring-[#0562ff] transition-all font-medium font-montserrat"
                  />
                </div>

                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-slate-50 border border-slate-300 rounded-none font-montserrat pl-11 pr-11 py-3 text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0562ff] focus:ring-1 focus:ring-[#0562ff] transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer focus:outline-none"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-slate-500 hover:text-slate-700" />
                    ) : (
                      <Eye className="w-5 h-5 text-slate-500 hover:text-slate-700" />
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#0562ff] hover:bg-blue-700 text-white font-semibold text-base py-3.5 rounded-none shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-70 font-montserrat"
                >
                  {isSubmitting ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>
            </div>

            {/* End of Container: Subtext info & Real Website & LinkedIn Vector Icons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 mt-2">
              <span className="text-xs text-slate-400 font-medium">
                Smart Access Management
              </span>

              {/* Real Website & LinkedIn Vector Brand Icons at end of container */}
              <div className="flex items-center gap-2">
                {/* Website Icon */}
                <a
                  href="https://tectha.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-none text-slate-500 hover:text-[#0562ff] bg-slate-50 hover:bg-slate-100 transition-all border border-slate-200"
                  title="Official Website"
                  aria-label="Official Website"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </a>

                {/* Real LinkedIn Brand SVG Vector Icon */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-none bg-slate-50 hover:bg-slate-100 transition-all border border-slate-200"
                  title="LinkedIn Page"
                  aria-label="LinkedIn Page"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#0A66C2">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Automated 4-Card Showcase Slider */}
          <div className="p-8 sm:p-10 border-t md:border-t-0 md:border-l border-slate-100 bg-gradient-to-b from-slate-50 to-slate-100/60 flex flex-col justify-between items-center text-center">

            {/* Unsplash Workspace Photo Card with Smooth Fade */}
            <div className="w-full rounded-none overflow-hidden border border-slate-200/90 shadow-lg relative group my-auto bg-white min-h-[180px] sm:min-h-[256px]">
              {SHOWCASE_CARDS.map((card, index) => (
                <div
                  key={card.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                >
                  <img
                    src={card.image}
                    alt={card.alt}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </div>
              ))}
            </div>

            {/* Showcase Text Content with Smooth Transition */}
            <div className="space-y-3 mt-6 w-full min-h-[130px] flex flex-col justify-between items-center">
              <div className="transition-all duration-500 min-h-[90px] flex flex-col items-center justify-center">
                <h2 className="text-2xl font-semibold font-montserrat text-slate-900 tracking-tight">
                  {SHOWCASE_CARDS[activeSlide].title}
                </h2>
                <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto font-medium mt-2">
                  {SHOWCASE_CARDS[activeSlide].description}
                </p>
              </div>

              {/* 4 Interactive Slider Dots */}
              <div className="flex items-center justify-center gap-2 pt-2">
                {SHOWCASE_CARDS.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    className={`transition-all duration-300 rounded-none cursor-pointer ${index === activeSlide
                      ? 'w-6 h-2 bg-[#0562ff]'
                      : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                      }`}
                    aria-label={`Go to slide ${index + 1}`}
                    title={`Slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer Bar */}
      <footer className="relative z-10 w-full text-center pb-6 text-sm text-slate-500 font-medium space-y-1">
        <div>
          © {new Date().getFullYear()}, TEC THA Workspace Pvt. Ltd. All Rights Reserved.
        </div>
        <div>
          <a href="mailto:support@tectha.com" className="hover:text-slate-700 transition-colors font-semibold">
            support@tectha.com
          </a>
        </div>
      </footer>

    </div>
  );
};

export default Login;