'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Car,
  User,
  Phone,
  Mail,
  FileCheck,
  AlertTriangle,
  Award,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Check,
  X,
  HelpCircle,
  MessageSquare,
  Wrench,
  Search,
  BadgeCheck,
  Camera,
  Layers,
  Cpu,
  FileText,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRecarsState } from '@/lib/store';
import { useAuth } from '@/lib/authContext';
import { MAKES, CITIES } from '@/lib/data';
import { PDIBooking, FuelType, TransmissionType } from '@/lib/types';
import { formatINR } from '@/lib/formatters';

const PDI_CHECKLIST_CATEGORIES = [
  {
    id: 'exterior',
    title: 'Exterior & Paint Thickness',
    count: '12 Points',
    icon: Camera,
    items: [
      'Digital paint depth gauge test for secret transit repaints & touchups',
      'Panel gap symmetry verification across bonnet, doors & boot lid',
      'Bumper clip alignment & under-bumper scrape inspection',
      'Door sill scuff inspection and rubber weatherstrip sealing check',
    ],
  },
  {
    id: 'engine',
    title: 'Engine Bay & Mechanicals',
    count: '10 Points',
    icon: Wrench,
    items: [
      'Engine oil, coolant, brake fluid & windshield fluid factory levels',
      'Factory paint-dot torque marks on suspension strut & engine mounts',
      'Battery load & voltage test with OEM serial warranty card match',
      'Inspection for rodent bite marks or wiring insulation exposure in stockyards',
    ],
  },
  {
    id: 'interior',
    title: 'Cabin, Tech & Air Conditioning',
    count: '14 Points',
    icon: Cpu,
    items: [
      'Digital instrument cluster warning lamps & zero-fault diagnostic boot',
      'Air conditioner chilling capacity test and climate blower speed audit',
      'Infotainment touchscreen, Apple CarPlay / Android Auto & all speakers',
      'All power windows, electric mirrors, sunroof seals & anti-pinch safety',
    ],
  },
  {
    id: 'tyres',
    title: 'Tyres, Wheels & Underbody',
    count: '8 Points',
    icon: Layers,
    items: [
      'Tyre manufacturing DOT week & year matching vehicle assembly date',
      'Alloy wheel rim face check for transit loading scrape marks',
      'Spare wheel inspection, correct air pressure & undamaged sidewalls',
      'Jack, toolkit, tow hook, and emergency reflective triangle present',
    ],
  },
  {
    id: 'paperwork',
    title: 'Chassis, VIN & Documentation',
    count: '6 Points',
    icon: FileText,
    items: [
      'Physical chassis punch verification under windshield & driver floor',
      'Chassis & engine number match against Form 21 (Sale Certificate) & Form 22',
      'Odometer verification (confirming vehicle was not driven interstate)',
      'Owner manual, duplicate remote key & OEM accessory verification',
    ],
  },
];

const TIME_SLOTS = [
  'Morning 10:00 AM - 12:00 PM',
  'Afternoon 01:00 PM - 03:00 PM',
  'Evening 03:30 PM - 05:30 PM',
];

const FAQS = [
  {
    q: 'Does the car dealership allow an independent representative to inspect my new car?',
    a: 'Yes, absolutely! As a car buyer, it is your legal consumer right to inspect the vehicle allotted to you before signing RTO Form 20/22 and before the final invoice is billed. Dealerships routinely welcome Recars certified representatives.',
  },
  {
    q: 'When is the best time to book the Pre-Delivery Inspection?',
    a: 'The ideal time is when your car arrives at the dealership showroom or stockyard, BEFORE registration and BEFORE paying the remaining invoice balance. Once the car is registered at the RTO, the chassis is tied to your name and cannot be replaced.',
  },
  {
    q: 'Where will the Recars representative meet me?',
    a: 'Our certified automotive representative arrives directly at your chosen dealership showroom or stockyard at the scheduled time with professional diagnostic tools, paint depth gauges, and the 50-point checklist.',
  },
  {
    q: 'What happens if the representative discovers a defect or transit damage?',
    a: 'Our representative immediately photographs and documents the issue. We provide you with a detailed technical note so you can instruct the dealer to rectify the issue, apply a financial discount, or allocate another fresh vehicle from the manufacturer.',
  },
  {
    q: 'Can I pay the inspection fee at the dealership?',
    a: 'Yes! You can choose "Pay at Dealership / Delivery" to pay our representative directly in person via UPI or cash upon completion of the inspection.',
  },
];

