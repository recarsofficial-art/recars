'use client';

import { useState } from 'react';
import { ArrowLeft, Search, Check, Sparkles } from 'lucide-react';
import { MAKES, CAR_TYPES } from '@/lib/data';
import { formatINR, formatKM } from '@/lib/formatters';
import { BUDGET_BRACKETS } from './DreamCarWizardModal';

interface TwoColumnFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  // Filter States
  minPrice: number;
  setMinPrice: (val: number) => void;
  maxPrice: number;
  setMaxPrice: (val: number) => void;
  selectedMakes: string[];
  setSelectedMakes: (val: string[]) => void;
  minYear: number;
  setMinYear: (val: number) => void;
  maxKm: number;
  setMaxKm: (val: number) => void;
  selectedFuels: string[];
  setSelectedFuels: (val: string[]) => void;
  selectedBodyTypes: string[];
  setSelectedBodyTypes: (val: string[]) => void;
  selectedTransmissions: string[];
  setSelectedTransmissions: (val: string[]) => void;
  selectedOwnerships: string[];
  setSelectedOwnerships: (val: string[]) => void;
  selectedAvailability: string[];
  setSelectedAvailability: (val: string[]) => void;
  selectedSeats: number[];
  setSelectedSeats: (val: number[]) => void;
  selectedColors: string[];
  setSelectedColors: (val: string[]) => void;
  selectedFeatures: string[];
  setSelectedFeatures: (val: string[]) => void;
  onlyRecarsSelect: boolean;
  setOnlyRecarsSelect: (val: boolean) => void;
  onlyVerified: boolean;
  setOnlyVerified: (val: boolean) => void;
  // Helpers
  clearAllFilters: () => void;
  filteredCount: number;
}

type FilterTabKey =
  | 'price'
  | 'makes'
  | 'year'
  | 'km'
  | 'fuel'
  | 'body'
  | 'transmission'
  | 'category'
  | 'ownership'
  | 'status'
  | 'color'
  | 'features'
  | 'seats';

const POPULAR_COLORS = ['White', 'Silver', 'Grey', 'Black', 'Red', 'Blue', 'Brown'];
const POPULAR_FEATURES = [
  'Sunroof',
  'Touchscreen',
  'Reverse Camera',
  'Push Button Start',
  'Wireless Smartphone Charger',
  'Airbags',
  'Alloy Wheels',
  'Cruise Control',
  'Leatherette Seats',
];

