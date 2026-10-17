'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Zap,
  CreditCard,
  FileCheck2,
  CarFront,
  ChevronRight,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { BrandLogo } from './BrandLogos';

interface SpinnyHeroProps {
  onSelectBrand?: (brand: string) => void;
  selectedBrand?: string;
  onSubmitDetails?: (details: {
    make: string;
    model: string;
    year: number;
    fuel: string;
    transmission: string;
    variant: string;
    regNumber?: string;
  }) => void;
}

const TOP_BRANDS = [
  'Maruti Suzuki',
  'Hyundai',
  'Tata',
  'Honda',
  'Renault',
  'Ford',
  'Volkswagen',
  'Mahindra',
  'Kia',
  'Audi',
  'BMW',
];

const ALL_ADDITIONAL_BRANDS = [
  'Toyota',
  'Mercedes-Benz',
  'Skoda',
  'MG',
  'Nissan',
  'Jeep',
  'Volvo',
  'Land Rover',
  'Jaguar',
  'Porsche',
  'Mini',
];

const ALL_MAKES = [
  'Maruti Suzuki',
  'Hyundai',
  'Tata',
  'Honda',
  'Toyota',
  'Mahindra',
  'Kia',
  'Volkswagen',
  'Renault',
  'Ford',
  'BMW',
  'Mercedes-Benz',
  'Skoda',
  'MG',
  'Nissan',
  'Jeep',
];

const MODELS_BY_MAKE_EXTENDED: Record<string, string[]> = {
  'Maruti Suzuki': ['Swift', 'Baleno', 'Brezza', 'Dzire', 'Grand Vitara', 'Ertiga', 'Wagon R', 'Alto K10', 'Fronx', 'Jimny'],
  Hyundai: ['Creta', 'Venue', 'i20', 'Verna', 'Tucson', 'Aura', 'Exter', 'Alcazar'],
  Tata: ['Nexon EV', 'Nexon', 'Harrier', 'Safari', 'Punch', 'Altroz', 'Tiago', 'Tigor'],
  Honda: ['City', 'Amaze', 'Elevate', 'WR-V', 'Jazz', 'Civic'],
  Toyota: ['Fortuner', 'Innova Crysta', 'Innova Hycross', 'Urban Cruiser', 'Hyryder', 'Camry', 'Glanza'],
  Mahindra: ['XUV700', 'Thar', 'Scorpio-N', 'Scorpio Classic', 'XUV300', 'Bolero', 'XUV400 EV'],
  Kia: ['Seltos', 'Sonet', 'Carens', 'EV6', 'Carnival'],
  Volkswagen: ['Virtus', 'Taigun', 'Polo', 'Vento', 'Tiguan'],
  Renault: ['Kwid', 'Triber', 'Kiger', 'Duster'],
  Ford: ['EcoSport', 'Endeavour', 'Figo', 'Aspire'],
  BMW: ['3 Series', '5 Series', 'X1', 'X3', 'X5', 'M340i'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'GLA', 'GLC', 'A-Class'],
  Skoda: ['Slavia', 'Kushaq', 'Octavia', 'Superb', 'Kodiaq'],
  MG: ['Hector', 'ZS EV', 'Astor', 'Comet EV', 'Gloster'],
  Nissan: ['Magnite', 'Kicks'],
  Jeep: ['Compass', 'Meridian', 'Wrangler'],
};

const YEARS = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010];
const FUELS = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];
const TRANSMISSIONS = ['Manual', 'Automatic'];
const KM_RANGES = ['< 15,000 km', '15,000 - 30,000 km', '30,000 - 50,000 km', '50,000 - 80,000 km', '> 80,000 km'];

