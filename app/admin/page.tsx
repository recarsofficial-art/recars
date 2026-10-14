'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Menu,
  LayoutDashboard,
  Car,
  Calendar,
  Users,
  IndianRupee,
  Plus,
  Trash2,
  Check,
  X,
  Eye,
  Edit,
  ArrowUpRight,
  Search,
  Filter,
  MessageSquare,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Clock,
  Sparkles,
  MapPin,
  Tag,
  RefreshCw,
} from 'lucide-react';
import Footer from '@/components/Footer';
import Logo from '@/components/Logo';
import { useRecarsState } from '@/lib/store';
import { formatINR, formatKM } from '@/lib/formatters';
import { Car as CarType, CarInquiry, SellRequest, TestDriveBooking } from '@/lib/types';
import { MAKES, CITIES } from '@/lib/data';

const AVAILABLE_IMAGES = [
  { label: 'Hyundai Creta (White SUV)', url: '/car-creta.jpg' },
  { label: 'Honda City (Silver Sedan)', url: '/car-city.jpg' },
  { label: 'Mahindra Thar (Red 4x4)', url: '/car-thar.jpg' },
  { label: 'Toyota Fortuner (White SUV)', url: '/car-fortuner.jpg' },
  { label: 'Tata Nexon (Blue Crossover)', url: '/cat-suv.jpg' },
  { label: 'Maruti Baleno (Grey Hatchback)', url: '/cat-hatch.jpg' },
  { label: 'Toyota Hilux (White Ute)', url: '/cat-ute.jpg' },
  { label: 'BMW 3-Series (Luxury Performance)', url: '/cat-performance.jpg' },
  { label: 'Electric EV Vehicle', url: '/cat-ev.jpg' },
  { label: 'Eco Hybrid Vehicle', url: '/cat-hybrid.jpg' },
];

