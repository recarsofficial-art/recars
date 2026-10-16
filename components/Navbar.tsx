'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  MapPin,
  Search,
  Heart,
  User,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  Shield,
  Car,
  Calculator,
  HelpCircle,
  LogOut,
  Phone,
} from 'lucide-react';
import Logo from './Logo';
import CitySelectorModal from './CitySelectorModal';
import CarSearchModal from './CarSearchModal';
import { useAuth } from '@/lib/authContext';


interface NavbarProps {
  selectedCity: string;
  onSelectCity: (city: string) => void;
  wishlistCount: number;
}

export default function Navbar({
  selectedCity,
  onSelectCity,
  wishlistCount,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, openLogin, logout } = useAuth();
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { label: 'Buy', href: '/buy' },
    { label: 'Sell', href: '/sell' },
    { label: 'Why Recars', href: '/why-recars' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/buy?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] transition-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Logo size="md" showTagline={true} />
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-8 font-nav tracking-rounded">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href === '/buy' && pathname.startsWith('/cars'));
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`relative py-2 text-sm font-semibold transition-colors duration-200 ${
                      isActive ? 'text-[#101216]' : 'text-[#24262A] hover:text-[#E5325C]'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E5325C] rounded-full" />
                    )}
                  </Link>
                );
              })}

              {/* More Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}
                  onBlur={() => setTimeout(() => setIsMoreDropdownOpen(false), 200)}
                  className="flex items-center gap-1 text-sm font-semibold text-[#24262A] hover:text-[#E5325C] transition-colors py-2"
                >
                  <span>More</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isMoreDropdownOpen ? 'rotate-180 text-[#E5325C]' : ''
                    }`}
                  />
                </button>

                {isMoreDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#E5E7EB] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <Link
                      href="/why-recars#inspection"
                      className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-[#24262A] hover:bg-[#FFF0F3] hover:text-[#E5325C]"
                    >
                      <Shield className="w-4 h-4 text-[#E5325C]" />
                      <span>28+ Point Inspection</span>
                    </Link>
                    <Link
                      href="/sell"
                      className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-[#24262A] hover:bg-[#FFF0F3] hover:text-[#E5325C]"
                    >
                      <Shield className="w-4 h-4 text-[#E5325C]" />
                      <span>Doorstep Inspection (₹499)</span>
                    </Link>
                    <Link
                      href="/why-recars#process"
                      className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-[#24262A] hover:bg-[#FFF0F3] hover:text-[#E5325C]"
                    >
                      <Car className="w-4 h-4 text-[#E5325C]" />
                      <span>How Recars Works</span>
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            {/* Right Action Icons & Sell Button */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
              {/* Call Us Link */}
              <a
                href="tel:+919908796677"
                className="hidden xl:flex items-center gap-1 text-xs font-semibold text-[#101216] hover:text-[#E5325C] transition-colors pr-1"
              >
                <span className="text-[#6B7078] text-[11px]">Call us at</span>
                <span className="font-extrabold text-[#101216] tracking-tight">+91 99087 96677</span>
              </a>

              {/* City selector pill */}
              <button
                onClick={() => setIsCityModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-[#F8F9FA] hover:bg-[#FFF0F3] hover:border-[#E5325C]/50 transition-all text-xs font-semibold text-[#101216]"
              >
                <MapPin className="w-3.5 h-3.5 text-[#E5325C]" />
                <span>{selectedCity}</span>
                <ChevronDown className="w-3 h-3 text-[#6B7078]" />
              </button>

              {/* Search icon */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-[#24262A] hover:text-[#E5325C] hover:bg-[#F8F9FA] rounded-full transition-colors"
                title="Search cars"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Wishlist icon with counter */}
              <Link
                href="/account?tab=wishlist"
                className="relative p-2 text-[#24262A] hover:text-[#E5325C] hover:bg-[#F8F9FA] rounded-full transition-colors"
                title="Saved cars"
              >
                <Heart className="w-4 h-4" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E5325C] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* User Account Menu or Login / Signup Button */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                    onBlur={() => setTimeout(() => setIsAccountMenuOpen(false), 200)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-[#E5E7EB] hover:border-[#E5325C] text-[#24262A] hover:text-[#E5325C] transition-colors cursor-pointer group"
                    title="My Account"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#FFF0F3] text-[#E5325C] border border-[#FFD6DF] flex items-center justify-center text-xs font-bold uppercase">
                      {user.name ? user.name.slice(0, 1) : 'U'}
                    </div>
                    <span className="text-xs font-bold text-[#101216] group-hover:text-[#E5325C] max-w-[100px] truncate hidden xl:inline">
                      {user.name}
                    </span>
                    <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-[#E5325C]" />
                  </button>
                  {isAccountMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] py-2 z-50 animate-in fade-in slide-in-from-top-1">
                      <div className="px-4 py-2 border-b border-[#E5E7EB]">
                        <p className="text-xs font-bold text-[#101216] truncate">{user.name}</p>
                        <p className="text-[11px] text-[#6B7078] truncate">{user.phone || user.email}</p>
                      </div>
                      <Link
                        href="/account?tab=bookings"
                        className="block px-4 py-2 text-xs font-medium text-[#24262A] hover:bg-[#FFF0F3] hover:text-[#E5325C]"
                      >
                        Test Drive Bookings
                      </Link>
                      <Link
                        href="/account?tab=wishlist"
                        className="block px-4 py-2 text-xs font-medium text-[#24262A] hover:bg-[#FFF0F3] hover:text-[#E5325C]"
                      >
                        Saved Vehicles ({wishlistCount})
                      </Link>
                      <Link
                        href="/account?tab=selling"
                        className="block px-4 py-2 text-xs font-medium text-[#24262A] hover:bg-[#FFF0F3] hover:text-[#E5325C]"
                      >
                        Selling Requests
                      </Link>
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-xs font-medium text-[#E5325C] hover:bg-[#FFF0F3]"
                      >
                        Admin Dashboard
                      </Link>
                      <div className="border-t border-[#E5E7EB] my-1" />
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={openLogin}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#E5E7EB] bg-white hover:border-[#E5325C] hover:bg-[#FFF0F3] text-xs font-semibold font-btn tracking-rounded text-[#101216] hover:text-[#E5325C] transition-all cursor-pointer shadow-2xs"
                >
                  <User className="w-3.5 h-3.5 text-[#E5325C]" />
                  <span>Login / Sign Up</span>
                </button>
              )}

              {/* Prominent Sell Your Car Button */}
              <Link
                href="/sell"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold font-btn tracking-rounded text-white bg-[#E5325C] hover:bg-[#D4264E] transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                <span>Sell Your Car</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setIsCityModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-[#E5E7EB] bg-[#F8F9FA] text-xs font-medium"
              >
                <MapPin className="w-3 h-3 text-[#E5325C]" />
                <span className="text-[11px] font-semibold">{selectedCity}</span>
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-[#24262A] hover:bg-[#F8F9FA]"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile slide drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#E5E7EB] bg-white px-4 pt-3 pb-6 space-y-3">
            <div className="grid grid-cols-2 gap-2 pt-2 pb-3 border-b border-[#E5E7EB]">
              <Link
                href="/buy"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-lg bg-[#FFF0F3] text-[#E5325C] font-bold text-xs"
              >
                Buy a Car
              </Link>
              <Link
                href="/sell"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-lg bg-[#E5325C] text-white font-bold text-xs"
              >
                Sell Your Car →
              </Link>
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-[#24262A] hover:text-[#E5325C]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/sell"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-[#24262A] hover:text-[#E5325C]"
            >
              Sell Your Car (Doorstep Inspection)
            </Link>
            <Link
              href="/account"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-[#24262A] hover:text-[#E5325C]"
            >
              My Account / Wishlist ({wishlistCount})
            </Link>
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-gray-500"
            >
              Admin Dashboard
            </Link>

            <div className="pt-3 mt-2 border-t border-gray-100 flex flex-col gap-2 px-3 py-2 text-xs">
              <a
                href="tel:+919908796677"
                className="flex items-center gap-2 font-bold text-[#101216] hover:text-[#E5325C]"
              >
                <Phone className="w-3.5 h-3.5 text-[#E5325C]" />
                <span>Call Us: +91 99087 96677</span>
              </a>
              <a
                href="mailto:Recars.in@gmail.com"
                className="flex items-center gap-2 text-gray-500 hover:text-[#E5325C]"
              >
                <span>Email: Recars.in@gmail.com</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Global Rich Search Modal */}
      <CarSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        initialQuery={searchQuery}
      />

      {/* City Modal */}
      <CitySelectorModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        selectedCity={selectedCity}
        onSelectCity={onSelectCity}
      />
    </>
  );
}
