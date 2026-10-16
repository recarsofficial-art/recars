'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Play,
  ChevronRight,
  ChevronLeft,
  Star,
  Quote,
  CheckCircle,
  X,
  ShieldCheck,
} from 'lucide-react';

const REVIEWS_DATA = [
  {
    id: 1,
    name: 'Rahul Sharma',
    city: 'Hanamkonda, Warangal',
    car: 'Sold Hyundai Creta 2021',
    rating: 5,
    date: '2 days ago',
    comment:
      'Got payment in my account within 45 minutes of the inspection! The team handled all RC transfer paperwork without me having to visit the RTO. Truly the best price and smoothest experience.',
    tag: 'Instant Payment Verified',
  },
  {
    id: 2,
    name: 'Pooja Iyer',
    city: 'Kazipet, Warangal',
    car: 'Sold Honda City 2019',
    rating: 5,
    date: '1 week ago',
    comment:
      'The evaluator came right to my apartment basement, checked the car professionally, and offered ₹40,000 more than what local dealers offered. Everything was transparent from start to finish.',
    tag: 'Certified Inspection Verified',
  },
  {
    id: 3,
    name: 'Vikram Mehta',
    city: 'Subedari, Warangal',
    car: 'Sold Maruti Brezza 2020',
    rating: 5,
    date: '2 weeks ago',
    comment:
      'The seller protection policy gave me total peace of mind. Once I handed over the keys, I got an immediate indemnity agreement protecting me until the new RC was issued.',
    tag: 'Seller Protection Assured',
  },
  {
    id: 4,
    name: 'Ananya Reddy',
    city: 'Naimnagar, Warangal',
    car: 'Sold Kia Seltos 2022',
    rating: 5,
    date: '3 weeks ago',
    comment:
      'Super easy process. Filled out the registration number online, got an instant estimate, booked a home slot for the next morning, and by lunch the funds were credited. 10/10 service!',
    tag: 'Same Day Settlement',
  },
];

