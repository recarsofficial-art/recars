'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  ShieldCheck,
  Lock,
  LogOut,
  EyeOff,
  ArrowLeft,
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
  Upload,
  Image as ImageIcon,
  Handshake,
  Sliders,
  TrendingUp,
  Banknote,
  Send,
  SlidersHorizontal,
} from 'lucide-react';
import Footer from '@/components/Footer';
import Logo from '@/components/Logo';
import { useRecarsState } from '@/lib/store';
import { formatINR, formatKM } from '@/lib/formatters';
import { Car as CarType, CarInquiry, SellRequest, TestDriveBooking, Negotiation, InspectionConfig, VehicleAvailability, PDIBooking } from '@/lib/types';
import { MAKES, CITIES } from '@/lib/data';

const AVAILABLE_IMAGES = [
  { label: 'Hyundai Creta (Metallic Titan Grey Studio SUV)', url: '/car-creta-hd.jpg' },
  { label: 'Honda City (Platinum White Pearl Studio Sedan)', url: '/car-city-hd.jpg' },
  { label: 'Toyota Fortuner (Attitude Black 4x4 Studio SUV)', url: '/car-fortuner-hd.jpg' },
  { label: 'Kia Seltos (Glacier White Studio Compact SUV)', url: '/car-seltos-hd.jpg' },
  { label: 'Tata Nexon EV (Teal Dual-Tone Electric SUV)', url: '/car-nexon-hd.jpg' },
  { label: 'BMW 3-Series (Portimao Blue Luxury Sports Sedan)', url: '/car-bmw-hd.jpg' },
  { label: 'Maruti Suzuki Swift (Fire Red Studio Hatchback)', url: '/car-swift-hd.jpg' },
  { label: 'Toyota Innova Crysta (Garnet Red Luxury MUV)', url: '/car-innova-hd.jpg' },
  { label: 'Hyundai i20 (Fiery Red Studio Hatchback)', url: '/car-i20-hd.jpg' },
  { label: 'Hyundai Venue (Polar White Studio Compact SUV)', url: '/car-venue-hd.jpg' },
];

