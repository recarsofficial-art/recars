import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldCheck, RefreshCw, Award, HeartHandshake } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-[#F8F9FA] text-[#101216] border-t border-gray-200 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Badges Strip (Clean Light Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-gray-200">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-white border border-gray-200 text-[#E5325C] shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-[#E5325C]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#101216]">200+ Point Inspection</h4>
              <p className="text-xs text-gray-500 mt-0.5">Every vehicle certified by automotive engineers</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-white border border-gray-200 text-[#E5325C] shadow-2xs">
              <RefreshCw className="w-5 h-5 text-[#E5325C]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#101216]">Fair Price Negotiation</h4>
              <p className="text-xs text-gray-500 mt-0.5">Transparent market pricing with instant offer workflow</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-white border border-gray-200 text-[#E5325C] shadow-2xs">
              <Award className="w-5 h-5 text-[#E5325C]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#101216]">Verified Standards</h4>
              <p className="text-xs text-gray-500 mt-0.5">Thorough mechanical, engine & title verification</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-white border border-gray-200 text-[#E5325C] shadow-2xs">
              <HeartHandshake className="w-5 h-5 text-[#E5325C]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#101216]">RC Transfer Assistance</h4>
              <p className="text-xs text-gray-500 mt-0.5">End-to-end legal title & ownership documentation support</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 py-12 border-b border-gray-200">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <Logo size="md" />
              <p className="text-xs font-semibold text-[#E5325C] mt-1 tracking-tight">Trust Every Drive. Value Every Rupee.</p>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed max-w-sm">
              Recars is India&apos;s most trusted verified pre-owned car marketplace. We combine rigorous 200+ point inspection engineering, transparent pricing, and doorstep convenience so every Indian can buy and sell with utmost confidence.
            </p>
            
            <div className="pt-2 space-y-2.5 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#E5325C]" />
                <a href="tel:+919908796677" className="hover:text-[#E5325C] transition-colors font-medium">
                  Customer Care: +91 99087 96677 (9 AM – 9 PM)
                </a>
                <span className="text-gray-300">|</span>
                <a
                  href="https://wa.me/919908796677?text=Hello%20Recars%20Team%2C%20I%20have%20an%20inquiry%20regarding%20pre-owned%20cars."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors"
                >
                  WhatsApp
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#E5325C]" />
                <a href="mailto:Recars.in@gmail.com" className="hover:text-[#E5325C] transition-colors font-medium">
                  Support: Recars.in@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#E5325C]" />
                <span>Headquarters: Recars Automotive Plaza, Hitec City, Hyderabad - 500081</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#101216] mb-4">
              Explore Marketplace
            </h5>
            <ul className="space-y-2.5 text-xs text-gray-600">
              <li><Link href="/buy" className="hover:text-[#E5325C] transition-colors">Browse All Cars</Link></li>
              <li><Link href="/buy?type=SUV" className="hover:text-[#E5325C] transition-colors">Used SUVs</Link></li>
              <li><Link href="/buy?type=Sedan" className="hover:text-[#E5325C] transition-colors">Used Sedans</Link></li>
              <li><Link href="/buy?type=Hatchback" className="hover:text-[#E5325C] transition-colors">Used Hatchbacks</Link></li>
              <li><Link href="/buy?type=Electric" className="hover:text-[#E5325C] transition-colors">Electric Vehicles</Link></li>
              <li><Link href="/buy?type=Luxury" className="hover:text-[#E5325C] transition-colors">Luxury Collection</Link></li>
            </ul>
          </div>

          {/* Selling & Services */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#101216] mb-4">
              Sell & Services
            </h5>
            <ul className="space-y-2.5 text-xs text-gray-600">
              <li><Link href="/sell" className="hover:text-[#E5325C] transition-colors">Sell Your Car</Link></li>
              <li><Link href="/sell" className="hover:text-[#E5325C] transition-colors">Doorstep Inspection (₹499)</Link></li>
              <li><Link href="/why-recars#inspection" className="hover:text-[#E5325C] transition-colors">200+ Point Inspection</Link></li>
              <li><Link href="/finance" className="hover:text-[#E5325C] transition-colors">Car Loan & EMI Calculator</Link></li>
              <li><Link href="/insurance" className="hover:text-[#E5325C] transition-colors">Comprehensive Insurance</Link></li>
              <li><Link href="/why-recars#rc-transfer" className="hover:text-[#E5325C] transition-colors">RC Transfer Assistance</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#101216] mb-4">
              Company & Hubs
            </h5>
            <ul className="space-y-2.5 text-xs text-gray-600">
              <li><Link href="/why-recars" className="hover:text-[#E5325C] transition-colors">Why Choose Recars</Link></li>
              <li><Link href="/buy?city=Hyderabad" className="hover:text-[#E5325C] transition-colors">Cars in Hyderabad</Link></li>
              <li><Link href="/buy?city=Warangal" className="hover:text-[#E5325C] font-semibold text-amber-700 transition-colors">Cars in Warangal ⭐</Link></li>
              <li><Link href="/buy?city=Bengaluru" className="hover:text-[#E5325C] transition-colors">Cars in Bengaluru</Link></li>
              <li><Link href="/buy?city=Mumbai" className="hover:text-[#E5325C] transition-colors">Cars in Mumbai</Link></li>
              <li><Link href="/account" className="hover:text-[#E5325C] transition-colors">Customer Portal</Link></li>
              <li><Link href="/admin" className="hover:text-[#E5325C] transition-colors">Admin Dashboard</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-gray-500 gap-4">
          <p>© 2026 Recars Technologies Private Limited. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <Link href="#" className="hover:text-[#E5325C] transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-[#E5325C] transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-[#E5325C] transition-colors">Inspection Policy</Link>
            <Link href="#" className="hover:text-[#E5325C] transition-colors">Fair Price Guarantee</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
