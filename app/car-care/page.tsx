'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Sparkles,
  Droplets,
  Layers,
  Wrench,
  CheckCircle2,
  Calendar,
  Phone,
  User,
  Car,
  MapPin,
  Clock,
  ArrowRight,
  ChevronDown,
  AlertCircle,
  FileText,
  BadgeCheck,
  Check,
  Send,
  MessageCircle,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRecarsState } from '@/lib/store';
import { useAuth } from '@/lib/authContext';
import { MAKES, CITIES } from '@/lib/data';
import { CarCareServiceType } from '@/lib/types';

interface ServiceCardInfo {
  id: CarCareServiceType;
  title: string;
  badge: string;
  tagline: string;
  description: string;
  benefits: string[];
  specs: { label: string; value: string }[];
  highlight: string;
}

const SERVICES: ServiceCardInfo[] = [
  {
    id: 'Paint Protection Film (PPF)',
    title: 'Paint Protection Film (PPF)',
    badge: 'Ultimate Armor',
    tagline: 'Self-healing TPU film protecting against stone chips, scratches & road debris.',
    description:
      'High-grade Thermoplastic Polyurethane (TPU) transparent film engineered with instant self-healing technology. Absorbs gravel impacts, branch scratches, key marks, and acid rains while retaining a pristine showroom gloss.',
    benefits: [
      'Micro-scratch self-healing under direct sunlight or warm water',
      'Shields against highway stone chips, gravel & physical abrasion',
      'Anti-yellowing & UV resistant with zero orange-peel haze',
      'Available in Ultra Gloss or Sleek Satin Matte finishes',
      'Preserves original OEM factory paint resale value',
    ],
    specs: [
      { label: 'Film Material', value: '180–200 Micron TPU' },
      { label: 'Technology', value: 'Self-Healing Heat Memory' },
      { label: 'Durability', value: '5 to 10 Year Warranty' },
    ],
    highlight: 'Recommended for new vehicles, luxury sedans, and high-speed highway drivers.',
  },
  {
    id: 'Ceramic Coating',
    title: 'Ceramic Coating (9H / 10H)',
    badge: 'Hydrophobic Glass Shield',
    tagline: 'Permanent nano-ceramic crystalline bond delivering deep mirror gloss & repelling water.',
    description:
      'Liquid nano-ceramic polymers chemically cross-link into your vehicle’s clear coat. Creates an ultra-hydrophobic contact angle that repels water beads, mud, brake dust, bird droppings, and UV oxidation with minimum wash effort.',
    benefits: [
      'Unmatched mirror reflection with candy-gloss aesthetic depth',
      'Super-hydrophobic lotus effect — water and dirt glide right off',
      'Chemical & bird-dropping etch resistance (pH 2 to pH 12)',
      'Blocks UV oxidation that turns car paint dull and chalky',
      'Reduces washing frequency by up to 60%',
    ],
    specs: [
      { label: 'Hardness Level', value: 'True 9H / 10H Pencil Hardness' },
      { label: 'Coating Layers', value: 'Base Nano + Hydrophobic Top' },
      { label: 'Durability', value: '2 to 5 Year Protection' },
    ],
    highlight: 'Ideal for daily city commuters wanting low-maintenance, dazzling mirror reflections.',
  },
  {
    id: 'Teflon Coating',
    title: 'Teflon Coating & Paint Sealant',
    badge: 'Gloss Booster',
    tagline: 'Synthetic fluoropolymer treatment filling micro-swirls for smooth, silky finish.',
    description:
      'High-grade Polytetrafluoroethylene (PTFE) synthetic sealant bond that forms an invisible non-stick film over the vehicle body. Smooths out minor hairline swirls, removes surface road grime, and restores slick paint smoothness.',
    benefits: [
      'Fills microscopic paint pores and masks hairline swirl marks',
      'Non-stick slippery surface prevents dust and road grease adhesion',
      'Quick application turnaround — ready in just a few hours',
      'Protects against industrial fallout, smoke, and moisture',
      'Cost-effective periodic detailing treatment for all cars',
    ],
    specs: [
      { label: 'Composition', value: 'Synthetic Fluoropolymer (PTFE)' },
      { label: 'Process', value: '3-Step Machine Compound + Seal' },
      { label: 'Durability', value: '6 to 12 Months' },
    ],
    highlight: 'Great value seasonal refresh before monsoon or festive family journeys.',
  },
  {
    id: 'Anti-Rust Treatment',
    title: 'Anti-Rust & Underbody Coating',
    badge: 'Chassis Shield',
    tagline: 'Thick rubberized bitumen and silencer zinc barrier preventing undercarriage corrosion.',
    description:
      'Heavy-duty rubberized bitumen coating sprayed across the floor pan, wheel wells, and subframe chassis, combined with high-temperature zinc protection for exhaust mufflers. Shields against water-logging, monsoon mud, gravel blasts, and road salt.',
    benefits: [
      'Prevents structural chassis rusting and metal pinhole perforation',
      'Dampens road vibrations, wheel tire roar, and underfloor cabin noise',
      'Heat-resistant zinc coating shields hot exhaust silencer from rust',
      'Essential protection against monsoon waterlogged roads',
      'Inspected and reapplied annually for complete peace of mind',
    ],
    specs: [
      { label: 'Coating Base', value: 'Rubberized Bitumen & Silencer Zinc' },
      { label: 'Coverage', value: 'Floor Pan, Arches, Silencer' },
      { label: 'Acoustics', value: 'Noticeable NVH Sound Dampening' },
    ],
    highlight: 'Must-have for coastal regions, monsoon seasons, and low-ground-clearance vehicles.',
  },
];

