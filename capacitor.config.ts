import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.recars.app',
  appName: 'Recars',
  webDir: 'public',
  server: {
    url: 'http://localhost:3000',
    cleartext: true,
    androidScheme: 'https',
    allowNavigation: [
      'localhost',
      '127.0.0.1',
      'recars.in',
      '*.recars.in',
      '*.supabase.co',
      '*.firebaseapp.com',
      '*.googleapis.com',
      '*.gstatic.com',
      'images.unsplash.com',
    ],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 400,
      launchAutoHide: true,
      backgroundColor: '#FFFFFF',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#FFFFFF',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
