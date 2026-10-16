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
          src="/images/brands/hyundai.svg"
          alt="Hyundai"
          className={className || "h-4 sm:h-4.5 w-auto max-w-[95px] sm:max-w-[110px] object-contain"}
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
          src="/images/brands/renault.svg"
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

    default:
      return (
        <span className="text-xs font-bold text-gray-800 tracking-tight font-sans">
          {brand}
        </span>
      );
  }
}