export default function SpinnyHero({
  onSelectBrand,
  selectedBrand,
  onSubmitDetails,
}: SpinnyHeroProps) {
  const router = useRouter();
  const [selectedMake, setSelectedMake] = useState(
    selectedBrand && selectedBrand !== 'All' ? selectedBrand : 'Hyundai'
  );
  const [selectedModel, setSelectedModel] = useState('Creta');
  const [selectedYear, setSelectedYear] = useState<number>(2022);
  const [selectedFuel, setSelectedFuel] = useState('Petrol');
  const [selectedTransmission, setSelectedTransmission] = useState('Automatic');
  const [selectedVariant, setSelectedVariant] = useState('SX (O) 1.5 Petrol');
  const [selectedKm, setSelectedKm] = useState('30,000 - 50,000 km');
  const [errorMsg, setErrorMsg] = useState('');
  const [isMoreBrandsOpen, setIsMoreBrandsOpen] = useState(false);

  useEffect(() => {
    if (selectedBrand && selectedBrand !== 'All') {
      setSelectedMake(selectedBrand);
      const availableModels = MODELS_BY_MAKE_EXTENDED[selectedBrand] || ['Standard'];
      setSelectedModel(availableModels[0] || 'Standard');
    }
  }, [selectedBrand]);

  const handleMakeChange = (newMake: string) => {
    setSelectedMake(newMake);
    const availableModels = MODELS_BY_MAKE_EXTENDED[newMake] || ['Standard'];
    setSelectedModel(availableModels[0] || 'Standard');
  };

  const handleGetPrice = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    if (onSubmitDetails) {
      onSubmitDetails({
        make: selectedMake,
        model: selectedModel,
        year: selectedYear,
        fuel: selectedFuel,
        transmission: selectedTransmission,
        variant: selectedVariant,
      });
    } else {
      const params = new URLSearchParams({
        make: selectedMake,
        model: selectedModel,
        year: selectedYear.toString(),
        fuel: selectedFuel,
        transmission: selectedTransmission,
        variant: selectedVariant,
      });
      router.push(`/sell?${params.toString()}#sell-workflow`);
    }
  };

  const handleBrandClick = (brand: string) => {
    setSelectedMake(brand);
    const availableModels = MODELS_BY_MAKE_EXTENDED[brand] || ['Standard'];
    setSelectedModel(availableModels[0] || 'Standard');
    if (onSelectBrand) {
      onSelectBrand(brand);
    }
  };

  return (
    <section className="relative bg-white pt-4 pb-10 sm:pt-8 sm:pb-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* ========================================================
              LEFT COLUMN: HEADING + SELLRIGHT CARD + TRUST BADGES
          ========================================================= */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
            
            {/* SellRight Sub-badge */}
            <div className="inline-flex items-center gap-1.5 mb-2 sm:mb-3">
              <div className="w-5 h-5 rounded-md bg-[#E5325C] text-white flex items-center justify-center text-xs font-black shadow-2xs">
                <span>R</span>
              </div>
              <span className="text-sm font-extrabold text-[#E5325C] tracking-tight">
                SellRight
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-[44px] font-semibold font-heading tracking-tight leading-[1.25] mb-4 sm:mb-6 text-[#101216]">
              Trust Every Drive.{' '}
              <span className="text-[#E5325C]">
                Value Every Rupee.
              </span>
            </h1>

            {/* Main White Card */}
            <div className="w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl shadow-gray-200/50 border border-gray-200/90 p-4 sm:p-7 text-[#101216]">
              
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs sm:text-sm font-bold text-gray-900">
                    Enter your car details
                  </label>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#10B981] text-white text-[10px] sm:text-[11px] font-extrabold shadow-2xs whitespace-nowrap">
                    <Check className="w-3 h-3 text-white stroke-[3]" />
                    <span>Quick & accurate valuation</span>
                  </span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleGetPrice} className="space-y-3">

                    {/* Car Details Form Grid: 6 fields matching screenshot (Brand, Model, Year, Fuel, Transmission, Variant) */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                      {/* 1. Make / Brand */}
                      <div>
                        <label className="block text-[10px] sm:text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                          Select Brand / Make
                        </label>
                        <select
                          value={selectedMake}
                          onChange={(e) => handleMakeChange(e.target.value)}
                          className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 bg-gray-50/80 hover:bg-white focus:bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-bold text-[#101216] focus:outline-none focus:border-[#E5325C] focus:ring-2 focus:ring-[#E5325C]/20 transition-all cursor-pointer"
                        >
                          {ALL_MAKES.map((brand) => (
                            <option key={brand} value={brand}>
                              {brand}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 2. Model */}
                      <div>
                        <label className="block text-[10px] sm:text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                          Model
                        </label>
                        <select
                          value={selectedModel}
                          onChange={(e) => setSelectedModel(e.target.value)}
                          className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 bg-gray-50/80 hover:bg-white focus:bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-bold text-[#101216] focus:outline-none focus:border-[#E5325C] focus:ring-2 focus:ring-[#E5325C]/20 transition-all cursor-pointer"
                        >
                          {(MODELS_BY_MAKE_EXTENDED[selectedMake] || ['Standard']).map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 3. Year */}
                      <div>
                        <label className="block text-[10px] sm:text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                          Year
                        </label>
                        <select
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(Number(e.target.value))}
                          className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 bg-gray-50/80 hover:bg-white focus:bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-bold text-[#101216] focus:outline-none focus:border-[#E5325C] focus:ring-2 focus:ring-[#E5325C]/20 transition-all cursor-pointer"
                        >
                          {YEARS.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 4. Fuel Type */}
                      <div>
                        <label className="block text-[10px] sm:text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                          Fuel Type
                        </label>
                        <select
                          value={selectedFuel}
                          onChange={(e) => setSelectedFuel(e.target.value)}
                          className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 bg-gray-50/80 hover:bg-white focus:bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-bold text-[#101216] focus:outline-none focus:border-[#E5325C] focus:ring-2 focus:ring-[#E5325C]/20 transition-all cursor-pointer"
                        >
                          {FUELS.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 5. Transmission */}
                      <div>
                        <label className="block text-[10px] sm:text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                          Transmission
                        </label>
                        <select
                          value={selectedTransmission}
                          onChange={(e) => setSelectedTransmission(e.target.value)}
                          className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 bg-gray-50/80 hover:bg-white focus:bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-bold text-[#101216] focus:outline-none focus:border-[#E5325C] focus:ring-2 focus:ring-[#E5325C]/20 transition-all cursor-pointer"
                        >
                          {TRANSMISSIONS.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 6. Variant */}
                      <div>
                        <label className="block text-[10px] sm:text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                          Variant
                        </label>
                        <input
                          type="text"
                          value={selectedVariant}
                          onChange={(e) => setSelectedVariant(e.target.value)}
                          placeholder="e.g. SX / VXI / ZX"
                          className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 bg-gray-50/80 hover:bg-white focus:bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-bold text-[#101216] focus:outline-none focus:border-[#E5325C] focus:ring-2 focus:ring-[#E5325C]/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Big Action Button */}
                    <button
                      type="submit"
                      className="w-full mt-3 inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 bg-[#E5325C] hover:bg-[#D4264E] active:scale-[0.98] text-white font-black text-xs sm:text-sm tracking-wider uppercase rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer whitespace-nowrap"
                    >
                      <span>SELL YOUR CAR (SELLRIGHT)</span>
                      <span>→</span>
                    </button>

                    {/* Perks Row below button */}
                    <div className="flex items-center justify-center gap-2 sm:gap-4 pt-2.5 text-[10px] sm:text-xs text-gray-500 font-medium text-center flex-wrap">
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-[#10B981]" />
                        <span>Instant Online Payment</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-[#10B981]" />
                        <span>RC Transfer Assistance</span>
                      </span>
                    </div>


                {errorMsg && (
                  <p className="text-xs text-red-600 font-semibold pl-1 text-left">
                    {errorMsg}
                  </p>
                )}
              </form>

              {/* Select Car Brand Grid */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-xs sm:text-sm font-bold text-gray-800 mb-2.5 text-left">
                  Select your car brand to get started:
                </p>

                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {TOP_BRANDS.map((brand) => {
                    const isSelected = selectedBrand
                      ? selectedBrand.toLowerCase() === brand.toLowerCase()
                      : selectedMake.toLowerCase() === brand.toLowerCase();
                    return (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => handleBrandClick(brand)}
                        className={`h-12 sm:h-13 flex items-center justify-center px-2 py-1.5 rounded-2xl border transition-all duration-150 group cursor-pointer text-center ${
                          isSelected
                            ? 'bg-[#FFF0F3] border-2 border-[#E5325C] shadow-xs ring-1 ring-[#E5325C]/30'
                            : 'bg-white hover:bg-gray-50/90 border-gray-200 hover:border-gray-300 shadow-2xs'
                        }`}
                        title={`Select ${brand}`}
                      >
                        <BrandLogo brand={brand} />
                      </button>
                    );
                  })}

                  {/* "More Brands >" Tile */}
                  <button
                    type="button"
                    onClick={() => setIsMoreBrandsOpen(true)}
                    className="h-12 sm:h-13 flex items-center justify-center gap-1 px-2 rounded-2xl bg-[#FFF0F3] hover:bg-[#FFE5EC] border border-[#FFD6DF] hover:border-[#E5325C] transition-all group cursor-pointer text-[#E5325C] font-bold text-xs sm:text-sm"
                  >
                    <span>More Brands</span>
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Three Trust Pillars Under Card */}
            <div className="w-full max-w-2xl mt-5 sm:mt-8">
              <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-10 text-gray-800">
                
                {/* 1. Instant Payment */}
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center sm:text-left group">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#FFF0F3] border border-[#FFD6DF] flex items-center justify-center text-[#E5325C] shrink-0">
                    <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold leading-tight">Instant Payment</span>
                </div>

                {/* 2. Expert Car Evaluation */}
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center sm:text-left group">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#FFF0F3] border border-[#FFD6DF] flex items-center justify-center text-[#E5325C] shrink-0">
                    <CarFront className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold leading-tight">Expert Evaluation</span>
                </div>

                {/* 3. Fast RC Transfer Assistance */}
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center sm:text-left group">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#FFF0F3] border border-[#FFD6DF] flex items-center justify-center text-[#E5325C] shrink-0">
                    <FileCheck2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold leading-tight">RC Transfer Assistance</span>
                </div>

              </div>
            </div>

          </div>

          {/* ========================================================
              RIGHT COLUMN: BRAND AMBASSADOR WITH LUXURY SUV (EXACT SCREENSHOT)
          ========================================================= */}
          <div className="lg:col-span-5 xl:col-span-4 flex justify-center lg:justify-end mt-4 lg:mt-0">
            <div className="w-full max-w-[420px] aspect-[4/4.5] sm:aspect-[9/13.5] rounded-2xl sm:rounded-3xl overflow-hidden bg-gray-50 border border-gray-200/80 shadow-lg sm:shadow-xl shadow-gray-200/50 relative">
              <img
                src="/ambassador-white-studio.jpg"
                alt="Recars Brand Ambassador with Luxury SUV"
                className="w-full h-full object-cover object-[center_36%]"
              />
            </div>
          </div>

        </div>

        {/* Bottom Verification Note matching screenshot */}
        <p className="text-[11px] sm:text-xs text-gray-400 text-center mt-6 sm:mt-8">
          *Offers and final valuations are subject to physical inspection and vehicle documentation verification.
        </p>
      </div>

      {/* ========================================================
          MORE BRANDS MODAL
      ========================================================= */}
      {isMoreBrandsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-200 text-[#101216] relative">
            <button
              onClick={() => setIsMoreBrandsOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-[#101216] mb-1">
              Select Your Car Brand
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              Choose your car make to get an instant valuation and guaranteed offer
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-80 overflow-y-auto p-1">
              {[...TOP_BRANDS, ...ALL_ADDITIONAL_BRANDS].map((brand) => (
                <button
                  key={brand}
                  onClick={() => {
                    setIsMoreBrandsOpen(false);
                    handleBrandClick(brand);
                  }}
                  className="p-3 rounded-xl bg-gray-50 hover:bg-[#FFF0F3] border border-gray-200 hover:border-[#E5325C] text-xs font-bold text-[#101216] hover:text-[#E5325C] transition-all flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer"
                >
                  <BrandLogo brand={brand} className="h-6 max-w-[80px]" />
                  <span className="text-[11px] font-semibold">{brand}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
