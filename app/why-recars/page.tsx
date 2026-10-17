'use client';

import Link from 'next/link';
import {
  ShieldCheck,
  FileCheck,
  IndianRupee,
  RotateCcw,
  CreditCard,
  FileText,
  Headphones,
  Check,
  X,
  Award,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRecarsState } from '@/lib/store';

export default function WhyRecarsPage() {
  const { selectedCity, changeCity, wishlistIds } = useRecarsState();

  const comparisonRows = [
    {
      feature: 'Inspection Rigor',
      recars: '28+ Point Certified Engineering Check',
      unorganized: 'Basic visual check or none',
    },
    {
      feature: 'Odometer Tampering Guarantee',
      recars: '100% Genuine Odometer with OEM history check',
      unorganized: 'High risk of meter tampering',
    },
    {
      feature: 'Quality Verification',
      recars: '28+ Point engineering check with digital report',
      unorganized: 'Basic cosmetic polish without diagnostic scan',
    },
    {
      feature: 'Accidental Chassis Verification',
      recars: 'Strict zero structural accident policy',
      unorganized: 'Often concealed with superficial paint jobs',
    },
    {
      feature: 'Pricing & Negotiation',
      recars: 'Data-backed market guidance with direct online negotiation',
      unorganized: 'Arbitrary dealer margins and artificial markups',
    },
    {
      feature: 'Inspection Standard',
      recars: 'Certified mechanical, electronic & diagnostic checks',
      unorganized: 'No mechanical inspection or technical warranty',
    },
    {
      feature: 'Pricing Transparency',
      recars: 'Fair market evaluation with transparent inspection charges',
      unorganized: 'Arbitrary dealer margins and hidden commissions',
    },
    {
      feature: 'RC Ownership Transfer',
      recars: 'Doorstep RTO legal transfer assistance (RTO transfer charges paid by client)',
      unorganized: 'Customer left to deal with RTO agents & delays',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFFFF]">
      <Navbar
        selectedCity={selectedCity}
        onSelectCity={changeCity}
        wishlistCount={wishlistIds.length}
      />

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-[#FFF0F3] to-white py-16 sm:py-20 border-b border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#E5325C]">
            The Recars Promise
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-[#101216] tracking-tight">
            Trust Every Drive. <br />
            Value Every Rupee.
          </h1>
          <p className="text-sm sm:text-base text-[#6B7078] max-w-2xl mx-auto leading-relaxed">
            We started Recars to eliminate the mistrust, opacity, and uncertainty from the Indian used-car ecosystem. Every car on our platform goes through meticulous engineering checks, backed by total financial and legal transparency.
          </p>
        </div>
      </section>

      {/* 7 Trust Pillars */}
      <section className="py-16 bg-white" id="inspection">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-black text-[#101216]">Our 7 Pillars of Trust</h2>
            <p className="text-xs sm:text-sm text-[#6B7078]">
              Engineered standards designed to protect you before, during, and after purchase.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#E5325C] shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#101216]">28+ Point Inspection</h3>
              <p className="text-xs text-[#6B7078] leading-relaxed">
                Automotive specialists evaluate engine compression, hydraulic brakes, body panels, OBD-II scanner electronics, and electrical harness. If it doesn&apos;t meet our standards, we reject it.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#E5325C] shadow-xs">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#101216]">Fair Price Negotiations</h3>
              <p className="text-xs text-[#6B7078] leading-relaxed">
                Submit an offer directly from any vehicle listing. Our pricing desk reviews your offer with data-driven counterproposals for full mutual agreement.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#E5325C] shadow-xs">
                <IndianRupee className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#101216]">Data-Driven Market Guidance</h3>
              <p className="text-xs text-[#6B7078] leading-relaxed">
                No arbitrary bargaining or inflated dealer markups. Real market transaction benchmarks and transparent pricing suggestions guide every decision.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#E5325C] shadow-xs">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#101216]">Rigorous Engineering Standards</h3>
              <p className="text-xs text-[#6B7078] leading-relaxed">
                Comprehensive 28+ mechanical diagnostics including engine compression, transmission gearshifts, ECU health, and chassis integrity.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#E5325C] shadow-xs">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#101216]">100% Legal Document Cleared</h3>
              <p className="text-xs text-[#6B7078] leading-relaxed">
                We independently verify RTO registration, previous loan hypothecation NOCs, traffic challans, and insurance claims history before putting any vehicle up for sale.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#E5325C] shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#101216]">Doorstep RC Transfer Assistance</h3>
              <p className="text-xs text-[#6B7078] leading-relaxed">
                Our in-house RTO legal desk assists with transfer documentation, NOC generation, and appointment coordination. Note: Recars provides full transfer assistance, while statutory RTO transfer charges and government fees are to be paid by the client.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-[#F8F9FA] border-t border-b border-[#E5E7EB]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <h2 className="text-3xl font-black text-[#101216]">Recars vs Traditional Used Car Market</h2>
            <p className="text-xs sm:text-sm text-[#6B7078]">
              See why thousands of buyers switch from roadside brokers to Recars.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden shadow-lg">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#101216] text-white">
                <tr>
                  <th className="p-4 sm:p-5 font-bold">Standard</th>
                  <th className="p-4 sm:p-5 font-bold text-[#E5325C]">Recars Assured</th>
                  <th className="p-4 sm:p-5 font-bold text-gray-400">Traditional Dealers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="hover:bg-[#FFF0F3]/40 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-[#101216]">{row.feature}</td>
                    <td className="p-4 sm:p-5 text-[#237A52] font-semibold flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#237A52] flex-shrink-0 stroke-[3]" />
                      <span>{row.recars}</span>
                    </td>
                    <td className="p-4 sm:p-5 text-[#C43D3D] font-medium">
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-[#C43D3D] flex-shrink-0 stroke-[2.5]" />
                        <span>{row.unorganized}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/buy"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#E5325C] text-white font-bold text-sm hover:bg-[#D4264E] transition-all shadow-md"
            >
              <span>Explore Verified Cars</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
