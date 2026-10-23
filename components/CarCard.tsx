'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Check, ShieldCheck, ArrowRight, MapPin } from 'lucide-react';
import { Car } from '@/lib/types';
import { formatINR, formatKM } from '@/lib/formatters';
import { computeCarRibbons, getRibbonColorStyles } from '@/lib/ribbons';

interface CarCardProps {
  car: Car;
  isWishlisted: boolean;
  onToggleWishlist: (carId: string) => void;
}

export default function CarCard({ car, isWishlisted, onToggleWishlist }: CarCardProps) {
  const activeRibbons = computeCarRibbons(car, (car as any).viewsCount);
  const isSoldOut = car.availabilityStatus === 'Sold Out';

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-[#E5325C]/40 transition-all duration-300 flex flex-col relative">
      {/* Image container */}
      <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
        <Link href={`/cars/${car.id}`} className="block w-full h-full">
          <img
            src={car.image}
            alt={`${car.make} ${car.model}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Diagonal Corner Ribbon for Sold Out */}
        {isSoldOut && (
          <div className="absolute -top-1 -right-1 z-30 overflow-hidden w-28 h-28 pointer-events-none">
            <div className="absolute transform rotate-45 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-black text-[10px] tracking-widest py-1.5 right-[-32px] top-[22px] w-[130px] text-center shadow-xl uppercase border-y border-red-300/60 drop-shadow-md">
              SOLD OUT
            </div>
          </div>
        )}

        {/* Top-Left Ribbons / Badges (Max 2 per vehicle card) */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 flex-wrap max-w-[80%]">
          {activeRibbons.length > 0 ? (
            activeRibbons.map((ribbon, idx) => {
              const styles = getRibbonColorStyles(ribbon.color);
              return (
                <span
                  key={`${ribbon.text}-${idx}`}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-md border flex items-center gap-1 ${styles.bg} ${styles.text} ${styles.border}`}
                >
                  {ribbon.isStatus && <span className={`w-1.5 h-1.5 rounded-full ${styles.dot} animate-pulse`} />}
                  <span>{ribbon.text}</span>
                </span>
              );
            })
          ) : (
            <span className="px-2.5 py-1 rounded-md bg-emerald-600/90 backdrop-blur-xs text-[10px] font-extrabold text-white tracking-wide uppercase border border-emerald-400 shadow-sm">
              Available
            </span>
          )}
        </div>

        {isSoldOut && (
          <div className="absolute inset-0 bg-slate-950/20 pointer-events-none" />
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleWishlist(car.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 shadow-sm ${
            isWishlisted
              ? 'bg-[#E5325C] text-white hover:bg-[#D4264E]'
              : 'bg-white/85 text-[#24262A] hover:bg-white hover:text-[#E5325C]'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* City tag on bottom-left of image */}
        <div className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-semibold text-white tracking-wide">
          {car.city}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <Link href={`/cars/${car.id}`} className="block">
          {/* Featured Badge if applicable */}
          {car.featured && (
            <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-[10px] font-bold tracking-wider uppercase font-heading">
                FEATURED
              </span>
            </div>
          )}

          {/* 1. PRICE FIRST */}
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xl sm:text-2xl font-bold text-[#101216] font-price tracking-tight">
              {formatINR(car.price)}
            </span>
            {car.emiPerMonth && (
              <span className="text-[11px] text-[#6B7078] font-body shrink-0">
                EMI from {formatINR(car.emiPerMonth)}/mo
              </span>
            )}
          </div>

          {/* 2. CAR NAME & YEAR */}
          <h3 className="font-bold text-base sm:text-lg text-[#101216] group-hover:text-[#E5325C] transition-colors leading-snug truncate font-heading mt-1">
            {car.make} {car.model} {car.year}
          </h3>

          {/* 3. SPEC BADGES PILLS */}
          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium font-body">
              {car.year}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium font-body">
              {formatKM(car.kilometers)}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium font-body">
              {car.fuelType}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium font-body">
              {car.transmission}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium font-body">
              {car.ownership || '1st Owner'}
            </span>
          </div>

          {/* 4. LOCATION PIN */}
          <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 font-body">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">
              {car.locationArea ? `${car.locationArea}, ${car.city}` : car.city}
            </span>
          </div>
        </Link>

        {/* Badges strip / CTA */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-1 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {car.isVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F0F9F4] text-[#237A52] border border-[#D1EAD9] font-heading">
                <Check className="w-3 h-3 stroke-[2.5]" />
                <span>Verified</span>
              </span>
            )}
            {car.isRecarsSelect && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#FFF0F3] text-[#E5325C] border border-[#FFD6DF] font-heading">
                <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
                <span>Recars Select</span>
              </span>
            )}
          </div>

          {car.availabilityStatus === 'Sold Out' ? (
            <Link
              href={`/cars/${car.id}`}
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 group-hover:translate-x-0.5 transition-all inline-flex items-center gap-0.5 font-heading"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              href={`/cars/${car.id}`}
              className="text-xs font-semibold text-[#E5325C] hover:text-[#D4264E] group-hover:translate-x-0.5 transition-all inline-flex items-center gap-0.5 font-heading"
            >
              <span>Interested</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
