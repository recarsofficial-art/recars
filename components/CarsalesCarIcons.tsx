import React from 'react';

interface CarIconProps {
  type: string;
  className?: string;
}

const CATEGORY_IMAGES: Record<string, string> = {
  'New cars': '/cat-new-cars.jpg',
  'EV': '/cat-ev.jpg',
  'Hybrid': '/cat-hybrid.jpg',
  'SUV': '/cat-suv.jpg',
  'Ute': '/cat-ute.jpg',
  'Hatch': '/cat-hatch.jpg',
  'Offroad 4x4': '/cat-offroad.jpg',
  'Performance': '/cat-performance.jpg',
};

export function CarTypeIcon({ type }: CarIconProps) {
  const imageSrc = CATEGORY_IMAGES[type];

  if (!imageSrc) return null;

  return (
    <div className="relative flex items-center justify-center w-full h-12 sm:h-14">
      <img
        src={imageSrc}
        alt={type}
        className="h-full w-auto max-w-[85px] sm:max-w-[95px] object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-108"
      />
    </div>
  );
}