export default function CarCarePage() {
  const { selectedCity, changeCity, wishlistIds } = useRecarsState();
  const { user } = useAuth();

  // Enquiry Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [mobileNumber, setMobileNumber] = useState(user?.phone || '');
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState<string>('2024');
  const [selectedServices, setSelectedServices] = useState<CarCareServiceType[]>([
    'Paint Protection Film (PPF)',
  ]);
  const [preferredLocation, setPreferredLocation] = useState(selectedCity || 'Warangal');
  const [preferredDate, setPreferredDate] = useState('');
  const [minDate, setMinDate] = useState('');
  const [additionalRequirements, setAdditionalRequirements] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setMinDate(new Date().toISOString().split('T')[0]);
  }, []);

  const toggleService = (service: CarCareServiceType) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? (prev.length > 1 ? prev.filter((s) => s !== service) : prev) : [...prev, service]
    );
  };

  const handleQuickEnquireService = (service: CarCareServiceType) => {
    if (!selectedServices.includes(service)) {
      setSelectedServices((prev) => [...prev, service]);
    }
    const formElement = document.getElementById('enquiry-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validation
    const cleanPhone = mobileNumber.replace(/\D/g, '');
    if (!fullName.trim()) {
      setSubmitError('Please enter your full name.');
      return;
    }
    if (cleanPhone.length < 10) {
      setSubmitError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!vehicleBrand.trim() || !vehicleModel.trim()) {
      setSubmitError('Please specify your vehicle make and model.');
      return;
    }
    if (selectedServices.length === 0) {
      setSubmitError('Please select at least one car care service.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/car-care', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          mobileNumber: cleanPhone.slice(-10),
          vehicleBrand: vehicleBrand.trim(),
          vehicleModel: vehicleModel.trim(),
          vehicleYear: vehicleYear ? parseInt(vehicleYear, 10) : undefined,
          services: selectedServices,
          preferredLocation: preferredLocation.trim(),
          preferredDate: preferredDate || undefined,
          additionalRequirements: additionalRequirements.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit enquiry. Please try again.');
      }

      setSubmittedRef(data.enquiryId ? `RC-CC-${data.enquiryId.slice(0, 8).toUpperCase()}` : 'CONFIRMED');
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      <Navbar
        selectedCity={selectedCity}
        onSelectCity={changeCity}
        wishlistCount={wishlistIds.length}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#101216] via-[#1A1D24] to-[#24262A] text-white pt-16 pb-20 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#E5325C]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-rose-300">
                <Sparkles className="w-3.5 h-3.5 text-[#E5325C]" />
                <span>Recars Pro Studio • Vehicle Protection & Detailing</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Preserve Showroom Shine. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E5325C] via-rose-400 to-amber-300">
                  Protect Every Single Layer.
                </span>
              </h1>

              <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                Shield your car from Indian road gravel, scratch swirls, harsh UV radiation, and monsoon rust.
                Get certified self-healing PPF, 9H ceramic glass coats, PTFE Teflon, and underbody anti-rust treatments executed with clean-room precision.
              </p>

              {/* Service Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {[
                  { name: 'Self-Healing PPF', desc: 'Stone-chip armor' },
                  { name: '9H Ceramic Coat', desc: 'Candy glass gloss' },
                  { name: 'PTFE Teflon Seal', desc: 'Swirl elimination' },
                  { name: 'Underbody Rust', desc: 'Chassis protection' },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#E5325C]/50 transition-colors"
                  >
                    <p className="text-xs font-bold text-white">{item.name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* Quick Action CTA */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#enquiry-form"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-[#E5325C] hover:bg-[#D4264E] text-white transition-all shadow-lg shadow-[#E5325C]/25"
                >
                  <span>Request Custom Quote</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="https://wa.me/919908796677?text=Hi%20Recars,%20I%20want%20a%20quotation%20for%20Car%20Care%20and%20PPF%20services"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-xs text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp Detailing Desk</span>
                </a>
              </div>
            </div>

            {/* Hero Quick Stat Card */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-rose-300">Recars Promise</p>
                    <h3 className="text-lg font-bold text-white">Trust Every Drive</h3>
                  </div>
                  <BadgeCheck className="w-8 h-8 text-[#E5325C]" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white">Zero Paint Orange Peel</p>
                      <p className="text-[11px] text-gray-300">
                        Optically pure, bubble-free installation with temperature-controlled cure rooms.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white">Authentic Formulations</p>
                      <p className="text-[11px] text-gray-300">
                        100% genuine imported ceramic resins and virgin TPU films with manufacturer warranty cards.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white">Tailored Quotations</p>
                      <p className="text-[11px] text-gray-300">
                        Custom quotes based on exact vehicle size, paint condition, and chosen package.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-gray-300">
                  <span>Authorized Recars Studio</span>
                  <span className="font-bold text-white">Warangal Hub & Doorstep</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#E5325C]">Precision Protection</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#101216] mt-1">
            Choose Your Vehicle Protection Package
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Every vehicle has unique protection needs. Review our specialized services below and request an exact quotation for your vehicle model.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SERVICES.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6 sm:p-8 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FFF0F3] text-[#E5325C] border border-[#FFD6DF]">
                      {service.badge}
                    </span>
                    <h3 className="text-xl font-extrabold text-[#101216] mt-2 group-hover:text-[#E5325C] transition-colors">
                      {service.title}
                    </h3>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 group-hover:bg-[#FFF0F3] transition-colors">
                    {service.id.includes('PPF') ? (
                      <Shield className="w-6 h-6 text-[#E5325C]" />
                    ) : service.id.includes('Ceramic') ? (
                      <Sparkles className="w-6 h-6 text-[#E5325C]" />
                    ) : service.id.includes('Teflon') ? (
                      <Droplets className="w-6 h-6 text-[#E5325C]" />
                    ) : (
                      <Wrench className="w-6 h-6 text-[#E5325C]" />
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {service.description}
                </p>

                {/* Specs Pill Matrix */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-100 bg-[#FBFBFC] rounded-xl px-3">
                  {service.specs.map((spec) => (
                    <div key={spec.label} className="text-center">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase">{spec.label}</p>
                      <p className="text-xs font-bold text-[#101216] mt-0.5">{spec.value}</p>
                    </div>
                  ))}
                </div>

                {/* Key Benefits */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-[#101216] uppercase tracking-wider">Key Benefits:</p>
                  <ul className="space-y-2">
                    {service.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-700">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 font-medium">
                  💡 {service.highlight}
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium">Custom Quote Available</span>
                <button
                  type="button"
                  onClick={() => handleQuickEnquireService(service.id)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#101216] hover:bg-[#E5325C] text-white transition-colors"
                >
                  <span>Select for Quote</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Enquiry Form Section */}
      <section id="enquiry-form" className="py-16 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#F8F9FA] border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-sm">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#FFF0F3] text-[#E5325C]">
                Get Official Quotation
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101216] mt-2">
                Request a Car Care Quotation
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Fill in your car details and our detailing advisors will share a transparent, no-obligation quotation tailored to your car.
              </p>
            </div>

            {submittedRef ? (
              <div className="bg-white rounded-2xl p-8 border border-emerald-200 text-center space-y-4 shadow-sm animate-in fade-in duration-200">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-extrabold text-[#101216]">Enquiry Submitted Successfully!</h3>
                <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                  Thank you, <span className="font-bold text-[#101216]">{fullName}</span>. Your enquiry reference number is{' '}
                  <span className="font-mono font-bold text-[#E5325C]">{submittedRef}</span>.
                  Our detailing specialist will call you shortly on{' '}
                  <span className="font-semibold text-[#101216]">+91 {mobileNumber}</span> with full package pricing and appointment slots.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedRef(null);
                      setAdditionalRequirements('');
                    }}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold border border-gray-200 hover:border-gray-400 bg-white text-gray-700 transition-colors"
                  >
                    Submit Another Enquiry
                  </button>
                  <a
                    href={`https://wa.me/919908796677?text=Hi%20Recars,%20I%20just%20submitted%20Car%20Care%20enquiry%20${submittedRef}%20for%20my%20${encodeURIComponent(
                      vehicleBrand + ' ' + vehicleModel
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Track on WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {submitError && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Service Selection Checkboxes */}
                <div>
                  <label className="block text-xs font-bold text-[#101216] uppercase tracking-wider mb-2">
                    Services Required (Select one or more) <span className="text-[#E5325C]">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SERVICES.map((s) => {
                      const isChecked = selectedServices.includes(s.id);
                      return (
                        <div
                          key={s.id}
                          onClick={() => toggleService(s.id)}
                          className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                            isChecked
                              ? 'bg-rose-50/60 border-[#E5325C] shadow-xs'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="w-4 h-4 text-[#E5325C] rounded border-gray-300 focus:ring-[#E5325C] mt-0.5 pointer-events-none"
                          />
                          <div className="text-left">
                            <p className="text-xs font-bold text-[#101216]">{s.title}</p>
                            <p className="text-[11px] text-gray-500 line-clamp-1">{s.tagline}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#101216] mb-1.5">
                      Full Name <span className="text-[#E5325C]">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#101216] focus:outline-none focus:border-[#E5325C]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#101216] mb-1.5">
                      Mobile Number <span className="text-[#E5325C]">*</span>
                    </label>
                    <div className="relative">
                      <span className="text-xs font-bold text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="98765 43210"
                        className="w-full pl-12 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#101216] focus:outline-none focus:border-[#E5325C]"
                      />
                    </div>
                  </div>
                </div>

                {/* Vehicle Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#101216] mb-1.5">
                      Vehicle Brand <span className="text-[#E5325C]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        list="brand-list"
                        value={vehicleBrand}
                        onChange={(e) => setVehicleBrand(e.target.value)}
                        placeholder="e.g. Hyundai, Tata, Kia"
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#101216] focus:outline-none focus:border-[#E5325C]"
                      />
                      <datalist id="brand-list">
                        {MAKES.map((m) => (
                          <option key={m} value={m} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#101216] mb-1.5">
                      Vehicle Model <span className="text-[#E5325C]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="e.g. Creta, Harrier, Seltos"
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#101216] focus:outline-none focus:border-[#E5325C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#101216] mb-1.5">
                      Manufacturing Year
                    </label>
                    <select
                      value={vehicleYear}
                      onChange={(e) => setVehicleYear(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#101216] focus:outline-none focus:border-[#E5325C]"
                    >
                      {Array.from({ length: 15 }, (_, i) => 2026 - i).map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location and Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#101216] mb-1.5">
                      Preferred Service Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={preferredLocation}
                        onChange={(e) => setPreferredLocation(e.target.value)}
                        placeholder="e.g. Warangal Studio / Hanamkonda Doorstep"
                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#101216] focus:outline-none focus:border-[#E5325C]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#101216] mb-1.5">
                      Preferred Date (Optional)
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        min={minDate || undefined}
                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#101216] focus:outline-none focus:border-[#E5325C]"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-semibold text-[#101216] mb-1.5">
                    Additional Requirements or Questions
                  </label>
                  <textarea
                    rows={3}
                    value={additionalRequirements}
                    onChange={(e) => setAdditionalRequirements(e.target.value)}
                    placeholder="e.g. Matte finish PPF preference, doorstep pick-up inquiry, deep scratch inspection..."
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#101216] focus:outline-none focus:border-[#E5325C]"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-[#E5325C] hover:bg-[#D4264E] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Enquiry • Get Quotation</span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-gray-500 text-center mt-2.5">
                    🔒 No spam. Our team will verify car specifications and send official quotation via WhatsApp & Call.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Section */}
      <section className="py-14 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-200/70">
              <div className="p-3 rounded-xl bg-[#FFF0F3] text-[#E5325C] shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#101216]">Zero Risk Workmanship</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Experienced technicians trained on luxury clear-coats with edge-wrapping techniques for seamless, invisible edges.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-200/70">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#101216]">Transparent Turnaround</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Accurate time estimates. Fast Teflon turnaround in 3 hours, ceramic curing in 24 hours, and full PPF in 48 hours.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-200/70">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <BadgeCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#101216]">Warranty Backed</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Every PPF and Ceramic job includes a digital warranty card with periodic complimentary inspection checkups.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
