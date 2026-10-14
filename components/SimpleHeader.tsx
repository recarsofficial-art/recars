'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Phone, ChevronDown, Car, Shield, User, LogOut, Heart, Sparkles, LayoutDashboard } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '@/lib/authContext';

export default function SimpleHeader() {
  const [isBuyMenuOpen, setIsBuyMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, openLogin, logout } = useAuth();

  return (
    <header className="w-full bg-white border-b border-[#E5E7EB] sticky top-0 z-40 transition-shadow">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Left: Recars Logo */}
        <div className="flex items-center shrink-0">
          <Logo size="md" showTagline={false} />
        </div>

        {/* Right: Buy Car Dropdown, Call Support & Login/Signup */}
        <div className="flex items-center gap-2.5 sm:gap-6">
          {/* Buy Car Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsBuyMenuOpen(!isBuyMenuOpen)}
              onBlur={() => setTimeout(() => setIsBuyMenuOpen(false), 200)}
              className="inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-[15px] font-bold text-[#101216] hover:text-[#E5325C] transition-colors py-2 cursor-pointer group"
            >
              <span>Buy Car</span>
              <ChevronDown
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6B7078] group-hover:text-[#E5325C] transition-transform duration-200 ${
                  isBuyMenuOpen ? 'rotate-180 text-[#E5325C]' : ''
                }`}
              />
            </button>

            {isBuyMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <Link
                  href="/buy"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-[#101216] hover:bg-[#FFF0F3] hover:text-[#E5325C]"
                >
                  <Car className="w-4 h-4 text-[#E5325C]" />
                  <span>Browse All Cars</span>
                </Link>
                <Link
                  href="/buy?type=SUV"
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#24262A] hover:bg-[#FFF0F3] hover:text-[#E5325C]"
                >
                  <span>Explore SUVs</span>
                </Link>
                <Link
                  href="/buy?type=Sedan"
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#24262A] hover:bg-[#FFF0F3] hover:text-[#E5325C]"
                >
                  <span>Explore Sedans</span>
                </Link>
                <Link
                  href="/buy?type=Hatchback"
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#24262A] hover:bg-[#FFF0F3] hover:text-[#E5325C]"
                >
                  <span>Explore Hatchbacks</span>
                </Link>
                <div className="border-t border-[#E5E7EB] my-1" />
                <Link
                  href="/why-recars"
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#6B7078] hover:text-[#E5325C]"
                >
                  <Shield className="w-3.5 h-3.5 text-[#E5325C]" />
                  <span>Recars Certified Quality</span>
                </Link>
              </div>
            )}
          </div>

          {/* Call us link */}
          <a
            href="tel:+919908796677"
            className="hidden md:flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-semibold text-[#101216] hover:text-[#E5325C] transition-colors group px-2 py-1 sm:p-0 rounded-full bg-gray-50 sm:bg-transparent border border-gray-200/80 sm:border-0"
          >
            <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#E5325C]" />
            <span className="hidden sm:inline text-[#6B7078] font-normal text-xs">
              Call us at
            </span>
            <span className="font-extrabold text-[#101216] group-hover:text-[#E5325C] tracking-tight text-xs sm:text-sm whitespace-nowrap">
              +91 99087 96677
            </span>
          </a>

          {/* Login / Sign Up or User Account Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                onBlur={() => setTimeout(() => setIsUserMenuOpen(false), 200)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-white hover:border-[#E5325C] transition-all cursor-pointer shadow-2xs group"
              >
                <div className="w-6 h-6 rounded-full bg-[#FFF0F3] text-[#E5325C] border border-[#FFD6DF] flex items-center justify-center text-xs font-black uppercase">
                  {user.name ? user.name.slice(0, 1) : 'U'}
                </div>
                <span className="text-xs font-bold text-[#101216] group-hover:text-[#E5325C] max-w-[100px] sm:max-w-[140px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#E5325C]" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] py-2 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-4 py-2.5 border-b border-[#E5E7EB]">
                    <p className="text-xs font-bold text-[#101216] truncate">{user.name}</p>
                    <p className="text-[11px] text-gray-500 font-mono truncate">{user.phone || user.email}</p>
                    <span className="inline-block mt-1 text-[10px] text-[#237A52] font-semibold bg-[#F0F9F4] px-2 py-0.5 rounded-md border border-[#D1EAD9]">
                      Verified Customer
                    </span>
                  </div>

                  <Link
                    href="/account?tab=wishlist"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-[#FFF0F3] hover:text-[#E5325C]"
                  >
                    <Heart className="w-4 h-4 text-[#E5325C]" />
                    <span>Saved Cars / Wishlist</span>
                  </Link>

                  <Link
                    href="/account?tab=selling"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-[#FFF0F3] hover:text-[#E5325C]"
                  >
                    <Sparkles className="w-4 h-4 text-[#E5325C]" />
                    <span>My Car Sell Requests</span>
                  </Link>

                  <Link
                    href="/admin"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-[#FFF0F3] hover:text-[#E5325C]"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#E5325C]" />
                    <span>Admin Control Center</span>
                  </Link>

                  <div className="border-t border-[#E5E7EB] my-1" />

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={openLogin}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#E5E7EB] bg-white hover:border-[#E5325C] hover:bg-[#FFF0F3] text-xs font-bold text-[#101216] hover:text-[#E5325C] transition-all cursor-pointer shadow-2xs"
              >
                <User className="w-3.5 h-3.5 text-[#E5325C]" />
                <span>Login / Sign Up</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