export default function SellProcessSection() {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const nextReview = () => {
    setCurrentReviewIndex((prev) => (prev + 1) % REVIEWS_DATA.length);
  };

  const prevReview = () => {
    setCurrentReviewIndex((prev) =>
      prev === 0 ? REVIEWS_DATA.length - 1 : prev - 1
    );
  };

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================
            1. SECTION TITLE WITH EXTENDING LINES
        ========================================================= */}
        <div className="relative flex items-center justify-center mb-12 sm:mb-16">
          <div className="hidden sm:block flex-1 border-t border-gray-200" />
          <h2 className="px-4 sm:px-8 text-2xl sm:text-3xl lg:text-[32px] font-black text-[#2A0545] tracking-tight text-center">
            Sell your car for the Best Price
          </h2>
          <div className="hidden sm:block flex-1 border-t border-gray-200" />
        </div>

        {/* ========================================================
            2. 4 PROCESS STEPS WITH CHARMING ILLUSTRATIONS
        ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          
          {/* STEP 1: Let's talk about your car */}
          <div className="flex flex-col items-center text-center group">
            {/* Illustration 1 */}
            <div className="w-40 h-40 flex items-center justify-center mb-4 transition-transform group-hover:scale-105 duration-300">
              <svg viewBox="0 0 160 160" className="w-full h-full" fill="none">
                {/* Background soft glow circle */}
                <circle cx="80" cy="80" r="65" fill="#FAF5FF" />
                {/* Phone screen in hands */}
                <rect x="25" y="45" width="46" height="74" rx="8" fill="#FFFFFF" stroke="#9333EA" strokeWidth="2.5" />
                <rect x="33" y="55" width="30" height="40" rx="4" fill="#F3E8FF" />
                {/* Mini car silhouette on phone */}
                <path d="M37 78 C39 72, 45 68, 52 68 C56 68, 60 72, 61 78 L61 83 H37 Z" fill="#9333EA" />
                <circle cx="43" cy="83" r="2.5" fill="#1E1B4B" />
                <circle cx="55" cy="83" r="2.5" fill="#1E1B4B" />
                {/* Quote pill on phone */}
                <rect x="35" y="88" width="26" height="5" rx="2.5" fill="#10B981" />
                
                {/* Character with purple curly hair */}
                <path d="M72 65 C68 45, 95 35, 110 45 C122 55, 125 75, 120 90 C110 88, 102 85, 95 88 Z" fill="#7C3AED" />
                {/* Face & Arms */}
                <circle cx="95" cy="68" r="16" fill="#FDBA74" />
                {/* Cheerful Expression */}
                <path d="M91 66 C92 68, 94 68, 95 66" stroke="#431407" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M99 66 C100 68, 102 68, 103 66" stroke="#431407" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M93 72 C96 76, 101 76, 103 72" stroke="#EA580C" strokeWidth="1.8" strokeLinecap="round" />
                {/* Sweater with pattern */}
                <path d="M80 84 C85 80, 110 80, 115 84 L125 118 H70 Z" fill="#FFFFFF" stroke="#9333EA" strokeWidth="2" />
                <circle cx="88" cy="95" r="1.5" fill="#EF4444" />
                <circle cx="105" cy="98" r="1.5" fill="#EF4444" />
                <circle cx="96" cy="108" r="1.5" fill="#EF4444" />
                {/* Hands holding phone */}
                <circle cx="68" cy="85" r="6" fill="#FDBA74" />
                <circle cx="70" cy="98" r="5" fill="#FDBA74" />
                {/* Sparkle star */}
                <path d="M125 35 L127 40 L132 42 L127 44 L125 49 L123 44 L118 42 L123 40 Z" fill="#F59E0B" />
              </svg>
            </div>

            <h3 className="text-base sm:text-[17px] font-bold text-[#101216] mb-1.5">
              Let's talk about your car
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed max-w-[240px] mb-3">
              Tell us about your vehicle and schedule a certified doorstep inspection
            </p>
            <Link
              href="/sell"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#7E22CE] hover:text-[#9333EA] transition-colors"
            >
              <span>Book inspection</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* STEP 2: Pick a day */}
          <div className="flex flex-col items-center text-center group">
            {/* Illustration 2 */}
            <div className="w-40 h-40 flex items-center justify-center mb-4 transition-transform group-hover:scale-105 duration-300">
              <svg viewBox="0 0 160 160" className="w-full h-full" fill="none">
                <circle cx="80" cy="80" r="65" fill="#F0FDF4" />
                
                {/* Sleek Car Profile being inspected */}
                <path
                  d="M40 75 C45 68, 65 65, 90 65 C115 65, 135 68, 140 75 L142 88 H38 Z"
                  fill="#E2E8F0"
                  stroke="#64748B"
                  strokeWidth="2"
                />
                <circle cx="58" cy="88" r="8" fill="#1E293B" stroke="#CBD5E1" strokeWidth="2" />
                <circle cx="122" cy="88" r="8" fill="#1E293B" stroke="#CBD5E1" strokeWidth="2" />
                {/* Window */}
                <path d="M62 67 H98 L108 75 H52 Z" fill="#93C5FD" opacity="0.8" />
                
                {/* Inspector from behind looking with magnifying glass */}
                <circle cx="102" cy="65" r="14" fill="#581C87" />
                <path d="M85 80 C88 72, 115 72, 120 80 L125 118 H80 Z" fill="#6B21A8" />
                
                {/* Magnifying Glass held up */}
                <circle cx="68" cy="62" r="12" fill="#E0F2FE" stroke="#F59E0B" strokeWidth="3" />
                <line x1="77" y1="71" x2="88" y2="82" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
                {/* Sparkle in glass */}
                <circle cx="65" cy="58" r="2" fill="#FFFFFF" />
              </svg>
            </div>

            <h3 className="text-base sm:text-[17px] font-bold text-[#101216] mb-1.5">
              Pick a day
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed max-w-[240px] mb-3">
              At home or your nearest Recars Car Hub, for a 200+ point inspection and final best offer. Easy
            </p>
            <Link
              href="/sell"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#7E22CE] hover:text-[#9333EA] transition-colors"
            >
              <span>Schedule free visit</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* STEP 3: Credited, the same day */}
          <div className="flex flex-col items-center text-center group">
            {/* Illustration 3 */}
            <div className="w-40 h-40 flex items-center justify-center mb-4 transition-transform group-hover:scale-105 duration-300">
              <svg viewBox="0 0 160 160" className="w-full h-full" fill="none">
                <circle cx="80" cy="80" r="65" fill="#FEFCE8" />
                
                {/* Floating Gold Rupee Coins */}
                <circle cx="45" cy="60" r="7" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
                <circle cx="40" cy="95" r="9" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
                <circle cx="125" cy="98" r="8" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
                <circle cx="120" cy="55" r="6" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />

                {/* Smartphone with Bank Credit Success */}
                <rect x="42" y="52" width="36" height="58" rx="6" fill="#FFFFFF" stroke="#64748B" strokeWidth="2" />
                <circle cx="60" cy="72" r="8" fill="#10B981" />
                <path d="M56 72 L59 75 L65 69" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="48" y="86" width="24" height="4" rx="2" fill="#10B981" />
                <rect x="52" y="93" width="16" height="3" rx="1.5" fill="#CBD5E1" />

                {/* Relaxed Person with headphones & hands behind head */}
                <path d="M78 48 C72 38, 98 32, 108 42 C114 48, 114 62, 110 70 Z" fill="#7C3AED" />
                <circle cx="95" cy="60" r="14" fill="#FDBA74" />
                {/* Headphones */}
                <path d="M82 60 C82 48, 108 48, 108 60" stroke="#EF4444" strokeWidth="3" fill="none" />
                <rect x="80" y="55" width="4" height="10" rx="2" fill="#EF4444" />
                <rect x="106" y="55" width="4" height="10" rx="2" fill="#EF4444" />
                {/* Happy Face */}
                <path d="M90 60 C92 62, 94 62, 95 60" stroke="#431407" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M97 60 C99 62, 101 62, 102 60" stroke="#431407" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M92 67 C95 70, 99 70, 101 67" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
                {/* Shirt & Relaxed Arms */}
                <path d="M80 75 C75 90, 85 115, 95 118 L115 118 C120 100, 115 80, 105 75 Z" fill="#FFFFFF" stroke="#9333EA" strokeWidth="2" />
                <path d="M72 82 C82 72, 85 85, 90 88" stroke="#FDBA74" strokeWidth="6" strokeLinecap="round" />
                <path d="M118 82 C108 72, 105 85, 100 88" stroke="#FDBA74" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </div>

            <h3 className="text-base sm:text-[17px] font-bold text-[#101216] mb-1.5">
              Credited, the same day
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed max-w-[240px] mb-3">
              Complete payment and paperwork on-the-spot
            </p>
            <Link
              href="/sell"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#7E22CE] hover:text-[#9333EA] transition-colors"
            >
              <span>Sell car</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* STEP 4: Sit back, relax. Car in Transit */}
          <div className="flex flex-col items-center text-center group">
            {/* Illustration 4 */}
            <div className="w-40 h-40 flex items-center justify-center mb-4 transition-transform group-hover:scale-105 duration-300">
              <svg viewBox="0 0 160 160" className="w-full h-full" fill="none">
                <circle cx="80" cy="80" r="65" fill="#F0FDF4" />
                
                {/* Large Green Hexagonal Shield in background */}
                <polygon
                  points="80,25 125,45 125,95 80,125 35,95 35,45"
                  fill="#ECFDF5"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />

                {/* Sparkling Stars around shield */}
                <path d="M125 35 L127 40 L132 42 L127 44 L125 49 L123 44 L118 42 L123 40 Z" fill="#F59E0B" />
                <path d="M38 75 L39 78 L42 79 L39 80 L38 83 L37 80 L34 79 L37 78 Z" fill="#F59E0B" />
                <path d="M120 105 L121 108 L124 109 L121 110 L120 113 L119 110 L116 109 L119 108 Z" fill="#F59E0B" />

                {/* Meditating Character in Lotus Pose */}
                <path d="M68 50 C65 35, 95 35, 95 45 C102 52, 102 65, 95 72 Z" fill="#7C3AED" />
                <circle cx="80" cy="58" r="13" fill="#FDBA74" />
                {/* Peaceful eyes & smile */}
                <path d="M75 58 C77 60, 79 60, 80 58" stroke="#431407" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M82 58 C84 60, 86 60, 87 58" stroke="#431407" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M78 64 C80 66, 83 66, 85 64" stroke="#EA580C" strokeWidth="1.8" strokeLinecap="round" />
                {/* Orange meditation robe */}
                <path d="M70 72 C65 85, 75 105, 80 108 C85 105, 95 85, 90 72 Z" fill="#EA580C" />
                {/* Crossed legs with purple pants */}
                <path d="M52 105 C60 92, 100 92, 108 105 C102 112, 58 112, 52 105 Z" fill="#4C1D95" />
                {/* Meditating hands resting on knees */}
                <circle cx="56" cy="100" r="4.5" fill="#FDBA74" />
                <circle cx="104" cy="100" r="4.5" fill="#FDBA74" />
              </svg>
            </div>

            <h3 className="text-base sm:text-[17px] font-bold text-[#101216] mb-1.5">
              Sit back, relax. Car in Transit
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed max-w-[240px] mb-3">
              Our seller protection policy ensures that you're protected from any liabilities until your RC transfer is completed
            </p>
            <Link
              href="/sell"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#7E22CE] hover:text-[#9333EA] transition-colors"
            >
              <span>Sell car</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

        {/* ========================================================
            3. ACTIONS: "WATCH HOW IT WORKS" & "LEARN MORE"
        ========================================================= */}
        <div className="flex flex-col items-center justify-center mt-12 sm:mt-16 gap-3">
          <button
            onClick={() => setIsVideoModalOpen(true)}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#5B1082] hover:bg-[#4C0B6E] active:scale-98 text-white font-extrabold text-sm tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <span>Watch how it works</span>
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <Play className="w-3 h-3 fill-white text-white ml-0.5" />
            </div>
          </button>

          <Link
            href="/why-recars#process"
            className="inline-flex items-center gap-1 text-sm font-bold text-[#5B1082] hover:text-[#7C3AED] transition-colors py-1"
          >
            <span>Learn More</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ========================================================
            4. USER REVIEWS & RATINGS SECTION (WITH SLIDER ARROWS)
        ========================================================= */}
        <div className="mt-20 sm:mt-28">
          <div className="relative flex items-center justify-between mb-8 sm:mb-12">
            <div className="hidden sm:block flex-1 border-t border-gray-200 mr-6" />
            <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#2A0545] tracking-tight whitespace-nowrap">
              User Reviews & Ratings
            </h2>
            <div className="hidden sm:block flex-1 border-t border-gray-200 ml-6" />

            {/* Slider Navigation Arrows matching screenshot */}
            <div className="flex items-center gap-2 pl-4">
              <button
                onClick={prevReview}
                aria-label="Previous review"
                className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#5B1082] text-gray-700 hover:text-[#5B1082] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextReview}
                aria-label="Next review"
                className="w-8 h-8 rounded-full border border-gray-300 hover:border-[#5B1082] text-gray-700 hover:text-[#5B1082] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Testimonial Cards Carousel Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {REVIEWS_DATA.map((rev, idx) => (
              <div
                key={rev.id}
                className={`bg-[#FAFAF8] rounded-2xl p-6 border border-gray-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${
                  idx === currentReviewIndex ? 'ring-2 ring-[#5B1082]/20' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-[#F59E0B]">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {rev.date}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed mb-4 italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-200/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#101216]">
                        {rev.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium">
                        {rev.car} • {rev.city}
                      </p>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* ========================================================
          VIDEO MODAL (HOW IT WORKS)
      ========================================================= */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#5B1082] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
                <Play className="w-6 h-6 fill-white ml-0.5" />
              </div>
              <h3 className="text-2xl font-black text-[#101216]">
                How Recars Car Selling Works
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                From doorstep inspection to instant bank credit in 3 simple steps
              </p>
            </div>

            {/* Video Mockup Frame */}
            <div className="aspect-video bg-[#101216] rounded-2xl overflow-hidden relative flex items-center justify-center shadow-inner group">
              <img
                src="/recars-hero-ambassador.jpg"
                alt="Process video preview"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#00F5A0]" />
                  <span className="text-xs font-bold text-[#00F5A0]">
                    Guaranteed Best Price & 100% Free Paperwork
                  </span>
                </div>
                <p className="text-sm font-semibold">
                  See how over 50,000+ car sellers got instant bank transfer with zero dealership hassles.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 transition-colors"
              >
                Close Video
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
