'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from './types';

interface AuthContextType {
  user: AuthUser | null;
  isAuthModalOpen: boolean;
  authMode: 'login' | 'signup';
  openLogin: () => void;
  openSignup: () => void;
  closeAuthModal: () => void;
  login: (phoneOrEmail: string, otpOrPass?: string) => Promise<{ success: boolean; message?: string }>;
  signup: (data: { name: string; phone: string; email: string; city: string }) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'recars_authenticated_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const openLogin = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const openSignup = () => {
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (phoneOrEmail: string, otpOrPass?: string) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', phoneOrEmail, otp: otpOrPass }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, message: data.error || 'Login failed' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Login failed' };
    }
  };

  const signup = async (formData: { name: string; phone: string; email: string; city: string }) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signup', ...formData }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, message: data.error || 'Signup failed' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Signup failed' };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { signInWithPopup } = await import('firebase/auth');
      const { auth, googleProvider } = await import('./firebase');

      const cred = await signInWithPopup(auth, googleProvider);
      const googleUser = cred.user;

      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'google',
          name: googleUser.displayName || '',
          email: googleUser.email || '',
          phone: googleUser.phoneNumber || '',
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, message: data.error || 'Google sign in failed' };
    } catch (e: any) {
      console.error('Google Auth Error:', e);
      return { success: false, message: e.message || 'Google sign in cancelled or failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthModalOpen,
        authMode,
        openLogin,
        openSignup,
        closeAuthModal,
        login,
        signup,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
