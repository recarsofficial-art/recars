'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Check, ShieldCheck, ArrowRight, MapPin } from 'lucide-react';
import { Car } from '@/lib/types';
import { formatINR, formatKM } from '@/lib/formatters';

interface CarCardProps {
  car: Car;
  isWishlisted: boolean;
  onToggleWishlist: (carId: string) => void;
}

export default function CarCard({ car, isWishlisted, onToggleWishlist }: CarCardProps) {
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

        {/* Top-Left Availability Badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 flex-wrap">
          {car.availabilityStatus === 'Sold Out' ? (
            <span className="px-2.5 py-1 rounded-md bg-slate-900/90 backdrop-blur-xs text-[10px] font-extrabold text-white tracking-wide uppercase border border-slate-700 shadow-sm">
              Sold Out
            </span>
          ) : car.availabilityStatus === 'Reserved' ? (
            <span className="px-2.5 py-1 rounded-md bg-amber-600/90 backdrop-blur-xs text-[10px] font-extrabold text-white tracking-wide uppercase border border-amber-400 shadow-sm">
              Reserved
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-md bg-emerald-600/90 backdrop-blur-xs text-[10px] font-extrabold text-white tracking-wide uppercase border border-emerald-400 shadow-sm">
              Available
            </span>
          )}
        </div>

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
          {/* Top Elite & Featured Badges if applicable */}
          {(car.isRecarsSelect || car.featured) && (
            <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
              {car.isRecarsSelect && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1E3A8A] text-white text-[10px] font-bold tracking-wider uppercase font-heading shadow-2xs">
                  👑 ELITE
                </span>
              )}
              {car.featured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-[10px] font-bold tracking-wider uppercase font-heading">
                  FEATURED
                </span>
              )}
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

          <Link
            href={`/cars/${car.id}`}
            className="text-xs font-semibold text-[#E5325C] hover:text-[#D4264E] group-hover:translate-x-0.5 transition-all inline-flex items-center gap-0.5 font-heading"
          >
            <span>Interested</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
