'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Phone, Mail, User, MapPin, Sparkles } from 'lucide-react';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/authContext';
import { CITIES } from '@/lib/data';
import { GoogleIcon } from '@/components/AuthModal';

export default function SignupPage() {
  const router = useRouter();
  const { signup, loginWithGoogle, user } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    router.push('/account');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!phone.trim() && !email.trim()) {
      setError('Please provide a mobile number or email.');
      return;
    }
    setLoading(true);
    setError(null);
    const res = await signup({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      city: city || 'Hyderabad',
    });
    setLoading(false);
    if (res.success) {
      router.push('/');
    } else {
      setError(res.message || 'Signup failed');
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setError(null);
    const res = await loginWithGoogle();
    setGoogleLoading(false);
    if (res.success) {
      router.push('/');
    } else {
      setError(res.message || 'Google sign up failed');
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
              <span>Create Account</span>
            </span>
            <h2 className="text-2xl font-black text-[#101216] mt-2">Join Recars</h2>
            <p className="text-xs text-gray-600 mt-1">
              Connect to Supabase, book doorstep test drives and track sell valuations.
            </p>
          </div>

          <div className="p-6 space-y-4">
            {/* Google Sign Up Option */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              disabled={googleLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-[#E5E7EB] hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>{googleLoading ? 'Connecting with Google...' : 'Sign up with Google'}</span>
            </button>

            <div className="relative flex items-center justify-center my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E7EB]" />
              </div>
              <div className="relative bg-white px-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Or register with details
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                  {error}
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
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#E5325C] hover:bg-[#D4264E] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-[#E5325C] font-bold hover:underline">
                  Sign In
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
