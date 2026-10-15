'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  MessageSquare,
  Bell,
  Heart,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Check,
  HelpCircle,
  SlidersHorizontal,
  RefreshCw,
  Award,
  HeartHandshake,
  Car,
  Clock,
  Star,
  Building2,
  BadgePercent,
  Banknote,
  FileCheck,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import { MAKES, MODELS_BY_MAKE, CITIES } from '@/lib/data';
import SimpleHeader from '@/components/SimpleHeader';
import SpinnyHero from '@/components/SpinnyHero';
import CarCard from '@/components/CarCard';
import Footer from '@/components/Footer';
import { useRecarsState } from '@/lib/store';

const CATEGORIES = [
  { id: 'New cars', label: 'New cars', filter: 'new' },
  { id: 'EV', label: 'EV', filter: 'Electric' },
  { id: 'Hybrid', label: 'Hybrid', filter: 'Hybrid' },
  { id: 'SUV', label: 'SUV', filter: 'SUV' },
  { id: 'Ute', label: 'Ute', filter: 'MUV' },
  { id: 'Hatch', label: 'Hatch', filter: 'Hatchback' },
  { id: 'Offroad 4x4', label: 'Offroad 4x4', filter: 'SUV' },
  { id: 'Performance', label: 'Performance', filter: 'Luxury' },
];

const FAQS = [
  {
    question: 'What makes Recars different from other pre-owned car platforms?',
    answer:
      'Unlike unverified classifieds or typical used car dealers, Recars inspects every vehicle through 200+ engineering checkpoints. We offer transparent market-guided pricing with online negotiation options, verified vehicle documentation, and complete doorstep RC ownership transfer assistance.'
  },
  {
    question: 'How does the Recars Price Negotiation work?',
    answer:
      'Found a car you love? Use the "Interested" or "Make an Offer" button on any vehicle page to submit your proposed price. Our pricing desk reviews offers against live market data and either accepts or proposes a fair counteroffer in real time.'
  },
  {
    question: 'Are prices fixed or can I bargain?',
    answer:
      'All Recars prices are 100% fixed and transparent. Our algorithmic valuation model analyzes thousands of live market transactions, regional demand, and the car’s exact 200-point condition report to provide the fairest possible price upfront.'
  },
  {
    question: 'How does Recars handle the RC (Registration Certificate) transfer?',
    answer:
      'Our dedicated RTO legal team manages the entire process from police clearance and NOC generation to final ownership endorsement. You get real-time SMS progress tracking and doorstep delivery of your updated RC smartcard.'
  },
  {
    question: 'Can I finance my purchase or exchange my existing car?',
    answer:
      'Yes! We partner with leading financial institutions (HDFC, ICICI, SBI, Axis) to offer instant loan pre-approvals starting from 8.99% p.a. You can also trade in your existing vehicle with instant doorstep valuation and immediate credit.'
  }
];

const REVIEWS = [
  {
    name: 'Rohan Mukherjee',
    city: 'Hyderabad',
    car: '2022 Hyundai Creta SX (O)',
    rating: 5,
    comment: 'The 200-point inspection report was brutally transparent. Every minor scratch was photographed in high resolution. Delivered right to my driveway in Hitec City with a fresh polish and full tank!',
    date: 'Verified Buyer • 2 weeks ago'
  },
  {
    name: 'Priya Sundaram',
    city: 'Bengaluru',
    car: '2021 Honda City ZX CVT',
    rating: 5,
    comment: 'I used to dread buying used cars because of manipulative middlemen. Recars is completely different: transparent pricing guidance, direct online negotiation, and thorough inspection details gave me total peace of mind.',
    date: 'Verified Buyer • 1 month ago'
  },
  {
    name: 'Amitabh Verma',
    city: 'Mumbai',
    car: 'Sold 2020 Kia Seltos GTX+',
    rating: 5,
    comment: 'Sold my Seltos in under 2 hours. The valuation engineer was punctual, very courteous, and the entire payment was transferred to my bank before the car keys were handed over. Highly recommended!',
    date: 'Verified Seller • 3 weeks ago'
  }
];