export default function AdminDashboardPage() {
  const {
    cars: storeCars,
    sellRequests: storeSellRequests,
    testDrives: storeTestDrives,
    inquiries: storeInquiries,
    addCarListing,
    removeCarListing,
    removeInquiry,
    updateInquiryStatus,
  } = useRecarsState();

  const [activeTab, setActiveTab] = useState<'overview' | 'cars' | 'inquiries' | 'leads' | 'testdrives' | 'customers'>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Live Supabase synced states
  const [liveCars, setLiveCars] = useState<CarType[]>([]);
  const [liveSellRequests, setLiveSellRequests] = useState<SellRequest[]>([]);
  const [liveInquiries, setLiveInquiries] = useState<CarInquiry[]>([]);
  const [liveCustomers, setLiveCustomers] = useState<any[]>([]);
  const [liveTestDrives, setLiveTestDrives] = useState<TestDriveBooking[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  const syncAllFromSupabase = async () => {
    setIsSyncing(true);
    try {
      const [carsRes, sellRes, inqRes, custRes, tdRes] = await Promise.all([
        fetch('/api/cars').then((r) => r.json()).catch(() => null),
        fetch('/api/sell').then((r) => r.json()).catch(() => null),
        fetch('/api/inquiries').then((r) => r.json()).catch(() => null),
        fetch('/api/customers').then((r) => r.json()).catch(() => null),
        fetch('/api/test-drive').then((r) => r.json()).catch(() => null),
      ]);

      if (carsRes?.cars) setLiveCars(carsRes.cars);
      if (sellRes?.customerCars) setLiveSellRequests(sellRes.customerCars);
      if (inqRes?.inquiries) setLiveInquiries(inqRes.inquiries);
      if (custRes?.customers) setLiveCustomers(custRes.customers);
      if (tdRes?.testDrives) setLiveTestDrives(tdRes.testDrives);
      setLastSyncTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (e) {
      console.error('Error syncing admin with Supabase:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    syncAllFromSupabase();

    const handleFocus = () => syncAllFromSupabase();
    window.addEventListener('focus', handleFocus);
    const handleVis = () => {
      if (document.visibilityState === 'visible') syncAllFromSupabase();
    };
    document.addEventListener('visibilitychange', handleVis);
    const interval = setInterval(syncAllFromSupabase, 6000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVis);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    syncAllFromSupabase();
  }, [activeTab]);

  const cars = liveCars.length > 0 ? liveCars : storeCars;
  const sellRequests = liveSellRequests;
  const inquiries = liveInquiries;
  const customers = liveCustomers;
  const testDrives = liveTestDrives;

  // Search & Filter state for Cars tab
  const [carSearch, setCarSearch] = useState('');
  const [carCityFilter, setCarCityFilter] = useState('All');

  // Search & Filter state for Inquiries tab
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<string>('All');

  // Modals state
  const [isAddCarModalOpen, setIsAddCarModalOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<CarType | null>(null);

  // New Car form fields
  const [newMake, setNewMake] = useState('Hyundai');
  const [newModel, setNewModel] = useState('Venue');
  const [newVariant, setNewVariant] = useState('SX 1.0 Turbo DCT');
  const [newYear, setNewYear] = useState(2023);
  const [newPrice, setNewPrice] = useState(1050000);
  const [newKm, setNewKm] = useState(22000);
  const [newFuel, setNewFuel] = useState<'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'CNG'>('Petrol');
  const [newTransmission, setNewTransmission] = useState<'Manual' | 'Automatic'>('Automatic');
  const [newBodyType, setNewBodyType] = useState<'SUV' | 'Sedan' | 'Hatchback' | 'Luxury' | 'MUV' | 'Electric'>('SUV');
  const [newOwnership, setNewOwnership] = useState<'1st Owner' | '2nd Owner' | '3rd Owner'>('1st Owner');
  const [newCity, setNewCity] = useState('Hyderabad');
  const [newLocationArea, setNewLocationArea] = useState('Hitec City Automotive Hub');
  const [newImage, setNewImage] = useState('/car-creta.jpg');
  const [newScore, setNewScore] = useState(97);
  const [newIsVerified, setNewIsVerified] = useState(true);
  const [newIsSelect, setNewIsSelect] = useState(true);
  const [newDescription, setNewDescription] = useState('Dealer managed immaculate single-owner vehicle with full service record.');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateCar = async (e: React.FormEvent) => {
    e.preventDefault();
    const created: CarType = {
      id: `recars-${Date.now()}`,
      make: newMake,
      model: newModel,
      variant: newVariant,
      year: newYear,
      price: Number(newPrice),
      emiPerMonth: Math.round(Number(newPrice) * 0.021),
      kilometers: Number(newKm),
      fuelType: newFuel,
      transmission: newTransmission,
      bodyType: newBodyType,
      ownership: newOwnership,
      city: newCity,
      locationArea: newLocationArea || `${newCity} Hub`,
      image: newImage,
      galleryImages: [newImage],
      isVerified: newIsVerified,
      isRecarsSelect: newIsSelect,
      featured: true,
      inspectionScore: Number(newScore),
      specifications: {
        engine: '1.2L Turbo Dual VVT',
        maxPower: '118 bhp',
        torque: '172 Nm',
        mileage: '18.2 kmpl',
        seatingCapacity: 5,
        bootSpace: '380 Litres',
        fuelTankCapacity: '45 Litres',
        groundClearance: '195 mm',
        rto: `${newCity.slice(0, 2).toUpperCase()}-09`,
        regYear: newYear,
        insuranceValidTill: 'Nov 2026',
        color: 'Polar White',
      },
      features: ['Touchscreen Infotainment', 'Apple CarPlay & Android Auto', 'Push Button Start', 'Reverse Camera', 'ABS with EBD'],
      description: newDescription,
      createdAt: new Date().toISOString(),
    };

    addCarListing(created);
    setIsAddCarModalOpen(false);
    showToast(`Adding "${created.make} ${created.model}" to Supabase inventory...`);

    try {
      await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created),
      });
      await syncAllFromSupabase();
      showToast(`Successfully added "${created.make} ${created.model}" to live marketplace inventory!`);
    } catch {
      showToast(`Added "${created.make} ${created.model}" locally.`);
    }
  };

  const handleConfirmDeleteCar = async () => {
    if (carToDelete) {
      const id = carToDelete.id;
      const title = `${carToDelete.make} ${carToDelete.model}`;
      removeCarListing(id);
      setCarToDelete(null);
      showToast(`Removing "${title}" from inventory...`);
      try {
        await fetch(`/api/cars?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
        await syncAllFromSupabase();
        showToast(`Removed "${title}" from Supabase inventory.`);
      } catch {
        showToast(`Removed "${title}".`);
      }
    }
  };

  const handleDeleteInquiry = (id: string, customerName: string) => {
    if (confirm(`Delete inquiry from ${customerName}?`)) {
      removeInquiry(id);
      showToast(`Inquiry from ${customerName} removed.`);
    }
  };

  // Filtered cars
  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      car.make.toLowerCase().includes(carSearch.toLowerCase()) ||
      car.model.toLowerCase().includes(carSearch.toLowerCase()) ||
      car.city.toLowerCase().includes(carSearch.toLowerCase());
    const matchesCity = carCityFilter === 'All' || car.city === carCityFilter;
    return matchesSearch && matchesCity;
  });

  // Filtered inquiries
  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inq.userName.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      inq.userPhone.includes(inquirySearch) ||
      inq.carTitle.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      inq.message.toLowerCase().includes(inquirySearch.toLowerCase());
    const matchesStatus =
      inquiryStatusFilter === 'All' || inq.status === inquiryStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Search & Filter state for Sell Requests
  const [sellSearch, setSellSearch] = useState('');
  const [sellStatusFilter, setSellStatusFilter] = useState('All');

  const filteredSellRequests = sellRequests.filter((req) => {
    const matchesSearch =
      req.sellerName.toLowerCase().includes(sellSearch.toLowerCase()) ||
      req.sellerPhone.includes(sellSearch) ||
      req.make.toLowerCase().includes(sellSearch.toLowerCase()) ||
      req.model.toLowerCase().includes(sellSearch.toLowerCase()) ||
      req.id.toLowerCase().includes(sellSearch.toLowerCase());
    const matchesStatus =
      sellStatusFilter === 'All' || req.status === sellStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Search & Filter state for Test Drives
  const [testDriveSearch, setTestDriveSearch] = useState('');
  const [testDriveStatusFilter, setTestDriveStatusFilter] = useState('All');

  const filteredTestDrives = testDrives.filter((td) => {
    const matchesSearch =
      td.userName.toLowerCase().includes(testDriveSearch.toLowerCase()) ||
      td.userPhone.includes(testDriveSearch) ||
      td.carTitle.toLowerCase().includes(testDriveSearch.toLowerCase()) ||
      td.city.toLowerCase().includes(testDriveSearch.toLowerCase());
    const matchesStatus =
      testDriveStatusFilter === 'All' || td.status === testDriveStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateSellStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/sell', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Updated request ${id} to "${newStatus}"`);
        await syncAllFromSupabase();
      } else {
        showToast(`Failed to update status`);
      }
    } catch {
      showToast(`Error updating status`);
    }
  };


  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
        <header className="bg-white border-b border-[#E5E7EB] py-3.5 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-40 shadow-2xs">
          <div className="flex items-center gap-4">
            <Logo showTagline={false} size="sm" />
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F3] border border-[#FFD6DF] text-xs font-bold text-[#E5325C] tracking-wide uppercase">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Control Center</span>
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-1 w-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-9 h-9 border-3 border-[#E5325C] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-gray-500">Loading Recars Admin Console...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F8F9FA]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#101216] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mobile Sidebar Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* ========================================================
          LEFT SIDEBAR: DEDICATED SECTIONS NAVIGATION
      ========================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#E5E7EB] flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen lg:shrink-0 ${
          isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <Logo showTagline={false} size="sm" />
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFF0F3] border border-[#FFD6DF] text-[10px] font-extrabold text-[#E5325C] tracking-wide uppercase self-start">
              <Shield className="w-3 h-3" />
              <span>Admin Hub</span>
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dedicated Sections Navigation Menu */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                Dedicated Sections
              </span>
              <span className="text-[10px] font-bold text-[#E5325C] bg-[#FFF0F3] px-1.5 py-0.5 rounded">
                5 Modules
              </span>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab('overview');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-[#FFF0F3] text-[#E5325C] shadow-xs ring-1 ring-[#FFD6DF]'
                    : 'text-gray-700 hover:text-black hover:bg-gray-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    activeTab === 'overview' ? 'bg-[#E5325C] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <LayoutDashboard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block">Dashboard Overview</span>
                    <span className="text-[10px] font-normal text-gray-400 block">All 5 sections</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                  activeTab === 'overview' ? 'bg-[#E5325C] text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  All
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('cars');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'cars'
                    ? 'bg-[#FFF0F3] text-[#E5325C] shadow-xs ring-1 ring-[#FFD6DF]'
                    : 'text-gray-700 hover:text-black hover:bg-gray-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    activeTab === 'cars' ? 'bg-[#E5325C] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block">Vehicles Inventory</span>
                    <span className="text-[10px] font-normal text-gray-400 block">Live car catalog</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                  activeTab === 'cars' ? 'bg-[#E5325C] text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {cars.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('inquiries');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'inquiries'
                    ? 'bg-[#FFF0F3] text-[#E5325C] shadow-xs ring-1 ring-[#FFD6DF]'
                    : 'text-gray-700 hover:text-black hover:bg-gray-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    activeTab === 'inquiries' ? 'bg-[#E5325C] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block">Car Inquiries</span>
                    <span className="text-[10px] font-normal text-gray-400 block">Quotes & questions</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                  activeTab === 'inquiries' ? 'bg-[#E5325C] text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {inquiries.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('leads');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'leads'
                    ? 'bg-[#FFF0F3] text-[#E5325C] shadow-xs ring-1 ring-[#FFD6DF]'
                    : 'text-gray-700 hover:text-black hover:bg-gray-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    activeTab === 'leads' ? 'bg-[#E5325C] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block">Sell Requests</span>
                    <span className="text-[10px] font-normal text-gray-400 block">Customer submitted cars</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                  activeTab === 'leads' ? 'bg-[#E5325C] text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {sellRequests.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('customers');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'customers'
                    ? 'bg-[#FFF0F3] text-[#E5325C] shadow-xs ring-1 ring-[#FFD6DF]'
                    : 'text-gray-700 hover:text-black hover:bg-gray-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    activeTab === 'customers' ? 'bg-[#E5325C] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block">Customers Directory</span>
                    <span className="text-[10px] font-normal text-gray-400 block">Supabase user database</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                  activeTab === 'customers' ? 'bg-[#E5325C] text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {customers.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('testdrives');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'testdrives'
                    ? 'bg-[#FFF0F3] text-[#E5325C] shadow-xs ring-1 ring-[#FFD6DF]'
                    : 'text-gray-700 hover:text-black hover:bg-gray-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    activeTab === 'testdrives' ? 'bg-[#E5325C] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block">Test Drives</span>
                    <span className="text-[10px] font-normal text-gray-400 block">Hub & doorstep visits</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                  activeTab === 'testdrives' ? 'bg-[#E5325C] text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {testDrives.length}
                </span>
              </button>
            </nav>
          </div>

          {/* Add Vehicle Button in Left Sidebar */}
          <div className="pt-2">
            <button
              onClick={() => {
                setIsAddCarModalOpen(true);
                setIsSidebarOpen(false);
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#E5325C] hover:bg-[#D4264E] text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Vehicle Listing</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer with Supabase status & Marketplace Link */}
        <div className="p-4 border-t border-[#E5E7EB] space-y-3 bg-[#F8F9FA]/60">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <span className="text-gray-700 font-bold text-[11px] block">Supabase Connected</span>
                <span className="text-[9px] text-gray-400 block">{lastSyncTime || 'Auto-sync active'}</span>
              </div>
            </div>
            <button
              onClick={syncAllFromSupabase}
              disabled={isSyncing}
              className="p-1.5 rounded-xl border border-[#E5E7EB] hover:bg-white text-gray-600 hover:text-[#E5325C] transition-colors cursor-pointer"
              title="Sync Supabase Database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#E5325C]' : ''}`} />
            </button>
          </div>

          <Link
            href="/"
            className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E5E7EB] hover:border-[#E5325C] text-xs font-bold text-gray-700 hover:text-[#E5325C] transition-colors group"
          >
            <div className="flex items-center gap-2">
              <span>Marketplace Store</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#E5325C]" />
          </Link>
        </div>
      </aside>

      {/* ========================================================
          RIGHT MAIN CONTENT AREA
      ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Admin Right Top Header */}
        <header className="bg-white border-b border-[#E5E7EB] py-3.5 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl border border-[#E5E7EB] text-gray-600 hover:text-black hover:bg-gray-50 lg:hidden cursor-pointer"
              title="Open Dedicated Sections Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:inline">
                  Admin Control Center •
                </span>
                <h2 className="text-base font-extrabold text-[#101216]">
                  {activeTab === 'overview' && 'Dashboard Overview (All Dedicated Sections)'}
                  {activeTab === 'cars' && 'Vehicle Inventory Workspace'}
                  {activeTab === 'inquiries' && 'Customer Car Inquiries Workspace'}
                  {activeTab === 'leads' && 'Customer Sell Requests Workspace'}
                  {activeTab === 'customers' && 'Registered Customers Directory'}
                  {activeTab === 'testdrives' && 'Test Drive Appointments Workspace'}
                </h2>
              </div>
              <p className="text-[11px] text-gray-500 hidden md:block">
                Recars Verified Pre-Owned Automotive Hub Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={syncAllFromSupabase}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E7EB] hover:border-[#E5325C] text-xs font-bold text-gray-700 hover:text-[#E5325C] bg-[#F8F9FA] transition-all cursor-pointer disabled:opacity-50"
              title="Sync latest requests, customers & inventory from Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#E5325C]' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Supabase'}</span>
              {lastSyncTime && <span className="text-[10px] text-gray-400 font-normal hidden md:inline">({lastSyncTime})</span>}
            </button>

            <Link
              href="/"
              className="text-xs font-bold text-gray-700 hover:text-[#E5325C] hidden sm:flex items-center gap-1 transition-colors"
            >
              <span>Marketplace</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <div className="w-8 h-8 rounded-full bg-[#E5325C] text-white flex items-center justify-center text-xs font-extrabold shadow-sm">
              ADM
            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="p-4 sm:p-8 flex-1 space-y-8 max-w-7xl w-full">
          {/* Metric Cards Row (Clickable to jump directly to dedicated sections) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div
            onClick={() => setActiveTab('cars')}
            className={`bg-white rounded-2xl border p-5 shadow-2xs cursor-pointer hover:border-[#E5325C] hover:shadow-xs transition-all ${
              activeTab === 'cars' ? 'border-[#E5325C] ring-2 ring-[#FFF0F3]' : 'border-[#E5E7EB]'
            }`}
          >
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Active Inventory</span>
              <div className="w-8 h-8 rounded-lg bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center">
                <Car className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#101216]">{cars.length}</div>
            <p className="text-[11px] text-[#237A52] font-semibold mt-1">Verified vehicles live →</p>
          </div>

          <div
            onClick={() => setActiveTab('inquiries')}
            className={`bg-white rounded-2xl border p-5 shadow-2xs cursor-pointer hover:border-[#E5325C] hover:shadow-xs transition-all ${
              activeTab === 'inquiries' ? 'border-[#E5325C] ring-2 ring-[#FFF0F3]' : 'border-[#E5E7EB]'
            }`}
          >
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Car Inquiries</span>
              <div className="w-8 h-8 rounded-lg bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#101216]">{inquiries.length}</div>
            <p className="text-[11px] text-[#E5325C] font-semibold mt-1">
              {inquiries.filter((i) => i.status === 'New').length} pending inquiries →
            </p>
          </div>

          <div
            onClick={() => setActiveTab('leads')}
            className={`bg-white rounded-2xl border p-5 shadow-2xs cursor-pointer hover:border-[#E5325C] hover:shadow-xs transition-all ${
              activeTab === 'leads' ? 'border-[#E5325C] ring-2 ring-[#FFF0F3]' : 'border-[#E5E7EB]'
            }`}
          >
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Sell Requests</span>
              <div className="w-8 h-8 rounded-lg bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#101216]">{sellRequests.length}</div>
            <p className="text-[11px] text-gray-500 font-semibold mt-1">Customer cars submitted →</p>
          </div>

          <div
            onClick={() => setActiveTab('customers')}
            className={`bg-white rounded-2xl border p-5 shadow-2xs cursor-pointer hover:border-[#E5325C] hover:shadow-xs transition-all ${
              activeTab === 'customers' ? 'border-[#E5325C] ring-2 ring-[#FFF0F3]' : 'border-[#E5E7EB]'
            }`}
          >
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Customers</span>
              <div className="w-8 h-8 rounded-lg bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#101216]">{customers.length}</div>
            <p className="text-[11px] text-[#237A52] font-semibold mt-1">Supabase synchronized →</p>
          </div>

          <div
            onClick={() => setActiveTab('cars')}
            className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs sm:col-span-2 lg:col-span-1 cursor-pointer hover:border-[#E5325C] hover:shadow-xs transition-all"
          >
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Inventory Value</span>
              <div className="w-8 h-8 rounded-lg bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#101216]">
              {formatINR(cars.reduce((acc, curr) => acc + curr.price, 0))}
            </div>
            <p className="text-[11px] text-gray-500 font-semibold mt-1">Gross live catalog →</p>
          </div>
        </div>

                {/* ========================================================
            TAB 1: DEDICATED SECTIONS FOR EACH ENTITY
        ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* DEDICATED SECTION 1: VEHICLES IN INVENTORY */}
            <section id="sec-inventory" className="bg-white rounded-3xl border border-[#E5E7EB] p-6 space-y-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center flex-shrink-0">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#FFF0F3] text-[#E5325C] text-[10px] font-extrabold uppercase tracking-wider border border-[#FFD6DF]">
                        Dedicated Section 1 of 5
                      </span>
                      <span className="text-xs font-bold text-gray-400">• {cars.length} Verified Cars</span>
                    </div>
                    <h3 className="font-extrabold text-lg text-[#101216] mt-0.5">Vehicles in Inventory</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsAddCarModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFF0F3] hover:bg-[#FFE0E6] text-[#E5325C] text-xs font-bold border border-[#FFD6DF] transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Add Listing</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('cars')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#101216] hover:bg-black text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <span>Manage All ({cars.length})</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cars.slice(0, 6).map((car) => (
                  <div key={car.id} className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] hover:border-[#E5325C]/40 transition-all flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-11 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                        <img src={car.image} alt={car.model} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#101216] truncate">{car.make} {car.model}</h4>
                        <p className="text-[11px] text-gray-500 truncate">{car.year} • {car.city} • {formatKM(car.kilometers)}</p>
                        <span className="inline-block mt-0.5 text-[10px] text-[#237A52] font-bold">
                          ★ {car.inspectionScore}/100 Inspection
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-extrabold text-[#101216] block">{formatINR(car.price)}</span>
                      <Link
                        href={`/cars/${car.id}`}
                        className="text-[10px] text-[#E5325C] font-bold hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>View</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* DEDICATED SECTION 2: CAR INQUIRIES */}
            <section id="sec-inquiries" className="bg-white rounded-3xl border border-[#E5E7EB] p-6 space-y-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#FFF0F3] text-[#E5325C] text-[10px] font-extrabold uppercase tracking-wider border border-[#FFD6DF]">
                        Dedicated Section 2 of 5
                      </span>
                      <span className="text-xs font-bold text-gray-400">• {inquiries.length} Inquiries Received</span>
                    </div>
                    <h3 className="font-extrabold text-lg text-[#101216] mt-0.5">Customer Car Inquiries</h3>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('inquiries')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#101216] hover:bg-black text-white text-xs font-bold transition-all cursor-pointer shadow-2xs self-start sm:self-center"
                >
                  <span>Open Inquiries Workspace ({inquiries.length})</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inquiries.slice(0, 6).map((inq) => (
                  <div key={inq.id} className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#101216]">{inq.userName}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF0F3] text-[#E5325C] border border-[#FFD6DF]">
                          {inq.inquiryType}
                        </span>
                      </div>
                      <p className="text-xs text-[#E5325C] font-semibold mt-1 truncate">
                        Car: {inq.carTitle}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2 italic mt-1 bg-white p-2.5 rounded-xl border border-gray-100">
                        &ldquo;{inq.message}&rdquo;
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-xs">
                      <span className="text-[11px] text-gray-500">{inq.city}</span>
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${inq.userPhone}`}
                          className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold border border-emerald-200"
                          title="Call user"
                        >
                          Call
                        </a>
                        <a
                          href={`mailto:${inq.userEmail}`}
                          className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold border border-blue-200"
                          title="Email user"
                        >
                          Email
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
                {inquiries.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-400 text-xs">
                    No customer inquiries received yet.
                  </div>
                )}
              </div>
            </section>

            {/* DEDICATED SECTION 3: SELL REQUESTS */}
            <section id="sec-sell" className="bg-white rounded-3xl border border-[#E5E7EB] p-6 space-y-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#FFF0F3] text-[#E5325C] text-[10px] font-extrabold uppercase tracking-wider border border-[#FFD6DF]">
                        Dedicated Section 3 of 5
                      </span>
                      <span className="text-xs font-bold text-gray-400">• {sellRequests.length} Customer Cars Submitted</span>
                    </div>
                    <h3 className="font-extrabold text-lg text-[#101216] mt-0.5">Customer Sell Requests & Doorstep Inspections</h3>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('leads')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#101216] hover:bg-black text-white text-xs font-bold transition-all cursor-pointer shadow-2xs self-start sm:self-center"
                >
                  <span>Open Sell Requests Workspace ({sellRequests.length})</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sellRequests.map((req) => (
                  <div key={req.id} className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] flex flex-col justify-between space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-[#101216]">
                            {req.year} {req.make} {req.model}
                          </h4>
                          <span className="font-mono text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded-md border border-[#E5E7EB]">
                            {req.id}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Seller: <span className="font-bold text-gray-900">{req.sellerName}</span> • {req.sellerPhone} • {req.sellerCity}
                        </p>
                        <p className="text-xs text-[#237A52] font-bold mt-1">
                          Price Evaluation: Free Doorstep Physical Inspection (Quote given on evaluation)
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFF0F3] text-[#E5325C] border border-[#FFD6DF] flex-shrink-0">
                        {req.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-xs">
                      <span className="text-[11px] text-gray-500">
                        Slot: {req.preferredInspectionDate} ({req.preferredInspectionTime || 'Morning'})
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${req.sellerPhone}`}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call Seller</span>
                        </a>
                        <a
                          href={`https://wa.me/91${req.sellerPhone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(req.sellerName)},%20regarding%20your%20${encodeURIComponent(req.make + ' ' + req.model)}%20valuation%20on%20Recars...`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] text-xs font-bold border border-[#25D366]/30 flex items-center gap-1"
                        >
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
                {sellRequests.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-gray-400 text-xs">
                    No customer sell requests recorded yet.
                  </div>
                )}
              </div>
            </section>

            {/* DEDICATED SECTION 4: REGISTERED CUSTOMERS DIRECTORY */}
            <section id="sec-customers" className="bg-white rounded-3xl border border-[#E5E7EB] p-6 space-y-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#FFF0F3] text-[#E5325C] text-[10px] font-extrabold uppercase tracking-wider border border-[#FFD6DF]">
                        Dedicated Section 4 of 5
                      </span>
                      <span className="text-xs font-bold text-gray-400">• {customers.length} Profiles in Supabase</span>
                    </div>
                    <h3 className="font-extrabold text-lg text-[#101216] mt-0.5">Registered Customers Directory</h3>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('customers')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#101216] hover:bg-black text-white text-xs font-bold transition-all cursor-pointer shadow-2xs self-start sm:self-center"
                >
                  <span>Open Customers Directory ({customers.length})</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.slice(0, 6).map((cust) => (
                  <div key={cust.id} className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center font-bold text-xs uppercase border border-[#FFD6DF] flex-shrink-0">
                        {cust.name ? cust.name.substring(0, 2) : 'CU'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#101216] truncate">{cust.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">{cust.phone || 'No phone'} • {cust.city || 'India'}</p>
                        {cust.email && <p className="text-[10px] text-gray-400 truncate">{cust.email}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {cust.phone && (
                        <a
                          href={`tel:${cust.phone}`}
                          className="p-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#FFF0F3] hover:text-[#E5325C] text-gray-600 transition-colors"
                          title="Call Customer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {cust.email && (
                        <a
                          href={`mailto:${cust.email}`}
                          className="p-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#FFF0F3] hover:text-[#E5325C] text-gray-600 transition-colors"
                          title="Email Customer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                {customers.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-400 text-xs">
                    No registered customer profiles found.
                  </div>
                )}
              </div>
            </section>

            {/* DEDICATED SECTION 5: TEST DRIVES */}
            <section id="sec-testdrives" className="bg-white rounded-3xl border border-[#E5E7EB] p-6 space-y-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#FFF0F3] text-[#E5325C] text-[10px] font-extrabold uppercase tracking-wider border border-[#FFD6DF]">
                        Dedicated Section 5 of 5
                      </span>
                      <span className="text-xs font-bold text-gray-400">• {testDrives.length} Bookings</span>
                    </div>
                    <h3 className="font-extrabold text-lg text-[#101216] mt-0.5">Test Drive & Experience Center Appointments</h3>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('testdrives')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#101216] hover:bg-black text-white text-xs font-bold transition-all cursor-pointer shadow-2xs self-start sm:self-center"
                >
                  <span>Open Test Drives Workspace ({testDrives.length})</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {testDrives.slice(0, 6).map((td) => (
                  <div key={td.id} className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] flex flex-col justify-between space-y-2 text-xs">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-[#101216] truncate">{td.carTitle}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-[#F0F9F4] border border-[#D1EAD9] text-[#237A52] font-bold text-[10px]">
                          {td.status}
                        </span>
                      </div>
                      <p className="text-gray-500 text-[11px] mt-1">
                        Customer: <span className="font-bold text-gray-800">{td.userName}</span> • {td.userPhone}
                      </p>
                      <p className="text-[#E5325C] font-semibold text-[10px] mt-0.5">
                        Slot: {td.preferredDate} ({td.type})
                      </p>
                    </div>
                    <div className="pt-2 border-t border-gray-200 flex justify-end">
                      <a
                        href={`tel:${td.userPhone}`}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 inline-flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call Customer</span>
                      </a>
                    </div>
                  </div>
                ))}
                {testDrives.length === 0 && (
                  <div className="col-span-3 text-center py-8 text-gray-400 text-xs">
                    No scheduled test drives currently pending.
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ========================================================
            TAB 2: CARS INVENTORY (ADD & REMOVE CARS)
        ========================================================= */}
        {activeTab === 'cars' && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by make, model, city..."
                  value={carSearch}
                  onChange={(e) => setCarSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:border-[#E5325C]"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Filter className="w-3.5 h-3.5 text-gray-400" />
                  <span>City:</span>
                </div>
                <select
                  value={carCityFilter}
                  onChange={(e) => setCarCityFilter(e.target.value)}
                  className="px-3 py-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                >
                  <option value="All">All Hubs</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#101216] text-white">
                    <tr>
                      <th className="p-4">Car Model</th>
                      <th className="p-4">Specs</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Hub Location</th>
                      <th className="p-4">Inspection</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {filteredCars.map((car) => (
                      <tr key={car.id} className="hover:bg-[#FFF0F3]/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <img src={car.image} alt={car.model} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-[#101216]">{car.make} {car.model}</h4>
                              <p className="text-[11px] text-gray-500">{car.variant}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600">
                          <div>{car.year} • {formatKM(car.kilometers)}</div>
                          <div className="text-[11px] text-gray-400">{car.fuelType} • {car.transmission}</div>
                        </td>
                        <td className="p-4">
                          <span className="font-extrabold text-sm text-[#101216]">{formatINR(car.price)}</span>
                          <span className="block text-[10px] text-gray-400">EMI {formatINR(car.emiPerMonth)}/mo</span>
                        </td>
                        <td className="p-4 text-gray-600">
                          <span className="font-semibold text-gray-800">{car.city}</span>
                          <span className="block text-[10px] text-gray-400">{car.locationArea}</span>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F9F4] text-[#237A52] border border-[#D1EAD9]">
                            <Check className="w-3 h-3 stroke-[2.5]" />
                            <span>{car.inspectionScore}/100</span>
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="inline-flex items-center gap-2 justify-end">
                            <Link
                              href={`/cars/${car.id}`}
                              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#E5325C] text-gray-700 hover:text-[#E5325C] font-semibold text-xs transition-colors"
                              title="View car page"
                            >
                              View
                            </Link>
                            <button
                              type="button"
                              onClick={() => setCarToDelete(car)}
                              className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-semibold text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                              title="Delete vehicle from inventory"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredCars.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">
                          No matching vehicles found in inventory.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: CAR INQUIRIES (USER REQUEST: SEE INQUIRIES ABOUT CARS)
        ========================================================= */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            {/* Inquiries Filter Bar */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer, phone, car..."
                  value={inquirySearch}
                  onChange={(e) => setInquirySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:border-[#E5325C]"
                />
              </div>

              {/* Status Filter Badges */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {['All', 'New', 'In Progress', 'Contacted', 'Closed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setInquiryStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      inquiryStatusFilter === st
                        ? 'bg-[#E5325C] text-white shadow-2xs'
                        : 'bg-[#F8F9FA] text-gray-600 hover:text-black border border-[#E5E7EB]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Inquiries Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredInquiries.map((inq) => {
                const statusStyles = {
                  'New': 'bg-[#FFF0F3] text-[#E5325C] border-[#FFD6DF]',
                  'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
                  'Contacted': 'bg-purple-50 text-purple-700 border-purple-200',
                  'Closed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                }[inq.status] || 'bg-gray-100 text-gray-800 border-gray-200';

                return (
                  <div
                    key={inq.id}
                    className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-2xs flex flex-col justify-between space-y-4 hover:border-[#E5325C]/40 transition-colors"
                  >
                    <div>
                      {/* Top Row: Customer Info + Status selector */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-base text-[#101216]">{inq.userName}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusStyles}`}>
                              {inq.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span>{inq.city}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span>{inq.createdAt?.includes('T') ? inq.createdAt.split('T')[0] : inq.createdAt}</span>
                            </span>
                          </div>
                        </div>

                        {/* Status Change Selector */}
                        <select
                          value={inq.status}
                          onChange={(e) => updateInquiryStatus(inq.id, e.target.value as CarInquiry['status'])}
                          className="text-xs px-2.5 py-1.5 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] font-bold text-gray-800 focus:outline-none focus:border-[#E5325C] cursor-pointer"
                        >
                          <option value="New">Mark New</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>

                      {/* Linked Car Banner */}
                      <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {inq.carImage && (
                            <img
                              src={inq.carImage}
                              alt={inq.carTitle}
                              className="w-12 h-8 rounded-lg object-cover bg-gray-200 flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                              Target Vehicle
                            </span>
                            <h5 className="text-xs font-bold text-[#101216] truncate">
                              {inq.carTitle}
                            </h5>
                          </div>
                        </div>
                        {inq.carPrice && (
                          <span className="text-xs font-extrabold text-[#E5325C] flex-shrink-0">
                            {formatINR(inq.carPrice)}
                          </span>
                        )}
                      </div>

                      {/* Inquiry Type & Message */}
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFF0F3] text-[#E5325C] text-xs font-bold border border-[#FFD6DF]">
                          <Tag className="w-3 h-3" />
                          <span>{inq.inquiryType}</span>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-700 leading-relaxed italic">
                          &ldquo;{inq.message}&rdquo;
                        </div>
                      </div>
                    </div>

                    {/* Action buttons footer */}
                    <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${inq.userPhone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </a>
                        <a
                          href={`mailto:${inq.userEmail}?subject=Recars Inquiry: ${inq.carTitle}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Email</span>
                        </a>
                      </div>

                      <button
                        onClick={() => handleDeleteInquiry(inq.id, inq.userName)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredInquiries.length === 0 && (
              <div className="bg-white rounded-3xl border border-[#E5E7EB] p-12 text-center text-gray-500">
                <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h4 className="font-bold text-base text-[#101216]">No inquiries match your filter</h4>
                <p className="text-xs text-gray-500 mt-1">Try selecting a different status tab or clearing the search query.</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 4: DEDICATED SELL REQUESTS & VALUATIONS SECTION
        ========================================================= */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            {/* Header & Filter Bar */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#FFF0F3] text-[#E5325C] text-[10px] font-extrabold uppercase tracking-wider border border-[#FFD6DF]">
                      Dedicated Section 3 of 5
                    </span>
                    <span className="text-xs font-bold text-gray-400">• Supabase Synced</span>
                  </div>
                  <h3 className="font-extrabold text-xl text-[#101216] mt-0.5">
                    Customer Sell Requests & Doorstep Inspections ({sellRequests.length})
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="text-xs font-bold text-[#E5325C] hover:underline self-start sm:self-center"
                >
                  ← Back to All Sections
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search seller, phone, car, ID..."
                    value={sellSearch}
                    onChange={(e) => setSellSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:border-[#E5325C]"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                  {['All', 'Inspection Scheduled', 'Inspection Completed', 'Offer Accepted', 'Car Purchased'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setSellStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        sellStatusFilter === st
                          ? 'bg-[#E5325C] text-white shadow-2xs'
                          : 'bg-[#F8F9FA] text-gray-600 hover:text-black border border-[#E5E7EB]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sell Requests Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredSellRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl border border-[#E5E7EB] p-6 shadow-2xs flex flex-col justify-between space-y-4 hover:border-[#E5325C]/40 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-base text-[#101216]">
                            {req.year} {req.make} {req.model}
                          </h4>
                          <span className="font-mono text-[10px] text-gray-500 bg-[#F8F9FA] px-2 py-0.5 rounded-md border border-[#E5E7EB]">
                            {req.id}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{req.variant || 'Standard Variant'} • {req.fuelType || 'Petrol'} • {req.transmission || 'Manual'}</p>
                      </div>

                      <select
                        value={req.status}
                        onChange={(e) => handleUpdateSellStatus(req.id, e.target.value)}
                        className="text-xs px-2.5 py-1.5 rounded-xl bg-[#FFF0F3] border border-[#FFD6DF] font-bold text-[#E5325C] focus:outline-none cursor-pointer"
                      >
                        <option value="Inspection Scheduled">Inspection Scheduled</option>
                        <option value="Inspection Completed">Inspection Completed</option>
                        <option value="Offer Accepted">Offer Accepted</option>
                        <option value="Car Purchased">Car Purchased</option>
                      </select>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Seller Name:</span>
                        <span className="font-bold text-gray-900">{req.sellerName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Contact Phone:</span>
                        <span className="font-mono font-semibold text-gray-900">{req.sellerPhone}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">City / Location:</span>
                        <span className="text-gray-800">{req.sellerCity}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Preferred Slot:</span>
                        <span className="font-semibold text-gray-800">{req.preferredInspectionDate} ({req.preferredInspectionTime || 'Morning'})</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                        <span className="text-[#237A52] font-bold">Price Evaluation:</span>
                        <span className="font-extrabold text-[#237A52]">Doorstep Physical Inspection</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${req.sellerPhone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Seller</span>
                      </a>
                      <a
                        href={`https://wa.me/91${req.sellerPhone.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(req.sellerName)},%20regarding%20your%20${encodeURIComponent(req.make + ' ' + req.model)}%20sell%20request%20(${req.id})%20on%20Recars...`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#128C7E] text-xs font-bold transition-colors"
                      >
                        <span>WhatsApp</span>
                      </a>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">
                      Ref: {req.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {filteredSellRequests.length === 0 && (
              <div className="bg-white rounded-3xl border border-[#E5E7EB] p-12 text-center text-gray-500">
                <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h4 className="font-bold text-base text-[#101216]">No sell requests match your search</h4>
                <p className="text-xs text-gray-500 mt-1">Try clearing your search query or picking another status filter.</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 5: DEDICATED TEST DRIVE BOOKINGS SECTION
        ========================================================= */}
        {activeTab === 'testdrives' && (
          <div className="space-y-4">
            {/* Header & Filter Bar */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#FFF0F3] text-[#E5325C] text-[10px] font-extrabold uppercase tracking-wider border border-[#FFD6DF]">
                      Dedicated Section 5 of 5
                    </span>
                    <span className="text-xs font-bold text-gray-400">• Doorstep & Hub Drives</span>
                  </div>
                  <h3 className="font-extrabold text-xl text-[#101216] mt-0.5">
                    Test Drive Appointments ({testDrives.length})
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="text-xs font-bold text-[#E5325C] hover:underline self-start sm:self-center"
                >
                  ← Back to All Sections
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search customer, phone, car, city..."
                    value={testDriveSearch}
                    onChange={(e) => setTestDriveSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:border-[#E5325C]"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                  {['All', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setTestDriveStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        testDriveStatusFilter === st
                          ? 'bg-[#E5325C] text-white shadow-2xs'
                          : 'bg-[#F8F9FA] text-gray-600 hover:text-black border border-[#E5E7EB]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Test Drive Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTestDrives.map((td) => (
                <div
                  key={td.id}
                  className="bg-white rounded-3xl border border-[#E5E7EB] p-5 shadow-2xs flex flex-col justify-between space-y-3 hover:border-[#E5325C]/40 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-sm text-[#101216]">{td.carTitle}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Booking ID: {td.id}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-[#F0F9F4] border border-[#D1EAD9] text-[#237A52] font-bold text-[10px]">
                        {td.status}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] mt-3 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Customer:</span>
                        <span className="font-bold text-gray-900">{td.userName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Phone:</span>
                        <span className="font-mono text-gray-800">{td.userPhone}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">City / Location:</span>
                        <span className="text-gray-800">{td.city}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Scheduled Slot:</span>
                        <span className="font-semibold text-[#E5325C]">{td.preferredDate} ({td.type})</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">Type: {td.type}</span>
                    <a
                      href={`tel:${td.userPhone}`}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Customer</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {filteredTestDrives.length === 0 && (
              <div className="bg-white rounded-3xl border border-[#E5E7EB] p-12 text-center text-gray-500">
                <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <h4 className="font-bold text-base text-[#101216]">No test drives match your search</h4>
                <p className="text-xs text-gray-500 mt-1">Try selecting a different filter or checking back later.</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 6: CUSTOMERS DIRECTORY (SUPABASE)
        ========================================================= */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            {/* Customers Dedicated Section Header */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#FFF0F3] text-[#E5325C] text-[10px] font-extrabold uppercase tracking-wider border border-[#FFD6DF]">
                      Dedicated Section 4 of 5
                    </span>
                    <span className="text-xs font-bold text-emerald-600">• Supabase DB Connected</span>
                  </div>
                  <h3 className="font-extrabold text-xl text-[#101216] mt-0.5">
                    Registered Customers Directory ({customers.length})
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="text-xs font-bold text-[#E5325C] hover:underline self-start sm:self-center"
                >
                  ← Back to All Sections
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers by name, phone, email, or city..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#E5E7EB] focus:outline-hidden focus:border-[#E5325C] bg-[#F8F9FA]"
                />
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-600 px-2">
                <Users className="w-4 h-4 text-[#E5325C]" />
                <span>{customers.length} Registered in Supabase</span>
              </div>
            </div>
          </div>

          {/* Customers Table / Grid */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="py-3.5 px-6">Customer</th>
                      <th className="py-3.5 px-6">Phone Number</th>
                      <th className="py-3.5 px-6">Email Address</th>
                      <th className="py-3.5 px-6">Location</th>
                      <th className="py-3.5 px-6">Created In DB</th>
                      <th className="py-3.5 px-6 text-right">Direct Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] text-xs">
                    {customers
                      .filter((c) => {
                        if (!customerSearch) return true;
                        const q = customerSearch.toLowerCase();
                        return (
                          c.name?.toLowerCase().includes(q) ||
                          c.phone?.toLowerCase().includes(q) ||
                          c.email?.toLowerCase().includes(q) ||
                          c.city?.toLowerCase().includes(q)
                        );
                      })
                      .map((cust) => (
                        <tr key={cust.id} className="hover:bg-[#FFF9FA] transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center font-bold text-xs uppercase border border-[#FFD6DF]">
                                {cust.name ? cust.name.substring(0, 2) : 'CU'}
                              </div>
                              <div>
                                <p className="font-bold text-[#101216]">{cust.name}</p>
                                <p className="text-[10px] text-gray-400 font-mono">{cust.id?.substring(0, 8)}...</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              <span className="font-mono text-gray-800">{cust.phone || '—'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-gray-700">{cust.email || '—'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              <span>{cust.city || 'India'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-gray-500 text-[11px]">
                            {cust.created_at ? new Date(cust.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            }) : 'Recently'}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="inline-flex items-center gap-2">
                              {cust.phone && (
                                <a
                                  href={`tel:${cust.phone}`}
                                  className="p-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#FFF0F3] hover:text-[#E5325C] text-gray-600 transition-colors"
                                  title="Call Customer"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {cust.email && (
                                <a
                                  href={`mailto:${cust.email}`}
                                  className="p-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#FFF0F3] hover:text-[#E5325C] text-gray-600 transition-colors"
                                  title="Email Customer"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    {customers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-gray-400">
                          <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                          No customers recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================
          DELETE CAR CONFIRMATION MODAL
      ========================================================= */}
      {carToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-[#E5E7EB] p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#101216]">Confirm Vehicle Removal</h3>
                <p className="text-xs text-gray-500">This vehicle will be delisted from the live inventory.</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] flex items-center gap-3">
              <img
                src={carToDelete.image}
                alt={carToDelete.model}
                className="w-14 h-10 rounded-lg object-cover bg-gray-200"
              />
              <div>
                <h4 className="font-bold text-sm text-[#101216]">{carToDelete.make} {carToDelete.model}</h4>
                <p className="text-xs text-gray-500">{carToDelete.year} • {formatINR(carToDelete.price)} • {carToDelete.city}</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to permanently remove this car listing from Recars? All associated customer views and active inventory references will be removed immediately.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCarToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-xs text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCar}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 font-bold text-xs text-white shadow-sm cursor-pointer"
              >
                Yes, Remove Vehicle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ADD CAR MODAL (COMPREHENSIVE VEHICLE FORM)
      ========================================================= */}
      {isAddCarModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-[#E5E7EB] p-6 sm:p-8 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#101216]">Add Verified Vehicle to Inventory</h3>
                  <p className="text-xs text-gray-500">Fill in vehicle specifications to publish on Recars marketplace</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddCarModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCar} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#101216] mb-1">Make / Brand</label>
                  <select
                    value={newMake}
                    onChange={(e) => setNewMake(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                  >
                    {MAKES.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#101216] mb-1">Model Name</label>
                  <input
                    type="text"
                    required
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    placeholder="e.g. Creta, City, Thar..."
                    className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#101216] mb-1">Variant</label>
                  <input
                    type="text"
                    required
                    value={newVariant}
                    onChange={(e) => setNewVariant(e.target.value)}
                    placeholder="e.g. SX (O) DCT Turbo"
                    className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#101216] mb-1">Registration Year</label>
                  <input
                    type="number"
                    min={2014}
                    max={2026}
                    value={newYear}
                    onChange={(e) => setNewYear(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#101216] mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    step={10000}
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#101216] mb-1">Kilometers Driven</label>
                  <input
                    type="number"
                    value={newKm}
                    onChange={(e) => setNewKm(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#101216] mb-1">Fuel Type</label>
                  <select
                    value={newFuel}
                    onChange={(e) => setNewFuel(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="CNG">CNG</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#101216] mb-1">Transmission</label>
                  <select
                    value={newTransmission}
                    onChange={(e) => setNewTransmission(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#101216] mb-1">Body Type</label>
                  <select
                    value={newBodyType}
                    onChange={(e) => setNewBodyType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                  >
                    <option value="SUV">SUV</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Luxury">Luxury</option>
                    <option value="MUV">MUV</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#101216] mb-1">Hub City</label>
                  <select
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#101216] mb-1">Ownership</label>
                  <select
                    value={newOwnership}
                    onChange={(e) => setNewOwnership(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                  >
                    <option value="1st Owner">1st Owner</option>
                    <option value="2nd Owner">2nd Owner</option>
                    <option value="3rd Owner">3rd Owner</option>
                  </select>
                </div>
              </div>

              {/* Photo Selector */}
              <div>
                <label className="block font-bold text-[#101216] mb-1">Vehicle Image Preset or Custom Path</label>
                <div className="flex gap-2">
                  <select
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                  >
                    {AVAILABLE_IMAGES.map((img) => (
                      <option key={img.url} value={img.url}>{img.label}</option>
                    ))}
                  </select>
                  <div className="w-12 h-10 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 flex-shrink-0">
                    <img src={newImage} alt="preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              {/* Badges & Description */}
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800">
                  <input
                    type="checkbox"
                    checked={newIsVerified}
                    onChange={(e) => setNewIsVerified(e.target.checked)}
                    className="w-4 h-4 text-[#E5325C] rounded border-gray-300 focus:ring-[#E5325C]"
                  />
                  <span>Mark as 200+ Point Verified</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800">
                  <input
                    type="checkbox"
                    checked={newIsSelect}
                    onChange={(e) => setNewIsSelect(e.target.checked)}
                    className="w-4 h-4 text-[#E5325C] rounded border-gray-300 focus:ring-[#E5325C]"
                  />
                  <span>Recars Select Tier</span>
                </label>
              </div>

              <div>
                <label className="block font-bold text-[#101216] mb-1">Inspection Score (out of 100)</label>
                <input
                  type="number"
                  min={80}
                  max={100}
                  value={newScore}
                  onChange={(e) => setNewScore(Number(e.target.value))}
                  className="w-32 px-3 py-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#101216] mb-1">Description & Highlights</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-medium text-gray-800 focus:outline-none focus:border-[#E5325C]"
                />
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddCarModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 font-bold text-xs text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#E5325C] hover:bg-[#D4264E] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Publish Vehicle to Recars
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
