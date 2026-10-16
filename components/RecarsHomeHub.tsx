'use client';

import { useState } from 'react';
import {
  Search,
  MapPin,
  ChevronDown,
  ArrowRight,
  Car,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { CITIES } from '@/lib/data';

interface RecarsHomeHubProps {
  activeTab: 'buy' | 'sell';
  onSelectTab: (tab: 'buy' | 'sell') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

export default function RecarsHomeHub({
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  selectedCity,
  onSelectCity,
}: RecarsHomeHubProps) {
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  return (
    <section className="w-full bg-[#0E1118] text-white pt-4 pb-8 sm:pt-6 sm:pb-12 relative overflow-hidden">
      {/* Background Subtle Tech Grid Dots */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        {/* ========================================================
            1. TOP BAR: LOCATION DROPDOWN + AQI BADGE
        ========================================================= */}
        <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6">
          {/* Location Selector */}
          <div className="relative">
            <button
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              onBlur={() => setTimeout(() => setIsCityDropdownOpen(false), 200)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white hover:text-white/80 transition-colors py-1 px-2.5 rounded-full bg-white/10 backdrop-blur-xs border border-white/15"
            >
              <MapPin className="w-3.5 h-3.5 text-[#E5325C]" />
              <span>{selectedCity || 'Warangal'}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-white/70 transition-transform ${
                  isCityDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isCityDropdownOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white text-[#101216] rounded-2xl shadow-2xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Select Location
                </div>
                {CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      onSelectCity(city);
                      setIsCityDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between hover:bg-[#FFF0F3] hover:text-[#E5325C] transition-colors ${
                      selectedCity === city ? 'bg-[#FFF0F3] text-[#E5325C] font-bold' : ''
                    }`}
                  >
                    <span>{city}</span>
                    {selectedCity === city && <CheckCircle2 className="w-3.5 h-3.5 text-[#E5325C]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* AQI Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18392B] border border-[#238652]/40 text-[#4ADE80] text-[11px] sm:text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
            <span>AQI: 48 • Good</span>
          </div>
        </div>

        {/* ========================================================
            2. ROUNDED SEARCH BAR: "Search cars by model"
        ========================================================= */}
        <form onSubmit={onSearchSubmit} className="relative mb-5 sm:mb-6">
          <div className="relative flex items-center">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-[#E5325C] flex items-center justify-center">
                <Search className="w-3 h-3 text-[#E5325C]" />
              </div>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search cars by model (e.g. Creta, Thar, City, Swift)..."
              className="w-full bg-white text-[#101216] placeholder:text-gray-400 pl-13 pr-24 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-medium shadow-md focus:outline-none focus:ring-2 focus:ring-[#E5325C] transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 sm:py-2 rounded-xl bg-[#E5325C] hover:bg-[#D4264E] text-white text-xs font-bold transition-transform active:scale-95"
            >
              Search
            </button>
          </div>
        </form>

        {/* ========================================================
            3. BLUE BANNER: "Explore cars >" with car illustration
        ========================================================= */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#3B82F6] p-4 sm:p-6 mb-5 sm:mb-6 shadow-xl border border-blue-400/20">
          {/* Subtle stylized background landscape trees */}
          <div className="absolute inset-0 opacity-20 pointer-events-none flex items-end justify-between px-4">
            <div className="w-24 h-24 rounded-full bg-white/20 blur-xl" />
            <div className="w-40 h-40 rounded-full bg-cyan-300/30 blur-2xl" />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-block text-[11px] font-bold text-blue-100 uppercase tracking-wider">
                Recars Direct Collection
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
                Quality Pre-Owned Cars in {selectedCity || 'Warangal'}
              </h2>
              <p className="text-xs text-blue-100/90 max-w-sm">
                200+ engineering checkpoints, transparent prices, doorstep test drives.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-center">
              <button
                type="button"
                onClick={() => onSelectTab('buy')}
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white text-[#1D4ED8] hover:bg-blue-50 text-xs sm:text-sm font-extrabold shadow-md transition-transform active:scale-95"
              >
                <span>Explore cars</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            4. THE 2 PRIMARY SERVICE CARDS: BUY USED CAR & SELL CAR
        ========================================================= */}
        <div className="grid grid-cols-2 gap-3.5 sm:gap-6 mb-6">
          {/* CARD 1: BUY USED CAR */}
          <button
            type="button"
            onClick={() => onSelectTab('buy')}
            className={`group text-left p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer min-h-[140px] sm:min-h-[160px] ${
              activeTab === 'buy'
                ? 'bg-white text-[#101216] border-[#E5325C] shadow-xl ring-2 ring-[#E5325C]/25 scale-[1.01]'
                : 'bg-white text-[#101216] border-white/20 hover:border-white/60 shadow-md hover:shadow-lg'
            }`}
          >
            {/* Top row with tag and active indicator */}
            <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FFF0E6] text-[#E05300] text-[10px] sm:text-xs font-extrabold tracking-tight">
                UP TO 20% OFF
              </span>
              {activeTab === 'buy' && (
                <span className="w-3 h-3 rounded-full bg-[#E5325C] ring-4 ring-[#FFF0F3]" />
              )}
            </div>

            <div>
              <h3 className="text-base sm:text-xl font-black text-[#101216] group-hover:text-[#E5325C] transition-colors tracking-tight">
                Buy used car
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 line-clamp-1 mt-0.5 sm:mt-1">
                Certified 200+ points • 5-day return
              </p>
            </div>

            {/* Car illustration / action */}
            <div className="mt-4 flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center">
                <Car className="w-5 h-5" />
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-[#E5325C] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Browse Cars</span>
                <span>→</span>
              </div>
            </div>
          </button>

          {/* CARD 2: SELL CAR */}
          <button
            type="button"
            onClick={() => onSelectTab('sell')}
            className={`group text-left p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer min-h-[140px] sm:min-h-[160px] ${
              activeTab === 'sell'
                ? 'bg-white text-[#101216] border-[#E5325C] shadow-xl ring-2 ring-[#E5325C]/25 scale-[1.01]'
                : 'bg-white text-[#101216] border-white/20 hover:border-white/60 shadow-md hover:shadow-lg'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FFF0F3] text-[#E5325C] text-[10px] sm:text-xs font-extrabold tracking-tight">
                Instant Valuation
              </span>
              {activeTab === 'sell' && (
                <span className="w-3 h-3 rounded-full bg-[#E5325C] ring-4 ring-[#FFF0F3]" />
              )}
            </div>

            <div>
              <h3 className="text-base sm:text-xl font-black text-[#101216] group-hover:text-[#E5325C] transition-colors tracking-tight">
                Sell car
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 line-clamp-1 mt-0.5 sm:mt-1">
                15000+ buyer network • Best price guarantee
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center">
                <Tag className="w-5 h-5" />
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-[#E5325C] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Get Offer (SellRight)</span>
                <span>→</span>
              </div>
            </div>
          </button>
        </div>

        {/* ========================================================
            5. PRIMARY MODE SELECTOR PILL: [ Buy Used Car ] [ Sell Car ]
        ========================================================= */}
        <div className="flex items-center justify-center pt-2">
          <div className="inline-flex p-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 shadow-inner">
            <button
              type="button"
              onClick={() => onSelectTab('buy')}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'buy'
                  ? 'bg-white text-[#101216] shadow-md scale-102'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Car className="w-3.5 h-3.5 text-[#E5325C]" />
              <span>Buy Used Car</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('sell')}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'sell'
                  ? 'bg-[#E5325C] text-white shadow-md scale-102'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Sell Car (SellRight)</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
