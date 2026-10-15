import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  showTagline?: boolean;
  className?: string;
  isLight?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'horizontal' | 'stacked' | 'emblem';
}

export default function Logo({
  className = '',
  size = 'md',
  variant = 'horizontal',
}: LogoProps) {
  // Height configurations by size and variant
  const heightClasses = {
    horizontal: {
      sm: 'h-8 sm:h-9 max-w-[150px]',
      md: 'h-9 sm:h-11 max-w-[190px]',
      lg: 'h-12 sm:h-14 max-w-[240px]',
      xl: 'h-16 sm:h-20 max-w-[320px]',
    },
    stacked: {
      sm: 'h-12 max-w-[130px]',
      md: 'h-16 max-w-[160px]',
      lg: 'h-24 max-w-[220px]',
      xl: 'h-32 max-w-[300px]',
    },
    emblem: {
      sm: 'w-7 h-7',
      md: 'w-9 h-9',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16',
    },
  }[variant][size];

  const logoSrc = {
    horizontal: '/images/recars-logo-horizontal.png',
    stacked: '/images/recars-logo-tight.png',
    emblem: '/images/recars-emblem.png',
  }[variant];

  return (
    <Link
      href="/"
      className={`inline-flex items-center select-none group transition-opacity hover:opacity-95 ${className}`}
      aria-label="Recars | Trust Every Drive. Value Every Rupee."
    >
      <img
        src={logoSrc}
        alt="Recars — Trust Every Drive. Value Every Rupee."
        className={`${heightClasses} w-auto object-contain transition-transform group-hover:scale-[1.02]`}
        loading="eager"
      />
    </Link>
  );
}
