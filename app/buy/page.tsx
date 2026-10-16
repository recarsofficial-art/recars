'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Filter,
  X,
  SlidersHorizontal,
  ChevronDown,
  Check,
  RotateCcw,
  Search,
  Grid,
  List,
  Sparkles,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CarCard from '@/components/CarCard';
import DreamCarWizardModal, { BUDGET_BRACKETS } from '@/components/DreamCarWizardModal';
import TwoColumnFilterDrawer from '@/components/TwoColumnFilterDrawer';
import { useRecarsState } from '@/lib/store';
import { MAKES, CITIES, CAR_TYPES } from '@/lib/data';
import { CarBodyType, FuelType, TransmissionType } from '@/lib/types';
import { formatINR, formatKM } from '@/lib/formatters';

function BuyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const {
    selectedCity,
    changeCity,
    wishlistIds,
    toggleWishlist,
    isWishlisted,
    cars: storeCars,
  } = useRecarsState();

  const [liveCars, setLiveCars] = useState<any[]>([]);

  useEffect(() => {
    const fetchFreshCars = () => {
      fetch('/api/cars')
        .then((r) => r.json())
        .then((d) => {
          if (d?.cars?.length > 0) setLiveCars(d.cars);
        })
        .catch(() => {});
    };
    fetchFreshCars();
    window.addEventListener('focus', fetchFreshCars);
    return () => window.removeEventListener('focus', fetchFreshCars);
  }, []);

  const cars = liveCars.length > 0 ? liveCars : storeCars;

  // Filters State initialized from search params
  const [selectedMakes, setSelectedMakes] = useState<string[]>(() => {
    const p = searchParams.get('make');
    return p ? [p] : [];
  });

  const [selectedBodyTypes, setSelectedBodyTypes] = useState<string[]>(() => {
    const p = searchParams.get('type');
    return p ? [p] : [];
  });

  const [selectedFuels, setSelectedFuels] = useState<string[]>([]);
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([]);
  const [selectedOwnerships, setSelectedOwnerships] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const [minPrice, setMinPrice] = useState<number>(() => {
    const b = searchParams.get('budget');
    if (b && b.includes('-')) {
      return parseInt(b.split('-')[0]) || 50000;
    }
    return 50000;
  });

  const [maxPrice, setMaxPrice] = useState<number>(() => {
    const b = searchParams.get('budget');
    if (b && b.includes('-')) {
      return parseInt(b.split('-')[1]) || 7000000;
    }
    return 7000000;
  });

  const [maxKm, setMaxKm] = useState<number>(80000);
  const [minYear, setMinYear] = useState<number>(2018);
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);
  const [onlyRecarsSelect, setOnlyRecarsSelect] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>(() => searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isDreamWizardOpen, setIsDreamWizardOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Multi-select toggle helpers
  const toggleItem = (list: string[], setList: (val: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const clearAllFilters = () => {
    setSelectedMakes([]);
    setSelectedBodyTypes([]);
    setSelectedFuels([]);
    setSelectedTransmissions([]);
    setSelectedOwnerships([]);
    setSelectedAvailability([]);
    setSelectedSeats([]);
    setSelectedColors([]);
    setSelectedFeatures([]);
    setMinPrice(50000);
    setMaxPrice(7000000);
    setMaxKm(80000);
    setMinYear(2018);
    setOnlyVerified(false);
    setOnlyRecarsSelect(false);
    setSearchQuery('');
  };

  // Filtered and Sorted Cars
  const filteredCars = useMemo(() => {
    return cars
      .filter((car) => {
        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = `${car.make} ${car.model} ${car.variant}`.toLowerCase().includes(q);
          const matchCity = car.city.toLowerCase().includes(q);
          if (!matchTitle && !matchCity) return false;
        }

        // Makes
        if (selectedMakes.length > 0 && !selectedMakes.includes(car.make)) {
          return false;
        }

        // Body Types
        if (selectedBodyTypes.length > 0 && !selectedBodyTypes.includes(car.bodyType)) {
          return false;
        }

        // Fuel
        if (selectedFuels.length > 0 && !selectedFuels.includes(car.fuelType)) {
          return false;
        }

        // Transmission
        if (selectedTransmissions.length > 0 && !selectedTransmissions.includes(car.transmission)) {
          return false;
        }

        // Ownership
        if (selectedOwnerships.length > 0 && !selectedOwnerships.includes(car.ownership)) {
          return false;
        }

        // Availability
        if (selectedAvailability.length > 0 && !selectedAvailability.includes(car.availabilityStatus || 'Available')) {
          return false;
        }

        // Price
        if (car.price < minPrice || car.price > maxPrice) return false;

        // KM
        if (car.kilometers > maxKm) return false;

        // Year
        if (car.year < minYear) return false;

        // Seats
        if (selectedSeats.length > 0) {
          const seats =
            car.specifications?.seatingCapacity ||
            (car.bodyType === 'SUV' || car.bodyType === 'MUV' ? 7 : 5);
          if (!selectedSeats.includes(seats)) return false;
        }

        // Color
        if (selectedColors.length > 0) {
          const carColor = (car.specifications?.color || '').toLowerCase();
          const matchColor = selectedColors.some((c) =>
            carColor.includes(c.toLowerCase())
          );
          if (!matchColor) return false;
        }

        // Features
        if (selectedFeatures.length > 0) {
          const carFeatures = (car.features || []).map((f: string) => f.toLowerCase());
          const hasAll = selectedFeatures.every((f) =>
            carFeatures.some((cf: string) => cf.includes(f.toLowerCase()))
          );
          if (!hasAll) return false;
        }

        // Badges
        if (onlyVerified && !car.isVerified) return false;
        if (onlyRecarsSelect && !car.isRecarsSelect) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'km-low') return a.kilometers - b.kilometers;
        if (sortBy === 'year-new') return b.year - a.year;
        return 0; // recommended default
      });
  }, [
    cars,
    searchQuery,
    selectedMakes,
    selectedBodyTypes,
    selectedFuels,
    selectedTransmissions,
    selectedOwnerships,
    selectedAvailability,
    selectedSeats,
    selectedColors,
    selectedFeatures,
    minPrice,
    maxPrice,
    maxKm,
    minYear,
    onlyVerified,
    onlyRecarsSelect,
    sortBy,
  ]);

  const activeFilterCount =
    selectedMakes.length +
    selectedBodyTypes.length +
    selectedFuels.length +
    selectedTransmissions.length +
    selectedOwnerships.length +
    selectedAvailability.length +
    selectedSeats.length +
    selectedColors.length +
    selectedFeatures.length +
    (onlyVerified ? 1 : 0) +
    (onlyRecarsSelect ? 1 : 0) +
    (minPrice > 50000 || maxPrice < 7000000 ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const countMatchesForWizard = (wizardFilters: {
    minPrice: number;
    maxPrice: number;
    bodyTypes: string[];
    fuels: string[];
    transmissions: string[];
  }) => {
    return cars.filter((car) => {
      if (car.price < wizardFilters.minPrice || car.price > wizardFilters.maxPrice) return false;
      if (wizardFilters.bodyTypes.length > 0 && !wizardFilters.bodyTypes.includes(car.bodyType)) return false;
      if (wizardFilters.fuels.length > 0 && !wizardFilters.fuels.includes(car.fuelType)) return false;
      if (wizardFilters.transmissions.length > 0 && !wizardFilters.transmissions.includes(car.transmission)) return false;
      return true;
    }).length;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Navbar
        selectedCity={selectedCity}
        onSelectCity={changeCity}
        wishlistCount={wishlistIds.length}
      />



      {/* Main Inventory Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* =========================================
              DESKTOP FILTER SIDEBAR
          ========================================== */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs space-y-6 sticky top-28">
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#E5325C]" />
                  <span className="font-bold text-sm text-[#101216]">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#FFF0F3] border border-[#E5325C] text-[#E5325C] text-[10px] font-bold flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs font-semibold text-[#E5325C] hover:text-[#D4264E] flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Special Badges */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-[#101216] uppercase tracking-wider block">
                  Certification
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-[#24262A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyRecarsSelect}
                    onChange={(e) => setOnlyRecarsSelect(e.target.checked)}
                    className="rounded text-[#E5325C] focus:ring-[#E5325C]"
                  />
                  <span>Recars Select Only</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-[#24262A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyVerified}
                    onChange={(e) => setOnlyVerified(e.target.checked)}
                    className="rounded text-[#E5325C] focus:ring-[#E5325C]"
                  />
                  <span>100% Verified Only</span>
                </label>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-[#101216] uppercase tracking-wider">
                    Price Range
                  </label>
                  <span className="font-bold text-[#670080] text-[11px]">
                    {formatINR(minPrice)} - {formatINR(maxPrice)}
                  </span>
                </div>

                {/* Quick Budget Brackets */}
                <div className="space-y-1.5">
                  {BUDGET_BRACKETS.map((bracket) => {
                    const isSelected = minPrice === bracket.min && maxPrice === bracket.max;
                    return (
                      <button
                        key={bracket.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setMinPrice(50000);
                            setMaxPrice(7000000);
                          } else {
                            setMinPrice(bracket.min);
                            setMaxPrice(bracket.max);
                          }
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#F6EEFF] border-[#670080] text-[#670080] shadow-xs'
                            : 'bg-white border-[#E5E7EB] text-[#24262A] hover:border-gray-300'
                        }`}
                      >
                        <span>{bracket.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#670080]" />}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-1 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                    <span>Max: {formatINR(maxPrice)}</span>
                  </div>
                  <input
                    type="range"
                    min="100000"
                    max="7000000"
                    step="50000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-[#670080]"
                  />
                </div>
              </div>

              {/* Make Filter */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-[#101216] uppercase tracking-wider block">
                  Make / Brand
                </label>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {MAKES.map((m) => (
                    <label
                      key={m}
                      className="flex items-center justify-between text-xs text-[#24262A] hover:text-[#101216] cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedMakes.includes(m)}
                          onChange={() => toggleItem(selectedMakes, setSelectedMakes, m)}
                          className="rounded text-[#E5325C] focus:ring-[#E5325C]"
                        />
                        <span>{m}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Body Type Filter */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-[#101216] uppercase tracking-wider block">
                  Body Type
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {CAR_TYPES.map((t) => (
                    <button
                      key={t.type}
                      onClick={() => toggleItem(selectedBodyTypes, setSelectedBodyTypes, t.type)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors border ${
                        selectedBodyTypes.includes(t.type)
                          ? 'bg-[#FFF0F3] border-[#E5325C] text-[#E5325C]'
                          : 'bg-[#F8F9FA] border-[#E5E7EB] text-[#6B7078] hover:text-[#101216]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fuel Type Filter */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-[#101216] uppercase tracking-wider block">
                  Fuel Type
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['Petrol', 'Diesel', 'Electric', 'CNG'].map((f) => (
                    <button
                      key={f}
                      onClick={() => toggleItem(selectedFuels, setSelectedFuels, f)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        selectedFuels.includes(f)
                          ? 'bg-[#101216] text-white border-[#101216]'
                          : 'bg-white border-[#E5E7EB] text-[#6B7078]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transmission */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-[#101216] uppercase tracking-wider block">
                  Transmission
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Automatic', 'Manual'].map((tr) => (
                    <button
                      key={tr}
                      onClick={() => toggleItem(selectedTransmissions, setSelectedTransmissions, tr)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border text-center ${
                        selectedTransmissions.includes(tr)
                          ? 'bg-[#FFF0F3] border-[#E5325C] text-[#E5325C] font-semibold'
                          : 'bg-white border-[#E5E7EB] text-[#6B7078]'
                      }`}
                    >
                      {tr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ownership Count */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-[#101216] uppercase tracking-wider block">
                  Ownership
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['1st Owner', '2nd Owner', '3rd Owner'].map((own) => (
                    <button
                      key={own}
                      onClick={() => toggleItem(selectedOwnerships, setSelectedOwnerships, own)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-medium border text-center truncate ${
                        selectedOwnerships.includes(own)
                          ? 'bg-[#FFF0F3] border-[#E5325C] text-[#E5325C] font-semibold'
                          : 'bg-white border-[#E5E7EB] text-[#6B7078]'
                      }`}
                    >
                      {own}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle Availability */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-[#101216] uppercase tracking-wider block">
                  Vehicle Status
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['Available', 'Reserved', 'Sold Out'].map((st) => (
                    <button
                      key={st}
                      onClick={() => toggleItem(selectedAvailability, setSelectedAvailability, st)}
                      className={`px-1.5 py-1.5 rounded-lg text-[11px] font-medium border text-center truncate ${
                        selectedAvailability.includes(st)
                          ? 'bg-[#101216] text-white border-[#101216] font-semibold'
                          : 'bg-white border-[#E5E7EB] text-[#6B7078]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* =========================================
              CAR LISTINGS GRID / CONTENT
          ========================================== */}
          <div className="lg:col-span-3 space-y-6">
            {/* Find your dream car in 3 steps Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4A0E4E] via-[#670080] to-[#E5325C] p-4 sm:p-5 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold backdrop-blur-xs">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    Interactive Finder
                  </span>
                  <span className="text-xs text-white/80 font-medium">Find in 3 Steps</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold">
                  Your dream car, in 3 steps
                </h3>
                <p className="text-xs text-white/85 max-w-md">
                  Pick your budget bracket, body type, and preferred fuel & transmission to get instant curated matches.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDreamWizardOpen(true)}
                className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#670080] hover:bg-[#FAF5FF] text-xs font-bold shadow-xs transition-transform active:scale-95"
              >
                <span>What&apos;s your budget?</span>
                <span className="w-5 h-5 rounded-full bg-[#F6EEFF] text-[#670080] flex items-center justify-center text-[11px] font-black">→</span>
              </button>
            </div>

            {/* Controls Bar: Results Count, Mobile Filter Trigger, Search, Sort */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E5E7EB] bg-[#F6EEFF] text-xs font-bold text-[#670080]"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters ({activeFilterCount})</span>
                </button>
                <span className="text-xs sm:text-sm font-bold text-[#101216] whitespace-nowrap">
                  {filteredCars.length} {filteredCars.length === 1 ? 'Car Available' : 'Cars Available'}
                </span>
              </div>

              {/* Quick Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by make, model, variant..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#E5325C] text-[#101216]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Sorting & Layout Toggle */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#6B7078] font-medium hidden sm:inline">
                    Sort by:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-xs font-semibold text-[#101216] focus:outline-none cursor-pointer"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="km-low">KM: Lowest First</option>
                    <option value="year-new">Year: Newest First</option>
                  </select>
                </div>

                <div className="flex items-center border border-[#E5E7EB] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${
                      viewMode === 'grid' ? 'bg-[#101216] text-white' : 'bg-white text-gray-500'
                    }`}
                    title="Grid view"
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${
                      viewMode === 'list' ? 'bg-[#101216] text-white' : 'bg-white text-gray-500'
                    }`}
                    title="List view"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-[#6B7078] font-medium">Active filters:</span>
                {(minPrice > 50000 || maxPrice < 7000000) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F6EEFF] border border-[#D5A6E6] text-xs font-semibold text-[#670080]">
                    {formatINR(minPrice)} - {formatINR(maxPrice)}
                    <button
                      onClick={() => {
                        setMinPrice(50000);
                        setMaxPrice(7000000);
                      }}
                    >
                      <X className="w-3 h-3 text-[#670080] hover:text-red-500" />
                    </button>
                  </span>
                )}
                {selectedMakes.map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#E5E7EB] text-xs font-semibold text-[#101216]"
                  >
                    {m}
                    <button onClick={() => toggleItem(selectedMakes, setSelectedMakes, m)}>
                      <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                    </button>
                  </span>
                ))}
                {selectedBodyTypes.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#E5E7EB] text-xs font-semibold text-[#101216]"
                  >
                    {t}
                    <button onClick={() => toggleItem(selectedBodyTypes, setSelectedBodyTypes, t)}>
                      <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                    </button>
                  </span>
                ))}
                {selectedSeats.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#E5E7EB] text-xs font-semibold text-[#101216]"
                  >
                    {s} Seater
                    <button onClick={() => setSelectedSeats(selectedSeats.filter((x) => x !== s))}>
                      <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                    </button>
                  </span>
                ))}
                {selectedColors.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#E5E7EB] text-xs font-semibold text-[#101216]"
                  >
                    Color: {c}
                    <button onClick={() => setSelectedColors(selectedColors.filter((x) => x !== c))}>
                      <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                    </button>
                  </span>
                ))}
                {selectedFeatures.map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#E5E7EB] text-xs font-semibold text-[#101216]"
                  >
                    {f}
                    <button onClick={() => setSelectedFeatures(selectedFeatures.filter((x) => x !== f))}>
                      <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                    </button>
                  </span>
                ))}
                {selectedOwnerships.map((o) => (
                  <span
                    key={o}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#E5E7EB] text-xs font-semibold text-[#101216]"
                  >
                    {o}
                    <button onClick={() => toggleItem(selectedOwnerships, setSelectedOwnerships, o)}>
                      <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                    </button>
                  </span>
                ))}
                {selectedAvailability.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#E5E7EB] text-xs font-semibold text-[#101216]"
                  >
                    {a}
                    <button onClick={() => toggleItem(selectedAvailability, setSelectedAvailability, a)}>
                      <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                    </button>
                  </span>
                ))}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#E5E7EB] text-xs font-semibold text-[#101216]">
                    &quot;{searchQuery}&quot;
                    <button onClick={() => setSearchQuery('')}>
                      <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-[#E5325C] hover:underline ml-2"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Cars Results Grid */}
            {filteredCars.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {filteredCars.map((car) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    isWishlisted={isWishlisted(car.id)}
                    onToggleWishlist={toggleWishlist}
                  />
                ))}
              </div>
            ) : (
              /* Friendly Empty State */
              <div className="bg-white rounded-3xl border border-[#E5E7EB] p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-[#101216]">
                  No matching cars found
                </h3>
                <p className="text-xs sm:text-sm text-[#6B7078] max-w-md mx-auto">
                  Try adjusting your budget, clearing brand filters, or broadening your city search to discover available inventory.
                </p>
                <div className="pt-2">
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-2.5 rounded-full bg-[#E5325C] text-white text-xs font-bold hover:bg-[#D4264E] transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer (Spinny-style 2-column drawer) */}
      <TwoColumnFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        minPrice={minPrice}
        setMinPrice={setMinPrice}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        selectedMakes={selectedMakes}
        setSelectedMakes={setSelectedMakes}
        minYear={minYear}
        setMinYear={setMinYear}
        maxKm={maxKm}
        setMaxKm={setMaxKm}
        selectedFuels={selectedFuels}
        setSelectedFuels={setSelectedFuels}
        selectedBodyTypes={selectedBodyTypes}
        setSelectedBodyTypes={setSelectedBodyTypes}
        selectedTransmissions={selectedTransmissions}
        setSelectedTransmissions={setSelectedTransmissions}
        selectedOwnerships={selectedOwnerships}
        setSelectedOwnerships={setSelectedOwnerships}
        selectedAvailability={selectedAvailability}
        setSelectedAvailability={setSelectedAvailability}
        selectedSeats={selectedSeats}
        setSelectedSeats={setSelectedSeats}
        selectedColors={selectedColors}
        setSelectedColors={setSelectedColors}
        selectedFeatures={selectedFeatures}
        setSelectedFeatures={setSelectedFeatures}
        onlyRecarsSelect={onlyRecarsSelect}
        setOnlyRecarsSelect={setOnlyRecarsSelect}
        onlyVerified={onlyVerified}
        setOnlyVerified={setOnlyVerified}
        clearAllFilters={clearAllFilters}
        filteredCount={filteredCars.length}
      />

      {/* Dream Car 3-Step Wizard Modal */}
      <DreamCarWizardModal
        isOpen={isDreamWizardOpen}
        onClose={() => setIsDreamWizardOpen(false)}
        onApply={(filters) => {
          setMinPrice(filters.minPrice);
          setMaxPrice(filters.maxPrice);
          if (filters.bodyTypes.length > 0) setSelectedBodyTypes(filters.bodyTypes);
          if (filters.fuels.length > 0) setSelectedFuels(filters.fuels);
          if (filters.transmissions.length > 0) setSelectedTransmissions(filters.transmissions);
        }}
        totalMatchingCars={countMatchesForWizard}
      />

      <Footer />
    </div>
  );
}

export default function BuyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">Loading Inventory...</div>}>
      <BuyContent />
    </Suspense>
  );
}
