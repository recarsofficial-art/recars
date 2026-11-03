'use client';

import { useState, useEffect } from 'react';

interface SplashScreenProps {
  /**
   * Minimum duration in milliseconds for the splash screen animation.
   */
  minDuration?: number;
  /**
   * Optional callback when splash screen finishes closing.
   */
  onFinish?: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [mounted, setMounted] = useState(true);
  const [isLogoIn, setIsLogoIn] = useState(false);
  const [wordingStage, setWordingStage] = useState(0); // 0 = none, 1 = 'buy', 2 = 'smart.', 3 = 'sell', 4 = 'easy.'
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Prevent body scrolling during splash
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Step 1: Logo Mark scales into view
    const tLogo = setTimeout(() => {
      setIsLogoIn(true);
      setProgress(20);
    }, 100);

    // Step 2: The wording loads word-by-word
    // "buy"
    const tWord1 = setTimeout(() => {
      setWordingStage(1);
      setProgress(40);
    }, 450);

    // "smart."
    const tWord2 = setTimeout(() => {
      setWordingStage(2);
      setProgress(60);
    }, 700);

    // "sell"
    const tWord3 = setTimeout(() => {
      setWordingStage(3);
      setProgress(80);
    }, 950);

    // "easy."
    const tWord4 = setTimeout(() => {
      setWordingStage(4);
      setProgress(100);
    }, 1200);

    // Step 3: Wording complete hold, then open homepage
    const tExit = setTimeout(() => {
      setIsExiting(true);
    }, 1750);

    // Step 4: Unmount after smooth fade out
    const tUnmount = setTimeout(() => {
      setMounted(false);
      document.body.style.overflow = originalOverflow;
      if (onFinish) onFinish();
    }, 2300);

    return () => {
      clearTimeout(tLogo);
      clearTimeout(tWord1);
      clearTimeout(tWord2);
      clearTimeout(tWord3);
      clearTimeout(tWord4);
      clearTimeout(tExit);
      clearTimeout(tUnmount);
      document.body.style.overflow = originalOverflow;
    };
  }, [onFinish]);

  // Click or touch to skip immediately
  const handleQuickSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      setMounted(false);
      document.body.style.overflow = '';
      if (onFinish) onFinish();
    }, 250);
  };

  if (!mounted) return null;

  return (
    <div
      role="dialog"
      aria-label="Recars Loading"
      aria-modal="true"
      onClick={handleQuickSkip}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white cursor-pointer select-none transition-all duration-550 ease-out ${
        isExiting
          ? 'opacity-0 scale-[1.02] pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
    >
      <div className="relative flex flex-col items-center justify-center max-w-lg w-full px-6 text-center">
        {/* Stage 1: Official Recars Logo Mark on Pure White */}
        <div
          className={`transition-all duration-700 ease-out transform ${
            isLogoIn
              ? 'opacity-100 scale-100 translate-y-0'
              : 'opacity-0 scale-95 translate-y-2'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/recars-mark-pure-white.png"
            alt="Recars"
            className="w-64 sm:w-80 md:w-92 max-w-[85vw] h-auto object-contain mx-auto"
            loading="eager"
            fetchPriority="high"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/recars-splash-logo-white-bg.png';
            }}
          />
        </div>

        {/* Stage 2: The Wording Loads with Animated Reveal */}
        <div className="mt-3 h-10 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 text-xl sm:text-2xl md:text-[26px] font-black tracking-tight">
            {/* Word 1: 'buy' */}
            <span
              className={`transition-all duration-300 ease-out transform inline-block text-[#E5325C] ${
                wordingStage >= 1
                  ? 'opacity-100 scale-100 translate-y-0'
                  : 'opacity-0 scale-75 translate-y-2'
              }`}
            >
              buy
            </span>

            {/* Word 2: 'smart.' */}
            <span
              className={`transition-all duration-300 ease-out transform inline-block text-[#101216] ${
                wordingStage >= 2
                  ? 'opacity-100 scale-100 translate-y-0'
                  : 'opacity-0 scale-75 translate-y-2'
              }`}
            >
              smart.
            </span>

            {/* Word 3: 'sell' */}
            <span
              className={`transition-all duration-300 ease-out transform inline-block text-[#E5325C] ml-1 ${
                wordingStage >= 3
                  ? 'opacity-100 scale-100 translate-y-0'
                  : 'opacity-0 scale-75 translate-y-2'
              }`}
            >
              sell
            </span>

            {/* Word 4: 'easy.' */}
            <span
              className={`transition-all duration-300 ease-out transform inline-block text-[#101216] ${
                wordingStage >= 4
                  ? 'opacity-100 scale-100 translate-y-0'
                  : 'opacity-0 scale-75 translate-y-2'
              }`}
            >
              easy.
            </span>
          </div>
        </div>

        {/* Stage 3: Sleek Loading Progress Indicator on White */}
        <div
          className={`w-48 sm:w-56 mt-7 transition-all duration-500 transform ${
            isLogoIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden p-[1px]">
            <div
              className="h-full bg-gradient-to-r from-[#E5325C] via-[#FF4D79] to-[#E5325C] rounded-full transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 mt-2 px-0.5">
            <span className="tracking-wider uppercase text-[10px] text-[#E5325C] font-extrabold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E5325C] animate-pulse" />
              {wordingStage < 4 ? 'Loading...' : 'Opening Recars...'}
            </span>
            <span className="font-mono text-[10px] text-gray-400">
              {progress}%
            </span>
          </div>
        </div>

        {/* Subtle skip hint */}
        <p className="text-[10px] text-gray-300 font-medium mt-6 tracking-wide opacity-80 hover:opacity-100 transition-opacity">
          Click anywhere to skip
        </p>
      </div>
    </div>
  );
}
