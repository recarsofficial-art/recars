'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Percent,
  CheckCircle2,
  Calendar,
  Building,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRecarsState } from '@/lib/store';
import { formatINR, calculateEMI } from '@/lib/formatters';

export default function FinancePage() {
  const { selectedCity, changeCity, wishlistIds } = useRecarsState();

  const [loanAmount, setLoanAmount] = useState<number>(1000000);
  const [tenureYears, setTenureYears] = useState<number>(5);
  const [interestRate, setInterestRate] = useState<number>(9.0);
  const [submitted, setSubmitted] = useState(false);

  const monthlyEMI = calculateEMI(loanAmount, interestRate, tenureYears * 12);
  const totalRepayment = monthlyEMI * tenureYears * 12;
  const totalInterest = totalRepayment - loanAmount;

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
            Recars Financial Services
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#101216]">
            Used Car Loans Starting at 8.75%
          </h1>
          <p className="text-xs sm:text-sm text-[#6B7078] max-w-lg mx-auto">
            Instant digital loan approvals, up to 100% on-road financing, and transparent low processing charges.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-10">
        {/* Loan Calculator */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-10 shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-xl font-black text-[#101216]">Custom EMI Calculator</h2>

            <div>
              <div className="flex justify-between text-xs font-bold text-[#101216] mb-1">
                <span>Loan Required</span>
                <span className="text-[#E5325C] text-sm">{formatINR(loanAmount)}</span>
              </div>
              <input
                type="range"
                min="200000"
                max="4000000"
                step="50000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full accent-[#E5325C]"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-[#101216] mb-1">
                <span>Loan Tenure: {tenureYears} Years</span>
                <span className="text-[#6B7078]">{tenureYears * 12} Months</span>
              </div>
              <div className="grid grid-cols-5 gap-2 pt-1">
                {[1, 2, 3, 5, 7].map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setTenureYears(yr)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      tenureYears === yr
                        ? 'bg-[#101216] text-white border-[#101216]'
                        : 'bg-[#F8F9FA] border-[#E5E7EB] text-[#6B7078]'
                    }`}
                  >
                    {yr} Yrs
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-[#101216] mb-1">
                <span>Interest Rate</span>
                <span className="text-[#E5325C] text-sm">{interestRate}% p.a.</span>
              </div>
              <input
                type="range"
                min="8.5"
                max="14.0"
                step="0.25"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full accent-[#E5325C]"
              />
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-[#FFF0F3] to-[#FFE5EC] border border-[#FFD6DF] rounded-3xl p-6 sm:p-8 text-center space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#E5325C]">
              Estimated Monthly Payment
            </span>
            <div className="text-4xl font-black text-[#101216]">
              {formatINR(monthlyEMI)}
              <span className="text-xs font-normal text-[#6B7078]"> / month</span>
            </div>

            <div className="pt-2 border-t border-[#FFD6DF] space-y-2 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-[#6B7078]">Principal Loan:</span>
                <span className="font-bold text-[#101216]">{formatINR(loanAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7078]">Total Interest:</span>
                <span className="font-bold text-[#101216]">{formatINR(totalInterest)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7078]">Total Repayment:</span>
                <span className="font-bold text-[#E5325C]">{formatINR(totalRepayment)}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSubmitted(true)}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#E5325C] text-white text-xs font-bold hover:bg-[#D4264E] transition-all shadow-md"
              >
                {submitted ? 'Eligibility Check Submitted!' : 'Check Instant Loan Eligibility'}
              </button>
            </div>
          </div>
        </div>

        {/* Banking Partners Strip */}
        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7078] text-center">
            Our Official Banking & NBFC Partners
          </h3>
          <div className="flex items-center justify-around flex-wrap gap-4 pt-2">
            {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'IDFC FIRST'].map(
              (bank) => (
                <div key={bank} className="px-4 py-2 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] text-xs font-bold text-[#101216]">
                  {bank}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
