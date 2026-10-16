'use client';

import { useState } from 'react';
import { X, Shield, Phone, Mail, User, MapPin, CheckCircle2, ArrowRight, Sparkles, Lock } from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { CITIES } from '@/lib/data';

import Logo from './Logo';

export function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function sanitizeErrorMessage(msg?: string | null): string {
  if (!msg) return 'Login is temporarily unavailable. Please try again shortly.';
  const lower = msg.toLowerCase();
  if (
    lower.includes('emaxconn') ||
    lower.includes('pool_size') ||
    lower.includes('postgres') ||
    lower.includes('relation') ||
    lower.includes('database') ||
    lower.includes('connection') ||
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('timeout') ||
    lower.includes('500') ||
    lower.includes('503') ||
    lower.includes('internal server')
  ) {
    return 'Login is temporarily unavailable. Please try again shortly.';
  }
  return msg;
}

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authMode, login, signup, loginWithGoogle } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup'>(authMode);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Signup form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Warangal');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  // Sync mode whenever modal opens or authMode changes
  useState(() => {
    setTab(authMode);
  });

  if (!isAuthModalOpen) return null;

  const isBusy = loginLoading || signupLoading || googleLoading;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy) return;
    if (!loginIdentifier.trim()) {
      setLoginError('Please enter your mobile number or email address.');
      return;
    }
    setLoginLoading(true);
    setLoginError(null);
    const res = await login(loginIdentifier.trim(), loginOtp);
    setLoginLoading(false);
    if (!res.success) {
      setLoginError(sanitizeErrorMessage(res.message));
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy) return;
    if (!name.trim()) {
      setSignupError('Please enter your full name.');
      return;
    }
    if (!phone.trim() && !email.trim()) {
      setSignupError('Please provide either a mobile number or email.');
      return;
    }
    setSignupLoading(true);
    setSignupError(null);
    const res = await signup({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      city: city || 'Warangal',
    });
    setSignupLoading(false);
    if (!res.success) {
      setSignupError(sanitizeErrorMessage(res.message));
    }
  };

  const handleGoogleAuth = async () => {
    if (isBusy) return;
    setGoogleLoading(true);
    setLoginError(null);
    setSignupError(null);
    const res = await loginWithGoogle();
    setGoogleLoading(false);
    if (!res.success) {
      const sanitized = sanitizeErrorMessage(res.message);
      if (tab === 'login') {
        setLoginError(sanitized);
      } else {
        setSignupError(sanitized);
      }
    }
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E5E7EB] overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Top Header Banner with Spinny style accent */}
        <div className="bg-gradient-to-r from-[#FFF0F3] to-[#FFF8F9] p-6 pb-4 border-b border-[#FFD6DF]/60 relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-black hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center justify-between mb-3 pr-8">
            <Logo size="sm" variant="horizontal" />
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white text-[#E5325C] text-[10px] font-extrabold uppercase tracking-wider border border-[#FFD6DF] shadow-2xs">
              <Shield className="w-3 h-3" />
              <span>Verified Account</span>
            </span>
          </div>

          <h3 className="text-xl font-semibold font-heading text-[#101216]">
            {tab === 'login' ? 'Welcome Back to Recars' : 'Join Recars Marketplace'}
          </h3>
          <p className="text-xs text-gray-600 mt-1 font-body">
            {tab === 'login'
              ? 'Access saved cars, test drive schedules & instant valuations'
              : 'Sign up to track valuations, doorstep test drives & inspect cars'}
          </p>

          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-white/80 p-1 border border-[#E5E7EB] mt-4 shadow-2xs font-nav">
            <button
              onClick={() => {
                setTab('login');
                setLoginError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold font-btn tracking-rounded rounded-lg transition-all cursor-pointer ${
                tab === 'login'
                  ? 'bg-[#E5325C] text-white shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setTab('signup');
                setSignupError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold font-btn tracking-rounded rounded-lg transition-all cursor-pointer ${
                tab === 'signup'
                  ? 'bg-[#E5325C] text-white shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* One-Click Google Authentication */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={googleLoading}
            className="w-full py-2.5 px-4 rounded-xl border border-[#E5E7EB] hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            <GoogleIcon className="w-4 h-4" />
            <span>
              {googleLoading
                ? 'Connecting with Google...'
                : tab === 'login'
                ? 'Sign in with Google'
                : 'Sign up with Google'}
            </span>
          </button>

          <div className="relative flex items-center justify-center my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E7EB]" />
            </div>
            <div className="relative bg-white px-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Or continue with {tab === 'login' ? 'credentials' : 'details'}
              </span>
            </div>
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#101216] mb-1.5">
                  Mobile Number or Email
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Enter 10-digit mobile number or email"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#E5325C] text-xs font-medium text-gray-900 bg-[#F8F9FA]"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5">
                  <label className="text-xs font-bold text-[#101216]">
                    Security Passcode / OTP
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={loginOtp}
                    onChange={(e) => setLoginOtp(e.target.value)}
                    placeholder="Enter 4-digit OTP"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#E5325C] text-xs font-mono font-bold text-gray-900 bg-[#F8F9FA]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded-xl bg-[#E5325C] hover:bg-[#D4264E] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loginLoading ? 'Verifying Account...' : 'Sign In to Recars'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              {signupError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                  {signupError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#101216] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#E5325C] text-xs font-medium text-gray-900 bg-[#F8F9FA]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101216] mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="text-xs font-bold text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#E5325C] text-xs font-mono font-medium text-gray-900 bg-[#F8F9FA]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101216] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="e.g. javed@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#E5325C] text-xs font-medium text-gray-900 bg-[#F8F9FA]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101216] mb-1">
                  City
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#E5325C] text-xs font-bold text-gray-900 bg-[#F8F9FA] cursor-pointer"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={signupLoading}
                className="w-full py-3 rounded-xl bg-[#E5325C] hover:bg-[#D4264E] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{signupLoading ? 'Creating Account in Supabase...' : 'Create Account & Continue'}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="text-center pt-2">
            <p className="text-[11px] text-gray-400">
              By proceeding, you agree to Recars&apos;{' '}
              <span className="text-[#E5325C] font-semibold cursor-pointer">Terms of Service</span> and{' '}
              <span className="text-[#E5325C] font-semibold cursor-pointer">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
