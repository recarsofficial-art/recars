import React from 'react';

interface BrandLogoProps {
  brand: string;
  className?: string;
}

export function BrandLogo({ brand, className = 'h-7 max-w-[90px]' }: BrandLogoProps) {
  switch (brand) {
    case 'Maruti Suzuki':
      return (
        <div className={`flex items-center gap-1.5 ${className}`}>
          <svg viewBox="0 0 40 40" className="w-6 h-6 flex-shrink-0" fill="none">
            {/* Suzuki S stylized emblem */}
            <path
              d="M10 8 L30 8 L18 20 L30 20 L30 32 L10 32 L22 20 L10 20 Z"
              fill="#D32F2F"
            />
            <path
              d="M10 8 L24 8 L14 18 L10 18 Z M26 22 L30 22 L30 32 L16 32 Z"
              fill="#1E40AF"
            />
          </svg>
          <div className="flex flex-col text-left leading-none">
            <span className="text-[8px] font-black text-gray-800 tracking-tight">MARUTI</span>
            <span className="text-[9px] font-extrabold text-[#1E40AF] tracking-tight">SUZUKI</span>
          </div>
        </div>
      );

    case 'Hyundai':
      return (
        <div className={`flex items-center gap-1.5 ${className}`}>
          <svg viewBox="0 0 50 32" className="w-7 h-5 flex-shrink-0" fill="none">
            <ellipse cx="25" cy="16" rx="23" ry="14" stroke="#002C6C" strokeWidth="2.5" fill="none" />
            <path
              d="M17 9 C17 9 20 16 19 23 M33 9 C33 9 30 16 31 23 M17 16 C22 14 28 17 33 16"
              stroke="#002C6C"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[10px] font-black tracking-tight text-[#002C6C]">HYUNDAI</span>
        </div>
      );

    case 'Tata':
      return (
        <div className={`flex items-center gap-1.5 ${className}`}>
          <svg viewBox="0 0 40 28" className="w-7 h-5 flex-shrink-0" fill="none">
            <ellipse cx="20" cy="14" rx="18" ry="12" stroke="#005B94" strokeWidth="2.2" />
            <path
              d="M11 9 C15 11 18 17 18 23 M29 9 C25 11 22 17 22 23 M11 11 H29"
              stroke="#005B94"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[11px] font-black tracking-wider text-[#005B94]">TATA</span>
        </div>
      );

    case 'Honda':
      return (
        <div className={`flex items-center gap-1.5 ${className}`}>
          <svg viewBox="0 0 36 32" className="w-6 h-5 flex-shrink-0" fill="none">
            <rect x="2" y="2" width="32" height="28" rx="6" stroke="#C41230" strokeWidth="2.2" />
            <path
              d="M9 7 L12 25 M27 7 L24 25 M11 15 H25"
              stroke="#C41230"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[10px] font-black tracking-widest text-gray-900">HONDA</span>
        </div>
      );

    case 'Renault':
      return (
        <div className={`flex items-center gap-1.5 ${className}`}>
          <svg viewBox="0 0 32 36" className="w-5 h-6 flex-shrink-0" fill="none">
            <path
              d="M16 2 L28 18 L16 34 L4 18 Z"
              stroke="#FDB813"
              strokeWidth="3"
              fill="none"
              strokeLinejoin="round"
            />
            <path
              d="M16 9 L22 18 L16 27 L10 18 Z"
              stroke="#333333"
              strokeWidth="2"
              fill="none"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[9px] font-black tracking-wider text-gray-900">RENAULT</span>
        </div>
      );

    case 'Ford':
      return (
        <div className={`flex items-center ${className}`}>
          <div className="relative px-2.5 py-0.5 rounded-full bg-[#002C6C] border border-[#1E40AF] flex items-center justify-center">
            <span className="text-white font-serif italic font-black text-[13px] tracking-wide">
              Ford
            </span>
          </div>
        </div>
      );

    case 'Volkswagen':
      return (
        <div className={`flex items-center gap-1.5 ${className}`}>
          <svg viewBox="0 0 36 36" className="w-6 h-6 flex-shrink-0" fill="none">
            <circle cx="18" cy="18" r="16" stroke="#001E50" strokeWidth="2.5" />
            <path
              d="M9 10 L14 20 L18 12 L22 20 L27 10"
              stroke="#001E50"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 24 L15 16 L18 22 L21 16 L26 24"
              stroke="#001E50"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[9px] font-black tracking-tight text-[#001E50]">VOLKSWAGEN</span>
        </div>
      );

    case 'Mahindra':
      return (
        <div className={`flex items-center gap-1.5 ${className}`}>
          <svg viewBox="0 0 36 28" className="w-6 h-5 flex-shrink-0" fill="none">
            {/* Modern Twin Peaks chrome / red logo */}
            <path
              d="M4 22 L14 6 L18 12 L22 6 L32 22 M14 22 L18 16 L22 22"
              stroke="#D32F2F"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[10px] font-extrabold text-[#D32F2F] tracking-tight">Mahindra</span>
        </div>
      );

    case 'Kia':
      return (
        <div className={`flex items-center ${className}`}>
          <div className="px-2 py-0.5 rounded bg-black flex items-center justify-center">
            <span className="text-white font-black text-[12px] tracking-[0.18em]">
              KИ
            </span>
          </div>
        </div>
      );

    case 'Audi':
      return (
        <div className={`flex items-center justify-center ${className}`}>
          <svg viewBox="0 0 68 28" className="w-12 h-5 flex-shrink-0" fill="none">
            <circle cx="14" cy="14" r="11" stroke="#374151" strokeWidth="2.2" />
            <circle cx="27" cy="14" r="11" stroke="#374151" strokeWidth="2.2" />
            <circle cx="41" cy="14" r="11" stroke="#374151" strokeWidth="2.2" />
            <circle cx="54" cy="14" r="11" stroke="#374151" strokeWidth="2.2" />
          </svg>
        </div>
      );

    case 'BMW':
      return (
        <div className={`flex items-center gap-1.5 ${className}`}>
          <svg viewBox="0 0 36 36" className="w-6 h-6 flex-shrink-0" fill="none">
            <circle cx="18" cy="18" r="16" stroke="#111827" strokeWidth="2.5" />
            <circle cx="18" cy="18" r="12" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="0.8" />
            <path d="M18 6 A12 12 0 0 1 30 18 L18 18 Z" fill="#0066B1" />
            <path d="M6 18 A12 12 0 0 1 18 6 L18 18 Z" fill="#FFFFFF" />
            <path d="M6 18 A12 12 0 0 0 18 30 L18 18 Z" fill="#0066B1" />
            <path d="M18 30 A12 12 0 0 0 30 18 L18 18 Z" fill="#FFFFFF" />
            <text x="18" y="5" textAnchor="middle" fontSize="4" fontWeight="bold" fill="#111827">M</text>
          </svg>
          <span className="text-[11px] font-black tracking-wider text-gray-900">BMW</span>
        </div>
      );

    default:
      return (
        <span className="text-xs font-bold text-gray-800 tracking-tight">
          {brand}
        </span>
      );
  }
}
