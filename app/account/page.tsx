'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Heart,
  Calendar,
  Car,
  Clock,
  MapPin,
  CheckCircle2,
  Trash2,
  ArrowRight,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CarCard from '@/components/CarCard';
import { useRecarsState } from '@/lib/store';
import { formatINR } from '@/lib/formatters';
import { SellRequest, TestDriveBooking } from '@/lib/types';
import { useAuth } from '@/lib/authContext';

function AccountContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const {
    selectedCity,
    changeCity,
    wishlistIds,
    toggleWishlist,
    isWishlisted,
    cars,
    sellRequests: storeSellRequests,
    testDrives: storeTestDrives,
  } = useRecarsState();

  const { user, logout } = useAuth();
  const [liveSellRequests, setLiveSellRequests] = useState<SellRequest[]>([]);
  const [liveTestDrives, setLiveTestDrives] = useState<TestDriveBooking[]>([]);

  useEffect(() => {
    const fetchFreshData = () => {
      fetch('/api/sell')
        .then((r) => r.json())
        .then((d) => {
          if (d?.customerCars?.length > 0) setLiveSellRequests(d.customerCars);
        })
        .catch(() => {});
      fetch('/api/test-drive')
        .then((r) => r.json())
        .then((d) => {
          if (d?.testDrives?.length > 0) setLiveTestDrives(d.testDrives);
        })
        .catch(() => {});
    };

    fetchFreshData();
    window.addEventListener('focus', fetchFreshData);
    const interval = setInterval(fetchFreshData, 6000);
    return () => {
      window.removeEventListener('focus', fetchFreshData);
      clearInterval(interval);
    };
  }, []);

  const sellRequests = liveSellRequests.length > 0 ? liveSellRequests : storeSellRequests;
  const testDrives = liveTestDrives.length > 0 ? liveTestDrives : storeTestDrives;

  const [activeTab, setActiveTab] = useState<'wishlist' | 'bookings' | 'selling' | 'profile'>(() => {
    const t = searchParams.get('tab');
    if (t === 'wishlist' || t === 'bookings' || t === 'selling' || t === 'profile') return t;
    return 'wishlist';
  });

  const wishlistedCars = cars.filter((c) => wishlistIds.includes(c.id));

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Navbar
        selectedCity={selectedCity}
        onSelectCity={changeCity}
        wishlistCount={wishlistIds.length}
      />

      <div className="bg-white border-b border-[#E5E7EB] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#FFF0F3] border-2 border-[#E5325C] text-[#E5325C] flex items-center justify-center font-black text-xl shadow-xs">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'RC'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#101216]">
                  {user?.name || 'Customer Account'}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[#F0F9F4] text-[#237A52] text-[10px] font-bold border border-[#D1EAD9]">
                  Verified Account
                </span>
              </div>
              <p className="text-xs text-[#6B7078]">
                {user?.phone ? `+91 ${user.phone}` : user?.email || 'Active Session'} • {selectedCity}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="px-4 py-2 rounded-xl bg-[#FFF0F3] border border-[#FFD6DF] text-xs font-bold text-[#E5325C] hover:bg-[#FFE5EC] transition-colors"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'wishlist'
                ? 'bg-[#101216] text-white shadow-xs'
                : 'text-[#6B7078] hover:text-[#101216] bg-white border border-[#E5E7EB]'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Saved Cars ({wishlistIds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'bookings'
                ? 'bg-[#101216] text-white shadow-xs'
                : 'text-[#6B7078] hover:text-[#101216] bg-white border border-[#E5E7EB]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Test Drive Bookings ({testDrives.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('selling')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'selling'
                ? 'bg-[#101216] text-white shadow-xs'
                : 'text-[#6B7078] hover:text-[#101216] bg-white border border-[#E5E7EB]'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Sell Requests ({sellRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'profile'
                ? 'bg-[#101216] text-white shadow-xs'
                : 'text-[#6B7078] hover:text-[#101216] bg-white border border-[#E5E7EB]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Settings</span>
          </button>
        </div>

        {/* Tab 1: Saved Wishlist Cars */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistedCars.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistedCars.map((car) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    isWishlisted={true}
                    onToggleWishlist={toggleWishlist}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#E5E7EB] p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#101216]">Your Wishlist is Empty</h3>
                <p className="text-xs text-[#6B7078] max-w-sm mx-auto">
                  Click the heart icon on any vehicle card to save it here for quick comparisons and booking test drives.
                </p>
                <div className="pt-2">
                  <Link
                    href="/buy"
                    className="px-6 py-2.5 rounded-full bg-[#E5325C] text-white text-xs font-bold hover:bg-[#D4264E]"
                  >
                    Browse Featured Cars
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Test Drive Bookings */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {testDrives.length > 0 ? (
              <div className="space-y-4">
                {testDrives.map((td) => (
                  <div
                    key={td.id}
                    className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-14 rounded-xl overflow-hidden bg-[#F8F9FA] flex-shrink-0">
                        <img src={td.carImage} alt={td.carTitle} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-[#101216]">{td.carTitle}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F9F4] text-[#237A52] border border-[#D1EAD9]">
                            {td.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B7078] mt-0.5">
                          Booking ID: {td.id} • {td.type}
                        </p>
                        <p className="text-xs font-semibold text-[#E5325C] mt-0.5">
                          Scheduled: {td.preferredDate} ({td.preferredTimeSlot})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Link
                        href={`/cars/${td.carId}`}
                        className="px-4 py-2 rounded-xl bg-[#F8F9FA] hover:bg-[#FFF0F3] border border-[#E5E7EB] text-xs font-bold text-[#101216]"
                      >
                        View Vehicle
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#E5E7EB] p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center mx-auto">
                  <Calendar className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#101216]">No Active Test Drives</h3>
                <p className="text-xs text-[#6B7078] max-w-sm mx-auto">
                  You haven&apos;t scheduled any test drives yet. Schedule doorstep test drives with zero obligations.
                </p>
                <div className="pt-2">
                  <Link
                    href="/buy"
                    className="px-6 py-2.5 rounded-full bg-[#E5325C] text-white text-xs font-bold hover:bg-[#D4264E]"
                  >
                    Explore Inventory
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Selling Requests */}
        {activeTab === 'selling' && (
          <div className="space-y-4">
            {sellRequests.length > 0 ? (
              <div className="space-y-4">
                {sellRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl border border-[#E5E7EB] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#101216]">
                          {req.year} {req.make} {req.model} ({req.variant})
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF0F3] text-[#E5325C] border border-[#FFD6DF]">
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B7078] mt-1">
                        Reg No: {req.registrationNumber || 'TS 09 EA 4589'} • Ref: {req.id}
                      </p>
                      <p className="text-xs font-semibold text-[#101216] mt-1">
                        Price Evaluation: <span className="text-[#237A52] font-bold">Free Physical Doorstep Inspection (Offer given on inspection)</span>
                      </p>
                      <p className="text-[11px] text-[#6B7078]">
                        Home Inspection: {req.preferredInspectionDate} ({req.preferredInspectionTime}) in {req.sellerCity}
                      </p>
                    </div>

                    <div className="self-end sm:self-center">
                      <span className="text-xs font-bold text-[#237A52] flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Engineer Assigned</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#E5E7EB] p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center mx-auto">
                  <Car className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#101216]">No Car Selling Requests</h3>
                <p className="text-xs text-[#6B7078] max-w-sm mx-auto">
                  Ready to upgrade? Sell your vehicle with free doorstep physical inspection and same-day payment.
                </p>
                <div className="pt-2">
                  <Link
                    href="/sell"
                    className="px-6 py-2.5 rounded-full bg-[#E5325C] text-white text-xs font-bold hover:bg-[#D4264E]"
                  >
                    Start Selling Process
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Profile Settings */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-8 max-w-2xl mx-auto space-y-6">
            <h3 className="font-bold text-base text-[#101216] border-b border-[#E5E7EB] pb-3">
              Customer Profile Information
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#101216] mb-1">Full Legal Name</label>
                <input
                  type="text"
                  key={user?.id ? `name-${user.id}` : 'guest-name'}
                  defaultValue={user?.name || ''}
                  placeholder="Enter full name"
                  className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#101216] mb-1">Registered Phone</label>
                <input
                  type="text"
                  key={user?.id ? `phone-${user.id}` : 'guest-phone'}
                  defaultValue={user?.phone ? `+91 ${user.phone}` : ''}
                  placeholder="Enter registered mobile"
                  className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#101216] mb-1">Email Address</label>
                <input
                  type="email"
                  key={user?.id ? `email-${user.id}` : 'guest-email'}
                  defaultValue={user?.email || ''}
                  placeholder="Enter email address"
                  className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#101216] mb-1">Default City Hub</label>
                <input
                  type="text"
                  defaultValue={selectedCity}
                  className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                className="px-6 py-2.5 rounded-full bg-[#E5325C] text-white text-xs font-bold"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">Loading Account...</div>}>
      <AccountContent />
    </Suspense>
  );
}