export default function PDIPage() {
  const { selectedCity, changeCity, wishlistIds, addPDIBooking } = useRecarsState();
  const { user } = useAuth();

  // Pricing configuration
  const [standardFee, setStandardFee] = useState<number>(2500);
  const [reportFee, setReportFee] = useState<number>(2499);
  const [selectedPackage, setSelectedPackage] = useState<'Standard PDI' | 'Complete PDI Report'>('Complete PDI Report');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.config?.pdiInspectionFee) {
          setStandardFee(Number(data.config.pdiInspectionFee));
        }
        if (data?.config?.pdiReportFee) {
          setReportFee(Number(data.config.pdiReportFee));
        }
      })
      .catch(() => {});
  }, []);

  const currentFee = selectedPackage === 'Standard PDI' ? standardFee : reportFee;

  // Booking Form State
  const [carMake, setCarMake] = useState('Hyundai');
  const [carModel, setCarModel] = useState('Creta');
  const [carVariant, setCarVariant] = useState('SX (O) 1.5');
  const [fuelType, setFuelType] = useState<FuelType>('Petrol');
  const [transmission, setTransmission] = useState<TransmissionType>('Automatic');
  const [vinOrChassis, setVinOrChassis] = useState('');

  const [city, setCity] = useState(selectedCity || 'Warangal');
  const [dealershipName, setDealershipName] = useState('');
  const [dealershipAddress, setDealershipAddress] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [minDate, setMinDate] = useState('');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState(TIME_SLOTS[0]);

  useEffect(() => {
    const today = new Date();
    setMinDate(today.toISOString().split('T')[0]);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setPreferredDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'Pay on Inspection' | 'Paid Online'>('Pay on Inspection');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<PDIBooking | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !dealershipName || !carMake || !carModel) {
      alert('Please fill in all required fields (Name, Phone, Car Make & Model, and Dealership Name).');
      return;
    }

    setIsSubmitting(true);
    const bookingId = `PDI-${Date.now().toString().slice(-6)}`;
    const newBooking: PDIBooking = {
      id: bookingId,
      customerName,
      customerPhone,
      customerEmail,
      city,
      dealershipName,
      dealershipAddress: dealershipAddress || `${city} Showroom`,
      carMake,
      carModel,
      carVariant,
      fuelType,
      transmission,
      vinOrChassis,
      preferredDate,
      preferredTimeSlot,
      specialInstructions,
      packageType: selectedPackage === 'Standard PDI' ? 'Standard PDI Check (₹2,500)' : 'Complete PDI Report (₹2,499)',
      fee: currentFee,
      paymentStatus,
      status: 'Representative Assigned',
      assignedRepresentative: {
        name: 'K. Rajesh Kumar (Senior Automobile Engineer)',
        phone: '+91 99087 96677',
        badgeId: 'REC-ENG-042',
      },
      createdAt: new Date().toISOString(),
    };

    try {
      addPDIBooking(newBooking);
      setSubmittedBooking(newBooking);
    } catch (err) {
      console.error('Failed to book PDI:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FB] text-[#101216]">
      <Navbar
        selectedCity={selectedCity}
        onSelectCity={changeCity}
        wishlistCount={wishlistIds.length}
      />

      {/* ========================================================
          1. HERO SECTION WITH REPRESENTATIVE VALUE PROPOSITION
      ========================================================= */}
      <section className="relative bg-gradient-to-b from-[#FFF0F3] via-white to-[#F8F9FB] border-b border-gray-200 pt-10 pb-14 sm:pt-14 sm:pb-20 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#E5325C]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E5325C]/30 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#E5325C] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#E5325C]">
                  Showroom & Stockyard Inspection
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#101216] tracking-tight leading-[1.15]">
                New Car Pre-Delivery Inspection <br />
                <span className="text-[#E5325C]">(PDI) Services</span>
              </h1>

              <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#E5325C]/20 shadow-sm space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center font-bold shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-[#101216]">
                    A Certified Representative Will Come Check Your New Car
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#4B525D] leading-relaxed">
                  Book this service and our certified automotive engineer arrives right at your dealership showroom or yard with specialized micrometer paint gauges, diagnostic scanners, and a 50-point checklist to inspect your new car before you sign registration papers and release payment.
                </p>
              </div>

              {/* 4 Quick Key Benefits */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#101216]">
                  <CheckCircle2 className="w-4 h-4 text-[#237A52] shrink-0" />
                  <span>Transit Damage & Repaint Detection</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#101216]">
                  <CheckCircle2 className="w-4 h-4 text-[#237A52] shrink-0" />
                  <span>VIN & Form 22 Physical Match</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#101216]">
                  <CheckCircle2 className="w-4 h-4 text-[#237A52] shrink-0" />
                  <span>Odometer Tampering & Transit Check</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#101216]">
                  <CheckCircle2 className="w-4 h-4 text-[#237A52] shrink-0" />
                  <span>Instant Go / No-Go Decision Report</span>
                </div>
              </div>

              {/* Representative dispatch alert pill */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#book-pdi"
                  className="px-6 py-3.5 rounded-full bg-[#E5325C] text-white text-xs sm:text-sm font-bold hover:bg-[#D4264E] transition-all shadow-md shadow-[#E5325C]/20 inline-flex items-center gap-2"
                >
                  <span>Book Representative for ₹{currentFee}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="https://wa.me/919908796677?text=Hello%20Recars%20Team%2C%20I%20want%20to%20book%20a%20Pre-Delivery%20Inspection%20(PDI)%20for%20my%20new%20car."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3.5 rounded-full bg-white text-[#101216] border border-gray-300 text-xs sm:text-sm font-bold hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-[#237A52]" />
                  <span>WhatsApp PDI Desk</span>
                </a>
              </div>
            </div>

            {/* Right Card: Engineer Dispatch Preview */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-xl space-y-5 relative">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Service Guarantee
                    </span>
                    <h3 className="font-black text-lg text-[#101216]">Showroom Doorstep PDI</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#F0F9F4] text-[#237A52] text-xs font-black border border-[#D1EAD9]">
                    Verified Engineer
                  </span>
                </div>

                {/* Representative card */}
                <div className="p-4 rounded-2xl bg-[#F8F9FB] border border-gray-200 flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E5325C] to-[#FF6B8B] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                    RE
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-sm text-[#101216] truncate">Recars Field Engineer</h4>
                      <BadgeCheck className="w-4 h-4 text-[#E5325C] shrink-0" />
                    </div>
                    <p className="text-[11px] text-[#6B7078]">Comes directly to your showroom with tools</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500 font-medium">
                      <span>• Paint Depth Gauge</span>
                      <span>• OBD-II Scanner</span>
                      <span>• 50-pt Checklist</span>
                    </div>
                  </div>
                </div>

                {/* What happens on booking step */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-[#101216] uppercase tracking-wider">
                    How The Service Works
                  </h5>
                  
                  <div className="space-y-2.5 text-xs text-[#4B525D]">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#FFF0F3] text-[#E5325C] text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </div>
                      <p>You book the PDI with your car model, date, and showroom location.</p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#FFF0F3] text-[#E5325C] text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </div>
                      <p>
                        <strong className="text-[#101216]">Our representative comes to the dealership</strong> at the chosen slot to meet you or inspect on your behalf.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-[#FFF0F3] text-[#E5325C] text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </div>
                      <p>You get an instant Go/No-Go inspection report with high-res photos before paying the dealer or signing Form 20.</p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FFF0F3] border border-[#FFD6DF] text-xs text-[#E5325C] font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Once registered at the RTO, dealer replacement is legally impossible!</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          2. BOOKING FORM SECTION
      ========================================================= */}
      <section id="book-pdi" className="py-12 sm:py-16 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E5325C]">
              Instant Appointment
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#101216]">
              Book Your Showroom Representative
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7078]">
              Fill in your new vehicle details and dealership address. A certified Recars representative will be dispatched for your inspection.
            </p>
          </div>

          {/* If already submitted in current session */}
          {submittedBooking ? (
            <div className="bg-gradient-to-b from-[#F0F9F4] to-white rounded-3xl border-2 border-[#237A52]/30 p-6 sm:p-10 shadow-lg space-y-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#237A52] text-white flex items-center justify-center shadow-lg shadow-[#237A52]/20">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <span className="px-3 py-1 rounded-full bg-[#D1EAD9] text-[#237A52] text-xs font-black uppercase tracking-wider">
                  Booking Confirmed
                </span>
                <h3 className="text-2xl font-black text-[#101216]">
                  Your Pre-Delivery Inspection Is Booked!
                </h3>
                <p className="text-sm font-semibold text-[#237A52] max-w-md">
                  A certified Recars representative will come check your new car at{' '}
                  <span className="underline font-bold text-[#101216]">{submittedBooking.dealershipName}</span> on{' '}
                  <span className="font-bold text-[#101216]">{submittedBooking.preferredDate}</span> ({submittedBooking.preferredTimeSlot}).
                </p>
              </div>

              {/* Booking Summary Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Booking ID</span>
                    <p className="font-mono font-black text-base text-[#101216]">{submittedBooking.id}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Inspection Fee</span>
                    <p className="font-black text-base text-[#E5325C]">₹{submittedBooking.fee}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block font-medium">New Car</span>
                    <span className="font-bold text-[#101216]">
                      {submittedBooking.carMake} {submittedBooking.carModel} ({submittedBooking.carVariant || 'Standard'})
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block font-medium">Dealership Location</span>
                    <span className="font-bold text-[#101216]">
                      {submittedBooking.dealershipName}, {submittedBooking.dealershipAddress}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block font-medium">Customer Details</span>
                    <span className="font-bold text-[#101216]">
                      {submittedBooking.customerName} ({submittedBooking.customerPhone})
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block font-medium">Assigned Representative</span>
                    <span className="font-bold text-[#237A52]">
                      {submittedBooking.assignedRepresentative?.name || 'Engineer Assigned'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 text-[11px] text-gray-600 flex items-center justify-between">
                  <span>Payment Method: <strong>{submittedBooking.paymentStatus}</strong></span>
                  <span className="text-[#237A52] font-bold">Representative Dispatched</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={`https://wa.me/919908796677?text=Hello%20Recars%2C%20I%20have%20booked%20PDI%20${submittedBooking.id}%20for%20my%20new%20${submittedBooking.carMake}%20${submittedBooking.carModel}%20at%20${submittedBooking.dealershipName}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#237A52] text-white text-xs font-bold hover:bg-[#1E6746] transition-colors text-center flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Connect with Representative on WhatsApp</span>
                </a>

                <button
                  onClick={() => setSubmittedBooking(null)}
                  className="py-3 px-6 rounded-xl bg-white border border-gray-300 text-xs font-bold text-[#101216] hover:bg-gray-50 transition-colors"
                >
                  Book Another PDI
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-lg space-y-8">
              
              {/* Package Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  1. Choose Inspection Package
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Standard Package */}
                  <div
                    onClick={() => setSelectedPackage('Standard PDI')}
                    className={`cursor-pointer rounded-2xl p-4 sm:p-5 border-2 transition-all ${
                      selectedPackage === 'Standard PDI'
                        ? 'border-[#E5325C] bg-[#FFF0F3]/30 shadow-sm'
                        : 'border-gray-200 bg-[#F8F9FA] hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-[#101216]">New Car PDI</span>
                      <span className="font-black text-base text-[#E5325C]">₹{standardFee}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3">
                      Complete 50-point physical check: Paint micrometer test, panel gaps, odometer audit, fluids, electricals, and VIN match.
                    </p>
                    <span className="text-[11px] font-bold text-[#E5325C] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Representative on-site visit
                    </span>
                  </div>

                  {/* Complete Report Package */}
                  <div
                    onClick={() => setSelectedPackage('Complete PDI Report')}
                    className={`cursor-pointer rounded-2xl p-4 sm:p-5 border-2 transition-all ${
                      selectedPackage === 'Complete PDI Report'
                        ? 'border-[#E5325C] bg-[#FFF0F3]/30 shadow-sm'
                        : 'border-gray-200 bg-[#F8F9FA] hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-bold text-sm text-[#101216]">Complete PDI Report</span>
                        <span className="ml-2 text-[10px] font-bold bg-[#E5325C] text-white px-2 py-0.5 rounded-full">
                          Special Offer
                        </span>
                      </div>
                      <span className="font-black text-base text-[#E5325C]">₹{reportFee}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3">
                      Includes 50-point checks PLUS computerized OBD-II Engine ECU Diagnostic Scan, battery conductance test, and official complete certified report.
                    </p>
                    <span className="text-[11px] font-bold text-[#E5325C] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Complete digital report & certificate
                    </span>
                  </div>
                </div>
              </div>

              {/* Car Information */}
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                  2. New Car Details
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Make / Brand *</label>
                    <select
                      value={carMake}
                      onChange={(e) => setCarMake(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#E5325C]"
                      required
                    >
                      {MAKES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Model *</label>
                    <input
                      type="text"
                      value={carModel}
                      onChange={(e) => setCarModel(e.target.value)}
                      placeholder="e.g. Creta, Thar, Nexon, Grand Vitara"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#E5325C]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Variant / Trim</label>
                    <input
                      type="text"
                      value={carVariant}
                      onChange={(e) => setCarVariant(e.target.value)}
                      placeholder="e.g. SX (O), Fearless+, AX7L"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#E5325C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Fuel Type</label>
                    <select
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value as FuelType)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#E5325C]"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric (EV)</option>
                      <option value="Hybrid">Strong Hybrid</option>
                      <option value="CNG">CNG</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Transmission</label>
                    <select
                      value={transmission}
                      onChange={(e) => setTransmission(e.target.value as TransmissionType)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#E5325C]"
                    >
                      <option value="Automatic">Automatic / DCT / AT</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      VIN / Chassis No. <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={vinOrChassis}
                      onChange={(e) => setVinOrChassis(e.target.value.toUpperCase())}
                      placeholder="17-digit VIN from booking slip"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs font-mono uppercase focus:outline-none focus:border-[#E5325C]"
                    />
                  </div>
                </div>
              </div>

              {/* Dealership & Appointment Schedule */}
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                  3. Dealership Location & Appointment
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">City *</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#E5325C]"
                      required
                    >
                      {CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Dealership / Showroom Name *</label>
                    <input
                      type="text"
                      value={dealershipName}
                      onChange={(e) => setDealershipName(e.target.value)}
                      placeholder="e.g. Neon Hyundai, Kalyani Motors, Varun Motors"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#E5325C]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Showroom or Stockyard Address / Area *
                  </label>
                  <input
                    type="text"
                    value={dealershipAddress}
                    onChange={(e) => setDealershipAddress(e.target.value)}
                    placeholder="e.g. Naimnagar Bypass Road, Hanamkonda / Kazipet Showroom"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#E5325C]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Preferred Inspection Date *</label>
                    <input
                      type="date"
                      min={minDate || undefined}
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#E5325C]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Preferred Time Slot *</label>
                    <select
                      value={preferredTimeSlot}
                      onChange={(e) => setPreferredTimeSlot(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#E5325C]"
                      required
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                  4. Your Contact Details (For Representative Dispatch)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ramesh Reddy"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#E5325C]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Phone (for SMS & WhatsApp) *</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#E5325C]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="ramesh@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs font-semibold focus:outline-none focus:border-[#E5325C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Special Instructions / Dealer Remarks <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. Car is parked in outdoor stockyard; please check driver side door alignment closely."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-gray-200 text-xs font-medium focus:outline-none focus:border-[#E5325C]"
                  />
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div className="p-4 rounded-2xl bg-[#F8F9FB] border border-gray-200 space-y-3">
                <span className="text-xs font-bold text-[#101216] uppercase tracking-wider block">
                  5. Payment Mode
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    paymentStatus === 'Pay on Inspection' ? 'border-[#E5325C] bg-[#FFF0F3]' : 'border-gray-200 bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={paymentStatus === 'Pay on Inspection'}
                      onChange={() => setPaymentStatus('Pay on Inspection')}
                      className="accent-[#E5325C]"
                    />
                    <div>
                      <span className="block text-xs font-bold text-[#101216]">Pay at Dealership to Representative</span>
                      <span className="text-[10px] text-gray-500">Pay via UPI or Cash directly after inspection</span>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    paymentStatus === 'Paid Online' ? 'border-[#E5325C] bg-[#FFF0F3]' : 'border-gray-200 bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMode"
                      checked={paymentStatus === 'Paid Online'}
                      onChange={() => setPaymentStatus('Paid Online')}
                      className="accent-[#E5325C]"
                    />
                    <div>
                      <span className="block text-xs font-bold text-[#101216]">Pay Online (Razorpay / Instant)</span>
                      <span className="text-[10px] text-gray-500">Secure digital confirmation receipt</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-[#E5325C] text-white font-black text-sm hover:bg-[#D4264E] transition-all shadow-lg shadow-[#E5325C]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <span>Confirm Booking & Dispatch Representative (₹{currentFee})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-gray-400 mt-2">
                  No cancellation fee • Flexible rescheduling up to 2 hours before appointment
                </p>
              </div>

            </form>
          )}

        </div>
      </section>

      {/* ========================================================
          3. 50-POINT PDI AUDIT CHECKLIST
      ========================================================= */}
      <section className="py-14 sm:py-20 bg-[#F8F9FB] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E5325C]">
              Engineering Thoroughness
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#101216]">
              What Our Representative Checks
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7078]">
              Dealership stockyards can be unforgiving. Our 50-point audit scrutinizes your vehicle against manufacturing defects, transit scrapes, and odometer anomalies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PDI_CHECKLIST_CATEGORIES.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-3xl border border-gray-200 p-6 space-y-4 hover:border-[#E5325C]/40 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-bold text-[10px]">
                      {cat.count}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-[#101216]">{cat.title}</h3>
                  </div>

                  <ul className="space-y-2.5 text-xs text-[#4B525D]">
                    {cat.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#237A52] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================
          4. WHY BUYERS NEED PDI BEFORE SIGNING FORM 20
      ========================================================= */}
      <section className="py-14 sm:py-20 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E5325C]">
                Consumer Protection
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#101216] leading-snug">
                Why You Need A Representative Before Taking Delivery
              </h2>
              <p className="text-xs sm:text-sm text-[#4B525D] leading-relaxed">
                Buying a brand new car is a major emotional and financial milestone. However, cars travel hundreds of kilometers on transit trailers and sit in open dusty stockyards for weeks before reaching the showroom.
              </p>
              
              <div className="space-y-3 pt-2 text-xs text-[#101216]">
                <div className="p-3.5 rounded-2xl bg-[#FFF0F3] border border-[#FFD6DF] flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#E5325C] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">1 In 7 Cars Suffer Stockyard or Transit Damage</strong>
                    <span className="text-[#6B7078] text-[11px]">
                      Dealerships secretly repaint scratched doors and replace bumpers without informing the customer.
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F0F9F4] border border-[#D1EAD9] flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#237A52] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Total Leverage Before Registration</strong>
                    <span className="text-[#6B7078] text-[11px]">
                      Before registration, you can reject a damaged car or request a fresh chassis allocation from the factory.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Without Recars PDI */}
                <div className="bg-[#FFF8F8] border border-red-200 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                    <X className="w-4 h-4" />
                    <span>Without Independent PDI</span>
                  </div>
                  
                  <ul className="space-y-3 text-xs text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span>Rushed 15-minute showroom handover with sweets & ribbons</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span>Unable to detect repainted panels in dim showroom lighting</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span>No way to know if odometer was disconnected during dealer transit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span>Defects discovered next day are labeled &quot;customer driving damage&quot;</span>
                    </li>
                  </ul>
                </div>

                {/* With Recars PDI */}
                <div className="bg-[#F0F9F4] border border-emerald-200 rounded-3xl p-6 space-y-4 shadow-sm">
                  <div className="flex items-center gap-2 text-[#237A52] font-bold text-sm">
                    <Check className="w-4 h-4" />
                    <span>With Recars PDI Representative</span>
                  </div>
                  
                  <ul className="space-y-3 text-xs text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-[#237A52] font-bold">✓</span>
                      <span>90-minute technical audit with calibrated paint depth gauge</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#237A52] font-bold">✓</span>
                      <span>Representative physically checks chassis punch & Form 22 certificate</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#237A52] font-bold">✓</span>
                      <span>Dealer held accountable for immediate fixes or replacement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#237A52] font-bold">✓</span>
                      <span>100% peace of mind before signing Form 20 or releasing balance funds</span>
                    </li>
                  </ul>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================
          5. FAQ SECTION
      ========================================================= */}
      <section className="py-14 sm:py-20 bg-[#F8F9FB]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E5325C]">
              Common Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#101216]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-[#101216] cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${
                      activeFaq === i ? 'rotate-180 text-[#E5325C]' : ''
                    }`}
                  />
                </button>
                {activeFaq === i && (
                  <div className="px-4 pb-5 sm:px-5 text-xs text-[#4B525D] leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Need help banner */}
          <div className="mt-10 p-6 rounded-3xl bg-white border border-gray-200 text-center space-y-3">
            <h4 className="font-black text-base text-[#101216]">Have Questions About Your Upcoming Delivery?</h4>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Our inspection team is available 7 days a week from 9 AM to 9 PM to answer all showroom queries.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <a
                href="tel:+919908796677"
                className="px-5 py-2.5 rounded-full bg-[#101216] text-white text-xs font-bold hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-[#E5325C]" />
                <span>Call +91 99087 96677</span>
              </a>
              <a
                href="https://wa.me/919908796677?text=Hello%20Recars%20Team%2C%20I%20have%20a%20question%20regarding%20PDI%20service."
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full bg-[#F0F9F4] text-[#237A52] border border-[#D1EAD9] text-xs font-bold hover:bg-[#E2F4EA] transition-colors inline-flex items-center gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