export default function TwoColumnFilterDrawer({
  isOpen,
  onClose,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  selectedMakes,
  setSelectedMakes,
  minYear,
  setMinYear,
  maxKm,
  setMaxKm,
  selectedFuels,
  setSelectedFuels,
  selectedBodyTypes,
  setSelectedBodyTypes,
  selectedTransmissions,
  setSelectedTransmissions,
  selectedOwnerships,
  setSelectedOwnerships,
  selectedAvailability,
  setSelectedAvailability,
  selectedSeats,
  setSelectedSeats,
  selectedColors,
  setSelectedColors,
  selectedFeatures,
  setSelectedFeatures,
  onlyRecarsSelect,
  setOnlyRecarsSelect,
  onlyVerified,
  setOnlyVerified,
  clearAllFilters,
  filteredCount,
}: TwoColumnFilterDrawerProps) {
  const [activeTab, setActiveTab] = useState<FilterTabKey>('price');
  const [brandSearch, setBrandSearch] = useState('');

  if (!isOpen) return null;

  const toggleItem = (list: any[], setList: (v: any[]) => void, item: any) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const tabs: { key: FilterTabKey; label: string; badge?: string; count?: number }[] = [
    { key: 'price', label: 'Price Range', count: minPrice > 50000 || maxPrice < 5000000 ? 1 : undefined },
    { key: 'makes', label: 'Brands + Models', count: selectedMakes.length || undefined },
    { key: 'year', label: 'Year', count: minYear > 2017 ? 1 : undefined },
    { key: 'km', label: 'Kms Driven', count: maxKm < 100000 ? 1 : undefined },
    { key: 'fuel', label: 'Fuel Type', count: selectedFuels.length || undefined },
    { key: 'body', label: 'Body Type', count: selectedBodyTypes.length || undefined },
    { key: 'transmission', label: 'Transmission', count: selectedTransmissions.length || undefined },
    { key: 'category', label: 'Car Category', count: (onlyVerified ? 1 : 0) + (onlyRecarsSelect ? 1 : 0) || undefined },
    { key: 'ownership', label: 'Ownership', count: selectedOwnerships.length || undefined },
    { key: 'status', label: 'Vehicle Status', count: selectedAvailability.length || undefined },
    { key: 'color', label: 'Color', count: selectedColors.length || undefined },
    { key: 'features', label: 'Safety & Features', badge: 'NEW', count: selectedFeatures.length || undefined },
    { key: 'seats', label: 'Seats', count: selectedSeats.length || undefined },
  ];

  const filteredMakesList = MAKES.filter((m) =>
    m.toLowerCase().includes(brandSearch.toLowerCase().trim())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-lg h-full flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header matching Screenshot 2 */}
        <div className="h-14 px-4 border-b border-[#E5E7EB] flex items-center justify-between bg-white shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-black text-[#101216] hover:text-[#E5325C] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            <span>Filter</span>
          </button>
          <button
            onClick={clearAllFilters}
            className="text-xs font-black text-purple-700 hover:text-purple-900 uppercase tracking-wider cursor-pointer"
          >
            CLEAR ALL
          </button>
        </div>

        {/* Two-Column Layout Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Category Tabs List */}
          <div className="w-[40%] bg-[#F9FAFB] border-r border-[#E5E7EB] overflow-y-auto divide-y divide-gray-100">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full py-4 px-3.5 text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-purple-50/60 text-purple-950 border-l-4 border-purple-700 shadow-2xs font-black'
                      : 'text-gray-700 hover:bg-gray-100/80 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex flex-col gap-0.5 min-w-0 pr-1">
                    <span className="truncate">{tab.label}</span>
                    {tab.badge && (
                      <span className="self-start text-[9px] font-black uppercase px-1.5 py-0.2 bg-emerald-600 text-white rounded">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  {tab.count !== undefined && (
                    <span className="w-4 h-4 rounded-full bg-purple-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Column: Tab Content Panel */}
          <div className="flex-1 p-5 overflow-y-auto space-y-6 bg-white">
            {/* TAB 1: PRICE RANGE (matching Screenshot 2) */}
            {activeTab === 'price' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Price Range
                  </h3>
                  <p className="text-base sm:text-lg font-black text-purple-950 mt-1">
                    {formatINR(minPrice)} - {formatINR(maxPrice)}
                  </p>
                </div>

                {/* Vertical Range Visualizer with Maximum & Minimum Pills matching Screenshot 2 */}
                <div className="bg-[#FAF9FC] p-4 rounded-2xl border border-purple-100 space-y-4">
                  {/* Maximum Price Pill */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600">Maximum Price</span>
                    <span className="px-3 py-1 rounded-lg bg-purple-800 text-white font-extrabold text-xs shadow-2xs">
                      {formatINR(maxPrice)}
                    </span>
                  </div>

                  {/* Dual Sliders */}
                  <div className="space-y-3 py-1">
                    <div>
                      <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                        <span>Max Cap:</span>
                        <span className="font-semibold text-gray-700">{formatINR(maxPrice)}</span>
                      </div>
                      <input
                        type="range"
                        min={minPrice + 50000}
                        max={7000000}
                        step={50000}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        className="w-full accent-purple-700 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                        <span>Min Floor:</span>
                        <span className="font-semibold text-gray-700">{formatINR(minPrice)}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={Math.max(0, maxPrice - 50000)}
                        step={25000}
                        value={minPrice}
                        onChange={(e) => setMinPrice(Number(e.target.value))}
                        className="w-full accent-purple-700 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Minimum Price Pill */}
                  <div className="flex items-center justify-between pt-1 border-t border-purple-100">
                    <span className="text-xs font-bold text-gray-600">Minimum Price</span>
                    <span className="px-3 py-1 rounded-lg bg-purple-800 text-white font-extrabold text-xs shadow-2xs">
                      {formatINR(minPrice)}
                    </span>
                  </div>
                </div>

                {/* Quick Budget Presets matching Screenshot 1 */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 block">
                    Quick Budget Brackets
                  </label>
                  <div className="space-y-2">
                    {BUDGET_BRACKETS.map((b) => {
                      const isSelected = minPrice === b.min && maxPrice === b.max;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => {
                            setMinPrice(b.min);
                            setMaxPrice(b.max);
                          }}
                          className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-purple-100/70 border-purple-600 text-purple-950 ring-1 ring-purple-400 font-extrabold'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300'
                          }`}
                        >
                          <span>{b.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-purple-700 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: BRANDS + MODELS */}
            {activeTab === 'makes' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search brand (Hyundai, Honda...)"
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div className="space-y-1.5 max-h-[360px] overflow-y-auto">
                  {filteredMakesList.map((m) => {
                    const isSelected = selectedMakes.includes(m);
                    return (
                      <label
                        key={m}
                        className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${
                          isSelected ? 'bg-purple-50 border-purple-400 font-bold text-purple-950' : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-xs">{m}</span>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleItem(selectedMakes, setSelectedMakes, m)}
                          className="w-4 h-4 rounded text-purple-700 focus:ring-purple-600"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: YEAR */}
            {activeTab === 'year' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Registration Year
                </h3>
                <div className="space-y-2">
                  {[
                    { label: '2023 & Newer', year: 2023 },
                    { label: '2021 & Newer', year: 2021 },
                    { label: '2019 & Newer', year: 2019 },
                    { label: '2017 & Newer', year: 2017 },
                    { label: 'Any Year', year: 2010 },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setMinYear(opt.year)}
                      className={`w-full p-3 rounded-xl border text-xs font-bold text-left flex items-center justify-between cursor-pointer ${
                        minYear === opt.year
                          ? 'bg-purple-50 border-purple-600 text-purple-950'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {minYear === opt.year && <Check className="w-4 h-4 text-purple-700 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: KMS DRIVEN */}
            {activeTab === 'km' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Kilometers Driven
                </h3>
                <div className="space-y-2">
                  {[
                    { label: 'Under 25,000 km', km: 25000 },
                    { label: 'Under 50,000 km', km: 50000 },
                    { label: 'Under 75,000 km', km: 75000 },
                    { label: 'Under 1,00,000 km', km: 100000 },
                    { label: 'Any Kms', km: 200000 },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setMaxKm(opt.km)}
                      className={`w-full p-3 rounded-xl border text-xs font-bold text-left flex items-center justify-between cursor-pointer ${
                        maxKm === opt.km
                          ? 'bg-purple-50 border-purple-600 text-purple-950'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {maxKm === opt.km && <Check className="w-4 h-4 text-purple-700 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: FUEL TYPE */}
            {activeTab === 'fuel' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Fuel Type
                </h3>
                <div className="space-y-2">
                  {['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG'].map((fuel) => {
                    const isSelected = selectedFuels.includes(fuel);
                    return (
                      <label
                        key={fuel}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                          isSelected ? 'bg-purple-50 border-purple-600 font-bold text-purple-950' : 'bg-white border-gray-200 text-gray-700'
                        }`}
                      >
                        <span className="text-xs">{fuel}</span>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleItem(selectedFuels, setSelectedFuels, fuel)}
                          className="w-4 h-4 rounded text-purple-700"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 6: BODY TYPE */}
            {activeTab === 'body' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Body Style
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {CAR_TYPES.map((bt) => {
                    const isSelected = selectedBodyTypes.includes(bt.type);
                    return (
                      <label
                        key={bt.type}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                          isSelected ? 'bg-purple-50 border-purple-600 font-bold text-purple-950' : 'bg-white border-gray-200 text-gray-700'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold block">{bt.label}</span>
                          <span className="text-[10px] text-gray-400 block">{bt.startingPrice}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleItem(selectedBodyTypes, setSelectedBodyTypes, bt.type)}
                          className="w-4 h-4 rounded text-purple-700"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 7: TRANSMISSION */}
            {activeTab === 'transmission' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Transmission
                </h3>
                <div className="space-y-2">
                  {['Automatic', 'Manual'].map((tr) => {
                    const isSelected = selectedTransmissions.includes(tr);
                    return (
                      <label
                        key={tr}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                          isSelected ? 'bg-purple-50 border-purple-600 font-bold text-purple-950' : 'bg-white border-gray-200 text-gray-700'
                        }`}
                      >
                        <span className="text-xs font-bold">{tr}</span>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleItem(selectedTransmissions, setSelectedTransmissions, tr)}
                          className="w-4 h-4 rounded text-purple-700"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 8: CAR CATEGORY */}
            {activeTab === 'category' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Verification & Tier
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">Recars Select Tier</span>
                      <span className="text-[10px] text-gray-500 block">Top rated premium condition cars</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={onlyRecarsSelect}
                      onChange={(e) => setOnlyRecarsSelect(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-700"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">200+ Point Verified</span>
                      <span className="text-[10px] text-gray-500 block">Diagnostically scanned and inspected</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={onlyVerified}
                      onChange={(e) => setOnlyVerified(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-700"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB 9: OWNERSHIP */}
            {activeTab === 'ownership' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Ownership Count
                </h3>
                <div className="space-y-2">
                  {['1st Owner', '2nd Owner', '3rd Owner'].map((own) => {
                    const isSelected = selectedOwnerships.includes(own);
                    return (
                      <label
                        key={own}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                          isSelected ? 'bg-purple-50 border-purple-600 font-bold text-purple-950' : 'bg-white border-gray-200 text-gray-700'
                        }`}
                      >
                        <span className="text-xs font-bold">{own}</span>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleItem(selectedOwnerships, setSelectedOwnerships, own)}
                          className="w-4 h-4 rounded text-purple-700"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 10: VEHICLE STATUS */}
            {activeTab === 'status' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Availability Status
                </h3>
                <div className="space-y-2">
                  {[
                    { label: 'Available (Immediate)', val: 'Available' },
                    { label: 'Reserved', val: 'Reserved' },
                    { label: 'Sold Out', val: 'Sold Out' },
                  ].map((st) => {
                    const isSelected = selectedAvailability.includes(st.val);
                    return (
                      <label
                        key={st.val}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                          isSelected ? 'bg-purple-50 border-purple-600 font-bold text-purple-950' : 'bg-white border-gray-200 text-gray-700'
                        }`}
                      >
                        <span className="text-xs font-bold">{st.label}</span>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleItem(selectedAvailability, setSelectedAvailability, st.val)}
                          className="w-4 h-4 rounded text-purple-700"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 11: COLOR */}
            {activeTab === 'color' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Exterior Color
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {POPULAR_COLORS.map((col) => {
                    const isSelected = selectedColors.includes(col);
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => toggleItem(selectedColors, setSelectedColors, col)}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left flex items-center justify-between cursor-pointer ${
                          isSelected ? 'bg-purple-50 border-purple-600 text-purple-950' : 'bg-white border-gray-200 text-gray-700'
                        }`}
                      >
                        <span>{col}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-purple-700 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 12: SAFETY & FEATURES */}
            {activeTab === 'features' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Safety & Key Features
                  </h3>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-emerald-600 text-white rounded">
                    NEW
                  </span>
                </div>
                <div className="space-y-2">
                  {POPULAR_FEATURES.map((feat) => {
                    const isSelected = selectedFeatures.includes(feat);
                    return (
                      <label
                        key={feat}
                        className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer ${
                          isSelected ? 'bg-purple-50 border-purple-600 font-bold text-purple-950' : 'bg-white border-gray-200 text-gray-700'
                        }`}
                      >
                        <span className="text-xs">{feat}</span>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleItem(selectedFeatures, setSelectedFeatures, feat)}
                          className="w-4 h-4 rounded text-purple-700"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 13: SEATS */}
            {activeTab === 'seats' && (
              <div className="space-y-3 animate-in fade-in duration-150">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Seating Capacity
                </h3>
                <div className="space-y-2">
                  {[
                    { label: '5 Seater (Hatchbacks, Sedans & Crossovers)', seats: 5 },
                    { label: '7 Seater (Large Family SUVs & MUVs)', seats: 7 },
                    { label: '8 Seater (Spacious People Movers)', seats: 8 },
                  ].map((st) => {
                    const isSelected = selectedSeats.includes(st.seats);
                    return (
                      <label
                        key={st.seats}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                          isSelected ? 'bg-purple-50 border-purple-600 font-bold text-purple-950' : 'bg-white border-gray-200 text-gray-700'
                        }`}
                      >
                        <span className="text-xs font-bold">{st.label}</span>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleItem(selectedSeats, setSelectedSeats, st.seats)}
                          className="w-4 h-4 rounded text-purple-700"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Fixed Apply Action Bar matching Screenshot 2 */}
        <div className="p-4 bg-white border-t border-[#E5E7EB] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-[#E5325C] hover:bg-[#D4264E] text-white font-extrabold text-sm uppercase tracking-wider shadow-md transition-all active:scale-98 cursor-pointer"
          >
            APPLY ({filteredCount} CARS)
          </button>
        </div>
      </div>
    </div>
  );
}
