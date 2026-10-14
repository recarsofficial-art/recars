import Link from 'next/link';

interface LogoProps {
  showTagline?: boolean;
  className?: string;
  isLight?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({
  showTagline = false,
  className = '',
  isLight = false,
  size = 'md',
}: LogoProps) {
  const badgeSize = {
    sm: 'w-7 h-7 text-base rounded-lg',
    md: 'w-9 h-9 text-xl rounded-xl',
    lg: 'w-11 h-11 text-2xl rounded-2xl',
  }[size];

  const textSize = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  }[size];

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 select-none group transition-opacity hover:opacity-95 ${className}`}
      aria-label="Recars - Trust Every Drive. Value Every Rupee."
    >
      <div
        className={`${badgeSize} bg-[#E5325C] text-white flex items-center justify-center font-black shadow-2xs group-hover:scale-105 transition-transform`}
      >
        <span>R</span>
      </div>
      <div className="flex items-baseline">
        <span
          className={`${textSize} font-black tracking-tight leading-none ${
            isLight ? 'text-white' : 'text-[#101216]'
          }`}
        >
          Re<span className="text-[#E5325C]">cars</span>
        </span>
      </div>
    </Link>
  );
}