export default function HomePage() {
  const router = useRouter();
  const { wishlistIds, toggleWishlist, isWishlisted, cars: storeCars } = useRecarsState();
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

  // Search Filters
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedBodyType, setSelectedBodyType] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [condition, setCondition] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Modals & Banners
  const [isCookieBannerVisible, setIsCookieBannerVisible] = useState(true);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');

  // Interactive Content States
  const [howItWorksTab, setHowItWorksTab] = useState<'buy' | 'sell'>('buy');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const availableModels = selectedMake ? MODELS_BY_MAKE[selectedMake] || [] : [];

  const handleClearAll = () => {
    setSelectedMake('');
    setSelectedModel('');
    setSelectedBodyType('');
    setSelectedLocation('');
    setCondition('All');
    setMinPrice('');
    setMaxPrice('');
  };

  // Brand Filter State synced with SpinnyHero
  const [selectedBrand, setSelectedBrand] = useState('All');

  const handleHeroSelectBrand = (brand: string) => {
    setSelectedBrand(brand);
    setTimeout(() => {
      const el = document.getElementById('featured-cars');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);
  };

  const displayedCars = selectedBrand === 'All'
    ? cars.slice(0, 8)
    : cars.filter((c) => {
        const b = selectedBrand.toLowerCase();
        const make = c.make.toLowerCase();
        if (b === 'maruti suzuki' || b === 'maruti') {
          return make.includes('maruti') || make.includes('suzuki');
        }
        return make.includes(b);
      });

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (selectedMake) params.set('make', selectedMake);
    if (selectedModel) params.set('model', selectedModel);
    if (selectedBodyType) params.set('type', selectedBodyType);
    if (selectedLocation) params.set('city', selectedLocation);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    router.push(`/buy?${params.toString()}`);
  };

  const handleCategoryClick = (categoryFilter: string) => {
    router.push(`/buy?type=${encodeURIComponent(categoryFilter)}`);
  };

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      router.push(`/buy?q=${encodeURIComponent(quickQuery.trim())}`);
    } else {
      router.push('/buy');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#101216] font-sans selection:bg-[#E5325C] selection:text-white">
      {/* ========================================================
          1. SIMPLE HEADER (EXACT SCREENSHOT: [S] Recars, Buy Car v, Call us at 727-727-7275)
      ========================================================= */}
      <SimpleHeader />

      {/* ========================================================
          2. SPINNY SELLRIGHT HERO (EXACT SCREENSHOT: SellRight, Headline, Card, Brands, Ambassador)
      ========================================================= */}
      <SpinnyHero
        onSelectBrand={handleHeroSelectBrand}
        selectedBrand={selectedBrand}
      />

      {/* ========================================================
          3. TRENDING PRE-OWNED CARS SECTION
      ========================================================= */}
      <section id="featured-cars" className="bg-[#F8F9FA] py-14 sm:py-16 border-t border-gray-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#E5325C]">
                FEATURED INVENTORY
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#101216] tracking-tight mt-1 flex items-center gap-2.5">
                <span>
                  {selectedBrand === 'All' ? 'Trending Pre-Owned Cars' : `${selectedBrand} Pre-Owned Cars`}
                </span>
                {selectedBrand !== 'All' && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#FFF0F3] text-[#E5325C] border border-[#FFD6DF]">
                    {displayedCars.length} {displayedCars.length === 1 ? 'car available' : 'cars available'}
                  </span>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {selectedBrand === 'All'
                  ? 'Hand-picked verified inventory ready for immediate home delivery'
                  : `Certified 200+ point inspection pre-owned ${selectedBrand} cars`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {selectedBrand !== 'All' && (
                <button
                  onClick={() => setSelectedBrand('All')}
                  className="text-xs font-bold text-gray-500 hover:text-[#E5325C] underline cursor-pointer"
                >
                  Clear Brand Filter
                </button>
              )}
              <Link
                href={selectedBrand === 'All' ? '/buy' : `/buy?make=${encodeURIComponent(selectedBrand)}`}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#E5325C] hover:text-[#D4264E] bg-white px-3.5 py-2 rounded-xl border border-[#E5E7EB] hover:border-[#E5325C] shadow-2xs transition-all"
              >
                <span>{selectedBrand === 'All' ? 'View all cars' : `View all ${selectedBrand} in Marketplace`}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Brand Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
            {['All', 'Hyundai', 'Maruti Suzuki', 'Tata', 'Honda', 'Toyota', 'Mahindra', 'BMW', 'Kia'].map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedBrand.toLowerCase() === brand.toLowerCase()
                    ? 'bg-[#E5325C] text-white shadow-xs'
                    : 'bg-white text-gray-600 hover:text-black hover:border-gray-300 border border-[#E5E7EB]'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>

          {displayedCars.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedCars.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  isWishlisted={isWishlisted(car.id)}
                  onToggleWishlist={toggleWishlist}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-10 text-center space-y-4 shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center mx-auto">
                <Car className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#101216]">
                  Looking for a verified {selectedBrand}?
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                  We have incoming {selectedBrand} vehicles undergoing our 200+ point engineering inspection. Check our full marketplace catalog or reserve early.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <Link
                  href={`/buy?make=${encodeURIComponent(selectedBrand)}`}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#E5325C] hover:bg-[#D4264E] text-white text-xs font-bold transition-all shadow-sm"
                >
                  <span>Explore Marketplace for {selectedBrand}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => setSelectedBrand('All')}
                  className="px-4 py-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
                >
                  Show All Available Cars
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          5. THE RECARS STANDARD — 4 PILLARS OF TRUST
      ========================================================= */}
      <section className="bg-white py-16 sm:py-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F3] border border-[#FFD6DF] text-xs font-bold text-[#E5325C] mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>THE RECARS PROMISE</span>
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#101216] tracking-tight">
              Reinventing How India Buys & Sells Pre-Owned Cars
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-3 leading-relaxed">
              We eliminate the anxiety, hidden flaws, and painful bargaining of traditional car shopping. Every vehicle on Recars is verified by certified engineers and protected by industry-leading warranties.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="bg-[#F8F9FA] rounded-2xl p-6 border border-gray-200 hover:border-[#E5325C]/40 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 text-[#E5325C] flex items-center justify-center mb-5 shadow-2xs group-hover:scale-105 transition-transform">
                <CheckCircle2 className="w-6 h-6 text-[#E5325C]" />
              </div>
              <h3 className="text-lg font-bold text-[#101216] mb-2">
                200+ Point Inspection
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Automotive engineers test cylinder compression, suspension dynamics, OBD-II onboard diagnostics, and verify zero structural flood or accident damage.
              </p>
              <div className="mt-4 pt-4 border-t border-gray-200/60 flex items-center gap-1.5 text-xs font-semibold text-[#E5325C]">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Full inspection report on every car</span>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-[#F8F9FA] rounded-2xl p-6 border border-gray-200 hover:border-[#E5325C]/40 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 text-[#E5325C] flex items-center justify-center mb-5 shadow-2xs group-hover:scale-105 transition-transform">
                <RefreshCw className="w-6 h-6 text-[#E5325C]" />
              </div>
              <h3 className="text-lg font-bold text-[#101216] mb-2">
                Fair Price Negotiations
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Review suggested market price guidance and submit your offer directly online. Transparent counteroffers with mutual agreement.
              </p>
              <div className="mt-4 pt-4 border-t border-gray-200/60 flex items-center gap-1.5 text-xs font-semibold text-[#E5325C]">
                <Award className="w-3.5 h-3.5" />
                <span>Market-Guided Value</span>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-[#F8F9FA] rounded-2xl p-6 border border-gray-200 hover:border-[#E5325C]/40 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 text-[#E5325C] flex items-center justify-center mb-5 shadow-2xs group-hover:scale-105 transition-transform">
                <Award className="w-6 h-6 text-[#E5325C]" />
              </div>
              <h3 className="text-lg font-bold text-[#101216] mb-2">
                Verified Diagnostic Standards
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Every vehicle undergoes technical checks on engine compression, transmission, structural panels, and electrical systems by qualified engineers.
              </p>
              <div className="mt-4 pt-4 border-t border-gray-200/60 flex items-center gap-1.5 text-xs font-semibold text-[#E5325C]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Certified Automotive Report</span>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="bg-[#F8F9FA] rounded-2xl p-6 border border-gray-200 hover:border-[#E5325C]/40 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 text-[#E5325C] flex items-center justify-center mb-5 shadow-2xs group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-6 h-6 text-[#E5325C]" />
              </div>
              <h3 className="text-lg font-bold text-[#101216] mb-2">
                RC Transfer Assistance
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Our in-house legal and RTO operations team assists with legal clearances, transfer documentation, and delivers your updated RC smartcard.
              </p>
              <div className="mt-4 pt-4 border-t border-gray-200/60 flex items-center gap-1.5 text-xs font-semibold text-[#E5325C]">
                <Clock className="w-3.5 h-3.5" />
                <span>Doorstep RTO Documentation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. HOW IT WORKS (INTERACTIVE BUY VS SELL TAB SYSTEM)
      ========================================================= */}
      <section className="bg-[#F8F9FA] py-16 sm:py-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#E5325C]">
                SIMPLE & TRANSPARENT PROCESS
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#101216] tracking-tight mt-1">
                How Recars Works
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl">
                Whether you're shopping for your dream ride or selling your current car, we make the journey effortless.
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="inline-flex p-1.5 bg-white border border-gray-200 rounded-full shadow-2xs">
              <button
                type="button"
                onClick={() => setHowItWorksTab('buy')}
                className={`px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  howItWorksTab === 'buy'
                    ? 'bg-[#E5325C] text-white shadow-xs'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Buying a Car
              </button>
              <button
                type="button"
                onClick={() => setHowItWorksTab('sell')}
                className={`px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  howItWorksTab === 'sell'
                    ? 'bg-[#E5325C] text-white shadow-xs'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Selling a Car
              </button>
            </div>
          </div>

          {/* Buying Steps */}
          {howItWorksTab === 'buy' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-7 border border-gray-200 shadow-2xs relative overflow-hidden group">
                <span className="text-5xl font-black text-gray-100 group-hover:text-blue-50 transition-colors absolute top-5 right-5">
                  01
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center font-bold text-sm mb-5">
                  1
                </div>
                <h3 className="text-lg font-bold text-[#101216] mb-2">
                  Browse & Inspect Online
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Explore high-definition 360° virtual tours, transparent inspection scores, service history, and upfront fixed pricing on every car in our inventory.
                </p>
                <div className="mt-5">
                  <Link href="/buy" className="text-xs font-bold text-[#E5325C] hover:underline inline-flex items-center gap-1">
                    <span>Browse inventory</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-7 border border-gray-200 shadow-2xs relative overflow-hidden group">
                <span className="text-5xl font-black text-gray-100 group-hover:text-blue-50 transition-colors absolute top-5 right-5">
                  02
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center font-bold text-sm mb-5">
                  2
                </div>
                <h3 className="text-lg font-bold text-[#101216] mb-2">
                  Doorstep or Hub Test Drive
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Book a sanitized car delivered right to your home or visit our modern Recars Experience Center. Take as much time as you need with zero pushy sales staff.
                </p>
                <div className="mt-5">
                  <Link href="/why-recars#inspection" className="text-xs font-bold text-[#E5325C] hover:underline inline-flex items-center gap-1">
                    <span>Inspection standards</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-7 border border-gray-200 shadow-2xs relative overflow-hidden group">
                <span className="text-5xl font-black text-gray-100 group-hover:text-blue-50 transition-colors absolute top-5 right-5">
                  03
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center font-bold text-sm mb-5">
                  3
                </div>
                <h3 className="text-lg font-bold text-[#101216] mb-2">
                  Drive Home with Confidence
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Complete seamless paperless payment or quick loan disbursal. Drive away with certified vehicle diagnostics and full legal title assistance.
                </p>
                <div className="mt-5">
                  <Link href="/finance" className="text-xs font-bold text-[#E5325C] hover:underline inline-flex items-center gap-1">
                    <span>Explore car loans</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Selling Steps */}
          {howItWorksTab === 'sell' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-7 border border-gray-200 shadow-2xs relative overflow-hidden group">
                <span className="text-5xl font-black text-gray-100 group-hover:text-blue-50 transition-colors absolute top-5 right-5">
                  01
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center font-bold text-sm mb-5">
                  1
                </div>
                <h3 className="text-lg font-bold text-[#101216] mb-2">
                  Doorstep Inspection Booking
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Tell us about your car and book a physical evaluation at your home or office with transparent inspection service fee (₹499).
                </p>
                <div className="mt-5">
                  <Link href="/sell" className="text-xs font-bold text-[#E5325C] hover:underline inline-flex items-center gap-1">
                    <span>Book inspection</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-7 border border-gray-200 shadow-2xs relative overflow-hidden group">
                <span className="text-5xl font-black text-gray-100 group-hover:text-blue-50 transition-colors absolute top-5 right-5">
                  02
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center font-bold text-sm mb-5">
                  2
                </div>
                <h3 className="text-lg font-bold text-[#101216] mb-2">
                  200+ Point Evaluation
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  A certified automotive engineer conducts thorough mechanical, paint, and OBD diagnostics, delivering our highest competitive purchase offer.
                </p>
                <div className="mt-5">
                  <Link href="/sell" className="text-xs font-bold text-[#E5325C] hover:underline inline-flex items-center gap-1">
                    <span>View evaluation criteria</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-7 border border-gray-200 shadow-2xs relative overflow-hidden group">
                <span className="text-5xl font-black text-gray-100 group-hover:text-blue-50 transition-colors absolute top-5 right-5">
                  03
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center font-bold text-sm mb-5">
                  3
                </div>
                <h3 className="text-lg font-bold text-[#101216] mb-2">
                  Instant Payment & RC Transfer Support
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  Accept our final best offer and receive 100% payment credited directly to your bank account before vehicle handover. We manage all transfer paperwork.
                </p>
                <div className="mt-5">
                  <Link href="/sell" className="text-xs font-bold text-[#E5325C] hover:underline inline-flex items-center gap-1">
                    <span>Sell my car now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ========================================================
          7. SELL YOUR CAR TO RECARS CTA BANNER
      ========================================================= */}
      <section className="bg-white py-14 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-[#E5325C] to-[#004BB5] text-white p-8 sm:p-12 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative overflow-hidden">
            
            {/* Background decorative glow */}
            <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />

            <div className="max-w-2xl relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-3 backdrop-blur-xs">
                <Banknote className="w-3.5 h-3.5" />
                <span>HIGHEST VALUE GUARANTEED</span>
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                Want to Sell Your Car Today? Get up to ₹35,000 More.
              </h2>
              <p className="text-sm sm:text-base text-blue-100 mt-3 leading-relaxed">
                Skip dealer commissions and endless stranger visits. Get a certified doorstep physical evaluation, guaranteed highest price, and instant bank transfer on the spot.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-5 text-xs font-semibold text-white/90">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Doorstep Inspection</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Instant Account Credit</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>RC Legal Transfer Support</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10">
              <Link
                href="/sell"
                className="px-8 py-4 rounded-2xl bg-white text-[#E5325C] hover:bg-gray-100 font-bold text-sm tracking-tight transition-all shadow-md active:scale-98 text-center"
              >
                Sell Your Car (Book Inspection)
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          8. RECARS PHYSICAL HUBS & SHOWROOMS
      ========================================================= */}
      <section className="bg-[#F8F9FA] py-16 sm:py-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#E5325C]">
                PAN-INDIA PRESENCE
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#101216] tracking-tight mt-1">
                Recars Experience Centers
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-xl">
                Prefer to test drive in person? Walk into our modern climate-controlled automotive hubs with test-tracks, customer lounges, and instant loan approvals.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-600">Featured Cities:</span>
              <span className="px-2.5 py-1 rounded-md bg-white border border-gray-200 text-xs font-bold text-gray-800">Hyderabad</span>
              <span className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-300 text-xs font-extrabold text-amber-900 shadow-2xs">⭐ Warangal (Featured)</span>
              <span className="px-2.5 py-1 rounded-md bg-white border border-gray-200 text-xs font-bold text-gray-800">Bengaluru</span>
              <span className="px-2.5 py-1 rounded-md bg-white border border-gray-200 text-xs font-bold text-gray-800">Mumbai</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/buy?city=Hyderabad"
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#E5325C] hover:shadow-lg transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center font-bold mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#101216] group-hover:text-[#E5325C] transition-colors">
                Hyderabad Hub
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Hitec City & Financial District • 160+ cars in stock
              </p>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#E5325C]">
                <span>View Hyderabad inventory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              href="/buy?city=Warangal"
              className="bg-gradient-to-b from-amber-50/50 to-white rounded-2xl p-6 border-2 border-amber-300 hover:border-amber-500 hover:shadow-lg transition-all group relative overflow-hidden"
            >
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 text-[10px] font-black uppercase tracking-wider">
                Featured
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#101216] group-hover:text-amber-700 transition-colors flex items-center gap-1.5">
                <span>Warangal Hub</span>
                <span>⭐</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Hanamkonda & Kazipet • Verified inventory & doorstep service
              </p>
              <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between text-xs font-semibold text-amber-700">
                <span>View Warangal inventory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              href="/buy?city=Bengaluru"
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#E5325C] hover:shadow-lg transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center font-bold mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#101216] group-hover:text-[#E5325C] transition-colors">
                Bengaluru Hub
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Koramangala & Whitefield Tech Zone • 210+ cars in stock
              </p>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#E5325C]">
                <span>View Bengaluru inventory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              href="/buy?city=Mumbai"
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#E5325C] hover:shadow-lg transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center font-bold mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#101216] group-hover:text-[#E5325C] transition-colors">
                Mumbai Hub
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Andheri West & BKC Annex • 185+ cars in stock
              </p>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#E5325C]">
                <span>View Mumbai inventory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              href="/buy?city=Delhi%20NCR"
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-[#E5325C] hover:shadow-lg transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center font-bold mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-[#101216] group-hover:text-[#E5325C] transition-colors">
                Delhi NCR Hub
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Cyber City & Sector 29 Gurugram • 240+ cars in stock
              </p>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#E5325C]">
                <span>View NCR inventory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          9. VERIFIED CUSTOMER REVIEWS
      ========================================================= */}
      <section className="bg-white py-16 sm:py-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="flex items-center justify-center gap-1 text-amber-500 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#101216] tracking-tight">
              Loved by 50,000+ Verified Car Buyers & Sellers
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              Read authentic feedback from drivers who discovered a stress-free automotive experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((rev, idx) => (
              <div
                key={idx}
                className="bg-[#F8F9FA] rounded-2xl p-6 border border-gray-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500">{rev.date}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic mb-6">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#101216]">{rev.name}</h4>
                    <p className="text-xs text-gray-500">{rev.car} • {rev.city}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F9F4] text-[#237A52] border border-[#D1EAD9]">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                    <span>Verified</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          10. FREQUENTLY ASKED QUESTIONS (ACCORDION)
      ========================================================= */}
      <section className="bg-[#F8F9FA] py-16 sm:py-20 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E5325C]">
              GOT QUESTIONS?
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#101216] tracking-tight mt-1">
              Frequently Asked Questions About Recars
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              Everything you need to know about our certified inspections, transparent pricing model, ownership verification, and vehicle purchasing.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#101216] hover:text-[#E5325C] transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#E5325C] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3 animate-in fade-in duration-150">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          11. FOOTER
      ========================================================= */}
      <Footer />

      {/* ========================================================
          6. COOKIE / PRIVACY BANNER NOTICE (MATCHING SCREENSHOT)
      ========================================================= */}
      {isCookieBannerVisible && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-[#F1F3F5] border-t border-gray-300 p-2.5 sm:p-4 shadow-xl">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-center justify-between gap-3">
            <p className="text-[11px] sm:text-xs text-gray-700 leading-snug max-w-5xl">
              We use cookies to personalise and improve your experience on Recars. See our{' '}
              <a href="#" className="text-[#E5325C] underline font-semibold">
                Policy
              </a>
              .
            </p>
            <button
              onClick={() => setIsCookieBannerVisible(false)}
              className="p-1 rounded-full hover:bg-gray-200 text-gray-600 transition-colors flex-shrink-0 cursor-pointer"
              aria-label="Dismiss cookie notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          7. AI ASSISTANT MODAL ("Ask Recars AI")
      ========================================================= */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsAiModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#E5325C] text-white flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  Ask Recars AI
                </h3>
                <p className="text-xs text-gray-500">
                  Describe what you're looking for in your next car
                </p>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. I need a fuel-efficient compact SUV for daily highway commute with high ground clearance under ₹12 Lakh..."
                rows={4}
                className="w-full p-3.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:border-[#E5325C] focus:bg-white focus:ring-1 focus:ring-[#E5325C]"
              />

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Powered by 200+ point verified database</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsAiModalOpen(false);
                    router.push('/buy');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#E5325C] hover:bg-[#D4264E] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Find Matching Cars
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
