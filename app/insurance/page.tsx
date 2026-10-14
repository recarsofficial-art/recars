'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Car,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRecarsState } from '@/lib/store';

export default function InsurancePage() {
  const { selectedCity, changeCity, wishlistIds } = useRecarsState();
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Navbar
        selectedCity={selectedCity}
        onSelectCity={changeCity}
        wishlistCount={wishlistIds.length}
      />

      <div className="bg-white border-b border-[#E5E7EB] py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#E5325C]">
            Recars Assurance & Protection
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#101216]">
            Comprehensive & Zero-Depreciation Car Insurance
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7078] max-w-lg mx-auto">
            Hassle-free policy transfers, cashless claims across 5,500+ network garages, and up to 85% discount on own-damage premiums.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center font-bold">
              01
            </div>
            <h3 className="font-bold text-base text-[#101216]">Zero Depreciation (Bumper to Bumper)</h3>
            <p className="text-xs text-[#6B7078] leading-relaxed">
              100% claim settlement on plastic, rubber, fiber glass, and metal parts replacement with no depreciation deduction.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center font-bold">
              02
            </div>
            <h3 className="font-bold text-base text-[#101216]">Engine & Gearbox Protector</h3>
            <p className="text-xs text-[#6B7078] leading-relaxed">
              Essential for Indian monsoons. Covers hydrostatic lock and oil spill damages to internal engine mechanics.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center font-bold">
              03
            </div>
            <h3 className="font-bold text-base text-[#101216]">24x7 Roadside Assistance</h3>
            <p className="text-xs text-[#6B7078] leading-relaxed">
              Emergency towing, flat tyre assistance, battery jump-start, and on-spot minor repairs anywhere across Indian highways.
            </p>
          </div>
        </div>

        {/* Insurance Request Form */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-10 shadow-sm space-y-4 max-w-xl mx-auto">
          <h2 className="text-lg font-black text-[#101216] text-center">
            Request an Instant Insurance Quote
          </h2>
          {submitted ? (
            <div className="p-4 rounded-2xl bg-[#F0F9F4] text-[#237A52] text-xs font-bold text-center border border-[#D1EAD9]">
              Quote request received! Our insurance desk will send competitive quotes via WhatsApp within 10 minutes.
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-[#101216] mb-1">Vehicle Registration No.</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TS 09 EA 4589"
                  className="w-full px-3 py-2 text-xs bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl focus:outline-none uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#101216] mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-xs bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#E5325C] text-white font-bold text-xs hover:bg-[#D4264E] transition-colors"
              >
                Get Discounted Quotes
              </button>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
