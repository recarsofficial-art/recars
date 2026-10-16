'use client';

import React, { useEffect } from 'react';
import { AuthProvider } from '@/lib/authContext';
import AuthModal from './AuthModal';
import { app } from '@/lib/firebase';

import FloatingContactButtons from './FloatingContactButtons';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Firebase app is initialized
    if (app) {
      // Firebase ready
    }
  }, []);

  return (
    <AuthProvider>
      {children}
      <AuthModal />
      <FloatingContactButtons />
    </AuthProvider>
  );
}
