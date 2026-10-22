'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  X,
  TrendingUp,
  Tag,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  Car as CarIcon,
} from 'lucide-react';
import { useRecarsState } from '@/lib/store';
import { formatINR } from '@/lib/formatters';

interface CarSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const TRENDING_SEARCHES = [
  'Tata Tiago',
  'Tata NEXON',
  'Hyundai Creta',
  'Maruti Swift',
  'Mahindra Thar',
  'Kia Seltos',
  'Honda City',
  'Toyota Fortuner',
];

const SEARCH_BRANDS = [
  {
    name: 'Maruti',
    filterMake: 'Maruti Suzuki',
    logo: '/images/brands/suzuki-emblem.svg',
    className: 'w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 object-contain',
  },
  {
    name: 'Hyundai',
    filterMake: 'Hyundai',
    logo: '/images/brands/hyundai-emblem.png',
    className: 'w-9 h-6 sm:w-10 sm:h-6.5 object-contain',
  },
  {
    name: 'Tata',
    filterMake: 'Tata',
    logo: '/images/brands/tata-emblem.svg',
    className: 'w-8.5 h-7.5 sm:w-9.5 sm:h-8 object-contain',
  },
  {
    name: 'Honda',
    filterMake: 'Honda',
    logo: '/images/brands/honda-badge.svg',
    className: 'w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 object-contain',
  },
  {
    name: 'Mahindra',
    filterMake: 'Mahindra',
    logo: '/images/brands/mahindra-emblem.png',
    className: 'w-8 h-8 sm:w-9 sm:h-9 object-contain',
  },
  {
    name: 'Kia',
    filterMake: 'Kia',
    logo: '/images/brands/kia.svg',
    className: 'w-9 h-auto sm:w-10 object-contain',
  },
  {
    name: 'Toyota',
    filterMake: 'Toyota',
    logo: '/images/brands/toyota-emblem.svg',
    className: 'w-9 h-6 sm:w-10 sm:h-6.5 object-contain',
  },
  {
    name: 'Renault',
    filterMake: 'Renault',
    logo: '/images/brands/renault-diamond.png',
    className: 'w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 object-contain',
  },
  {
    name: 'Volkswagen',
    filterMake: 'Volkswagen',
    logo: '/images/brands/volkswagen-emblem.svg',
    className: 'w-8 h-8 sm:w-9 sm:h-9 object-contain',
  },
  {
    name: 'MG',
    filterMake: 'MG',
    logo: '/images/brands/mg.svg',
    className: 'w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 object-contain',
  },
  {
    name: 'Ford',
    filterMake: 'Ford',
    logo: '/images/brands/ford.svg',
    className: 'w-8.5 h-auto object-contain',
  },
  {
    name: 'Audi',
    filterMake: 'Audi',
    logo: '/images/brands/audi.svg',
    className: 'w-8.5 h-auto object-contain',
  },
];

const SEARCH_BUDGETS = [
  { label: 'Under ₹2 lakhs', maxPrice: 200000 },
  { label: 'Under ₹3 lakhs', maxPrice: 300000 },
  { label: 'Under ₹4 lakhs', maxPrice: 400000 },
  { label: 'Under ₹5 lakhs', maxPrice: 500000 },
  { label: 'Under ₹8 lakhs', maxPrice: 800000 },
  { label: 'Under ₹10 lakhs', maxPrice: 1000000 },
  { label: 'Under ₹12 lakhs', maxPrice: 1200000 },
  { label: 'Under ₹15 lakhs', maxPrice: 1500000 },
];

const BODY_TYPES = [
  { label: 'Hatchback', type: 'Hatchback', image: '/cat-hatch.png' },
  { label: 'SUV', type: 'SUV', image: '/cat-suv.png' },
  { label: 'Sedan', type: 'Sedan', image: '/cat-new-cars.png' },
  { label: 'MUV', type: 'MUV', image: '/cat-ute.png' },
];

