'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Car,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Upload,
  Check,
  Sparkles,
  Phone,
  MapPin,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';
import SimpleHeader from '@/components/SimpleHeader';
import SpinnyHero from '@/components/SpinnyHero';
import Footer from '@/components/Footer';
import { useRecarsState } from '@/lib/store';
import { MAKES, MODELS_BY_MAKE, CITIES } from '@/lib/data';
import { FuelType, TransmissionType, OwnershipType, SellRequest } from '@/lib/types';
import { useAuth } from '@/lib/authContext';

function getNextRequestId(): string {
  return `REC-SELL-${Date.now().toString().slice(-5)}`;
}

function SellWorkflowContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const {
    selectedCity,
    changeCity,
    wishlistIds,
    addSellRequest,
  } = useRecarsState();

  const [step, setStep] = useState<number>(1);

  // Step 1: Vehicle Identification
  const [regNumber, setRegNumber] = useState(searchParams.get('reg') || '');
  const [make, setMake] = useState(searchParams.get('make') || 'Hyundai');
  const [model, setModel] = useState(searchParams.get('model') || 'Creta');
  const [year, setYear] = useState<number>(() => Number(searchParams.get('year')) || 2021);
  const [variant, setVariant] = useState(searchParams.get('variant') || 'SX (O) 1.5 Petrol');
  const [fuelType, setFuelType] = useState<FuelType>(
    (searchParams.get('fuel') as FuelType) || 'Petrol'
  );
  const [transmission, setTransmission] = useState<TransmissionType>(
    (searchParams.get('transmission') as TransmissionType) || 'Automatic'
  );

  // Step 2: Vehicle Condition
  const [kilometers, setKilometers] = useState<number>(34000);
  const [ownership, setOwnership] = useState<OwnershipType>('1st Owner');
  const [accidentHistory, setAccidentHistory] = useState<'None' | 'Minor Dent/Scratch' | 'Major Repaired'>('None');
  const [serviceHistory, setServiceHistory] = useState('Authorized Dealership Records');
  const [insuranceStatus, setInsuranceStatus] = useState('Comprehensive Valid');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>(['front_view.jpg', 'odometer.jpg']);

  const { user } = useAuth();

  // Step 3: Seller & Inspection Details
  const [sellerName, setSellerName] = useState(user?.name || '');
  const [sellerPhone, setSellerPhone] = useState(user?.phone || '');
  const [sellerCity, setSellerCity] = useState(user?.city || selectedCity || 'Warangal');
  const [sellerAddress, setSellerAddress] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [preferredInspectionDate, setPreferredInspectionDate] = useState('Tomorrow');
  const [preferredInspectionTime, setPreferredInspectionTime] = useState('11:00 AM - 01:00 PM');

  // Step 4: Submitted Result
  const [generatedRequestId, setGeneratedRequestId] = useState<string>('');
  const [feeAcknowledged, setFeeAcknowledged] = useState(true);
  const [inspectionFee, setInspectionFee] = useState(999);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.inspectionConfig) {
          const cfg = data.inspectionConfig;
          setInspectionFee(cfg.sellerInspectionFee ?? 999);
        }
      })
      .catch(() => {});
  }, []);

  const calculateSuggestedPrice = () => {
    let base = 850000;
    if (make === 'Toyota') base = 1600000;
    else if (make === 'Hyundai' || make === 'Kia') base = 950000;
    else if (make === 'Honda') base = 900000;
    else if (make === 'BMW' || make === 'Mercedes-Benz') base = 2600000;
    else if (make === 'Mahindra') base = 1200000;
    else if (make === 'Tata') base = 850000;
    else if (make === 'Maruti Suzuki') base = 600000;

    const age = Math.max(0, 2026 - year);
    const ageDeprec = Math.min(0.65, age * 0.08);
    const kmDeprec = Math.min(0.25, (kilometers / 100000) * 0.12);
    const fair = Math.round(base * (1 - ageDeprec - kmDeprec));
    return {
      min: Math.max(150000, Math.round((fair * 0.92) / 10000) * 10000),
      max: Math.max(200000, Math.round((fair * 1.06) / 10000) * 10000),
      mid: fair,
    };
  };

  const handleSendOtp = () => {
    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    setIsOtpVerified(true);
  };

  const handleFinalSubmit = () => {
    if (!sellerName.trim()) {
      alert('Please enter your full name before scheduling inspection.');
      return;
    }
    if (!sellerPhone.trim() || sellerPhone.replace(/\D/g, '').length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!feeAcknowledged) {
      alert('Please acknowledge the inspection service fee to continue.');
      return;
    }

    const priceRange = calculateSuggestedPrice();
    const reqId = getNextRequestId();
    const newRequest: SellRequest = {
      id: reqId,
      registrationNumber: regNumber || 'TS 09 EA 4589',
      make,
      model,
      variant,
      year,
      fuelType,
      transmission,
      kilometers,
      ownership,
      accidentHistory,
      sellerName: sellerName.trim(),
      sellerPhone: sellerPhone.trim(),
      sellerCity,
      preferredInspectionDate,
      preferredInspectionTime,
      estimatedPriceMin: priceRange.min,
      estimatedPriceMax: priceRange.max,
      suggestedListingPrice: priceRange.mid,
      inspectionFee: inspectionFee,
      inspectionFeeStatus: 'Pay at Doorstep',
      status: 'Inspection Scheduled',
      createdAt: new Date().toISOString(),
    };
    addSellRequest(newRequest);
    setGeneratedRequestId(reqId);
    setStep(4);
  };

  const availableModels = MODELS_BY_MAKE[make] || ['Standard'];

  const handleHeroSelectBrand = (selectedB: string) => {
    setMake(selectedB);
    const availableModelsList = MODELS_BY_MAKE[selectedB] || ['Standard'];
    setModel(availableModelsList[0] || 'Standard');
  };

  const handleHeroSubmit = (details: {
    make: string;
    model: string;
    year: number;
    fuel: string;
    transmission: string;
    variant: string;
    regNumber?: string;
  }) => {
    setMake(details.make);
    setModel(details.model);
    setYear(details.year);
    setFuelType(details.fuel as FuelType);
    setTransmission(details.transmission as TransmissionType);
    setVariant(details.variant);
    if (details.regNumber) setRegNumber(details.regNumber);
    setStep(2);
    setTimeout(() => {
      const el = document.getElementById('sell-workflow');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SimpleHeader activeTab="sell" />

      {/* Exact SellRight Hero (Screenshot: R SellRight, Trust Every Drive. Value Every Rupee., Enter your car details, brand logos, ambassador image) */}
      <SpinnyHero
        onSelectBrand={handleHeroSelectBrand}
        selectedBrand={make}
        onSubmitDetails={handleHeroSubmit}
      />

      {/* Main Multi-Step Form Card with Stepper */}
      <div id="sell-workflow" className="bg-[#F8F9FA] py-10 border-t border-gray-200 scroll-mt-16 flex-1 w-full">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full space-y-6">
        {/* Stepper Progress Indicator - 4 Clean Steps Without Fake Valuations */}
        <div className="flex items-center justify-between relative max-w-xl mx-auto px-4">
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-[#E5E7EB] -z-0" />
          {[
            { num: 1, label: 'Car Details' },
            { num: 2, label: 'Condition' },
            { num: 3, label: 'Doorstep Inspection' },
            { num: 4, label: 'Confirmed' },
          ].map((s) => {
            const isPastOrCurrent = step >= s.num;
            const isCurrent = step === s.num;
            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCurrent
                      ? 'bg-[#E5325C] text-white ring-4 ring-[#FFF0F3] shadow-md'
                      : isPastOrCurrent
                      ? 'bg-[#101216] text-white'
                      : 'bg-white text-[#6B7078] border border-[#E5E7EB]'
                  }`}
                >
                  {isPastOrCurrent && step > s.num ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    s.num
                  )}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-semibold mt-2 hidden sm:block ${
                    isCurrent ? 'text-[#E5325C]' : 'text-[#6B7078]'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-10 shadow-xl space-y-8">
          {/* STEP 1: VEHICLE IDENTIFICATION */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-[#E5E7EB] pb-4">
                <h2 className="text-xl font-black text-[#101216]">
                  Step 1: Vehicle Identification
                </h2>
                <p className="text-xs text-[#6B7078] mt-1">
                  Enter your car details or registration number for genuine evaluation.
                </p>
              </div>

              {/* Registration Number Input */}
              <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB]">
                <label className="block text-xs font-bold text-[#101216] uppercase mb-1">
                  Registration Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. TS 09 EA 4589"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                  className="w-full bg-white px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-[#E5325C]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#101216] mb-1">Make / Brand</label>
                  <select
                    value={make}
                    onChange={(e) => {
                      setMake(e.target.value);
                      setModel(MODELS_BY_MAKE[e.target.value]?.[0] || '');
                    }}
                    className="w-full bg-[#F8F9FA] px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-semibold focus:outline-none"
                  >
                    {MAKES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101216] mb-1">Model</label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-[#F8F9FA] px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-semibold focus:outline-none"
                  >
                    {availableModels.map((mdl) => (
                      <option key={mdl} value={mdl}>
                        {mdl}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101216] mb-1">Manufacturing Year</label>
                  <input
                    type="number"
                    min={2008}
                    max={2026}
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full bg-[#F8F9FA] px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101216] mb-1">Variant / Trim</label>
                  <input
                    type="text"
                    value={variant}
                    onChange={(e) => setVariant(e.target.value)}
                    placeholder="e.g. VXI / SX / ZX"
                    className="w-full bg-[#F8F9FA] px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101216] mb-1">Fuel Type</label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value as FuelType)}
                    className="w-full bg-[#F8F9FA] px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-semibold focus:outline-none"
                  >
                    {['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'].map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101216] mb-1">Transmission</label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value as TransmissionType)}
                    className="w-full bg-[#F8F9FA] px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-semibold focus:outline-none"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#E5325C] text-white text-xs font-bold hover:bg-[#D4264E] transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  <span>Continue to Condition</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: VEHICLE CONDITION */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-[#E5E7EB] pb-4">
                <h2 className="text-xl font-black text-[#101216]">
                  Step 2: Vehicle Condition & History
                </h2>
                <p className="text-xs text-[#6B7078] mt-1">
                  Accurate details help our engineer verify your car quickly.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#101216] mb-1">Odometer Reading (KM)</label>
                  <input
                    type="number"
                    step={1000}
                    value={kilometers}
                    onChange={(e) => setKilometers(Number(e.target.value))}
                    className="w-full bg-[#F8F9FA] px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101216] mb-1">Ownership</label>
                  <select
                    value={ownership}
                    onChange={(e) => setOwnership(e.target.value as OwnershipType)}
                    className="w-full bg-[#F8F9FA] px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-semibold focus:outline-none"
                  >
                    <option value="1st Owner">1st Owner</option>
                    <option value="2nd Owner">2nd Owner</option>
                    <option value="3rd Owner">3rd Owner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101216] mb-1">Accident History</label>
                  <select
                    value={accidentHistory}
                    onChange={(e) => setAccidentHistory(e.target.value as any)}
                    className="w-full bg-[#F8F9FA] px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-semibold focus:outline-none"
                  >
                    <option value="None">None (Accident Free)</option>
                    <option value="Minor Dent/Scratch">Minor Dent / Touch-ups</option>
                    <option value="Major Repaired">Structural Repaired</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101216] mb-1">Service History</label>
                  <select
                    value={serviceHistory}
                    onChange={(e) => setServiceHistory(e.target.value)}
                    className="w-full bg-[#F8F9FA] px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-semibold focus:outline-none"
                  >
                    <option value="Authorized Dealership Records">Authorized Dealership Service Records</option>
                    <option value="Third Party Garage Records">Third Party Garage Records</option>
                    <option value="Partial Records">Partial / Incomplete Records</option>
                  </select>
                </div>
              </div>

              {/* Suggested Listing Price Guidance */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Recars Suggested Market Price Guidance</span>
                  </span>
                  <span className="text-xs font-black text-[#E5325C]">
                    ₹{(calculateSuggestedPrice().min / 100000).toFixed(2)}L – ₹{(calculateSuggestedPrice().max / 100000).toFixed(2)}L
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Estimated market value based on {year} {make} {model} ({ownership}, {kilometers.toLocaleString('en-IN')} km). This is contextual guidance; your final binding purchase price is determined during physical 28+ point inspection.
                </p>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B7078] hover:text-[#101216]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#E5325C] text-white text-xs font-bold hover:bg-[#D4264E] transition-all shadow-md cursor-pointer"
                >
                  <span>Continue to Inspection Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SELLER & DOORSTEP INSPECTION DETAILS */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-[#E5E7EB] pb-4">
                <h2 className="text-xl font-black text-[#101216]">
                  Step 3: Doorstep Inspection & Contact
                </h2>
                <p className="text-xs text-[#6B7078] mt-1">
                  Schedule a certified engineer to physically evaluate your car and provide a genuine, highest-market quote.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#101216] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    className="w-full bg-[#F8F9FA] px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101216] mb-1">Mobile Number</label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      required
                      value={sellerPhone}
                      onChange={(e) => setSellerPhone(e.target.value)}
                      className="w-full bg-[#F8F9FA] px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-semibold focus:outline-none"
                    />
                    {!isOtpVerified && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="px-4 py-2 rounded-xl bg-[#101216] text-white text-xs font-bold whitespace-nowrap cursor-pointer"
                      >
                        {otpSent ? 'Resend' : 'Send OTP'}
                      </button>
                    )}
                  </div>
                </div>

                {otpSent && !isOtpVerified && (
                  <div className="sm:col-span-2 p-4 rounded-2xl bg-[#FFF0F3] border border-[#FFD6DF] space-y-2">
                    <label className="block text-xs font-bold text-[#101216]">
                      Enter 4-Digit Verification OTP
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-32 bg-white px-3 py-2 rounded-xl border border-[#E5E7EB] text-sm font-bold text-center tracking-widest focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="px-6 py-2 rounded-xl bg-[#237A52] text-white text-xs font-bold cursor-pointer"
                      >
                        Verify OTP
                      </button>
                    </div>
                  </div>
                )}

                {isOtpVerified && (
                  <div className="sm:col-span-2 p-3 rounded-xl bg-[#F0F9F4] text-[#237A52] text-xs font-bold border border-[#D1EAD9] flex items-center gap-2">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Mobile number verified successfully!</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#101216]">City Hub</label>
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                      ⭐ Warangal Featured
                    </span>
                  </div>

                  {/* Official Warangal Hub chip */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-2xs">
                      <span>⭐ Warangal Hub (Telangana)</span>
                    </div>
                  </div>

                  <select
                    value={sellerCity}
                    onChange={(e) => setSellerCity(e.target.value)}
                    className="w-full bg-[#F8F9FA] px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c === 'Warangal' ? '⭐ Warangal (Telangana Featured Hub)' : c}
                      </option>
                    ))}
                  </select>

                  {sellerCity === 'Warangal' && (
                    <p className="text-[11px] text-amber-950 bg-amber-50/90 p-2 rounded-lg border border-amber-200 mt-1.5 font-medium flex items-center gap-1.5">
                      <span>📍</span>
                      <span><strong>Warangal Doorstep Service:</strong> Certified engineer inspection available across Warangal, Hanamkonda & Kazipet.</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101216] mb-1">Address for Doorstep Inspection</label>
                  <input
                    type="text"
                    value={sellerAddress}
                    onChange={(e) => setSellerAddress(e.target.value)}
                    className="w-full bg-[#F8F9FA] px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-semibold focus:outline-none"
                    placeholder="Locality, Flat / Building"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101216] mb-1">Preferred Inspection Date</label>
                  <select
                    value={preferredInspectionDate}
                    onChange={(e) => setPreferredInspectionDate(e.target.value)}
                    className="w-full bg-[#F8F9FA] px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="Today">Today (Within 3 Hours)</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="Day After Tomorrow">Day After Tomorrow</option>
                    <option value="This Weekend">This Weekend</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101216] mb-1">Preferred Time Slot</label>
                  <select
                    value={preferredInspectionTime}
                    onChange={(e) => setPreferredInspectionTime(e.target.value)}
                    className="w-full bg-[#F8F9FA] px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                    <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                    <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                    <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Transparent Inspection Charges & Responsibility */}
              <div className="p-4.5 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Doorstep Inspection Fee & Transparent Policy</span>
                  </span>
                  <span className="text-xs font-black text-[#101216] px-2.5 py-1 rounded-full bg-white border border-blue-200 shadow-2xs">
                    ₹{inspectionFee} (Payable at Doorstep)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-blue-900">
                  <div>• <strong>Coverage:</strong> 28+ mechanical, paint meter, OBD diagnostics & road test.</div>
                  <div>• <strong>Responsibility:</strong> Payable by vehicle seller upon engineer arrival.</div>
                  <div>• <strong>Payment Due:</strong> At doorstep before technical physical evaluation.</div>
                  <div>• <strong>Deliverable:</strong> Certified evaluation & guaranteed highest purchase offer.</div>
                </div>
                <label className="flex items-start gap-2.5 pt-2 border-t border-blue-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={feeAcknowledged}
                    onChange={(e) => setFeeAcknowledged(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-[#E5325C] rounded border-gray-300 focus:ring-[#E5325C]"
                  />
                  <span className="text-xs font-bold text-gray-900 leading-tight">
                    I acknowledge and agree to the ₹{inspectionFee} doorstep inspection service fee payable upon the engineer&apos;s arrival.
                  </span>
                </label>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6B7078] hover:text-[#101216]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={!feeAcknowledged}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#E5325C] text-white text-xs font-bold hover:bg-[#D4264E] disabled:bg-gray-400 transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  <span>Schedule Doorstep Inspection (₹{inspectionFee})</span>
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRMATION SUCCESS */}
          {step === 4 && (
            <div className="text-center space-y-6 py-6 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-full bg-[#F0F9F4] text-[#237A52] flex items-center justify-center mx-auto border-2 border-[#D1EAD9]">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>

              <div>
                <span className="text-xs font-bold text-[#237A52] uppercase tracking-wider">
                  Request Confirmed & Scheduled
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#101216] mt-1">
                  Sell Request Confirmed Successfully!
                </h2>
                <div className="mt-3 inline-block px-4 py-1.5 rounded-full bg-[#FFF0F3] border border-[#FFD6DF] text-xs font-bold text-[#E5325C]">
                  Reference ID: {generatedRequestId}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] max-w-md mx-auto text-left space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#6B7078]">Vehicle:</span>
                  <span className="font-bold text-[#101216]">{year} {make} {model} ({variant})</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                  <span className="text-[#6B7078]">Inspection Type:</span>
                  <span className="font-bold text-[#101216]">Doorstep Physical Inspection (₹{inspectionFee} Fee)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7078]">Inspection Fee Status:</span>
                  <span className="font-bold text-amber-600">Payable at Doorstep</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7078]">Suggested Market Value:</span>
                  <span className="font-bold text-[#E5325C]">₹{(calculateSuggestedPrice().min / 100000).toFixed(2)}L – ₹{(calculateSuggestedPrice().max / 100000).toFixed(2)}L</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7078]">Preferred Slot:</span>
                  <span className="font-bold text-[#101216]">{preferredInspectionDate} ({preferredInspectionTime})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7078]">Inspection Location:</span>
                  <span className="font-bold text-[#101216]">{sellerAddress || 'Customer Address'}, {sellerCity}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 max-w-md mx-auto text-left text-xs text-gray-600 leading-relaxed">
                <p className="font-semibold text-gray-800 mb-1">What happens next?</p>
                Our certified Recars inspection engineer will contact you on <span className="font-bold text-gray-900">{sellerPhone}</span> before arriving. After a thorough 28+ point physical inspection, you will receive our highest guaranteed price with instant payment and doorstep RC transfer assistance (RTO transfer charges to be paid by client).
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  href="/account?tab=selling"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#E5325C] text-white text-xs font-bold hover:bg-[#D4264E] transition-all shadow-md"
                >
                  <span>Track in My Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div>
                  <Link href="/buy" className="text-xs font-semibold text-[#6B7078] hover:text-[#101216]">
                    Browse verified cars while you wait
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

      <Footer />
    </div>
  );
}

export default function SellPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">Loading Sell Flow...</div>}>
      <SellWorkflowContent />
    </Suspense>
  );
}
