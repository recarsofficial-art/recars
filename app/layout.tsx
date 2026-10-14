import type { Metadata } from 'next';
import './globals.css';
import ClientProviders from '@/components/ClientProviders';

export const metadata: Metadata = {
  title: 'Recars — Trust Every Drive. Value Every Rupee.',
  description:
    'Discover verified used cars in India with 200+ point inspection, transparent pricing, 7-day moneyback guarantee, and hassle-free RC transfer. Buy or sell pre-owned cars with total confidence.',
  keywords: [
    'Used Cars',
    'Pre-owned Cars',
    'Buy Used Cars India',
    'Sell Car Online',
    'Recars',
    'Used Cars Hyderabad',
    'Used Cars Bangalore',
    'Certified Second Hand Cars',
  ],
  openGraph: {
    title: 'Recars — Trust Every Drive. Value Every Rupee.',
    description:
      'Verified used cars, transparent pricing and a hassle-free experience. Buy, sell or upgrade with confidence.',
    url: 'https://recars.in',
    siteName: 'Recars',
    locale: 'en_IN',
    type: 'website',
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