export default function CarSearchModal({
  isOpen,
  onClose,
  initialQuery = '',
}: CarSearchModalProps) {
  const router = useRouter();
  const { cars } = useRecarsState();
  const [query, setQuery] = useState(initialQuery);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialQuery]);

  if (!isOpen || !mounted) return null;

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      onClose();
      router.push(`/buy?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelectTrending = (term: string) => {
    onClose();
    router.push(`/buy?q=${encodeURIComponent(term)}`);
  };

  const handleSelectBrand = (make: string) => {
    onClose();
    router.push(`/buy?make=${encodeURIComponent(make)}`);
  };

  const handleSelectBudget = (maxPrice: number) => {
    onClose();
    router.push(`/buy?maxPrice=${maxPrice}`);
  };

  const handleSelectBodyType = (type: string) => {
    onClose();
    router.push(`/buy?type=${encodeURIComponent(type)}`);
  };

  // Live matching cars if user has typed something
  const matchingCars = query.trim()
    ? cars
        .filter((c) => {
          const q = query.toLowerCase();
          return (
            c.make.toLowerCase().includes(q) ||
            c.model.toLowerCase().includes(q) ||
            c.variant.toLowerCase().includes(q)
          );
        })
        .slice(0, 5)
    : [];

  return createPortal(
    <div className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-xs flex items-start justify-center overflow-y-auto p-0 sm:py-8 sm:px-4">
      {/* Full screen modal container on mobile, card container on desktop */}
      <div className="w-full max-w-2xl bg-white min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200 relative z-10">
        
        {/* ========================================================
            TOP SEARCH BAR (MATCHING SCREENSHOT)
        ========================================================= */}
        <div className="p-4 sm:p-5 border-b border-gray-100 sticky top-0 bg-white z-20">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-2 -ml-1 text-gray-700 hover:text-black rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Input with rounded purple/magenta accent border */}
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for your favourite car"
                className="w-full pl-4 pr-10 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border-2 border-[#8B5CF6]/50 focus:border-[#7C3AED] focus:ring-2 focus:ring-[#8B5CF6]/20 bg-white text-sm sm:text-base font-body text-[#101216] placeholder:text-gray-400 outline-none transition-all shadow-xs"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <Search className="w-4 h-4 text-[#8B5CF6] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              )}
            </div>
          </form>

          {/* Quick live autocomplete dropdown when typing */}
          {query.trim().length > 0 && matchingCars.length > 0 && (
            <div className="mt-3 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden divide-y divide-gray-100">
              {matchingCars.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push(`/cars/${c.id}`);
                  }}
                  className="w-full p-3 text-left flex items-center justify-between hover:bg-[#FFF0F3] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={c.image || c.galleryImages?.[0] || '/car-creta-hd.jpg'}
                      alt={c.model}
                      className="w-12 h-9 object-cover rounded-lg"
                    />
                    <div>
                      <span className="text-xs sm:text-sm font-semibold font-heading text-[#101216] group-hover:text-[#E5325C] block">
                        {c.year} {c.make} {c.model}
                      </span>
                      <span className="text-[11px] text-gray-500 font-body">
                        {c.variant} • {c.fuelType}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold font-price text-[#E5325C]">
                    {formatINR(c.price)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================
            MODAL CONTENT BODY
        ========================================================= */}
        <div className="p-4 sm:p-6 space-y-7 flex-1 overflow-y-auto">
          
          {/* SECTION 1: TRENDING NOW */}
          <div>
            <h4 className="text-sm font-semibold font-heading text-[#101216] mb-3">
              Trending now
            </h4>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {TRENDING_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleSelectTrending(term)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200 hover:border-[#E5325C] hover:bg-[#FFF0F3] text-xs font-medium font-body text-gray-700 hover:text-[#E5325C] whitespace-nowrap bg-white shadow-2xs transition-all active:scale-95 cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#E5325C]" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* SECTION 2: SEARCH BY BRANDS */}
          <div>
            <h4 className="text-sm font-semibold font-heading text-[#101216] mb-3.5">
              Search by brands
            </h4>
            <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-none">
              {SEARCH_BRANDS.map((b) => (
                <button
                  key={b.name}
                  type="button"
                  onClick={() => handleSelectBrand(b.filterMake)}
                  className="flex flex-col items-center gap-2 min-w-[70px] sm:min-w-[80px] group cursor-pointer"
                >
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-white border border-gray-200/90 group-hover:border-[#E5325C] group-hover:shadow-md flex items-center justify-center p-3 transition-all duration-200 group-hover:scale-105 shadow-2xs">
                    <img
                      src={b.logo}
                      alt={b.name}
                      className={b.className}
                      loading="lazy"
                    />
                  </div>
                  <span className="text-xs font-semibold font-nav text-gray-800 group-hover:text-[#E5325C] transition-colors">
                    {b.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* SECTION 3: SEARCH BY BUDGET */}
          <div>
            <h4 className="text-sm font-semibold font-heading text-[#101216] mb-3.5">
              Search by budget
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {SEARCH_BUDGETS.map((bg) => (
                <button
                  key={bg.label}
                  type="button"
                  onClick={() => handleSelectBudget(bg.maxPrice)}
                  className="px-3.5 py-2 rounded-full border border-gray-200 hover:border-[#E5325C] hover:bg-[#FFF0F3] text-xs font-medium font-body text-gray-700 hover:text-[#E5325C] text-center bg-white shadow-2xs transition-all active:scale-95 cursor-pointer"
                >
                  {bg.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* SECTION 4: SEARCH BY BODY TYPE */}
          <div>
            <h4 className="text-sm font-semibold font-heading text-[#101216] mb-3.5">
              Search by body type
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BODY_TYPES.map((bt) => (
                <button
                  key={bt.label}
                  type="button"
                  onClick={() => handleSelectBodyType(bt.type)}
                  className="group p-3 rounded-2xl bg-[#F4F6F8] hover:bg-white hover:border-[#E5325C] border border-transparent shadow-2xs hover:shadow-md transition-all flex flex-col items-center justify-between min-h-[110px] cursor-pointer"
                >
                  <div className="w-full flex-1 flex items-center justify-center py-1">
                    <img
                      src={bt.image}
                      alt={bt.label}
                      className="h-14 sm:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <span className="text-xs font-semibold font-heading text-gray-800 group-hover:text-[#E5325C] transition-colors mt-1">
                    {bt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* SECTION 5: RECARS SERVICES */}
          <div>
            <h4 className="text-sm font-semibold font-heading text-[#101216] mb-3">
              Recars services
            </h4>
            <div className="bg-white rounded-2xl border border-gray-200/90 divide-y divide-gray-100 overflow-hidden shadow-2xs">
              <Link
                href="/sell"
                onClick={onClose}
                className="flex items-center justify-between p-3.5 hover:bg-[#FFF0F3]/60 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center">
                    <Tag className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium font-body text-gray-800 group-hover:text-[#E5325C]">
                    Sell your car
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#E5325C] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/finance"
                onClick={onClose}
                className="flex items-center justify-between p-3.5 hover:bg-[#FFF0F3]/60 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium font-body text-gray-800 group-hover:text-[#E5325C]">
                    Used car loan
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#E5325C] group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/why-recars#inspection"
                onClick={onClose}
                className="flex items-center justify-between p-3.5 hover:bg-[#FFF0F3]/60 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium font-body text-gray-800 group-hover:text-[#E5325C]">
                    28+ Point Inspection
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#E5325C] group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
