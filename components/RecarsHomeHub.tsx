'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import CarSearchModal from './CarSearchModal';

interface RecarsHomeHubProps {
  activeTab?: 'buy' | 'sell';
  onSelectTab?: (tab: 'buy' | 'sell') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit?: (e: React.FormEvent) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

export default function RecarsHomeHub({
  activeTab = 'buy',
  onSelectTab,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  selectedCity,
  onSelectCity,
}: RecarsHomeHubProps) {
  const router = useRouter();
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(e);
    } else if (searchQuery.trim()) {
      router.push(`/buy?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/buy');
    }
  };

  return (
    <section className="w-full bg-gradient-to-b from-white via-[#F8F9FB] to-[#F1F4F9] text-[#101216] pt-4 pb-8 sm:pt-6 sm:pb-10 border-b border-gray-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        {/* ========================================================
            1. TOP BAR: LOCATION DROPDOWN + AQI BADGE
        ========================================================= */}
        <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
          {/* Location Selector */}
          <div className="relative">
            <button
              onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
              onBlur={() => setTimeout(() => setIsCityDropdownOpen(false), 200)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#101216] hover:text-[#E5325C] transition-colors py-1.5 px-3 rounded-full bg-white border border-gray-300 shadow-2xs cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[#E5325C]" />
              <span>{selectedCity || 'Warangal'}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-500 transition-transform ${
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
        </div>

        {/* ========================================================
            2. ROUNDED SEARCH BAR: "Search cars by model"
        ========================================================= */}
        <div className="relative mb-5 sm:mb-6">
          <div
            onClick={() => setIsSearchModalOpen(true)}
            className="relative flex items-center cursor-pointer group"
          >
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
              <div className="w-6 h-6 rounded-full border-2 border-[#E5325C] flex items-center justify-center">
                <Search className="w-3 h-3 text-[#E5325C]" />
              </div>
            </div>
            <input
              type="text"
              readOnly
              value={searchQuery}
              placeholder="Search for your favourite car (e.g. Creta, Thar, City, Swift)..."
              className="w-full bg-white text-[#101216] placeholder:text-gray-400 pl-13 pr-24 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-medium border border-gray-300 group-hover:border-[#E5325C] shadow-xs cursor-pointer transition-all"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsSearchModalOpen(true);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 sm:py-2 rounded-xl bg-[#E5325C] hover:bg-[#D4264E] text-white text-xs font-semibold font-btn tracking-rounded transition-transform active:scale-95 cursor-pointer shadow-xs"
            >
              Search
            </button>
          </div>
        </div>

        {/* Global Full-Featured Car Search Modal */}
        <CarSearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          initialQuery={searchQuery}
        />

        {/* ========================================================
            3. AMBASSADOR PHOTO SECTION (WIDESCREEN LANDSCAPE BANNER)
        ========================================================= */}
        <div className="relative overflow-hidden rounded-3xl bg-[#101216] mb-5 sm:mb-6 shadow-xl border border-gray-200 group">
          {/* Background Landscape Photo */}
          <div className="absolute inset-0">
            <img
              src="/hero-ambassador-landscape.jpg"
              alt="Sell your car for the right price"
              className="w-full h-full object-cover object-[center_center] sm:object-[60%_center] scale-100 group-hover:scale-[1.01] transition-transform duration-700"
            />
            {/* Natural gradient overlay on the left to ensure high-contrast white text legibility while showcasing the ambassador and car */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent sm:from-black/80 sm:via-black/35 sm:to-transparent" />
          </div>

          {/* Foreground Content (Matching reference screenshot exactly) */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-12 min-h-[240px] sm:min-h-[290px] lg:min-h-[340px] flex flex-col justify-center items-start max-w-lg">
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-[#E5325C] text-white text-[10px] sm:text-xs font-semibold font-nav uppercase tracking-wider shadow-xs">
                Recars Direct
              </span>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-semibold font-heading text-white leading-[1.15] tracking-tight drop-shadow-md">
                sell your car<br />
                for the<br />
                right price
              </h2>
            </div>

            <div className="mt-4 sm:mt-6">
              <Link
                href="/sell"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-black hover:bg-[#E5325C] text-white text-xs sm:text-sm font-semibold font-btn shadow-lg border border-white/20 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <span>Sell Car</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================
            4. THE 2 PRIMARY SERVICE CARDS: BUY A CAR & SELL YOUR CAR
        ========================================================= */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-5">
          {/* CARD 1: BUY A CAR -> OPENS /buy */}
          <Link
            href="/buy"
            className="group relative block rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.99] cursor-pointer"
            aria-label="Buy a Car"
          >
            <img
              src="/images/card-buy-car.png"
              alt="Buy a Car — Recars"
              className="w-full h-auto object-contain block transition-transform duration-300 group-hover:scale-[1.02]"
              loading="eager"
            />
          </Link>

          {/* CARD 2: SELL YOUR CAR -> OPENS /sell */}
          <Link
            href="/sell"
            className="group relative block rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.99] cursor-pointer"
            aria-label="Sell Your Car"
          >
            <img
              src="/images/card-sell-car.png"
              alt="Sell Your Car — Recars"
              className="w-full h-auto object-contain block transition-transform duration-300 group-hover:scale-[1.02]"
              loading="eager"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
