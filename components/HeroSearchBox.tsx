'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Car, MapPin, IndianRupee, ArrowRight, Sparkles, ChevronDown } from 'lucide-react';
import { MAKES, MODELS_BY_MAKE, CITIES } from '@/lib/data';

interface HeroSearchBoxProps {
  currentCity: string;
  onOpenCityModal: () => void;
}

export default function HeroSearchBox({ currentCity, onOpenCityModal }: HeroSearchBoxProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');

  // Buy filters
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedBudget, setSelectedBudget] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>(currentCity);

  // Sell quick inputs
  const [sellRegNumber, setSellRegNumber] = useState('');
  const [sellMake, setSellMake] = useState('');

  const budgetOptions = [
    { label: 'Any Budget', value: '' },
    { label: 'Under ₹5 Lakh', value: '0-500000' },
    { label: '₹5 - ₹10 Lakh', value: '500000-1000000' },
    { label: '₹10 - ₹20 Lakh', value: '1000000-2000000' },
    { label: '₹20 - ₹30 Lakh', value: '2000000-3000000' },
    { label: 'Above ₹30 Lakh', value: '3000000-10000000' },
  ];

  const handleBuySearch = () => {
    const params = new URLSearchParams();
    if (selectedMake) params.set('make', selectedMake);
    if (selectedModel) params.set('model', selectedModel);
    if (selectedBudget) params.set('budget', selectedBudget);
    if (selectedCity) params.set('city', selectedCity);
    router.push(`/buy?${params.toString()}`);
  };

  const handleSellSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/sell?reg=${encodeURIComponent(sellRegNumber)}&make=${encodeURIComponent(sellMake)}`);
  };

  const availableModels = selectedMake ? MODELS_BY_MAKE[selectedMake] || [] : [];

  return (
    <div className="w-full bg-white rounded-3xl shadow-xl border border-[#E5E7EB] p-4 sm:p-6 backdrop-blur-xs">
      {/* Top Tabs */}
      <div className="flex items-center gap-2 mb-4 sm:mb-5">
        <button
          onClick={() => setActiveTab('buy')}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
            activeTab === 'buy'
              ? 'bg-[#101216] text-white shadow-md'
              : 'text-[#6B7078] hover:text-[#101216] hover:bg-[#F8F9FA]'
          }`}
        >
          Buy a Car
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
            activeTab === 'sell'
              ? 'bg-[#101216] text-white shadow-md'
              : 'text-[#6B7078] hover:text-[#101216] hover:bg-[#F8F9FA]'
          }`}
        >
          Sell Your Car
        </button>
      </div>

      {/* Tab 1: Buy a Car */}
      {activeTab === 'buy' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 items-center">
          {/* Make Selector */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] hover:border-[#E5325C]/50 transition-colors">
            <Car className="w-4 h-4 text-[#E5325C] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] font-bold text-[#6B7078] uppercase tracking-wider">
                Make
              </label>
              <select
                value={selectedMake}
                onChange={(e) => {
                  setSelectedMake(e.target.value);
                  setSelectedModel('');
                }}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#101216] focus:outline-none cursor-pointer"
              >
                <option value="">Any Make</option>
                {MAKES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B7078] flex-shrink-0" />
          </div>

          {/* Model Selector */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] hover:border-[#E5325C]/50 transition-colors">
            <Car className="w-4 h-4 text-[#E5325C] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] font-bold text-[#6B7078] uppercase tracking-wider">
                Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={!selectedMake}
                className={`w-full bg-transparent text-xs sm:text-sm font-semibold text-[#101216] focus:outline-none cursor-pointer ${
                  !selectedMake ? 'text-gray-400' : ''
                }`}
              >
                <option value="">{selectedMake ? 'Any Model' : 'Select Make First'}</option>
                {availableModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B7078] flex-shrink-0" />
          </div>

          {/* Budget Selector */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] hover:border-[#E5325C]/50 transition-colors">
            <IndianRupee className="w-4 h-4 text-[#E5325C] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] font-bold text-[#6B7078] uppercase tracking-wider">
                Budget
              </label>
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#101216] focus:outline-none cursor-pointer"
              >
                {budgetOptions.map((opt) => (
                  <option key={opt.label} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B7078] flex-shrink-0" />
          </div>

          {/* Location Selector */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] hover:border-[#E5325C]/50 transition-colors">
            <MapPin className="w-4 h-4 text-[#E5325C] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] font-bold text-[#6B7078] uppercase tracking-wider">
                Location
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#101216] focus:outline-none cursor-pointer"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c === 'Warangal' ? '⭐ Warangal (Telangana Hub)' : c}
                  </option>
                ))}
              </select>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B7078] flex-shrink-0" />
          </div>

          {/* Search Button */}
          <div className="sm:col-span-2 lg:col-span-1">
            <button
              onClick={handleBuySearch}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-sm text-white bg-[#E5325C] hover:bg-[#D4264E] transition-all shadow-md hover:shadow-lg active:scale-98"
            >
              <span>Search Cars</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Sell Your Car Quick */}
      {activeTab === 'sell' && (
        <form onSubmit={handleSellSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <div className="px-4 py-2.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB]">
            <label className="block text-[10px] font-bold text-[#6B7078] uppercase">
              Car Registration Number
            </label>
            <input
              type="text"
              placeholder="e.g. TS 09 EA 4589"
              value={sellRegNumber}
              onChange={(e) => setSellRegNumber(e.target.value.toUpperCase())}
              className="w-full bg-transparent text-sm font-bold text-[#101216] focus:outline-none uppercase placeholder:text-gray-400 placeholder:normal-case"
            />
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB]">
            <label className="block text-[10px] font-bold text-[#6B7078] uppercase">
              Or Select Brand
            </label>
            <select
              value={sellMake}
              onChange={(e) => setSellMake(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold text-[#101216] focus:outline-none cursor-pointer"
            >
              <option value="">Select Brand</option>
              {MAKES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-sm text-white bg-[#E5325C] hover:bg-[#D4264E] transition-all shadow-md active:scale-98"
          >
            <span>Book Doorstep Inspection</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}


    </div>
  );
}
