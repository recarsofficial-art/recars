'use client';

import React, { useState } from 'react';
import { Phone } from 'lucide-react';

export default function FloatingContactButtons() {
  const [showCallTooltip, setShowCallTooltip] = useState(false);
  const [showWaTooltip, setShowWaTooltip] = useState(false);

  const phoneNumber = '+91 99087 96677';
  const phoneTel = 'tel:+919908796677';
  const whatsappUrl =
    'https://wa.me/919908796677?text=Hi%20Recars,%20I%20am%20interested%20in%20used%20cars%20in%20Warangal.';

  return (
    <div
      className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-2.5 sm:gap-3 pointer-events-auto print:hidden select-none"
      aria-label="Quick contact actions"
    >
      {/* 1. Floating Call Button */}
      <div className="relative flex items-center">
        {/* Tooltip on desktop hover */}
        {showCallTooltip && (
          <div className="hidden sm:flex absolute right-full mr-3 items-center bg-[#101216] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-150">
            <span>Call {phoneNumber}</span>
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-[#101216]" />
          </div>
        )}

        <a
          href={phoneTel}
          onMouseEnter={() => setShowCallTooltip(true)}
          onMouseLeave={() => setShowCallTooltip(false)}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#101216] hover:bg-[#E5325C] active:scale-95 text-white flex items-center justify-center shadow-lg hover:shadow-xl shadow-black/25 transition-all duration-200 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E5325C]/50"
          aria-label={`Call Recars at ${phoneNumber}`}
          title={`Call ${phoneNumber}`}
        >
          <Phone className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-200" />
        </a>
      </div>

      {/* 2. Floating WhatsApp Button */}
      <div className="relative flex items-center">
        {/* Tooltip on desktop hover */}
        {showWaTooltip && (
          <div className="hidden sm:flex absolute right-full mr-3 items-center bg-[#101216] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-150">
            <span>Chat on WhatsApp</span>
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-[#101216]" />
          </div>
        )}

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setShowWaTooltip(true)}
          onMouseLeave={() => setShowWaTooltip(false)}
          className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white flex items-center justify-center shadow-xl hover:shadow-2xl shadow-green-600/35 transition-all duration-200 group cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
          aria-label="Chat with Recars on WhatsApp"
          title="Chat with Recars on WhatsApp"
        >
          {/* Subtle Online Pulse Indicator */}
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-300 border-2 border-white"></span>
          </span>

          {/* Authentic WhatsApp SVG Icon */}
          <svg
            viewBox="0 0 24 24"
            className="w-7 h-7 sm:w-8 sm:h-8 fill-current text-white group-hover:scale-110 transition-transform duration-200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.84a8.18 8.18 0 01-5.82 2.41h-.01c-1.49 0-2.94-.4-4.21-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.212 8.212 0 01-1.26-4.38c0-4.54 3.7-8.25 8.27-8.25zm-3.6 3.09c-.2 0-.44.07-.66.32-.23.25-.87.85-.87 2.08 0 1.23.89 2.42 1.01 2.59.13.17 1.76 2.69 4.26 3.77.59.26 1.06.41 1.42.53.6.19 1.15.16 1.58.1.48-.07 1.49-.61 1.7-1.2.21-.59.21-1.1.15-1.2-.06-.1-.23-.17-.48-.29-.25-.13-1.49-.74-1.72-.82-.23-.09-.4-.13-.57.13-.17.25-.66.82-.81.99-.15.17-.3.19-.55.07-.25-.13-1.07-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.32-.02-.44-.06-.13-.57-1.37-.78-1.88-.2-.49-.41-.43-.57-.44-.15-.01-.32-.01-.49-.01z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
