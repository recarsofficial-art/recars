'use client';

interface CarWatermarkProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'mark' | 'full';
}

/**
 * Recars Watermark Overlay for Car Photos (Styled like OLX)
 * Displays in the bottom-right corner of car photos with crisp white contrast
 * and soft drop shadow for maximum legibility on both dark and light vehicles.
 */
export default function CarWatermark({
  size = 'md',
  className = '',
  variant = 'mark',
}: CarWatermarkProps) {
  const sizeClasses = {
    xs: 'h-3 sm:h-3.5 max-w-[70px]',
    sm: 'h-4 sm:h-5 max-w-[100px]',
    md: 'h-5 sm:h-6 md:h-7 max-w-[140px]',
    lg: 'h-7 sm:h-9 md:h-11 max-w-[200px]',
  }[size];

  const logoSrc =
    variant === 'full'
      ? '/images/recars-watermark-white.png'
      : '/images/recars-watermark-mark-white.png';

  return (
    <div
      className={`pointer-events-none select-none z-20 flex items-center ${className}`}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoSrc}
        alt="Recars Watermark"
        className={`${sizeClasses} w-auto object-contain opacity-85 hover:opacity-100 transition-opacity drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] filter`}
        loading="eager"
      />
    </div>
  );
}
