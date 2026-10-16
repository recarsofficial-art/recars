'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Share2,
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  Settings,
  ShieldCheck,
  Check,
  Info,
  ChevronLeft,
  ChevronRight,
  Phone,
  FileCheck,
  RotateCcw,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  X,
  TrendingUp,
  Tag,
  AlertTriangle,
  Banknote,
  Send,
  CheckCircle,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CarCard from '@/components/CarCard';
import { useRecarsState } from '@/lib/store';
import { formatINR, formatKM, calculateEMI } from '@/lib/formatters';
import { Car, CarInquiry } from '@/lib/types';
import { useAuth } from '@/lib/authContext';
import { Suspense } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

function CarDetailInner({ params }: PageProps) {
  const unwrappedParams = use(params);
  const router = useRouter();

  const {
    selectedCity,
    changeCity,
    wishlistIds,
    toggleWishlist,
    isWishlisted,
    cars: storeCars,
    addInquiry,
  } = useRecarsState();

  const [liveCars, setLiveCars] = useState<Car[]>([]);

  useEffect(() => {
    const fetchCars = () => {
      fetch('/api/cars')
        .then((r) => r.json())
        .then((d) => {
          if (d?.cars?.length > 0) setLiveCars(d.cars);
        })
        .catch(() => {});
    };
    fetchCars();
    window.addEventListener('focus', fetchCars);
    return () => window.removeEventListener('focus', fetchCars);
  }, []);

  const cars = liveCars.length > 0 ? liveCars : storeCars;
  const car = cars.find((c) => c.id === unwrappedParams.id) || cars[0];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Interested Modal State
  const [isInterestedModalOpen, setIsInterestedModalOpen] = useState(false);
  const [interestedName, setInterestedName] = useState('');
  const [interestedPhone, setInterestedPhone] = useState('');
  const [interestedEmail, setInterestedEmail] = useState('');
  const [interestedNotes, setInterestedNotes] = useState('');
  const [interestedSubmitted, setInterestedSubmitted] = useState(false);
  const [interestedLoading, setInterestedLoading] = useState(false);

  // Negotiation Modal State
  const [isNegotiateModalOpen, setIsNegotiateModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState<number>(Math.round(car.price * 0.95));
  const [offerCustomerName, setOfferCustomerName] = useState('');
  const [offerCustomerPhone, setOfferCustomerPhone] = useState('');
  const [offerCustomerEmail, setOfferCustomerEmail] = useState('');
  const [offerNotes, setOfferNotes] = useState('');
  const [offerSubmitted, setOfferSubmitted] = useState(false);
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerError, setOfferError] = useState<string | null>(null);

  // Callback Modal State
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  const [cbName, setCbName] = useState('');
  const [cbPhone, setCbPhone] = useState('');
  const [cbSubmitted, setCbSubmitted] = useState(false);

  const [activeInspectionTab, setActiveInspectionTab] = useState<'engine' | 'exterior' | 'interior' | 'tyres'>('engine');

  // EMI Calculator states
  const [downPayment, setDownPayment] = useState<number>(Math.round(car.price * 0.2));
  const [loanTenureYears, setLoanTenureYears] = useState<number>(5);
  const [interestRate, setInterestRate] = useState<number>(9.5);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.name) {
        setInterestedName(user.name);
        setOfferCustomerName(user.name);
        setCbName(user.name);
      }
      if (user.phone) {
        setInterestedPhone(user.phone);
        setOfferCustomerPhone(user.phone);
        setCbPhone(user.phone);
      }
      if (user.email) {
        setInterestedEmail(user.email);
        setOfferCustomerEmail(user.email);
      }
    }
  }, [user]);

  const calculatedMonthlyEmi = calculateEMI(
    Math.max(100000, car.price - downPayment),
    interestRate,
    loanTenureYears * 12
  );

  const images = car.galleryImages && car.galleryImages.length > 0 ? car.galleryImages : [car.image];
  const similarCars = cars.filter((c) => c.id !== car.id && (c.bodyType === car.bodyType || c.make === car.make)).slice(0, 3);

  // Dynamic Vehicle Age Calculation
  const currentYear = new Date().getFullYear();
  const mfgYear = car.manufacturingYear || car.year;
  const regYear = car.registrationYear || car.specifications?.regYear || car.year;
  const vehicleAgeYears = Math.max(0, currentYear - mfgYear);
  const vehicleAgeFormatted = vehicleAgeYears === 0 ? 'Under 1 Year Old' : `${vehicleAgeYears} ${vehicleAgeYears === 1 ? 'Year' : 'Years'} Old`;

  // Dynamic Insurance Validity
  const insuranceValidDateStr = car.insuranceExpiry || car.specifications?.insuranceValidTill || 'Nov 2026';
  const insuranceStatus = car.insuranceStatus || 'Valid';
  const insuranceType = car.insuranceType || 'Comprehensive';

  // Availability status
  const availabilityStatus = car.availabilityStatus || 'Available';
  const isSoldOut = availabilityStatus === 'Sold Out';
  const isReserved = availabilityStatus === 'Reserved';

  // Pricing Suggestions
  const suggestedMin = car.suggestedPriceMin || Math.round(car.price * 0.94);
  const suggestedMax = car.suggestedPriceMax || Math.round(car.price * 1.04);
  const suggestedOfferMin = Math.round(car.price * 0.92);
  const suggestedOfferMax = Math.round(car.price * 0.98);

  const handleInterestedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInterestedLoading(true);
    const newInquiry: CarInquiry = {
      id: `inq-${Date.now()}`,
      carId: car.id,
      carTitle: `${car.year} ${car.make} ${car.model} ${car.variant}`,
      carImage: car.image,
      carPrice: car.price,
      userName: interestedName || 'Interested Customer',
      userPhone: interestedPhone,
      userEmail: interestedEmail || user?.email || 'Recars.in@gmail.com',
      city: car.city,
      inquiryType: 'Interested in Vehicle',
      message: interestedNotes || `Customer expressed interest in ${car.make} ${car.model}.`,
      status: 'New',
      createdAt: new Date().toISOString(),
    };

    try {
      await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInquiry),
      });
      addInquiry(newInquiry);
      setInterestedSubmitted(true);
    } catch {
      addInquiry(newInquiry);
      setInterestedSubmitted(true);
    } finally {
      setInterestedLoading(false);
    }
  };

  const handleNegotiationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOfferError(null);

    if (!offerAmount || offerAmount <= 0) {
      setOfferError('Please enter a valid offer amount.');
      return;
    }
    if (!offerCustomerPhone || offerCustomerPhone.length < 10) {
      setOfferError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setOfferLoading(true);
    try {
      const res = await fetch('/api/negotiations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId: car.id,
          carTitle: `${car.year} ${car.make} ${car.model}`,
          carImage: car.image,
          listedPrice: car.price,
          customerName: offerCustomerName || 'Prospective Buyer',
          customerPhone: offerCustomerPhone,
          customerEmail: offerCustomerEmail || user?.email || 'Recars.in@gmail.com',
          customerOffer: Number(offerAmount),
          notes: offerNotes || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOfferSubmitted(true);
      } else {
        setOfferError(data.error || 'Failed to submit offer.');
      }
    } catch (err: any) {
      setOfferError(err.message || 'Network error submitting offer.');
    } finally {
      setOfferLoading(false);
    }
  };

  const handleCallbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInq: CarInquiry = {
      id: `inq-${Date.now()}`,
      carId: car.id,
      carTitle: `${car.year} ${car.make} ${car.model}`,
      carImage: car.image,
      carPrice: car.price,
      userName: cbName || 'Interested Buyer',
      userPhone: cbPhone,
      userEmail: user?.email || 'Recars.in@gmail.com',
      city: car.city,
      inquiryType: 'Price Quote / Best Offer',
      message: 'Customer requested instant callback regarding vehicle details and availability.',
      status: 'New',
      createdAt: new Date().toISOString(),
    };
    fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInq),
    }).catch(() => {});
    addInquiry(newInq);
    setCbSubmitted(true);
    setTimeout(() => {
      setIsCallbackModalOpen(false);
      setCbSubmitted(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Navbar
        selectedCity={selectedCity}
        onSelectCity={changeCity}
        wishlistCount={wishlistIds.length}
      />

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-[#E5E7EB] py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-xs text-[#6B7078]">
            <div className="flex items-center gap-2">
              <Link href="/" className="hover:text-[#E5325C]">Home</Link>
              <span>/</span>
              <Link href="/buy" className="hover:text-[#E5325C]">Used Cars</Link>
              <span>/</span>
              <span className="font-semibold text-[#101216]">
                {car.make} {car.model}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `${car.make} ${car.model} on Recars`,
                      url: window.location.href,
                    });
                  }
                }}
                className="flex items-center gap-1 hover:text-[#E5325C]"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share Car</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Vehicle Details Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* =========================================
              LEFT COLUMN: GALLERY + SPECS + REPORT
          ========================================== */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. Large Photo Gallery */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden shadow-xs p-4 sm:p-6 space-y-4">
              <div className="relative aspect-[16/10] bg-[#F8F9FA] rounded-2xl overflow-hidden group">
                <img
                  src={images[activeImageIndex]}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                />

                {/* Left / Right Nav Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 backdrop-blur-md text-[#101216] hover:bg-white shadow-md transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 backdrop-blur-md text-[#101216] hover:bg-white shadow-md transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Image counter indicator */}
                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-xs font-semibold">
                  {activeImageIndex + 1} / {images.length} Photos
                </div>

                {/* Badges on Gallery */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {/* Availability Badge */}
                  {isSoldOut ? (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-900/90 text-white border border-slate-700 flex items-center gap-1 shadow-md">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Sold Out</span>
                    </span>
                  ) : isReserved ? (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/95 text-white border border-amber-400 flex items-center gap-1 shadow-md">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Reserved</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-600/90 text-white border border-emerald-400 flex items-center gap-1 shadow-md">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Available</span>
                    </span>
                  )}

                  {/* Ownership Count */}
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-xs text-[#101216] border border-gray-200 flex items-center gap-1 shadow-xs">
                    <Award className="w-3.5 h-3.5 text-[#E5325C]" />
                    <span>{car.ownership || '1st Owner'}</span>
                  </span>

                  {car.isVerified && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F0F9F4] text-[#237A52] border border-[#D1EAD9] flex items-center gap-1 shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Verified Vehicle</span>
                    </span>
                  )}
                  {car.isRecarsSelect && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFF0F3] text-[#E5325C] border border-[#FFD6DF] flex items-center gap-1 shadow-xs">
                      <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Recars Select</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails row */}
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      activeImageIndex === idx
                        ? 'border-[#E5325C] shadow-sm scale-102'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Key Highlights Strip */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#101216]">Vehicle Overview & History</h2>
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                  Reg: {car.specifications?.rto || `${car.city} RTO`}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB]">
                  <div className="flex items-center gap-1.5 text-xs text-[#6B7078] mb-1">
                    <Calendar className="w-4 h-4 text-[#E5325C]" />
                    <span>Reg. Year</span>
                  </div>
                  <span className="font-bold text-sm text-[#101216]">{regYear}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB]">
                  <div className="flex items-center gap-1.5 text-xs text-[#6B7078] mb-1">
                    <Calendar className="w-4 h-4 text-[#E5325C]" />
                    <span>Mfg. Year</span>
                  </div>
                  <span className="font-bold text-sm text-[#101216]">{mfgYear}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB]">
                  <div className="flex items-center gap-1.5 text-xs text-[#6B7078] mb-1">
                    <Clock className="w-4 h-4 text-[#E5325C]" />
                    <span>Vehicle Age</span>
                  </div>
                  <span className="font-bold text-sm text-[#101216]">{vehicleAgeFormatted}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB]">
                  <div className="flex items-center gap-1.5 text-xs text-[#6B7078] mb-1">
                    <Award className="w-4 h-4 text-[#E5325C]" />
                    <span>Ownership</span>
                  </div>
                  <span className="font-bold text-sm text-[#101216]">{car.ownership || '1st Owner'}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB]">
                  <div className="flex items-center gap-1.5 text-xs text-[#6B7078] mb-1">
                    <Gauge className="w-4 h-4 text-[#E5325C]" />
                    <span>Kilometers</span>
                  </div>
                  <span className="font-bold text-sm text-[#101216]">{formatKM(car.kilometers)}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB]">
                  <div className="flex items-center gap-1.5 text-xs text-[#6B7078] mb-1">
                    <Fuel className="w-4 h-4 text-[#E5325C]" />
                    <span>Fuel Type</span>
                  </div>
                  <span className="font-bold text-sm text-[#101216]">{car.fuelType}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB]">
                  <div className="flex items-center gap-1.5 text-xs text-[#6B7078] mb-1">
                    <Settings className="w-4 h-4 text-[#E5325C]" />
                    <span>Transmission</span>
                  </div>
                  <span className="font-bold text-sm text-[#101216]">{car.transmission}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB]">
                  <div className="flex items-center gap-1.5 text-xs text-[#6B7078] mb-1">
                    <Banknote className="w-4 h-4 text-[#E5325C]" />
                    <span>Finance Status</span>
                  </div>
                  <span className="font-bold text-sm text-emerald-700">{car.financeAvailable || 'Available'}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] sm:col-span-2">
                  <div className="flex items-center justify-between text-xs text-[#6B7078] mb-1">
                    <span className="flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-[#E5325C]" />
                      <span>Insurance Validity</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      insuranceStatus === 'Valid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {insuranceStatus}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-[#101216] flex items-center justify-between">
                    <span>{insuranceType}</span>
                    <span className="text-gray-500 font-medium">Expires: {insuranceValidDateStr}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB]">
                  <div className="flex items-center gap-1.5 text-xs text-[#6B7078] mb-1">
                    <MapPin className="w-4 h-4 text-[#E5325C]" />
                    <span>RTO Location</span>
                  </div>
                  <span className="font-bold text-sm text-[#101216] truncate block">{car.specifications?.rto || car.city}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB]">
                  <div className="flex items-center gap-1.5 text-xs text-[#6B7078] mb-1">
                    <Sparkles className="w-4 h-4 text-[#E5325C]" />
                    <span>Exterior Color</span>
                  </div>
                  <span className="font-bold text-sm text-[#101216]">{car.specifications?.color || 'Standard'}</span>
                </div>
              </div>
            </div>

            {/* 3. Detailed 28+ Point Inspection Report */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#237A52] uppercase tracking-wider mb-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Official Inspection Certified</span>
                  </div>
                  <h2 className="text-xl font-black text-[#101216]">
                    28+ Point Inspection Report
                  </h2>
                </div>

                {/* Big Score Badge */}
                <div className="flex items-center gap-3 bg-[#FFF0F3] border border-[#FFD6DF] px-4 py-2 rounded-2xl">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#6B7078] block">Overall Rating</span>
                    <span className="text-xs font-bold text-[#E5325C]">Superior Grade A+</span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#E5325C] text-white flex items-center justify-center font-black text-lg shadow-sm">
                    {car.inspectionScore}
                  </div>
                </div>
              </div>

              {/* Tabs for inspection categories */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveInspectionTab('engine')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeInspectionTab === 'engine'
                      ? 'bg-[#101216] text-white'
                      : 'bg-[#F8F9FA] text-[#6B7078] hover:text-[#101216]'
                  }`}
                >
                  Engine & Transmission (52 Pts)
                </button>
                <button
                  onClick={() => setActiveInspectionTab('exterior')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeInspectionTab === 'exterior'
                      ? 'bg-[#101216] text-white'
                      : 'bg-[#F8F9FA] text-[#6B7078] hover:text-[#101216]'
                  }`}
                >
                  Body & Exterior (68 Pts)
                </button>
                <button
                  onClick={() => setActiveInspectionTab('interior')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeInspectionTab === 'interior'
                      ? 'bg-[#101216] text-white'
                      : 'bg-[#F8F9FA] text-[#6B7078] hover:text-[#101216]'
                  }`}
                >
                  Electricals & AC (48 Pts)
                </button>
                <button
                  onClick={() => setActiveInspectionTab('tyres')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeInspectionTab === 'tyres'
                      ? 'bg-[#101216] text-white'
                      : 'bg-[#F8F9FA] text-[#6B7078] hover:text-[#101216]'
                  }`}
                >
                  Tyres & Brakes (32 Pts)
                </button>
              </div>

              {/* Checkpoint list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {activeInspectionTab === 'engine' && (
                  <>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0F9F4] text-xs font-medium text-[#237A52] border border-[#D1EAD9]">
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Engine Sound & Smooth Idling</span>
                      </span>
                      <span className="font-bold">Passed</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0F9F4] text-xs font-medium text-[#237A52] border border-[#D1EAD9]">
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Zero Oil Leakages & Fluid Levels</span>
                      </span>
                      <span className="font-bold">Passed</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0F9F4] text-xs font-medium text-[#237A52] border border-[#D1EAD9]">
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Transmission Gear Shifts & Clutch</span>
                      </span>
                      <span className="font-bold">Passed</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0F9F4] text-xs font-medium text-[#237A52] border border-[#D1EAD9]">
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Radiator, Coolant & Thermostat</span>
                      </span>
                      <span className="font-bold">Passed</span>
                    </div>
                  </>
                )}

                {activeInspectionTab === 'exterior' && (
                  <>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0F9F4] text-xs font-medium text-[#237A52] border border-[#D1EAD9]">
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Original Factory Panels & Non-Accidental</span>
                      </span>
                      <span className="font-bold">100% Verified</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0F9F4] text-xs font-medium text-[#237A52] border border-[#D1EAD9]">
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Chassis & Underbody Frame Integrity</span>
                      </span>
                      <span className="font-bold">Passed</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0F9F4] text-xs font-medium text-[#237A52] border border-[#D1EAD9]">
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Front & Rear Windshield Glass Seal</span>
                      </span>
                      <span className="font-bold">Passed</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0F9F4] text-xs font-medium text-[#237A52] border border-[#D1EAD9]">
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Headlamps, Tail Lamps & Fog Indicators</span>
                      </span>
                      <span className="font-bold">Passed</span>
                    </div>
                  </>
                )}

                {activeInspectionTab === 'interior' && (
                  <>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0F9F4] text-xs font-medium text-[#237A52] border border-[#D1EAD9]">
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Climate Control & AC Cooling Efficiency</span>
                      </span>
                      <span className="font-bold">Excellent</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0F9F4] text-xs font-medium text-[#237A52] border border-[#D1EAD9]">
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Infotainment, Speakers & Rear Camera</span>
                      </span>
                      <span className="font-bold">Passed</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0F9F4] text-xs font-medium text-[#237A52] border border-[#D1EAD9]">
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Power Windows & Central Locking</span>
                      </span>
                      <span className="font-bold">Passed</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0F9F4] text-xs font-medium text-[#237A52] border border-[#D1EAD9]">
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Airbag Sensors & Diagnostic Scan</span>
                      </span>
                      <span className="font-bold">Passed</span>
                    </div>
                  </>
                )}

                {activeInspectionTab === 'tyres' && (
                  <>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0F9F4] text-xs font-medium text-[#237A52] border border-[#D1EAD9]">
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Tyre Tread Depth (Above 75% Life)</span>
                      </span>
                      <span className="font-bold">78% Remaining</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0F9F4] text-xs font-medium text-[#237A52] border border-[#D1EAD9]">
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Spare Wheel & Jack Tool Kit</span>
                      </span>
                      <span className="font-bold">Present</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0F9F4] text-xs font-medium text-[#237A52] border border-[#D1EAD9]">
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Brake Pads & Disc Rotors Wear</span>
                      </span>
                      <span className="font-bold">Optimal</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0F9F4] text-xs font-medium text-[#237A52] border border-[#D1EAD9]">
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>ABS & ESP Dynamic Brake Test</span>
                      </span>
                      <span className="font-bold">Passed</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 4. Specifications & Equipment */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-[#101216]">Full Technical Specifications</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-xs divide-y sm:divide-y-0">
                <div className="flex justify-between py-2 border-b border-[#F1F3F5]">
                  <span className="text-[#6B7078]">Engine Displacement</span>
                  <span className="font-bold text-[#101216]">{car.specifications.engine}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#F1F3F5]">
                  <span className="text-[#6B7078]">Max Power Output</span>
                  <span className="font-bold text-[#101216]">{car.specifications.maxPower}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#F1F3F5]">
                  <span className="text-[#6B7078]">Peak Torque</span>
                  <span className="font-bold text-[#101216]">{car.specifications.torque}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#F1F3F5]">
                  <span className="text-[#6B7078]">Certified Mileage</span>
                  <span className="font-bold text-[#101216]">{car.specifications.mileage}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#F1F3F5]">
                  <span className="text-[#6B7078]">Seating Capacity</span>
                  <span className="font-bold text-[#101216]">{car.specifications.seatingCapacity} Seater</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#F1F3F5]">
                  <span className="text-[#6B7078]">Boot Space</span>
                  <span className="font-bold text-[#101216]">{car.specifications.bootSpace}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#F1F3F5]">
                  <span className="text-[#6B7078]">Ground Clearance</span>
                  <span className="font-bold text-[#101216]">{car.specifications.groundClearance}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#F1F3F5]">
                  <span className="text-[#6B7078]">Fuel Tank</span>
                  <span className="font-bold text-[#101216]">{car.specifications.fuelTankCapacity}</span>
                </div>
              </div>

              {/* Equipment list */}
              <div className="pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7078] mb-3">
                  Installed Luxury Features & Comfort
                </h4>
                <div className="flex flex-wrap gap-2">
                  {car.features.map((feat) => (
                    <span
                      key={feat}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8F9FA] border border-[#E5E7EB] text-xs font-semibold text-[#101216]"
                    >
                      <Check className="w-3 h-3 text-[#E5325C]" />
                      <span>{feat}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* =========================================
              RIGHT COLUMN: PRICING & ACTIONS PANEL
          ========================================== */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            {/* Main Price Card */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-lg space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#E5325C] uppercase tracking-wider">
                    {car.bodyType} • {car.city}
                  </span>
                  <button
                    onClick={() => toggleWishlist(car.id)}
                    className={`p-2 rounded-full border transition-colors ${
                      isWishlisted(car.id)
                        ? 'bg-[#E5325C] text-white border-[#E5325C]'
                        : 'bg-[#F8F9FA] text-[#6B7078] border-[#E5E7EB] hover:text-[#E5325C]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted(car.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <h1 className="text-2xl font-black text-[#101216]">
                  {car.make} {car.model}
                </h1>
                <p className="text-xs text-[#6B7078] mt-0.5">{car.variant}</p>
              </div>

              {/* Availability Notice */}
              {isSoldOut ? (
                <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center gap-2.5 text-xs font-bold shadow-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>This vehicle is Sold Out. Enquiries are currently closed.</span>
                </div>
              ) : isReserved ? (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2.5 text-xs font-medium">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Vehicle is currently reserved. You may express interest in case the booking opens.</span>
                </div>
              ) : null}

              {/* Price Display */}
              <div className="p-4 rounded-2xl bg-[#FFF0F3] border border-[#FFD6DF]">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-semibold font-price text-[#101216]">
                    {formatINR(car.price)}
                  </span>
                  {car.originalPrice && (
                    <span className="text-xs text-[#6B7078] line-through font-price">
                      {formatINR(car.originalPrice)}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#6B7078] mt-1 font-body">
                  Transparent Listed Price • Zero Brokerage Commission
                </p>
              </div>

              {/* Suggested Pricing Guidance Card */}
              <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-2 text-xs">
                <div className="flex items-center justify-between font-semibold font-heading text-[#101216]">
                  <span className="flex items-center gap-1.5 text-gray-700">
                    <TrendingUp className="w-3.5 h-3.5 text-[#E5325C]" />
                    <span>Suggested Market Value</span>
                  </span>
                  <span className="text-gray-900 font-semibold font-price">{formatINR(suggestedMin)} – {formatINR(suggestedMax)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#6B7078]">
                  <span>Suggested Offer Range:</span>
                  <span className="font-semibold font-price text-[#E5325C]">{formatINR(suggestedOfferMin)} – {formatINR(suggestedOfferMax)}</span>
                </div>
                <p className="text-[10px] text-gray-500 leading-tight pt-1.5 border-t border-gray-200 font-body">
                  Estimates are data-backed suggestions based on make, variant, year, odometer & condition, not guaranteed valuations.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                {/* 1. Interested Button */}
                <button
                  onClick={() => setIsInterestedModalOpen(true)}
                  disabled={isSoldOut}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-semibold font-btn tracking-rounded text-sm shadow-md transition-all active:scale-98 cursor-pointer ${
                    isSoldOut
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'text-white bg-[#E5325C] hover:bg-[#D4264E]'
                  }`}
                >
                  <Heart className="w-4 h-4 fill-current" />
                  <span>{isSoldOut ? 'Vehicle Sold Out' : 'Interested'}</span>
                </button>

                {/* 2. Make an Offer / Negotiate Price Button */}
                <button
                  onClick={() => setIsNegotiateModalOpen(true)}
                  disabled={isSoldOut}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-semibold font-btn tracking-rounded text-sm transition-all border cursor-pointer ${
                    isSoldOut
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'text-[#101216] bg-white border-gray-300 hover:border-[#E5325C] hover:text-[#E5325C] hover:bg-[#FFF0F3]/40'
                  }`}
                >
                  <Tag className="w-4 h-4 text-[#E5325C]" />
                  <span>Make an Offer / Negotiate Price</span>
                </button>

                {/* 3. Request Callback Button */}
                <button
                  onClick={() => setIsCallbackModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl font-semibold font-btn tracking-rounded text-xs text-[#101216] bg-white border border-[#E5E7EB] hover:bg-gray-50 transition-all cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-[#E5325C]" />
                  <span>Request Instant Callback</span>
                </button>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href="tel:+919908796677"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-semibold font-btn tracking-rounded text-xs text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:text-[#E5325C] transition-all"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#E5325C]" />
                    <span>Call 9908796677</span>
                  </a>

                  <a
                    href={`https://wa.me/919908796677?text=Hello%20Recars%2C%20I%20am%20interested%20in%20the%20${encodeURIComponent(car.year + ' ' + car.make + ' ' + car.model)}%20(${encodeURIComponent(car.id)})%20listed%20at%20${encodeURIComponent(formatINR(car.price))}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-semibold font-btn tracking-rounded text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all"
                  >
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Recars Assured Pillars (Genuine, transparent guarantees) */}
              <div className="pt-4 border-t border-[#E5E7EB] space-y-2.5 text-xs text-[#24262A]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#237A52] flex-shrink-0" />
                  <span>28+ Point Comprehensive Inspection Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#237A52] flex-shrink-0" />
                  <span>Verified Ownership & Clear Title Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#237A52] flex-shrink-0" />
                  <span>RC Ownership Transfer Assistance</span>
                </div>
              </div>
            </div>

            {/* EMI Calculator Card */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-[#101216] flex items-center justify-between">
                <span>Indicative EMI Calculator</span>
                <span className="text-[#E5325C] font-black">{formatINR(calculatedMonthlyEmi)}/mo</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-[#6B7078] mb-1">
                    <span>Down Payment</span>
                    <span className="font-bold text-[#101216]">{formatINR(downPayment)}</span>
                  </div>
                  <input
                    type="range"
                    min={Math.round(car.price * 0.1)}
                    max={Math.round(car.price * 0.8)}
                    step="20000"
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="w-full accent-[#E5325C]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[#6B7078] mb-1">
                    <span>Loan Tenure</span>
                    <span className="font-bold text-[#101216]">{loanTenureYears} Years</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {[3, 4, 5, 7].map((yr) => (
                      <button
                        key={yr}
                        onClick={() => setLoanTenureYears(yr)}
                        className={`py-1.5 rounded-lg text-xs font-semibold border ${
                          loanTenureYears === yr
                            ? 'bg-[#101216] text-white border-[#101216]'
                            : 'bg-[#F8F9FA] border-[#E5E7EB] text-[#6B7078]'
                        }`}
                      >
                        {yr} Yrs
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-[#6B7078] text-center leading-relaxed">
                Disclaimer: Financing availability and indicative EMIs are subject to lender credit approval, eligibility criteria, and KYC verification. Recars facilitates loan applications through partner banks.
              </div>
            </div>
          </div>
        </div>

        {/* Similar Cars Section */}
        {similarCars.length > 0 && (
          <div className="pt-10 border-t border-[#E5E7EB]">
            <h2 className="text-2xl font-black text-[#101216] mb-6">Similar Verified Cars</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarCars.map((c) => (
                <CarCard
                  key={c.id}
                  car={c}
                  isWishlisted={isWishlisted(c.id)}
                  onToggleWishlist={toggleWishlist}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Interested in this Vehicle Modal */}
      {isInterestedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-[#E5E7EB] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#FFF0F3]">
              <div className="flex items-center gap-2.5">
                <Heart className="w-5 h-5 text-[#E5325C] fill-current" />
                <div>
                  <h3 className="font-bold text-base text-[#101216]">Express Interest</h3>
                  <p className="text-xs text-[#6B7078]">{car.make} {car.model} ({car.year})</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsInterestedModalOpen(false);
                  setInterestedSubmitted(false);
                }}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {interestedSubmitted ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F0F9F4] text-[#237A52] flex items-center justify-center mx-auto border border-[#D1EAD9]">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h4 className="text-xl font-black text-[#101216]">Interest Registered!</h4>
                <p className="text-xs sm:text-sm text-[#6B7078] max-w-sm mx-auto">
                  Thank you! Your interest in the <span className="font-bold text-[#101216]">{car.make} {car.model}</span> has been saved in our system. Our vehicle specialist will connect with you shortly.
                </p>
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={() => {
                      setIsInterestedModalOpen(false);
                      setInterestedSubmitted(false);
                    }}
                    className="px-6 py-2.5 rounded-full bg-[#E5325C] text-white text-xs font-bold shadow-md"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInterestedSubmit} className="p-6 space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-200">
                  <img src={car.image} alt={car.model} className="w-16 h-12 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-gray-900 truncate">{car.make} {car.model} {car.variant}</h4>
                    <p className="text-xs font-extrabold text-[#E5325C]">{formatINR(car.price)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#101216] mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={interestedName}
                      onChange={(e) => setInterestedName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#E5325C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#101216] mb-1">Mobile Number (10 digits)</label>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={interestedPhone}
                      onChange={(e) => setInterestedPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#E5325C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#101216] mb-1">Email Address (Optional)</label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={interestedEmail}
                      onChange={(e) => setInterestedEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#E5325C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#101216] mb-1">Questions or Specific Requests (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="e.g., When can I see the car? Is finance available?"
                      value={interestedNotes}
                      onChange={(e) => setInterestedNotes(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#E5325C]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={interestedLoading}
                    className="w-full py-3.5 rounded-2xl bg-[#E5325C] text-white font-bold text-sm hover:bg-[#D4264E] transition-all shadow-md active:scale-98 disabled:opacity-50"
                  >
                    {interestedLoading ? 'Submitting Interest...' : 'Confirm My Interest'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Negotiation / Make an Offer Modal */}
      {isNegotiateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-[#E5E7EB] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between bg-[#FFF0F3]">
              <div className="flex items-center gap-2.5">
                <Tag className="w-5 h-5 text-[#E5325C]" />
                <div>
                  <h3 className="font-bold text-base text-[#101216]">Submit Price Offer</h3>
                  <p className="text-xs text-[#6B7078]">Direct negotiation with Recars pricing desk</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsNegotiateModalOpen(false);
                  setOfferSubmitted(false);
                  setOfferError(null);
                }}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {offerSubmitted ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F0F9F4] text-[#237A52] flex items-center justify-center mx-auto border border-[#D1EAD9]">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h4 className="text-xl font-black text-[#101216]">Offer Submitted!</h4>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 max-w-xs mx-auto">
                  <span className="block text-[10px] text-gray-500 uppercase font-bold">Your Proposed Offer</span>
                  <span className="text-lg font-black text-[#E5325C]">{formatINR(offerAmount)}</span>
                  <span className="block text-[10px] text-gray-500 mt-1">Listed: {formatINR(car.price)}</span>
                </div>
                <p className="text-xs sm:text-sm text-[#6B7078] max-w-sm mx-auto">
                  Your offer has been submitted directly to the Recars admin desk for <span className="font-bold text-[#101216]">{car.make} {car.model}</span>. Our team will review and respond with an acceptance or counteroffer.
                </p>
                <div className="pt-2 flex justify-center">
                  <button
                    onClick={() => {
                      setIsNegotiateModalOpen(false);
                      setOfferSubmitted(false);
                    }}
                    className="px-6 py-2.5 rounded-full bg-[#E5325C] text-white text-xs font-bold shadow-md"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleNegotiationSubmit} className="p-6 space-y-4">
                {offerError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{offerError}</span>
                  </div>
                )}

                {/* Car & Pricing Guidance */}
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">{car.make} {car.model} {car.variant}</h4>
                      <p className="text-[11px] text-gray-500">{car.year} • {car.fuelType} • {formatKM(car.kilometers)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-500 block">Listed Price</span>
                      <span className="text-sm font-black text-gray-900">{formatINR(car.price)}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-[#E5325C]" />
                      <span>Suggested Offer Range:</span>
                    </span>
                    <span className="font-bold text-[#E5325C]">{formatINR(suggestedOfferMin)} – {formatINR(suggestedOfferMax)}</span>
                  </div>
                </div>

                {/* Offer Input & Quick % Chips */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#101216]">Your Offer Amount (₹)</label>
                    <span className="text-xs font-black text-[#E5325C]">{formatINR(offerAmount)}</span>
                  </div>
                  <input
                    type="number"
                    required
                    min={Math.round(car.price * 0.7)}
                    max={car.price}
                    step={5000}
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm font-bold bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#E5325C]"
                  />
                  <div className="grid grid-cols-4 gap-1.5 mt-2">
                    {[
                      { label: '-3%', val: Math.round(car.price * 0.97) },
                      { label: '-5%', val: Math.round(car.price * 0.95) },
                      { label: '-7%', val: Math.round(car.price * 0.93) },
                      { label: '-10%', val: Math.round(car.price * 0.90) },
                    ].map((opt) => (
                      <button
                        type="button"
                        key={opt.label}
                        onClick={() => setOfferAmount(opt.val)}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                          offerAmount === opt.val
                            ? 'bg-[#E5325C] text-white border-[#E5325C]'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {opt.label} ({Math.round(opt.val / 1000)}k)
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-[#101216] mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={offerCustomerName}
                      onChange={(e) => setOfferCustomerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#E5325C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#101216] mb-1">Mobile (10 digits)</label>
                    <input
                      type="tel"
                      required
                      placeholder="Mobile Number"
                      value={offerCustomerPhone}
                      onChange={(e) => setOfferCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#E5325C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101216] mb-1">Offer Notes / Message (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Immediate cash settlement ready if offer accepted."
                    value={offerNotes}
                    onChange={(e) => setOfferNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#E5325C]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={offerLoading}
                    className="w-full py-3.5 rounded-2xl bg-[#E5325C] text-white font-bold text-sm hover:bg-[#D4264E] transition-all shadow-md active:scale-98 disabled:opacity-50"
                  >
                    {offerLoading ? 'Transmitting Offer...' : `Submit Offer: ${formatINR(offerAmount)}`}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-2">
                    Your offer will be saved in the Recars Admin Portal for review and response.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Callback Request Modal */}
      {isCallbackModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-[#E5E7EB] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-[#101216]">Request Callback</h3>
              <button onClick={() => setIsCallbackModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            {cbSubmitted ? (
              <div className="py-6 text-center text-xs font-bold text-[#237A52]">
                Callback requested! Our automotive advisor will call you within 15 minutes.
              </div>
            ) : (
              <form onSubmit={handleCallbackSubmit} className="space-y-3">
                <input
                  type="text"
                  placeholder="Your Full Name"
                  required
                  value={cbName}
                  onChange={(e) => setCbName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="10-digit Mobile Number"
                  required
                  value={cbPhone}
                  onChange={(e) => setCbPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#E5325C] text-white font-bold text-xs"
                >
                  Call Me Back
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Mobile Sticky Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E7EB] p-3 flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[10px] text-[#6B7078] block">Recars Price</span>
          <span className="text-base font-black text-[#101216]">{formatINR(car.price)}</span>
        </div>
        <div className="flex items-center gap-2">
          {!isSoldOut && (
            <button
              onClick={() => setIsNegotiateModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-800"
            >
              Negotiate
            </button>
          )}
          <button
            onClick={() => setIsInterestedModalOpen(true)}
            disabled={isSoldOut}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-md ${
              isSoldOut
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#E5325C] text-white'
            }`}
          >
            {isSoldOut ? 'Sold Out' : 'Interested'}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function CarDetailPage(props: PageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center font-bold text-sm text-[#E5325C]">Loading vehicle details...</div>}>
      <CarDetailInner {...props} />
    </Suspense>
  );
}
