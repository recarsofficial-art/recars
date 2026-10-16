'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Phone, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/authContext';
import { GoogleIcon } from '@/components/AuthModal';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, user } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    router.push('/account');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your mobile number or email.');
      return;
    }
    setLoading(true);
    setError(null);
    const res = await login(identifier.trim(), otp);
    setLoading(false);
    if (res.success) {
      router.push('/');
    } else {
      setError(res.message || 'Login failed');
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    const res = await loginWithGoogle();
    setGoogleLoading(false);
    if (res.success) {
      router.push('/');
    } else {
      setError(res.message || 'Google sign in failed');
    }
  };



  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <header className="bg-white border-b border-[#E5E7EB] py-4 px-6 flex items-center justify-between">
        <Logo size="md" showTagline={false} />
        <Link
          href="/"
          className="text-xs font-bold text-gray-600 hover:text-[#E5325C]"
        >
          ← Back to Marketplace
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#E5E7EB] overflow-hidden">
          <div className="bg-gradient-to-r from-[#FFF0F3] to-[#FFF8F9] p-6 border-b border-[#FFD6DF]/60">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white text-[#E5325C] text-[10px] font-extrabold uppercase tracking-wider border border-[#FFD6DF] shadow-2xs">
              <Shield className="w-3 h-3" />
              <span>Verified Account</span>
            </span>
            <h2 className="text-2xl font-semibold font-heading text-[#101216] mt-2">Sign In to Recars</h2>
            <p className="text-xs text-gray-600 mt-1 font-body">
              Access your test drives, saved vehicles, and car valuation requests.
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Google Sign In Option */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-[#E5E7EB] hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-800 font-semibold font-btn tracking-rounded text-xs shadow-2xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>{googleLoading ? 'Connecting with Google...' : 'Sign in with Google'}</span>
            </button>

            <div className="relative flex items-center justify-center my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E7EB]" />
              </div>
              <div className="relative bg-white px-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Or continue with credentials
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                  {error}
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
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#E5325C] text-xs font-medium text-gray-900 bg-[#F8F9FA]"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5">
                  <label className="text-xs font-bold text-[#101216]">
                    Passcode / OTP
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 4-digit OTP"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#E5325C] text-xs font-mono font-bold text-gray-900 bg-[#F8F9FA]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#E5325C] hover:bg-[#D4264E] text-white font-semibold font-btn tracking-rounded text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-2 border-t border-gray-100 font-body">
              <p className="text-xs text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-[#E5325C] font-semibold font-heading hover:underline">
                  Sign Up for Free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
