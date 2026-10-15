'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Check, ShieldCheck, ArrowRight } from 'lucide-react';
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
        <div className="absolute top-3 left-3 z-10">
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
          {/* Make and Model */}
          <h3 className="font-bold text-base text-[#101216] group-hover:text-[#E5325C] transition-colors leading-snug truncate">
            {car.make} {car.model}
          </h3>

          {/* Sub specs: Year • KM • Fuel • Ownership */}
          <p className="text-xs text-[#6B7078] mt-1 font-medium flex items-center gap-1.5 flex-wrap">
            <span>{car.year}</span>
            <span>•</span>
            <span>{formatKM(car.kilometers)}</span>
            <span>•</span>
            <span>{car.fuelType}</span>
            <span>•</span>
            <span className="font-semibold text-gray-800">{car.ownership || '1st Owner'}</span>
          </p>

          {/* Price */}
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-lg font-black text-[#101216] tracking-tight">
              {formatINR(car.price)}
            </span>
            <span className="text-[11px] text-[#6B7078]">
              EMI from {formatINR(car.emiPerMonth)}/mo
            </span>
          </div>
        </Link>

        {/* Badges strip */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-1 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {car.isVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F0F9F4] text-[#237A52] border border-[#D1EAD9]">
                <Check className="w-3 h-3 stroke-[2.5]" />
                <span>Verified</span>
              </span>
            )}
            {car.isRecarsSelect && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFF0F3] text-[#E5325C] border border-[#FFD6DF]">
                <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
                <span>Recars Select</span>
              </span>
            )}
          </div>

          <Link
            href={`/cars/${car.id}`}
            className="text-[11px] font-bold text-[#E5325C] hover:text-[#D4264E] group-hover:translate-x-0.5 transition-all inline-flex items-center gap-0.5"
          >
            <span>Interested</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