export default function AdminDashboardPage() {
  const {
    cars: storeCars,
    sellRequests: storeSellRequests,
    testDrives: storeTestDrives,
    inquiries: storeInquiries,
    pdiBookings: storePDIBookings,
    addCarListing,
    removeCarListing,
    removeInquiry,
    updateInquiryStatus,
  } = useRecarsState();

  const [activeTab, setActiveTab] = useState<'overview' | 'cars' | 'pdi' | 'negotiations' | 'inquiries' | 'leads' | 'testdrives' | 'customers' | 'settings'>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Admin Portal Restricted Authentication States
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isCheckingAdminAuth, setIsCheckingAdminAuth] = useState(true);
  const [adminUser, setAdminUser] = useState<{ email: string; name: string; role: string } | null>(null);

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [isAdminLoggingIn, setIsAdminLoggingIn] = useState(false);

  // Live Supabase synced states
  const [liveCars, setLiveCars] = useState<CarType[]>([]);
  const [liveSellRequests, setLiveSellRequests] = useState<SellRequest[]>([]);
  const [liveInquiries, setLiveInquiries] = useState<CarInquiry[]>([]);
  const [liveCustomers, setLiveCustomers] = useState<any[]>([]);
  const [liveTestDrives, setLiveTestDrives] = useState<TestDriveBooking[]>([]);
  const [liveNegotiations, setLiveNegotiations] = useState<Negotiation[]>([]);
  const [livePDIBookings, setLivePDIBookings] = useState<PDIBooking[]>([]);
  const [inspectionConfig, setInspectionConfig] = useState<InspectionConfig>({
    sellerInspectionFee: 999,
    sellerReportFee: 1199,
    buyerInspectionFee: 999,
    pdiInspectionFee: 2500,
    pdiReportFee: 2499,
    freeInspectionActive: false,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // PDI Filters state
  const [pdiStatusFilter, setPdiStatusFilter] = useState<string>('All');
  const [pdiSearch, setPdiSearch] = useState<string>('');

  // Counter Offer Modal state
  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
  const [selectedNegotiation, setSelectedNegotiation] = useState<Negotiation | null>(null);
  const [counterOfferAmount, setCounterOfferAmount] = useState<number>(0);
  const [counterOfferNotes, setCounterOfferNotes] = useState<string>('');

  // Negotiations filter state
  const [negotiationStatusFilter, setNegotiationStatusFilter] = useState<string>('All');
  const [negotiationSearch, setNegotiationSearch] = useState<string>('');

  // Customer Car Sell Approval Modal State
  const [approvingSellReq, setApprovingSellReq] = useState<SellRequest | null>(null);
  const [approveListingPrice, setApproveListingPrice] = useState<number>(750000);
  const [approveImage, setApproveImage] = useState<string>('/car-creta-real.jpg');
  const [approveInspectionScore, setApproveInspectionScore] = useState<number>(96);
  const [approveCity, setApproveCity] = useState<string>('Warangal');
  const [approveDescription, setApproveDescription] = useState<string>('');
  const [approveIsSelect, setApproveIsSelect] = useState<boolean>(true);
  const [isSubmittingApproval, setIsSubmittingApproval] = useState<boolean>(false);

  // Email Notification States
  const [emailNotifs, setEmailNotifs] = useState<Record<string, { status: string; errorMessage?: string; sentAt?: string }>>({});
  const [retryingNotifId, setRetryingNotifId] = useState<string | null>(null);

  const handleRetryEmail = async (enquiryId: string) => {
    setRetryingNotifId(enquiryId);
    try {
      const res = await fetch('/api/admin/notifications/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enquiryId }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Email notification sent successfully to recars.in@gmail.com!');
      } else {
        alert(data.message || data.error || 'Failed to send notification email. Please check SMTP settings.');
      }
      syncAllFromSupabase();
    } catch (err: any) {
      alert('Error triggering retry: ' + err.message);
    } finally {
      setRetryingNotifId(null);
    }
  };

  const renderEmailBadge = (id: string) => {
    const notif = emailNotifs[id];
    return (
      <div className="flex items-center gap-1.5 flex-wrap pt-1">
        {notif?.status === 'sent' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Alert Sent to Email</span>
          </span>
        )}
        {notif?.status === 'failed' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200" title={notif.errorMessage}>
            <AlertCircle className="w-3 h-3 text-red-600" />
            <span>Alert Failed</span>
          </span>
        )}
        {(!notif || notif.status === 'pending') && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200" title={notif?.errorMessage || 'Delivery queued/pending'}>
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Email {notif?.status === 'pending' ? 'Pending' : 'Queue'}</span>
          </span>
        )}
        <button
          type="button"
          onClick={() => handleRetryEmail(id)}
          disabled={retryingNotifId === id}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] font-bold border border-gray-300 transition-colors cursor-pointer"
          title="Send / resend notification to recars.in@gmail.com"
        >
          <Send className="w-2.5 h-2.5" />
          <span>{retryingNotifId === id ? 'Sending...' : notif?.status === 'sent' ? 'Resend' : 'Send'}</span>
        </button>
      </div>
    );
  };

  const syncAllFromSupabase = async () => {
    setIsSyncing(true);
    try {
      const [carsRes, sellRes, inqRes, custRes, tdRes, negRes, setRes, pdiRes, notifRes] = await Promise.all([
        fetch('/api/cars').then((r) => r.json()).catch(() => null),
        fetch('/api/sell').then((r) => r.json()).catch(() => null),
        fetch('/api/inquiries').then((r) => r.json()).catch(() => null),
        fetch('/api/customers').then((r) => r.json()).catch(() => null),
        fetch('/api/test-drive').then((r) => r.json()).catch(() => null),
        fetch('/api/negotiations').then((r) => r.json()).catch(() => null),
        fetch('/api/settings').then((r) => r.json()).catch(() => null),
        fetch('/api/pdi').then((r) => r.json()).catch(() => null),
        fetch('/api/admin/notifications').then((r) => r.json()).catch(() => null),
      ]);

      if (carsRes?.cars) setLiveCars(carsRes.cars);
      if (sellRes?.customerCars) setLiveSellRequests(sellRes.customerCars);
      if (inqRes?.inquiries) setLiveInquiries(inqRes.inquiries);
      if (custRes?.customers) setLiveCustomers(custRes.customers);
      if (tdRes?.testDrives) setLiveTestDrives(tdRes.testDrives);
      if (negRes?.negotiations) setLiveNegotiations(negRes.negotiations);
      if (setRes?.config) setInspectionConfig(setRes.config);
      if (pdiRes?.bookings) setLivePDIBookings(pdiRes.bookings);
      if (notifRes?.notifications) {
        const map: Record<string, any> = {};
        notifRes.notifications.forEach((n: any) => {
          map[n.enquiryId] = n;
        });
        setEmailNotifs(map);
      }
      setLastSyncTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (e) {
      console.error('Error syncing admin with Supabase:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const checkAdminAuth = async () => {
    try {
      const res = await fetch('/api/admin/auth');
      const data = await res.json();
      if (data.authenticated && data.admin) {
        setIsAdminAuthenticated(true);
        setAdminUser(data.admin);
        return true;
      }
      setIsAdminAuthenticated(false);
      setAdminUser(null);
      return false;
    } catch {
      setIsAdminAuthenticated(false);
      setAdminUser(null);
      return false;
    } finally {
      setIsCheckingAdminAuth(false);
    }
  };

  const handleAdminEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError(null);
    setIsAdminLoggingIn(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: adminEmail,
          password: adminPassword,
        }),
      });
      const data = await res.json();
      if (data.success && data.admin) {
        setIsAdminAuthenticated(true);
        setAdminUser(data.admin);
        syncAllFromSupabase();
        showToast(`Authenticated as Administrator: ${data.admin.email}`);
      } else {
        setAdminAuthError(data.error || 'Authentication failed. Please verify admin credentials.');
      }
    } catch (err: any) {
      setAdminAuthError(err.message || 'Connection error. Please try again.');
    } finally {
      setIsAdminLoggingIn(false);
    }
  };

  const handleAdminGoogleLogin = async () => {
    setAdminAuthError(null);
    setIsAdminLoggingIn(true);
    try {
      const { signInWithPopup } = await import('firebase/auth');
      const { auth, googleProvider } = await import('@/lib/firebase');
      const cred = await signInWithPopup(auth, googleProvider);
      const googleUser = cred.user;

      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'google_admin',
          email: googleUser.email,
          name: googleUser.displayName || 'Recars Administrator',
        }),
      });
      const data = await res.json();
      if (data.success && data.admin) {
        setIsAdminAuthenticated(true);
        setAdminUser(data.admin);
        syncAllFromSupabase();
        showToast(`Administrator verified: ${data.admin.email}`);
      } else {
        setAdminAuthError(data.error || 'Access denied: This Google account is not an authorized administrator.');
      }
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setAdminAuthError(err.message || 'Google administrator authentication failed.');
      }
    } finally {
      setIsAdminLoggingIn(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
    } catch {
      // ignore
    }
    setIsAdminAuthenticated(false);
    setAdminUser(null);
    setAdminPassword('');
    showToast('Administrator session closed securely.');
  };

  useEffect(() => {
    setMounted(true);
    checkAdminAuth().then((authed) => {
      if (authed) syncAllFromSupabase();
    });

    const handleFocus = () => {
      if (isAdminAuthenticated) syncAllFromSupabase();
    };
    window.addEventListener('focus', handleFocus);
    const handleVis = () => {
      if (document.visibilityState === 'visible' && isAdminAuthenticated) syncAllFromSupabase();
    };
    document.addEventListener('visibilitychange', handleVis);
    const interval = setInterval(() => {
      if (isAdminAuthenticated) syncAllFromSupabase();
    }, 6000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVis);
      clearInterval(interval);
    };
  }, [isAdminAuthenticated]);

  useEffect(() => {
    if (isAdminAuthenticated) {
      syncAllFromSupabase();
    }
  }, [activeTab, isAdminAuthenticated]);

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
  const [newMfgYear, setNewMfgYear] = useState(2022);
  const [newRegYear, setNewRegYear] = useState(2023);
  const [newPrice, setNewPrice] = useState(1050000);
  const [newKm, setNewKm] = useState(22000);
  const [newFuel, setNewFuel] = useState<'Petrol' | 'Diesel' | 'Electric' | 'Hybrid' | 'CNG'>('Petrol');
  const [newTransmission, setNewTransmission] = useState<'Manual' | 'Automatic'>('Automatic');
  const [newBodyType, setNewBodyType] = useState<'SUV' | 'Sedan' | 'Hatchback' | 'Luxury' | 'MUV' | 'Electric'>('SUV');
  const [newOwnership, setNewOwnership] = useState<'1st Owner' | '2nd Owner' | '3rd Owner'>('1st Owner');
  const [newAvailability, setNewAvailability] = useState<VehicleAvailability>('Available');
  const [newInsuranceStatus, setNewInsuranceStatus] = useState<'Valid' | 'Expired' | 'Unavailable'>('Valid');
  const [newInsuranceExpiry, setNewInsuranceExpiry] = useState('Nov 2026');
  const [newInsuranceType, setNewInsuranceType] = useState<'Comprehensive' | 'Zero Depreciation' | 'Third Party'>('Comprehensive');
  const [newFinanceAvailable, setNewFinanceAvailable] = useState<'Available' | 'Not Available' | 'Subject to Approval'>('Available');
  const [newSuggestedMin, setNewSuggestedMin] = useState(980000);
  const [newSuggestedMax, setNewSuggestedMax] = useState(1080000);
  const [newCity, setNewCity] = useState('Warangal');
  const [newLocationArea, setNewLocationArea] = useState('Hanamkonda Recars Hub');
  const [newImage, setNewImage] = useState('/car-creta-hd.jpg');
  const [newGalleryImages, setNewGalleryImages] = useState<string[]>(['/car-creta-hd.jpg']);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url' | 'preset'>('upload');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [newScore, setNewScore] = useState(97);
  const [newIsVerified, setNewIsVerified] = useState(true);
  const [newIsSelect, setNewIsSelect] = useState(true);
  const [newDescription, setNewDescription] = useState('Dealer managed immaculate single-owner vehicle with full service record.');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const pdiList = livePDIBookings.length > 0 ? livePDIBookings : storePDIBookings;

  const handleUpdatePDIStatus = async (
    bookingId: string,
    newStatus: string,
    repDetails?: { name: string; phone: string; badgeId: string }
  ) => {
    try {
      const res = await fetch('/api/pdi', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, status: newStatus, assignedRepresentative: repDetails }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`PDI booking ${bookingId} updated to "${newStatus}"!`);
        await syncAllFromSupabase();
      } else {
        showToast(data.error || 'Failed to update PDI status.');
      }
    } catch {
      showToast('Error updating PDI booking.');
    }
  };

  const handleUpdateCarAvailability = async (carId: string, availabilityStatus: string) => {
    try {
      const res = await fetch('/api/cars', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: carId, availabilityStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Vehicle availability updated to "${availabilityStatus}"`);
        await syncAllFromSupabase();
      } else {
        showToast('Failed to update availability');
      }
    } catch {
      showToast('Error updating vehicle availability');
    }
  };

  const handleAcceptNegotiation = async (neg: Negotiation) => {
    try {
      const res = await fetch('/api/negotiations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: neg.id,
          status: 'Accepted',
          notes: 'Offer accepted by Recars administrator.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Offer from ${neg.customerName} for ${formatINR(neg.customerOffer)} ACCEPTED!`);
        await syncAllFromSupabase();
      } else {
        showToast(data.error || 'Failed to accept offer.');
      }
    } catch {
      showToast('Error accepting offer.');
    }
  };

  const handleRejectNegotiation = async (neg: Negotiation) => {
    if (!confirm(`Reject offer of ${formatINR(neg.customerOffer)} from ${neg.customerName}?`)) return;
    try {
      const res = await fetch('/api/negotiations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: neg.id,
          status: 'Rejected',
          notes: 'Offer declined by pricing desk.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Offer from ${neg.customerName} marked as Rejected.`);
        await syncAllFromSupabase();
      } else {
        showToast(data.error || 'Failed to reject offer.');
      }
    } catch {
      showToast('Error rejecting offer.');
    }
  };

  const handleSubmitCounterOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNegotiation) return;
    try {
      const res = await fetch('/api/negotiations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedNegotiation.id,
          status: 'Counteroffer',
          counterOffer: Number(counterOfferAmount),
          notes: counterOfferNotes || `Recars team proposed counteroffer of ${formatINR(Number(counterOfferAmount))}.`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Counteroffer of ${formatINR(Number(counterOfferAmount))} transmitted to ${selectedNegotiation.customerName}!`);
        setIsCounterModalOpen(false);
        setSelectedNegotiation(null);
        await syncAllFromSupabase();
      } else {
        showToast(data.error || 'Failed to send counteroffer.');
      }
    } catch {
      showToast('Error transmitting counteroffer.');
    }
  };

  const handleSaveInspectionConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'inspection_config',
          value: inspectionConfig,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Inspection charges and policies successfully updated & live!');
        await syncAllFromSupabase();
      } else {
        showToast('Failed to update inspection charges.');
      }
    } catch {
      showToast('Error saving inspection configuration.');
    }
  };

  const handleImageFileUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setIsUploadingImage(true);

    try {
      const fileList = Array.from(files);
      const uploadedUrls: string[] = [];

      for (const file of fileList) {
        if (!file.type.startsWith('image/')) {
          setUploadError('Please select valid JPG or image files.');
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (data.success && data.url) {
          uploadedUrls.push(data.url);
        } else {
          // Client-side base64 fallback
          const base64: string = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          uploadedUrls.push(base64);
        }
      }

      if (uploadedUrls.length > 0) {
        setNewImage(uploadedUrls[0]);
        setNewGalleryImages((prev) => Array.from(new Set([...uploadedUrls, ...prev])));
        showToast(`Uploaded ${uploadedUrls.length} high-resolution JPG image(s)!`);
      }
    } catch (err: any) {
      console.error('File upload failed:', err);
      setUploadError('Failed to process JPG upload. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeGalleryImage = (urlToRemove: string) => {
    const updated = newGalleryImages.filter((u) => u !== urlToRemove);
    setNewGalleryImages(updated);
    if (newImage === urlToRemove) {
      setNewImage(updated[0] || '/car-creta-hd.jpg');
    }
  };

  const handleCreateCar = async (e: React.FormEvent) => {
    e.preventDefault();
    const created: CarType = {
      id: `recars-${Date.now()}`,
      createdAt: new Date().toISOString(),
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
      availabilityStatus: newAvailability,
      manufacturingYear: Number(newMfgYear),
      registrationYear: Number(newRegYear),
      insuranceStatus: newInsuranceStatus,
      insuranceExpiry: newInsuranceExpiry,
      insuranceType: newInsuranceType,
      financeAvailable: newFinanceAvailable,
      suggestedPriceMin: Number(newSuggestedMin),
      suggestedPriceMax: Number(newSuggestedMax),
      city: newCity,
      locationArea: newLocationArea || `${newCity} Hub`,
      image: newImage || '/car-creta-hd.jpg',
      galleryImages: newGalleryImages.length > 0 ? newGalleryImages : [newImage || '/car-creta-hd.jpg'],
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
        regYear: newRegYear,
        insuranceValidTill: newInsuranceExpiry,
        color: 'Polar White',
      },
      features: ['Touchscreen Infotainment', 'Apple CarPlay & Android Auto', 'Push Button Start', 'Reverse Camera', 'ABS with EBD'],
      description: newDescription,
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

  const filteredNegotiations = liveNegotiations.filter((neg) => {
    const q = negotiationSearch.toLowerCase();
    const matchesSearch =
      !negotiationSearch ||
      neg.customerName.toLowerCase().includes(q) ||
      neg.customerPhone.includes(q) ||
      (neg.customerEmail && neg.customerEmail.toLowerCase().includes(q)) ||
      neg.carTitle.toLowerCase().includes(q);
    const matchesStatus =
      negotiationStatusFilter === 'All' || neg.status === negotiationStatusFilter;
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

  const openApproveModal = (req: SellRequest) => {
    setApprovingSellReq(req);
    const inferredPrice = req.suggestedListingPrice || req.estimatedPriceMax || 750000;
    setApproveListingPrice(inferredPrice);

    const m = `${req.make} ${req.model}`.toLowerCase();
    let defaultImg = '/car-creta-hd.jpg';
    if (m.includes('brezza')) defaultImg = '/car-brezza.jpg';
    else if (m.includes('seltos')) defaultImg = '/car-seltos.jpg';
    else if (m.includes('creta') || m.includes('venue')) defaultImg = '/car-creta-real.jpg';
    else if (m.includes('city') || m.includes('verna')) defaultImg = '/car-city.jpg';
    else if (m.includes('i20')) defaultImg = '/car-i20.jpg';
    else if (m.includes('baleno') || m.includes('swift')) defaultImg = '/car-baleno.jpg';

    setApproveImage(defaultImg);
    setApproveInspectionScore(96);
    setApproveCity(req.sellerCity || 'Warangal');
    setApproveDescription(
      `Single owner ${req.year} ${req.make} ${req.model} (${req.variant || 'Standard'}). Certified and inspected by Recars engineering team with 28+ quality checkpoints. Available for test drive in ${req.sellerCity || 'Warangal'}.`
    );
    setApproveIsSelect(true);
  };

  const handleConfirmApprove = async () => {
    if (!approvingSellReq) return;
    setIsSubmittingApproval(true);
    try {
      const res = await fetch('/api/sell/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: approvingSellReq.id,
          listingPrice: approveListingPrice,
          image: approveImage,
          city: approveCity,
          inspectionScore: approveInspectionScore,
          isSelect: approveIsSelect,
          isVerified: true,
          description: approveDescription,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Approved & published ${approvingSellReq.year} ${approvingSellReq.make} ${approvingSellReq.model} to website!`);
        setApprovingSellReq(null);
        await syncAllFromSupabase();
      } else {
        alert(data.error || 'Failed to approve vehicle');
      }
    } catch (err: any) {
      alert('Error approving car: ' + err.message);
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  const handleDelistCar = async (requestId: string) => {
    if (!confirm('Are you sure you want to remove this car from the public website?')) return;
    try {
      const res = await fetch('/api/sell/delist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Car removed from public website.');
        await syncAllFromSupabase();
      } else {
        alert(data.error || 'Failed to delist vehicle');
      }
    } catch (err: any) {
      alert('Error delisting car: ' + err.message);
    }
  };


  if (!mounted || isCheckingAdminAuth) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0F1117] items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF0F3] border border-[#FFD6DF] flex items-center justify-center text-[#E5325C] animate-pulse">
            <Shield className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-gray-400">Verifying Admin Security Authorization...</span>
        </div>
      </div>
    );
  }

  // RESTRICTED ACCESS GATE: Dedicated Admin Portal Sign-In
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0F1117] flex flex-col items-center justify-center p-4 relative overflow-hidden font-body">
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

        {/* Ambient background glows */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#E5325C]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <Logo size="lg" variant="horizontal" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F3] border border-[#FFD6DF] text-[#E5325C] text-[10px] font-extrabold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Restricted • Admin Portal Access</span>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#101216]">Admin Portal Sign In</h2>
              <p className="text-xs text-gray-500 mt-1">
                Enter your administrative credentials to manage inventory, customer inquiries, and platform records.
              </p>
            </div>
          </div>

          {adminAuthError && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{adminAuthError}</span>
            </div>
          )}

          <form onSubmit={handleAdminEmailLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">Administrator Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="Recars.in@gmail.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#E5325C] focus:ring-2 focus:ring-[#FFF0F3] outline-hidden text-xs text-gray-900 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 block">Administrator Password</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 focus:border-[#E5325C] focus:ring-2 focus:ring-[#FFF0F3] outline-hidden text-xs text-gray-900 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isAdminLoggingIn}
              className="w-full py-3 rounded-xl bg-[#E5325C] hover:bg-[#D4254E] text-white text-xs font-extrabold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAdminLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authenticating Admin...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In to Admin Hub</span>
                </>
              )}
            </button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-gray-200 w-full" />
            <span className="bg-white px-3 text-[10px] uppercase font-bold text-gray-400 tracking-wider absolute">
              or authorized sso
            </span>
          </div>

          <button
            type="button"
            onClick={handleAdminGoogleLogin}
            disabled={isAdminLoggingIn}
            className="w-full py-2.5 rounded-xl border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google (Admin Only)</span>
          </button>

          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 text-[10px] text-gray-500 leading-relaxed text-center">
            Restricted System • Only verified Recars administrators have authorized access. All administrative operations are monitored and audited.
          </div>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[#E5325C] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Recars Marketplace</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F8F9FA] font-body">
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

              {/* Dedicated Section: Pre-Delivery Inspection (PDI) */}
              <button
                onClick={() => {
                  setActiveTab('pdi');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'pdi'
                    ? 'bg-[#FFF0F3] text-[#E5325C] shadow-xs ring-1 ring-[#FFD6DF]'
                    : 'text-gray-700 hover:text-black hover:bg-gray-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    activeTab === 'pdi' ? 'bg-[#E5325C] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="block">PDI Bookings</span>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-[#E5325C] text-white">New</span>
                    </div>
                    <span className="text-[10px] font-normal text-gray-400 block">Showroom inspections</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                  pdiList.some((p) => p.status === 'Booked')
                    ? 'bg-[#E5325C] text-white animate-pulse'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {pdiList.length}
                </span>
              </button>

              {/* Dedicated Section: Negotiations */}
              <button
                onClick={() => {
                  setActiveTab('negotiations');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'negotiations'
                    ? 'bg-[#FFF0F3] text-[#E5325C] shadow-xs ring-1 ring-[#FFD6DF]'
                    : 'text-gray-700 hover:text-black hover:bg-gray-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    activeTab === 'negotiations' ? 'bg-[#E5325C] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Handshake className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block">Negotiations</span>
                    <span className="text-[10px] font-normal text-gray-400 block">Offers & counteroffers</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                  liveNegotiations.some((n) => n.status === 'Pending')
                    ? 'bg-[#E5325C] text-white animate-pulse'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {liveNegotiations.length}
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

              {/* Dedicated Section: Inspection & Platform Settings */}
              <button
                onClick={() => {
                  setActiveTab('settings');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-[#FFF0F3] text-[#E5325C] shadow-xs ring-1 ring-[#FFD6DF]'
                    : 'text-gray-700 hover:text-black hover:bg-gray-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    activeTab === 'settings' ? 'bg-[#E5325C] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block">Inspection Settings</span>
                    <span className="text-[10px] font-normal text-gray-400 block">Fee policy & rules</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                  activeTab === 'settings' ? 'bg-[#E5325C] text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  ₹{inspectionConfig.sellerInspectionFee}
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

        {/* Sidebar Footer with Admin Profile, Supabase status & Marketplace Link */}
        <div className="p-4 border-t border-[#E5E7EB] space-y-3 bg-[#F8F9FA]/60">
          {/* Authenticated Admin Account Info */}
          <div className="p-2.5 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center font-extrabold text-[10px] flex-shrink-0">
                ADM
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-[#101216] block truncate">
                  {adminUser?.email || 'Operations Admin'}
                </span>
                <span className="text-[9px] text-[#237A52] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" /> Authorized Admin
                </span>
              </div>
            </div>
            <button
              onClick={handleAdminLogout}
              title="Sign Out Administrator"
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

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
            <div className="lg:hidden flex items-center">
              <Logo size="sm" variant="emblem" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:inline">
                  Admin Control Center •
                </span>
                <h2 className="text-base font-extrabold text-[#101216]">
                  {activeTab === 'overview' && 'Dashboard Overview (All Dedicated Sections)'}
                  {activeTab === 'cars' && 'Vehicle Inventory Workspace'}
                  {activeTab === 'pdi' && 'Pre-Delivery Inspection (PDI) Workspace'}
                  {activeTab === 'negotiations' && 'Customer Price Negotiations Workspace'}
                  {activeTab === 'inquiries' && 'Customer Car Inquiries Workspace'}
                  {activeTab === 'leads' && 'Customer Sell Requests Workspace'}
                  {activeTab === 'customers' && 'Registered Customers Directory'}
                  {activeTab === 'testdrives' && 'Test Drive Appointments Workspace'}
                  {activeTab === 'settings' && 'Inspection Fees & Business Policies'}
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

            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-[#101216] leading-tight truncate max-w-[160px]">
                  {adminUser?.email || 'Recars.in@gmail.com'}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" /> Admin
                </span>
              </div>
              <button
                onClick={handleAdminLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title="Lock session & Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
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
            onClick={() => setActiveTab('pdi')}
            className={`bg-white rounded-2xl border p-5 shadow-2xs cursor-pointer hover:border-[#E5325C] hover:shadow-xs transition-all ${
              activeTab === 'pdi' ? 'border-[#E5325C] ring-2 ring-[#FFF0F3]' : 'border-[#E5E7EB]'
            }`}
          >
            <div className="flex items-center justify-between text-gray-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">PDI Bookings</span>
              <div className="w-8 h-8 rounded-lg bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#101216]">{pdiList.length}</div>
            <p className="text-[11px] text-[#E5325C] font-semibold mt-1">
              {pdiList.filter((p) => p.status === 'Booked' || p.status === 'Representative Assigned').length} showroom visits pending →
            </p>
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
                          Price Evaluation: Physical Doorstep Inspection (Quote given on evaluation)
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
            TAB: PRE-DELIVERY INSPECTION (PDI) WORKSPACE
        ========================================================= */}
        {activeTab === 'pdi' && (
          <div className="space-y-4">
            {/* Header & Filter Bar */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] p-5 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E7EB]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-[#FFF0F3] text-[#E5325C] text-[10px] font-extrabold uppercase tracking-wider border border-[#FFD6DF]">
                      Showroom Inspection Service
                    </span>
                    <span className="text-xs font-bold text-gray-400">• Representative Dispatch</span>
                  </div>
                  <h3 className="font-extrabold text-xl text-[#101216] mt-0.5">
                    Pre-Delivery Inspection (PDI) Bookings ({pdiList.length})
                  </h3>
                </div>
                <div className="flex items-center gap-2.5">
                  <Link
                    href="/pdi"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF0F3] text-[#E5325C] text-xs font-bold border border-[#FFD6DF] hover:bg-[#FFE0E6] transition-colors"
                  >
                    <span>Customer PDI Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="text-xs font-bold text-[#E5325C] hover:underline self-start sm:self-center"
                  >
                    ← Back to Overview
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search customer, phone, car, showroom, VIN..."
                    value={pdiSearch}
                    onChange={(e) => setPdiSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:border-[#E5325C]"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                  {['All', 'Booked', 'Representative Assigned', 'Representative Dispatched', 'Inspection Completed', 'Cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setPdiStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        pdiStatusFilter === st
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

            {/* PDI Bookings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pdiList
                .filter((p) => {
                  const matchStatus = pdiStatusFilter === 'All' || p.status === pdiStatusFilter;
                  const query = pdiSearch.toLowerCase().trim();
                  const matchSearch =
                    !query ||
                    p.customerName.toLowerCase().includes(query) ||
                    p.customerPhone.includes(query) ||
                    p.carMake.toLowerCase().includes(query) ||
                    p.carModel.toLowerCase().includes(query) ||
                    p.dealershipName.toLowerCase().includes(query) ||
                    p.city.toLowerCase().includes(query) ||
                    p.id.toLowerCase().includes(query);
                  return matchStatus && matchSearch;
                })
                .map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-3xl border border-[#E5E7EB] p-5 shadow-2xs hover:border-[#E5325C]/40 hover:shadow-xs transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
                        <span className="font-mono text-[11px] font-black text-[#101216]">
                          {p.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          p.status === 'Inspection Completed'
                            ? 'bg-[#F0F9F4] text-[#237A52] border border-[#D1EAD9]'
                            : p.status === 'Representative Dispatched'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : p.status === 'Representative Assigned'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-[#FFF0F3] text-[#E5325C] border border-[#FFD6DF]'
                        }`}>
                          {p.status}
                        </span>
                      </div>

                      {/* Customer Info */}
                      <div>
                        <h4 className="font-black text-sm text-[#101216]">{p.customerName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <a
                            href={`tel:${p.customerPhone}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E5325C] hover:underline"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{p.customerPhone}</span>
                          </a>
                          <span className="text-gray-300">•</span>
                          <a
                            href={`https://wa.me/${p.customerPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(p.customerName)}%2C%20regarding%20your%20Recars%20Pre-Delivery%20Inspection%20booking%20(${p.id}).`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-emerald-600 hover:underline"
                          >
                            WhatsApp
                          </a>
                        </div>
                      </div>

                      {/* New Car Info */}
                      <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 font-medium">New Car</span>
                          <span className="font-black text-[#101216]">
                            {p.carMake} {p.carModel}
                          </span>
                        </div>
                        {p.carVariant && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-gray-400">Variant</span>
                            <span className="font-semibold text-gray-700">{p.carVariant}</span>
                          </div>
                        )}
                        {p.vinOrChassis && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-gray-400">Chassis / VIN</span>
                            <span className="font-mono font-bold text-gray-700">{p.vinOrChassis}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">Showroom</span>
                          <span className="font-semibold text-gray-800 text-right truncate max-w-[160px]">
                            {p.dealershipName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">Schedule</span>
                          <span className="font-bold text-[#101216]">{p.preferredDate}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-400">Slot</span>
                          <span className="text-gray-600">{p.preferredTimeSlot}</span>
                        </div>
                      </div>

                      {/* Representative Info */}
                      <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-[11px]">
                        <span className="text-gray-400 block text-[10px] font-bold uppercase tracking-wider">
                          Inspection Representative
                        </span>
                        <div className="font-bold text-[#101216] mt-0.5">
                          {p.assignedRepresentative?.name || 'K. Rajesh Kumar (Senior Automobile Engineer)'}
                        </div>
                        <div className="text-gray-500 text-[10px]">
                          Badge: {p.assignedRepresentative?.badgeId || 'REC-ENG-042'} • Phone: {p.assignedRepresentative?.phone || '+91 99087 96677'}
                        </div>
                      </div>

                      {p.specialInstructions && (
                        <div className="text-[11px] text-gray-500 bg-amber-50/50 p-2 rounded-xl border border-amber-100">
                          <strong>Note:</strong> {p.specialInstructions}
                        </div>
                      )}

                      {/* Email Notification Status */}
                      <div className="pt-1">
                        {renderEmailBadge(p.id)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-[#E5E7EB] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Fee: <strong className="text-[#101216]">₹{p.fee}</strong></span>
                        <span className="text-[10px] font-semibold text-gray-500">{p.paymentStatus}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          onClick={() => handleUpdatePDIStatus(p.id, 'Representative Dispatched')}
                          className="py-1.5 px-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[11px] transition-colors"
                        >
                          Dispatch Rep
                        </button>
                        <button
                          onClick={() => handleUpdatePDIStatus(p.id, 'Inspection Completed')}
                          className="py-1.5 px-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] transition-colors"
                        >
                          Pass / Report Done
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              {pdiList.length === 0 && (
                <div className="col-span-3 text-center py-12 bg-white rounded-3xl border border-[#E5E7EB] space-y-2">
                  <ShieldCheck className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="text-sm font-bold text-gray-600">No Pre-Delivery Inspection bookings yet.</p>
                  <p className="text-xs text-gray-400">When customers book at /pdi, they will appear here in real time.</p>
                </div>
              )}
            </div>
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
                      <th className="p-4">Specs & Ownership</th>
                      <th className="p-4">Price & Suggested</th>
                      <th className="p-4">Availability Status</th>
                      <th className="p-4">Insurance & Finance</th>
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
                              <p className="text-[11px] text-gray-500">{car.variant} • {car.city}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600">
                          <div className="font-semibold text-gray-900">
                            {car.year} • {formatKM(car.kilometers)}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              {car.ownership || '1st Owner'}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              Mfg: {car.manufacturingYear || car.year} • Reg: {car.registrationYear || car.year}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-extrabold text-sm text-[#101216]">{formatINR(car.price)}</span>
                          {car.suggestedPriceMin && car.suggestedPriceMax ? (
                            <span className="block text-[10px] text-emerald-600 font-bold">
                              Sug: {formatINR(car.suggestedPriceMin)} - {formatINR(car.suggestedPriceMax)}
                            </span>
                          ) : (
                            <span className="block text-[10px] text-gray-400">EMI {formatINR(car.emiPerMonth)}/mo</span>
                          )}
                        </td>
                        <td className="p-4">
                          <select
                            value={car.availabilityStatus || 'Available'}
                            onChange={(e) => handleUpdateCarAvailability(car.id, e.target.value)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                              car.availabilityStatus === 'Sold Out'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : car.availabilityStatus === 'Reserved'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            <option value="Available">🟢 Available</option>
                            <option value="Reserved">🟡 Reserved</option>
                            <option value="Sold Out">🔴 Sold Out</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-gray-500">Ins:</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                car.insuranceStatus === 'Expired'
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}>
                                {car.insuranceStatus || 'Valid'} ({car.insuranceExpiry || 'Active'})
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-gray-500">Loan:</span>
                              <span className="text-[11px] font-semibold text-gray-700">
                                {car.financeAvailable || 'Available'}
                              </span>
                            </div>
                          </div>
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

                      {/* Email Notification Status */}
                      <div className="pt-1">
                        {renderEmailBadge(inq.id)}
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
                        <option value="Approved & Published">Approved & Published</option>
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

                    {/* Email Notification Status */}
                    <div className="pt-1">
                      {renderEmailBadge(req.id)}
                    </div>

                    {/* Approve & Publish to Website Controls */}
                    {req.status === 'Approved & Published' || req.publishedCarId ? (
                      <div className="flex items-center justify-between gap-2 pt-2 pb-1 border-t border-gray-100 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Live on Public Website</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          {req.publishedCarId && (
                            <a
                              href={`/cars/${req.publishedCarId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3 text-gray-600" />
                              <span>View</span>
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelistCar(req.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
                            title="Remove from public website"
                          >
                            <EyeOff className="w-3 h-3" />
                            <span>Delist</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 pb-1 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => openApproveModal(req)}
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#237A52] to-[#1e6b47] hover:from-[#1b5e3f] hover:to-[#175237] text-white text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                          <span>Approve & Publish to Website</span>
                        </button>
                      </div>
                    )}
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

                    <div className="pt-2">
                      {renderEmailBadge(td.id)}
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

        {/* ========================================================
            TAB: NEGOTIATIONS (OFFERS & COUNTEROFFERS WORKSPACE)
        ========================================================= */}
        {activeTab === 'negotiations' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer, phone, car..."
                  value={negotiationSearch}
                  onChange={(e) => setNegotiationSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:border-[#E5325C]"
                />
              </div>

              {/* Status Filter Badges */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {['All', 'Pending', 'Counteroffer', 'Accepted', 'Rejected', 'Expired'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setNegotiationStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      negotiationStatusFilter === st
                        ? 'bg-[#E5325C] text-white shadow-2xs'
                        : 'bg-[#F8F9FA] text-gray-600 hover:text-black border border-[#E5E7EB]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Negotiations Table */}
            <div className="bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#101216] text-white">
                    <tr>
                      <th className="p-4">Customer Details</th>
                      <th className="p-4">Vehicle Listing</th>
                      <th className="p-4">Offer Breakdown</th>
                      <th className="p-4">Status & History</th>
                      <th className="p-4 text-right">Negotiation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {filteredNegotiations.map((neg) => {
                      const discountAmount = neg.listedPrice - neg.customerOffer;
                      const discountPercent = neg.listedPrice > 0 ? Math.round((discountAmount / neg.listedPrice) * 100) : 0;
                      const statusStyles = {
                        'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
                        'Counteroffer': 'bg-purple-50 text-purple-700 border-purple-200',
                        'Accepted': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                        'Rejected': 'bg-red-50 text-red-700 border-red-200',
                        'Expired': 'bg-gray-100 text-gray-600 border-gray-200',
                      }[neg.status] || 'bg-gray-100 text-gray-700 border-gray-200';

                      return (
                        <tr key={neg.id} className="hover:bg-[#FFF0F3]/30 transition-colors">
                          <td className="p-4">
                            <div>
                              <h4 className="font-bold text-sm text-[#101216]">{neg.customerName}</h4>
                              <div className="flex items-center gap-2 mt-1 text-gray-500">
                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                <span className="font-mono">{neg.customerPhone}</span>
                              </div>
                              {neg.customerEmail && (
                                <div className="flex items-center gap-2 mt-0.5 text-gray-500 text-[11px]">
                                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                                  <span>{neg.customerEmail}</span>
                                </div>
                              )}
                              <p className="text-[10px] text-gray-400 mt-1">
                                {new Date(neg.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {neg.carImage && (
                                <img
                                  src={neg.carImage}
                                  alt={neg.carTitle}
                                  className="w-14 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200 flex-shrink-0"
                                />
                              )}
                              <div>
                                <h5 className="font-bold text-[#101216]">{neg.carTitle}</h5>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                  Listed: <span className="font-extrabold text-gray-800">{formatINR(neg.listedPrice)}</span>
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase text-gray-400">Offer:</span>
                                <span className="text-sm font-black text-[#E5325C]">
                                  {formatINR(neg.customerOffer)}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                Discount: {formatINR(discountAmount)} ({discountPercent}%)
                              </p>
                              {neg.counterOffer && (
                                <p className="text-[11px] font-bold text-purple-700 mt-1">
                                  Counter: {formatINR(neg.counterOffer)}
                                </p>
                              )}
                              {neg.finalPrice && (
                                <p className="text-[11px] font-extrabold text-emerald-700 mt-1">
                                  Agreed: {formatINR(neg.finalPrice)}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="p-4">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${statusStyles}`}>
                              {neg.status}
                            </span>
                            {neg.notes && (
                              <p className="text-[11px] text-gray-600 mt-1.5 italic max-w-xs">
                                "{neg.notes}"
                              </p>
                            )}
                            {neg.offerHistory && neg.offerHistory.length > 0 && (
                              <div className="mt-1 text-[10px] text-gray-400">
                                {neg.offerHistory.length} round(s) recorded
                              </div>
                            )}
                            <div className="mt-2">
                              {renderEmailBadge(neg.id)}
                            </div>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {neg.status === 'Pending' || neg.status === 'Counteroffer' ? (
                                <>
                                  <button
                                    onClick={() => handleAcceptNegotiation(neg)}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
                                    title="Accept customer offer"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedNegotiation(neg);
                                      setCounterOfferAmount(neg.customerOffer + 10000);
                                      setCounterOfferNotes('');
                                      setIsCounterModalOpen(true);
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors cursor-pointer"
                                    title="Propose a counteroffer"
                                  >
                                    Counter
                                  </button>
                                  <button
                                    onClick={() => handleRejectNegotiation(neg)}
                                    className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs transition-colors cursor-pointer"
                                    title="Decline offer"
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : (
                                <span className="text-[11px] font-bold text-gray-400">
                                  Resolved
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredNegotiations.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">
                          <Handshake className="w-8 h-8 mx-auto mb-2 opacity-40 text-gray-400" />
                          No negotiations found matching your criteria.
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
            TAB: INSPECTION CHARGES & BUSINESS POLICIES
        ========================================================= */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-8 space-y-6 shadow-2xs">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#101216]">Inspection Charges & Policy Configuration</h3>
                  <p className="text-xs text-gray-500">Transparent pricing for vehicle inspections across buyers and sellers</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveInspectionConfig} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#101216] mb-1">
                    Seller Doorstep Inspection Fee (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={inspectionConfig.sellerInspectionFee}
                    onChange={(e) =>
                      setInspectionConfig((prev) => ({
                        ...prev,
                        sellerInspectionFee: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Charged when seller schedules a doorstep inspection.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-[#101216] mb-1">
                    Buyer Comprehensive Diagnostic Fee (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={inspectionConfig.buyerInspectionFee}
                    onChange={(e) =>
                      setInspectionConfig((prev) => ({
                        ...prev,
                        buyerInspectionFee: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Charged when buyer requests third-party diagnostic verification.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-[#101216] mb-1">
                    Pre-Owned Complete Report Fee (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={inspectionConfig.sellerReportFee ?? 1199}
                    onChange={(e) =>
                      setInspectionConfig((prev) => ({
                        ...prev,
                        sellerReportFee: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Charged when seller requests complete technical certified report.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-[#101216] mb-1">
                    New Car PDI Standard Fee (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={inspectionConfig.pdiInspectionFee ?? 2500}
                    onChange={(e) =>
                      setInspectionConfig((prev) => ({
                        ...prev,
                        pdiInspectionFee: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Standard fee for certified representative showroom PDI check.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-[#101216] mb-1">
                    New Car PDI Complete Report Fee (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={inspectionConfig.pdiReportFee ?? 2499}
                    onChange={(e) =>
                      setInspectionConfig((prev) => ({
                        ...prev,
                        pdiReportFee: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Fee for complete PDI technical report + computerized OBD scan.
                  </p>
                </div>
              </div>

              {/* Promotional free inspection toggle */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inspectionConfig.freeInspectionActive}
                    onChange={(e) =>
                      setInspectionConfig((prev) => ({
                        ...prev,
                        freeInspectionActive: e.target.checked,
                      }))
                    }
                    className="mt-0.5 w-4 h-4 text-[#E5325C] rounded border-gray-300 focus:ring-[#E5325C]"
                  />
                  <div>
                    <span className="font-bold text-gray-900 block">
                      Promotional Waiver: Free Inspections Active
                    </span>
                    <span className="text-[11px] text-gray-600 block mt-0.5">
                      When enabled, customer inspection charges are waived to ₹0. Do NOT advertise inspections as free unless this business toggle is explicitly enabled.
                    </span>
                  </div>
                </label>
              </div>

              {/* Policy explanation notice */}
              <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-2">
                <h4 className="font-bold text-[#101216]">Transparent Customer Responsibility Policy</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600 text-[11px]">
                  <li>Inspection covers 28+ multi-point diagnostic checks: engine, transmission, steering, brakes, suspension, electricals, and RTO document audit.</li>
                  <li>Customer acknowledges charges prior to booking confirmation.</li>
                  <li>No customer is charged without affirmative authorization and consent.</li>
                </ul>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#E5325C] hover:bg-[#D4264E] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Save & Publish Inspection Settings
                </button>
              </div>
            </form>
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  <label className="block font-bold text-[#101216] mb-1">Ownership Count</label>
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

                <div>
                  <label className="block font-bold text-[#101216] mb-1">Availability Status</label>
                  <select
                    value={newAvailability}
                    onChange={(e) => setNewAvailability(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Sold Out">Sold Out</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-[#101216] mb-1">Mfg Year</label>
                  <input
                    type="number"
                    min={2010}
                    max={2026}
                    value={newMfgYear}
                    onChange={(e) => setNewMfgYear(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#101216] mb-1">Reg Year</label>
                  <input
                    type="number"
                    min={2010}
                    max={2026}
                    value={newRegYear}
                    onChange={(e) => setNewRegYear(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#101216] mb-1">Sug Min Price (₹)</label>
                  <input
                    type="number"
                    step={10000}
                    value={newSuggestedMin}
                    onChange={(e) => setNewSuggestedMin(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#101216] mb-1">Sug Max Price (₹)</label>
                  <input
                    type="number"
                    step={10000}
                    value={newSuggestedMax}
                    onChange={(e) => setNewSuggestedMax(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-[#101216] mb-1">Insurance Status</label>
                  <select
                    value={newInsuranceStatus}
                    onChange={(e) => setNewInsuranceStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                  >
                    <option value="Valid">Valid</option>
                    <option value="Expired">Expired</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#101216] mb-1">Insurance Expiry</label>
                  <input
                    type="text"
                    placeholder="e.g. Nov 2026"
                    value={newInsuranceExpiry}
                    onChange={(e) => setNewInsuranceExpiry(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#101216] mb-1">Insurance Type</label>
                  <select
                    value={newInsuranceType}
                    onChange={(e) => setNewInsuranceType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                  >
                    <option value="Comprehensive">Comprehensive</option>
                    <option value="Zero Depreciation">Zero Depreciation</option>
                    <option value="Third Party">Third Party</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#101216] mb-1">Finance Availability</label>
                  <select
                    value={newFinanceAvailable}
                    onChange={(e) => setNewFinanceAvailable(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                  >
                    <option value="Available">Available</option>
                    <option value="Subject to Approval">Subject to Approval</option>
                    <option value="Not Available">Not Available</option>
                  </select>
                </div>
              </div>

              {/* Photo Selector & JPG Upload */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block font-bold text-[#101216] text-xs">Vehicle Photography (.JPG)</label>
                    <p className="text-[11px] text-gray-500">Upload high-resolution .jpg images or select a studio preset</p>
                  </div>
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 self-start sm:self-center">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        imageInputMode === 'upload'
                          ? 'bg-[#E5325C] text-white shadow-xs'
                          : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      <Upload className="w-3 h-3 inline mr-1" />
                      Upload JPG
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        imageInputMode === 'url'
                          ? 'bg-[#E5325C] text-white shadow-xs'
                          : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      JPG URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('preset')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        imageInputMode === 'preset'
                          ? 'bg-[#E5325C] text-white shadow-xs'
                          : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      Studio Presets
                    </button>
                  </div>
                </div>

                {uploadError && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Option 1: Upload JPG */}
                {imageInputMode === 'upload' && (
                  <div>
                    <label
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingOver(true);
                      }}
                      onDragLeave={() => setIsDraggingOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingOver(false);
                        if (e.dataTransfer.files) handleImageFileUpload(e.dataTransfer.files);
                      }}
                      className={`flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                        isDraggingOver
                          ? 'border-[#E5325C] bg-[#FFF0F3]'
                          : 'border-gray-300 hover:border-[#E5325C] bg-white hover:bg-[#FFF0F3]/30'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#FFF0F3] text-[#E5325C] flex items-center justify-center mb-2">
                        <Upload className={`w-5 h-5 ${isUploadingImage ? 'animate-bounce' : ''}`} />
                      </div>
                      <span className="text-xs font-bold text-[#101216]">
                        {isUploadingImage ? 'Uploading JPG image...' : 'Click to browse JPG files or drag & drop'}
                      </span>
                      <span className="text-[10px] text-gray-500 mt-0.5">
                        Accepts .jpg, .jpeg, .png • High-resolution quality • Multiple photos supported
                      </span>
                      <input
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,image/jpeg,image/png,image/webp"
                        disabled={isUploadingImage}
                        onChange={(e) => e.target.files && handleImageFileUpload(e.target.files)}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {/* Option 2: JPG URL */}
                {imageInputMode === 'url' && (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      placeholder="Paste high-res JPG URL (e.g. https://.../car.jpg)"
                      className="flex-1 px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl font-medium text-gray-900 focus:outline-none focus:border-[#E5325C] text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customImageUrl.trim()) {
                          setNewImage(customImageUrl.trim());
                          setNewGalleryImages((prev) => Array.from(new Set([customImageUrl.trim(), ...prev])));
                          setCustomImageUrl('');
                          showToast('Custom JPG image applied!');
                        }
                      }}
                      className="px-3 py-2 bg-[#101216] text-white rounded-xl font-bold text-xs hover:bg-black transition-colors cursor-pointer"
                    >
                      Apply JPG
                    </button>
                  </div>
                )}

                {/* Option 3: Presets */}
                {imageInputMode === 'preset' && (
                  <select
                    value={newImage}
                    onChange={(e) => {
                      setNewImage(e.target.value);
                      setNewGalleryImages((prev) => Array.from(new Set([e.target.value, ...prev])));
                    }}
                    className="w-full px-3 py-2.5 bg-white border border-[#E5E7EB] rounded-xl font-semibold text-gray-800 focus:outline-none focus:border-[#E5325C] text-xs"
                  >
                    {AVAILABLE_IMAGES.map((img) => (
                      <option key={img.url} value={img.url}>{img.label}</option>
                    ))}
                  </select>
                )}

                {/* Live Preview & Gallery management */}
                <div className="bg-white p-3 rounded-xl border border-gray-200 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-20 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-300 flex-shrink-0 relative group">
                      <img src={newImage} alt="Vehicle Primary Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F0F9F4] text-[#237A52] text-[9px] font-extrabold uppercase border border-[#D1EAD9]">
                        Primary Listing Image
                      </span>
                      <p className="text-xs font-bold text-[#101216] mt-0.5 truncate max-w-[200px] sm:max-w-xs">{newImage}</p>
                      <p className="text-[10px] text-gray-400">High-Resolution Automotive Image</p>
                    </div>
                  </div>

                  {newGalleryImages.length > 1 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-gray-500 mr-1">Gallery ({newGalleryImages.length}):</span>
                      {newGalleryImages.map((imgUrl, i) => (
                        <div key={i} className="relative group/thumb">
                          <img
                            src={imgUrl}
                            alt={`gallery-${i}`}
                            onClick={() => setNewImage(imgUrl)}
                            className={`w-9 h-7 rounded-md object-cover border cursor-pointer transition-all ${
                              newImage === imgUrl ? 'border-[#E5325C] ring-2 ring-[#FFF0F3]' : 'border-gray-200 opacity-75 hover:opacity-100'
                            }`}
                            title="Click to set as primary image"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeGalleryImage(imgUrl);
                            }}
                            className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] font-bold opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer shadow-xs"
                            title="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
                  <span>Mark as 28+ Point Verified</span>
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

      {/* ========================================================
          COUNTEROFFER MODAL (NEGOTIATION)
      ========================================================= */}
      {isCounterModalOpen && selectedNegotiation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-[#E5E7EB] p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <Handshake className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#101216]">Propose Counteroffer</h3>
                  <p className="text-[11px] text-gray-500">Respond directly to {selectedNegotiation.customerName}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCounterModalOpen(false);
                  setSelectedNegotiation(null);
                }}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Vehicle:</span>
                <span className="font-bold text-gray-900">{selectedNegotiation.carTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Listed Price:</span>
                <span className="font-bold text-gray-900">{formatINR(selectedNegotiation.listedPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Customer Offer:</span>
                <span className="font-black text-[#E5325C]">{formatINR(selectedNegotiation.customerOffer)}</span>
              </div>
            </div>

            <form onSubmit={handleSubmitCounterOffer} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#101216] mb-1">
                  Proposed Counteroffer (₹)
                </label>
                <input
                  type="number"
                  required
                  step={5000}
                  value={counterOfferAmount}
                  onChange={(e) => setCounterOfferAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-bold text-sm text-purple-700 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block font-bold text-[#101216] mb-1">
                  Message / Remarks to Customer
                </label>
                <textarea
                  rows={2}
                  value={counterOfferNotes}
                  onChange={(e) => setCounterOfferNotes(e.target.value)}
                  placeholder="e.g. Best price considering vehicle condition, verified service history and new battery."
                  className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-medium text-gray-800 focus:outline-none focus:border-[#E5325C]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCounterModalOpen(false);
                    setSelectedNegotiation(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-xs text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 font-bold text-xs text-white shadow-md cursor-pointer transition-colors"
                >
                  Send Counteroffer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          APPROVE & PUBLISH TO WEBSITE MODAL (CUSTOMER CAR SELL)
      ========================================================= */}
      {approvingSellReq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-[#E5E7EB] p-6 space-y-4 animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#101216]">Approve & Publish Vehicle</h3>
                  <p className="text-[11px] text-gray-500">List customer car live on Recars website marketplace</p>
                </div>
              </div>
              <button
                onClick={() => setApprovingSellReq(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Car Snapshot */}
            <div className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Vehicle:</span>
                <span className="font-extrabold text-gray-900 text-sm">
                  {approvingSellReq.year} {approvingSellReq.make} {approvingSellReq.model}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Variant & Specs:</span>
                <span className="font-semibold text-gray-800">
                  {approvingSellReq.variant || 'Standard'} • {approvingSellReq.fuelType} • {approvingSellReq.transmission}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Odometer & Owner:</span>
                <span className="font-semibold text-gray-800">
                  {approvingSellReq.kilometers?.toLocaleString('en-IN')} km • {approvingSellReq.ownership}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Seller:</span>
                <span className="font-medium text-gray-700">
                  {approvingSellReq.sellerName} ({approvingSellReq.sellerPhone})
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-gray-200">
                <span className="text-gray-500">Seller Expected Range:</span>
                <span className="font-bold text-[#237A52]">
                  {formatINR(approvingSellReq.estimatedPriceMin)} - {formatINR(approvingSellReq.estimatedPriceMax)}
                </span>
              </div>
            </div>

            {/* Approval Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirmApprove();
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-[#101216] mb-1">
                  Website Listing Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  step={5000}
                  value={approveListingPrice}
                  onChange={(e) => setApproveListingPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-black text-sm text-[#E5325C] focus:outline-none focus:border-[#E5325C]"
                />
                <p className="text-[10px] text-gray-400 mt-1">This will be the public selling price shown on the website.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#101216] mb-1">
                    Inspection Score (out of 100)
                  </label>
                  <input
                    type="number"
                    min={70}
                    max={100}
                    value={approveInspectionScore}
                    onChange={(e) => setApproveInspectionScore(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-bold text-gray-800 focus:outline-none focus:border-[#E5325C]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#101216] mb-1">
                    City / Hub Location
                  </label>
                  <input
                    type="text"
                    value={approveCity}
                    onChange={(e) => setApproveCity(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-medium text-gray-800 focus:outline-none focus:border-[#E5325C]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#101216] mb-1">
                  Primary Vehicle Photo URL
                </label>
                <input
                  type="text"
                  value={approveImage}
                  onChange={(e) => setApproveImage(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-mono text-[11px] text-gray-800 focus:outline-none focus:border-[#E5325C]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#101216] mb-1">
                  Listing Description & Highlights
                </label>
                <textarea
                  rows={2}
                  value={approveDescription}
                  onChange={(e) => setApproveDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl font-medium text-gray-800 focus:outline-none focus:border-[#E5325C]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="approveSelectCheck"
                  checked={approveIsSelect}
                  onChange={(e) => setApproveIsSelect(e.target.checked)}
                  className="rounded text-[#E5325C] focus:ring-[#E5325C]"
                />
                <label htmlFor="approveSelectCheck" className="font-semibold text-gray-700 cursor-pointer">
                  Mark as &ldquo;Recars Select&rdquo; Featured Vehicle
                </label>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setApprovingSellReq(null)}
                  disabled={isSubmittingApproval}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-xs text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingApproval}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#237A52] to-[#1e6b47] hover:from-[#1b5e3f] hover:to-[#175237] font-bold text-xs text-white shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>{isSubmittingApproval ? 'Publishing...' : 'Approve & Publish Live'}</span>
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
