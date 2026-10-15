import type { Metadata } from 'next';
import './globals.css';
import ClientProviders from '@/components/ClientProviders';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.recars.in'),
  title: 'Recars | Trust Every Drive. Value Every Rupee.',
  description:
    'Discover, buy and sell used cars with Recars. Trust Every Drive. Value Every Rupee.',
  keywords: [
    'Used Cars',
    'Pre-owned Cars',
    'Buy Used Cars India',
    'Sell Car Online',
    'Recars',
    'Used Cars Hyderabad',
    'Used Cars Warangal',
    'Used Cars Bangalore',
    'Certified Second Hand Cars',
  ],
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Recars | Trust Every Drive. Value Every Rupee.',
    description:
      'Discover, buy and sell used cars with Recars. Trust Every Drive. Value Every Rupee.',
    url: 'https://www.recars.in',
    siteName: 'Recars',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/images/recars-og.png',
        width: 1200,
        height: 630,
        alt: 'Recars — Trust Every Drive. Value Every Rupee.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recars | Trust Every Drive. Value Every Rupee.',
    description:
      'Discover, buy and sell used cars with Recars. Trust Every Drive. Value Every Rupee.',
    images: ['/images/recars-og.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#F8F9FA] text-[#101216]">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
