'use client';

import { useState } from 'react';
import {
  X,
  Search,
  Sparkles,
  Phone,
  User,
  Car,
  Fuel,
  Settings,
  Calendar,
  MapPin,
  CheckCircle2,
  DollarSign,
  Send,
  SlidersHorizontal,
} from 'lucide-react';
import { MAKES, CITIES } from '@/lib/data';

interface CarFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCity?: string;
}

const BUDGET_OPTIONS = [
  { label: 'Under ₹3 Lakh', min: 100000, max: 300000 },
  { label: '₹3 - ₹6 Lakh', min: 300000, max: 600000 },
  { label: '₹6 - ₹10 Lakh', min: 600000, max: 1000000 },
  { label: '₹10 - ₹15 Lakh', min: 1000000, max: 1500000 },
  { label: '₹15 - ₹25 Lakh', min: 1500000, max: 2500000 },
  { label: 'Above ₹25 Lakh', min: 2500000, max: 10000000 },
  { label: 'Flexible / Any Budget', min: 0, max: 0 },
];

export default function CarFinderModal({ isOpen, onClose, defaultCity = 'Hyderabad' }: CarFinderModalProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [preferredBrand, setPreferredBrand] = useState('Maruti Suzuki');
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [customBrandName, setCustomBrandName] = useState('');
  const [preferredModel, setPreferredModel] = useState('');
  const [selectedBudgetIndex, setSelectedBudgetIndex] = useState(1); // ₹3 - ₹6 Lakh
  const [preferredFuel, setPreferredFuel] = useState('Any');
  const [preferredTransmission, setPreferredTransmission] = useState('Any');
  const [preferredYear, setPreferredYear] = useState('2018+');
  const [preferredLocation, setPreferredLocation] = useState(defaultCity || 'Hyderabad');
  const [additionalRequirements, setAdditionalRequirements] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [matchedCount, setMatchedCount] = useState<number>(0);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const brand = isCustomBrand ? customBrandName.trim() : preferredBrand;
    if (!customerName.trim()) {
      setSubmitError('Please enter your full name');
      return;
    }
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setSubmitError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!brand) {
      setSubmitError('Please choose or enter your preferred car brand');
      return;
    }

    setIsSubmitting(true);
    const chosenBudget = BUDGET_OPTIONS[selectedBudgetIndex];

    try {
      const res = await fetch('/api/car-finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: cleanPhone,
          customerEmail: customerEmail.trim() || undefined,
          preferredBrand: brand,
          preferredModel: preferredModel.trim() || undefined,
          budgetMin: chosenBudget.min > 0 ? chosenBudget.min : undefined,
          budgetMax: chosenBudget.max > 0 ? chosenBudget.max : undefined,
          budgetRange: chosenBudget.label,
          preferredFuel: preferredFuel !== 'Any' ? preferredFuel : undefined,
          preferredTransmission: preferredTransmission !== 'Any' ? preferredTransmission : undefined,
          preferredYear: preferredYear !== 'Any' ? preferredYear : undefined,
          preferredLocation,
          additionalRequirements: additionalRequirements.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmittedId(data.requestId || `FIND-${Date.now().toString().slice(-6)}`);
        setMatchedCount(data.matchedCount || 0);
      } else {
        setSubmitError(data.error || 'Failed to submit request. Please try again.');
      }
    } catch {
      setSubmitError('Network error submitting request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedId(null);
    setSubmitError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#101216] via-[#1C1F26] to-[#101216] p-6 text-white relative">
          <button
            onClick={handleResetAndClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-8 h-8 rounded-xl bg-[#E5325C] flex items-center justify-center text-white shadow-md">
              <Search className="w-4 h-4" />
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 text-rose-300 border border-white/10">
              Personalized Vehicle Concierge
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black font-heading tracking-tight">
            Can&apos;t Find Your Dream Car?
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
            Tell us what you&apos;re looking for. We&apos;ll help you find the right car for your budget through our verified multi-city dealer and owner network.
          </p>
        </div>

        {submittedId ? (
          /* Success Screen */
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold bg-gray-100 text-gray-700 mb-2">
                Ref ID: #{submittedId}
              </span>
              <h4 className="text-xl font-black text-[#101216]">Car Finder Request Received!</h4>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-md mx-auto">
                Thank you, <strong className="text-gray-900">{customerName}</strong>! Our automotive search specialists have received your requirements and are cross-referencing our active and incoming inventory.
              </p>
              {matchedCount > 0 && (
                <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 inline-block text-xs font-bold text-emerald-800">
                  🎉 Good news! We already have {matchedCount} verified vehicle{matchedCount > 1 ? 's' : ''} in inventory closely matching your criteria.
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-6 py-3 rounded-xl bg-[#101216] text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Request Form */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {submitError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {submitError}
              </div>
            )}

            {/* 1. Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#101216] mb-1">
                  Full Name <span className="text-[#E5325C]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8F9FA] border border-gray-200 rounded-xl text-xs text-[#101216] focus:outline-none focus:border-[#E5325C] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101216] mb-1">
                  Mobile Number <span className="text-[#E5325C]">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8F9FA] border border-gray-200 rounded-xl text-xs text-[#101216] focus:outline-none focus:border-[#E5325C] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 2. Brand & Model */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#101216] mb-1">
                  Preferred Brand <span className="text-[#E5325C]">*</span>
                </label>
                {!isCustomBrand ? (
                  <select
                    value={preferredBrand}
                    onChange={(e) => {
                      if (e.target.value === 'Other') {
                        setIsCustomBrand(true);
                      } else {
                        setPreferredBrand(e.target.value);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-gray-200 rounded-xl text-xs text-[#101216] focus:outline-none focus:border-[#E5325C] focus:bg-white cursor-pointer font-medium"
                  >
                    <option value="Any">Any Verified Brand</option>
                    {MAKES.map((m: string) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                    <option value="Other">Enter Other Brand...</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      required
                      value={customBrandName}
                      onChange={(e) => setCustomBrandName(e.target.value)}
                      placeholder="Type car brand name"
                      className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-gray-200 rounded-xl text-xs text-[#101216] focus:outline-none focus:border-[#E5325C] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomBrand(false)}
                      className="px-2 py-2 text-xs text-gray-500 hover:text-black font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101216] mb-1">
                  Preferred Model (Optional)
                </label>
                <div className="relative">
                  <Car className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={preferredModel}
                    onChange={(e) => setPreferredModel(e.target.value)}
                    placeholder="e.g. Creta, Swift, City, Thar, Any"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8F9FA] border border-gray-200 rounded-xl text-xs text-[#101216] focus:outline-none focus:border-[#E5325C] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 3. Budget Bracket */}
            <div>
              <label className="block text-xs font-bold text-[#101216] mb-1.5">
                Target Budget Range <span className="text-[#E5325C]">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BUDGET_OPTIONS.map((opt, idx) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setSelectedBudgetIndex(idx)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      selectedBudgetIndex === idx
                        ? 'bg-[#101216] text-white border-[#101216] shadow-xs'
                        : 'bg-[#F8F9FA] text-gray-700 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Fuel & Transmission */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#101216] mb-1">
                  Fuel Preference
                </label>
                <select
                  value={preferredFuel}
                  onChange={(e) => setPreferredFuel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-gray-200 rounded-xl text-xs text-[#101216] focus:outline-none focus:border-[#E5325C] cursor-pointer"
                >
                  <option value="Any">Any Fuel Type</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="CNG">CNG</option>
                  <option value="Electric">Electric</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101216] mb-1">
                  Transmission
                </label>
                <select
                  value={preferredTransmission}
                  onChange={(e) => setPreferredTransmission(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-gray-200 rounded-xl text-xs text-[#101216] focus:outline-none focus:border-[#E5325C] cursor-pointer"
                >
                  <option value="Any">Any Transmission</option>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#101216] mb-1">
                  Mfg Year
                </label>
                <select
                  value={preferredYear}
                  onChange={(e) => setPreferredYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-gray-200 rounded-xl text-xs text-[#101216] focus:outline-none focus:border-[#E5325C] cursor-pointer"
                >
                  <option value="Any">Any Year</option>
                  <option value="2022+">2022 & Newer</option>
                  <option value="2020+">2020 & Newer</option>
                  <option value="2018+">2018 & Newer</option>
                  <option value="2015+">2015 & Newer</option>
                </select>
              </div>
            </div>

            {/* 5. Location */}
            <div>
              <label className="block text-xs font-bold text-[#101216] mb-1">
                Preferred Hub / City
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8F9FA] border border-gray-200 rounded-xl text-xs text-[#101216] focus:outline-none focus:border-[#E5325C] cursor-pointer font-medium"
                >
                  {CITIES.map((c: string) => (
                    <option key={c} value={c}>{c} Hub & Nearby</option>
                  ))}
                  <option value="Any City in Telangana">Any City / Hub in Telangana</option>
                </select>
              </div>
            </div>

            {/* 6. Additional Requirements */}
            <div>
              <label className="block text-xs font-bold text-[#101216] mb-1">
                Additional Requirements or Questions
              </label>
              <textarea
                rows={2}
                value={additionalRequirements}
                onChange={(e) => setAdditionalRequirements(e.target.value)}
                placeholder="e.g. Looking for white color, sunroof, under 50,000 km, ready for immediate delivery..."
                className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-gray-200 rounded-xl text-xs text-[#101216] focus:outline-none focus:border-[#E5325C] focus:bg-white resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-gray-100">
              <span className="text-[11px] text-gray-500 hidden sm:inline">
                🔒 Free concierge service • Zero obligation
              </span>

              <div className="flex items-center gap-2 ml-auto w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#E5325C] hover:bg-[#D4264E] text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>Find My Car</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
