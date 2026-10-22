import React from 'react';

interface BrandLogoProps {
  brand: string;
  className?: string;
}

export function BrandLogo({ brand, className }: BrandLogoProps) {
  switch (brand) {
    case 'Maruti Suzuki':
      return (
        <img
          src="/images/brands/maruti-suzuki.svg"
          alt="Maruti Suzuki"
          className={className || "h-5 sm:h-5.5 w-auto max-w-[95px] sm:max-w-[110px] object-contain"}
          loading="lazy"
        />
      );

    case 'Hyundai':
      return (
        <img
          src="/images/brands/hyundai-full.png"
          alt="Hyundai"
          className={className || "h-6 sm:h-7 w-auto max-w-[85px] sm:max-w-[95px] object-contain"}
          loading="lazy"
        />
      );

    case 'Tata':
      return (
        <img
          src="/images/brands/tata.svg"
          alt="Tata Motors"
          className={className || "h-5 sm:h-5.5 w-auto max-w-[90px] sm:max-w-[105px] object-contain"}
          loading="lazy"
        />
      );

    case 'Honda':
      return (
        <img
          src="/images/brands/honda.svg"
          alt="Honda"
          className={className || "h-4.5 sm:h-5 w-auto max-w-[95px] sm:max-w-[110px] object-contain"}
          loading="lazy"
        />
      );

    case 'Renault':
      return (
        <img
          src="/images/brands/renault-full.png"
          alt="Renault"
          className={className || "h-5 sm:h-5.5 w-auto max-w-[95px] sm:max-w-[110px] object-contain"}
          loading="lazy"
        />
      );

    case 'Ford':
      return (
        <img
          src="/images/brands/ford.svg"
          alt="Ford"
          className={className || "h-6 sm:h-7 w-auto max-w-[70px] sm:max-w-[80px] object-contain"}
          loading="lazy"
        />
      );

    case 'Volkswagen':
      return (
        <img
          src="/images/brands/volkswagen.svg"
          alt="Volkswagen"
          className={className || "h-4.5 sm:h-5 w-auto max-w-[100px] sm:max-w-[115px] object-contain"}
          loading="lazy"
        />
      );

    case 'Mahindra':
      return (
        <img
          src="/images/brands/mahindra.png"
          alt="Mahindra"
          className={className || "h-5 sm:h-5.5 w-auto max-w-[95px] sm:max-w-[110px] object-contain"}
          loading="lazy"
        />
      );

    case 'Kia':
      return (
        <div className="bg-black px-2.5 py-1 rounded-md flex items-center justify-center shadow-2xs">
          <img
            src="/images/brands/kia-white.svg"
            alt="Kia"
            className="h-3 sm:h-3.5 w-auto object-contain"
            loading="lazy"
          />
        </div>
      );

    case 'Audi':
      return (
        <img
          src="/images/brands/audi.svg"
          alt="Audi"
          className={className || "h-4.5 sm:h-5.5 w-auto max-w-[75px] sm:max-w-[85px] object-contain"}
          loading="lazy"
        />
      );

    case 'BMW':
      return (
        <img
          src="/images/brands/bmw.svg"
          alt="BMW"
          className={className || "h-5 sm:h-5.5 w-auto max-w-[85px] sm:max-w-[95px] object-contain"}
          loading="lazy"
        />
      );

    case 'Toyota':
      return (
        <img
          src="/images/brands/toyota.svg"
          alt="Toyota"
          className={className || "h-4.5 sm:h-5 w-auto max-w-[90px] sm:max-w-[100px] object-contain"}
          loading="lazy"
        />
      );

    case 'Mercedes-Benz':
      return (
        <img
          src="/images/brands/mercedes-benz.svg"
          alt="Mercedes-Benz"
          className={className || "h-6 sm:h-7 w-auto max-w-[65px] sm:max-w-[75px] object-contain"}
          loading="lazy"
        />
      );

    case 'Skoda':
      return (
        <img
          src="/images/brands/skoda.svg"
          alt="Skoda"
          className={className || "h-4.5 sm:h-5 w-auto max-w-[85px] sm:max-w-[95px] object-contain"}
          loading="lazy"
        />
      );

    case 'MG':
      return (
        <img
          src="/images/brands/mg.svg"
          alt="MG"
          className={className || "h-6 sm:h-7 w-auto max-w-[55px] sm:max-w-[65px] object-contain"}
          loading="lazy"
        />
      );

    case 'Nissan':
      return (
        <div className="flex items-center gap-1.5 justify-center">
          <svg viewBox="0 0 32 32" className="w-6 h-6 shrink-0">
            <circle cx="16" cy="16" r="13" stroke="#222" strokeWidth="2.5" fill="none" />
            <rect x="2" y="12.5" width="28" height="7" rx="1.5" fill="#222" />
            <text x="16" y="17.5" textAnchor="middle" fill="#fff" fontSize="5" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.6">NISSAN</text>
          </svg>
          <span className="text-xs font-black text-gray-900 tracking-tight font-sans">Nissan</span>
        </div>
      );

    case 'Jeep':
      return (
        <div className="flex items-center justify-center">
          <span className="font-black text-[#1E293B] tracking-wider text-sm sm:text-base uppercase font-sans">
            Jeep
          </span>
        </div>
      );

    case 'Land Rover':
      return (
        <div className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-[#004724] border border-[#005c2f] shadow-2xs">
          <span className="text-[8.5px] sm:text-[9.5px] font-black tracking-widest text-[#E6C687] uppercase font-sans">
            LAND ROVER
          </span>
        </div>
      );

    case 'Range Rover':
      return (
        <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-[#101216] border border-gray-700 shadow-2xs">
          <span className="text-[8px] sm:text-[9px] font-black tracking-widest text-white uppercase font-sans">
            RANGE ROVER
          </span>
        </div>
      );

    case 'Jaguar':
      return (
        <div className="flex items-center gap-1.5 justify-center">
          <svg viewBox="0 0 80 28" className="h-4.5 sm:h-5 w-auto">
            <path d="M4 20 C12 11, 22 7, 38 7 C52 7, 65 11, 78 4 C74 10, 66 14, 54 16 C36 18, 28 20, 18 24 Z" fill="#101216" />
          </svg>
          <span className="text-xs font-black text-gray-900 tracking-wider uppercase font-sans">Jaguar</span>
        </div>
      );

    case 'Volvo':
      return (
        <div className="flex items-center gap-1.5 justify-center">
          <svg viewBox="0 0 36 36" className="w-5.5 h-5.5 shrink-0">
            <circle cx="18" cy="18" r="13" stroke="#003057" strokeWidth="2.5" fill="none" />
            <line x1="26" y1="10" x2="33" y2="3" stroke="#003057" strokeWidth="2.5" strokeLinecap="round" />
            <polyline points="26,3 33,3 33,10" fill="none" stroke="#003057" strokeWidth="2.5" strokeLinejoin="round" />
            <rect x="4" y="14" width="28" height="8" fill="#003057" rx="1" />
            <text x="18" y="20" textAnchor="middle" fill="#fff" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.8">VOLVO</text>
          </svg>
          <span className="text-xs font-black text-[#003057] tracking-tight font-sans">Volvo</span>
        </div>
      );

    case 'Fiat':
      return (
        <div className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-[#8B0000] border-2 border-gray-300 shadow-2xs">
          <span className="text-[10px] font-black tracking-wider text-white font-sans">
            FIAT
          </span>
        </div>
      );

    case 'Mitsubishi':
      return (
        <div className="flex items-center gap-1.5 justify-center">
          <svg viewBox="0 0 40 40" className="w-5.5 h-5.5 shrink-0">
            <polygon points="20,5 25.77,15 20,25 14.23,15" fill="#ED1C24" />
            <polygon points="20,25 14.23,35 2.68,35 8.45,25" fill="#ED1C24" />
            <polygon points="20,25 31.55,25 37.32,35 25.77,35" fill="#ED1C24" />
          </svg>
          <span className="text-xs font-black text-gray-900 tracking-tight font-sans">Mitsubishi</span>
        </div>
      );

    case 'Citroen':
      return (
        <div className="flex items-center gap-1.5 justify-center">
          <svg viewBox="0 0 36 36" className="w-5.5 h-5.5 shrink-0">
            <polyline points="7,15 18,5 29,15" fill="none" stroke="#A81C07" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="miter" />
            <polyline points="7,27 18,17 29,27" fill="none" stroke="#A81C07" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="miter" />
          </svg>
          <span className="text-xs font-black text-gray-900 tracking-tight font-sans">Citroën</span>
        </div>
      );

    case 'VinFast':
    case 'Vinfast':
      return (
        <div className="flex items-center gap-1.5 justify-center">
          <svg viewBox="0 0 40 28" className="w-6 h-auto shrink-0">
            <path d="M4 6 L18 24 L22 24 L36 6 L30 6 L20 19 L10 6 Z" fill="#2563EB" />
            <path d="M12 6 L20 16 L28 6 L24 6 L20 11 L16 6 Z" fill="#1D4ED8" />
          </svg>
          <span className="text-xs font-black text-blue-700 tracking-tight font-sans">VinFast</span>
        </div>
      );

    case 'Chevrolet':
      return (
        <div className="flex items-center gap-1.5 justify-center">
          <svg viewBox="0 0 40 24" className="w-7 h-auto shrink-0">
            <polygon points="4,9 36,9 36,15 4,15" fill="#EAB308" stroke="#CA8A04" strokeWidth="1" />
            <polygon points="15,4 25,4 25,20 15,20" fill="#EAB308" stroke="#CA8A04" strokeWidth="1" />
            <polygon points="16,5 24,5 24,19 16,19" fill="#FACC15" />
            <polygon points="5,10 35,10 35,14 5,14" fill="#FACC15" />
          </svg>
          <span className="text-xs font-black text-gray-900 tracking-tight font-sans">Chevrolet</span>
        </div>
      );

    case 'Hindustan Motors':
      return (
        <div className="flex items-center gap-1.5 justify-center">
          <div className="w-6 h-6 rounded-full bg-[#1E3A8A] border-2 border-[#D97706] flex items-center justify-center shrink-0">
            <span className="text-[7.5px] font-black text-[#FDE68A] font-serif">HM</span>
          </div>
          <span className="text-[11px] font-black text-gray-900 tracking-tight font-sans">Hindustan</span>
        </div>
      );

    case 'JSW':
      return (
        <div className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-[#0F2D6B] border border-[#1E40AF] shadow-2xs">
          <span className="text-[10px] font-black tracking-wider text-white font-sans">
            JSW
          </span>
        </div>
      );

    default:
      return (
        <span className="text-xs font-bold text-gray-800 tracking-tight font-sans">
          {brand}
        </span>
      );
  }
}

export function BrandEmblem({ brand, className }: BrandLogoProps) {
  switch (brand) {
    case 'Maruti':
    case 'Maruti Suzuki':
      return (
        <img
          src="/images/brands/suzuki-emblem.svg"
          alt="Maruti Suzuki"
          className={className || "w-8 h-8 object-contain"}
          loading="lazy"
        />
      );

    case 'Hyundai':
      return (
        <img
          src="/images/brands/hyundai-emblem.png"
          alt="Hyundai"
          className={className || "w-9 h-6 object-contain"}
          loading="lazy"
        />
      );

    case 'Tata':
      return (
        <img
          src="/images/brands/tata-emblem.svg"
          alt="Tata"
          className={className || "w-8.5 h-8 object-contain"}
          loading="lazy"
        />
      );

    case 'Honda':
      return (
        <img
          src="/images/brands/honda-badge.svg"
          alt="Honda"
          className={className || "w-8 h-8 object-contain"}
          loading="lazy"
        />
      );

    case 'Mahindra':
      return (
        <img
          src="/images/brands/mahindra-emblem.png"
          alt="Mahindra"
          className={className || "w-8.5 h-8.5 object-contain"}
          loading="lazy"
        />
      );

    case 'Kia':
      return (
        <img
          src="/images/brands/kia.svg"
          alt="Kia"
          className={className || "w-9 h-auto object-contain"}
          loading="lazy"
        />
      );

    case 'Toyota':
      return (
        <img
          src="/images/brands/toyota-emblem.svg"
          alt="Toyota"
          className={className || "w-9 h-6.5 object-contain"}
          loading="lazy"
        />
      );

    case 'Renault':
      return (
        <img
          src="/images/brands/renault-diamond.png"
          alt="Renault"
          className={className || "w-7.5 h-7.5 object-contain"}
          loading="lazy"
        />
      );

    case 'Volkswagen':
      return (
        <img
          src="/images/brands/volkswagen-emblem.svg"
          alt="Volkswagen"
          className={className || "w-8 h-8 object-contain"}
          loading="lazy"
        />
      );

    case 'MG':
      return (
        <img
          src="/images/brands/mg.svg"
          alt="MG"
          className={className || "w-8 h-8 object-contain"}
          loading="lazy"
        />
      );

    case 'Ford':
      return (
        <img
          src="/images/brands/ford.svg"
          alt="Ford"
          className={className || "w-10 h-auto object-contain"}
          loading="lazy"
        />
      );

    case 'BMW':
      return (
        <img
          src="/images/brands/bmw.svg"
          alt="BMW"
          className={className || "w-8 h-8 object-contain"}
          loading="lazy"
        />
      );

    case 'Audi':
      return (
        <img
          src="/images/brands/audi.svg"
          alt="Audi"
          className={className || "w-10 h-auto object-contain"}
          loading="lazy"
        />
      );

    case 'Mercedes-Benz':
      return (
        <img
          src="/images/brands/mercedes-benz.svg"
          alt="Mercedes-Benz"
          className={className || "w-8 h-8 object-contain"}
          loading="lazy"
        />
      );

    case 'Skoda':
      return (
        <img
          src="/images/brands/skoda.svg"
          alt="Skoda"
          className={className || "w-8 h-8 object-contain"}
          loading="lazy"
        />
      );

    case 'Nissan':
      return (
        <svg viewBox="0 0 32 32" className={className || "w-8 h-8 object-contain"}>
          <circle cx="16" cy="16" r="13" stroke="#222" strokeWidth="2.5" fill="none" />
          <rect x="2" y="12.5" width="28" height="7" rx="1.5" fill="#222" />
          <text x="16" y="17.5" textAnchor="middle" fill="#fff" fontSize="5" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.6">NISSAN</text>
        </svg>
      );

    case 'Jeep':
      return (
        <div className="flex items-center justify-center">
          <span className="font-black text-[#1E293B] tracking-wider text-xs uppercase font-sans">
            Jeep
          </span>
        </div>
      );

    case 'Land Rover':
      return (
        <div className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-[#004724] border border-[#005c2f] shadow-2xs">
          <span className="text-[7px] font-black tracking-widest text-[#E6C687] uppercase font-sans">
            LAND ROVER
          </span>
        </div>
      );

    case 'Range Rover':
      return (
        <div className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md bg-[#101216] border border-gray-700 shadow-2xs">
          <span className="text-[6.5px] font-black tracking-widest text-white uppercase font-sans">
            RANGE ROVER
          </span>
        </div>
      );

    case 'Jaguar':
      return (
        <svg viewBox="0 0 80 28" className={className || "w-10 h-auto"}>
          <path d="M4 20 C12 11, 22 7, 38 7 C52 7, 65 11, 78 4 C74 10, 66 14, 54 16 C36 18, 28 20, 18 24 Z" fill="#101216" />
        </svg>
      );

    case 'Volvo':
      return (
        <svg viewBox="0 0 36 36" className={className || "w-7.5 h-7.5 object-contain"}>
          <circle cx="18" cy="18" r="13" stroke="#003057" strokeWidth="2.5" fill="none" />
          <line x1="26" y1="10" x2="33" y2="3" stroke="#003057" strokeWidth="2.5" strokeLinecap="round" />
          <polyline points="26,3 33,3 33,10" fill="none" stroke="#003057" strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="4" y="14" width="28" height="8" fill="#003057" rx="1" />
          <text x="18" y="20" textAnchor="middle" fill="#fff" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.8">VOLVO</text>
        </svg>
      );

    case 'Fiat':
      return (
        <div className="w-7 h-7 rounded-full bg-[#8B0000] border-2 border-gray-300 flex items-center justify-center shadow-2xs">
          <span className="text-[8.5px] font-black tracking-wider text-white font-sans">
            FIAT
          </span>
        </div>
      );

    case 'Mitsubishi':
      return (
        <svg viewBox="0 0 40 40" className={className || "w-7.5 h-7.5 object-contain"}>
          <polygon points="20,5 25.77,15 20,25 14.23,15" fill="#ED1C24" />
          <polygon points="20,25 14.23,35 2.68,35 8.45,25" fill="#ED1C24" />
          <polygon points="20,25 31.55,25 37.32,35 25.77,35" fill="#ED1C24" />
        </svg>
      );

    case 'Citroen':
      return (
        <svg viewBox="0 0 36 36" className={className || "w-7.5 h-7.5 object-contain"}>
          <polyline points="7,15 18,5 29,15" fill="none" stroke="#A81C07" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="miter" />
          <polyline points="7,27 18,17 29,27" fill="none" stroke="#A81C07" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="miter" />
        </svg>
      );

    case 'VinFast':
    case 'Vinfast':
      return (
        <svg viewBox="0 0 40 28" className={className || "w-7.5 h-auto object-contain"}>
          <path d="M4 6 L18 24 L22 24 L36 6 L30 6 L20 19 L10 6 Z" fill="#2563EB" />
          <path d="M12 6 L20 16 L28 6 L24 6 L20 11 L16 6 Z" fill="#1D4ED8" />
        </svg>
      );

    case 'Chevrolet':
      return (
        <svg viewBox="0 0 40 24" className={className || "w-8 h-auto object-contain"}>
          <polygon points="4,9 36,9 36,15 4,15" fill="#EAB308" stroke="#CA8A04" strokeWidth="1" />
          <polygon points="15,4 25,4 25,20 15,20" fill="#EAB308" stroke="#CA8A04" strokeWidth="1" />
          <polygon points="16,5 24,5 24,19 16,19" fill="#FACC15" />
          <polygon points="5,10 35,10 35,14 5,14" fill="#FACC15" />
        </svg>
      );

    case 'Hindustan Motors':
      return (
        <div className="w-6.5 h-6.5 rounded-full bg-[#1E3A8A] border-2 border-[#D97706] flex items-center justify-center shrink-0">
          <span className="text-[7px] font-black text-[#FDE68A] font-serif">HM</span>
        </div>
      );

    case 'JSW':
      return (
        <div className="px-2 py-0.5 rounded-md bg-[#0F2D6B] border border-[#1E40AF] flex items-center justify-center shadow-2xs">
          <span className="text-[8.5px] font-black tracking-wider text-white font-sans">
            JSW
          </span>
        </div>
      );

    default:
      return <BrandLogo brand={brand} className={className} />;
  }
}
