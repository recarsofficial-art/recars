'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Car, SellRequest, TestDriveBooking, CarInquiry, PDIBooking } from './types';

const STORAGE_KEYS = {
  WISHLIST: 'recars_wishlist_ids',
  CITY: 'recars_selected_city',
  SELL_REQUESTS: 'recars_sell_requests',
  TEST_DRIVES: 'recars_test_drives',
  CUSTOM_CARS: 'recars_custom_cars',
  DELETED_CARS: 'recars_deleted_car_ids',
  INQUIRIES: 'recars_car_inquiries',
  PDI_BOOKINGS: 'recars_pdi_bookings',
};

const INITIAL_INQUIRIES: CarInquiry[] = [];
const CARS_CACHE_TTL = 45 * 1000; // 45 seconds TTL for in-memory deduplication

function getStoredItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export interface RecarsContextType {
  isHydrated: boolean;
  selectedCity: string;
  changeCity: (city: string) => void;
  wishlistIds: string[];
  toggleWishlist: (carId: string) => void;
  isWishlisted: (carId: string) => boolean;
  cars: Car[];
  sellRequests: SellRequest[];
  testDrives: TestDriveBooking[];
  inquiries: CarInquiry[];
  pdiBookings: PDIBooking[];
  addSellRequest: (req: SellRequest) => void;
  addTestDrive: (booking: TestDriveBooking) => void;
  addCarListing: (newCar: Car) => void;
  updateCarListing: (updatedCar: Car) => void;
  removeCarListing: (carId: string) => void;
  addInquiry: (inquiry: CarInquiry) => void;
  removeInquiry: (inquiryId: string) => void;
  updateInquiryStatus: (inquiryId: string, status: CarInquiry['status']) => void;
  addPDIBooking: (booking: PDIBooking) => void;
  refreshCars: (force?: boolean) => Promise<void>;
  refreshAuxiliaryData: () => Promise<void>;
}

const RecarsContext = createContext<RecarsContextType | null>(null);

let globalCarsPromise: Promise<any> | null = null;
let lastCarsFetchTime = 0;

export function RecarsProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('Warangal');
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [sellRequests, setSellRequests] = useState<SellRequest[]>([]);
  const [testDrives, setTestDrives] = useState<TestDriveBooking[]>([]);
  const [inquiries, setInquiries] = useState<CarInquiry[]>(INITIAL_INQUIRIES);
  const [pdiBookings, setPdiBookings] = useState<PDIBooking[]>([]);

  const hasLoadedAuxiliaryRef = useRef(false);

  // Synchronous local state initialization to eliminate white screen flashes
  useEffect(() => {
    try {
      const storedCity = localStorage.getItem(STORAGE_KEYS.CITY);
      if (storedCity && (storedCity === 'Warangal' || storedCity === 'Hyderabad')) {
        setSelectedCity(storedCity);
      } else {
        setSelectedCity('Warangal');
        localStorage.setItem(STORAGE_KEYS.CITY, 'Warangal');
      }

      const storedWishlist = getStoredItem<string[]>(STORAGE_KEYS.WISHLIST, []);
      setWishlistIds(storedWishlist);

      const custom = getStoredItem<Car[]>(STORAGE_KEYS.CUSTOM_CARS, []);
      const demoDealerNames = ['Sri Sai Motors', 'ABC Automobiles', 'Royal Cars', 'Laxmi Motors', 'Balaji Auto World'];
      const demoCarIds = ['recars-101', 'recars-102', 'recars-103', 'recars-104', 'recars-105'];
      const filteredCustom = custom.filter((c) => !demoCarIds.includes(c.id) && !demoDealerNames.includes((c as any).dealerName || ''));
      if (filteredCustom.length !== custom.length) {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_CARS, JSON.stringify(filteredCustom));
      }
      const deleted = getStoredItem<string[]>(STORAGE_KEYS.DELETED_CARS, []);
      const map = new Map<string, Car>();
      filteredCustom.forEach((c) => map.set(c.id, c));
      const initialCachedCars = Array.from(map.values()).filter((c) => !deleted.includes(c.id));
      if (initialCachedCars.length > 0) {
        setCars(initialCachedCars);
      }

      const storedSellRequests = getStoredItem<SellRequest[]>(STORAGE_KEYS.SELL_REQUESTS, []);
      setSellRequests(storedSellRequests);

      const storedTestDrives = getStoredItem<TestDriveBooking[]>(STORAGE_KEYS.TEST_DRIVES, []);
      setTestDrives(storedTestDrives);

      const storedInquiries = getStoredItem<CarInquiry[]>(STORAGE_KEYS.INQUIRIES, INITIAL_INQUIRIES);
      setInquiries(storedInquiries);

      const storedPDIs = getStoredItem<PDIBooking[]>(STORAGE_KEYS.PDI_BOOKINGS, []);
      setPdiBookings(storedPDIs);
    } catch (e) {
      console.error('Error hydrating recars store from localStorage:', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Deduplicated cars fetch with TTL cache
  const refreshCars = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && lastCarsFetchTime > 0 && now - lastCarsFetchTime < CARS_CACHE_TTL) {
      return;
    }

    if (globalCarsPromise) {
      return globalCarsPromise;
    }

    globalCarsPromise = (async () => {
      try {
        const res = await fetch('/api/cars');
        const data = await res.json();
        if (Array.isArray(data?.cars)) {
          setCars(data.cars);
          lastCarsFetchTime = Date.now();
          try {
            localStorage.setItem(STORAGE_KEYS.CUSTOM_CARS, JSON.stringify(data.cars));
          } catch {}
        }
      } catch (err) {
        console.warn('Network issue fetching fresh cars, using cached inventory:', err);
      } finally {
        globalCarsPromise = null;
      }
    })();

    return globalCarsPromise;
  }, []);

  // Lazy non-blocking auxiliary data loader (sell requests, test drives, inquiries, pdi)
  const refreshAuxiliaryData = useCallback(async () => {
    if (hasLoadedAuxiliaryRef.current) return;
    hasLoadedAuxiliaryRef.current = true;

    // Run in parallel quietly without blocking navigation
    Promise.allSettled([
      fetch('/api/sell').then((r) => r.json()).then((d) => {
        if (Array.isArray(d?.customerCars)) {
          setSellRequests(d.customerCars);
          localStorage.setItem(STORAGE_KEYS.SELL_REQUESTS, JSON.stringify(d.customerCars));
        }
      }),
      fetch('/api/inquiries').then((r) => r.json()).then((d) => {
        if (Array.isArray(d?.inquiries)) {
          setInquiries(d.inquiries);
          localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(d.inquiries));
        }
      }),
      fetch('/api/pdi').then((r) => r.json()).then((d) => {
        if (Array.isArray(d?.bookings)) {
          setPdiBookings(d.bookings);
          localStorage.setItem(STORAGE_KEYS.PDI_BOOKINGS, JSON.stringify(d.bookings));
        }
      }),
      fetch('/api/test-drive').then((r) => r.json()).then((d) => {
        if (Array.isArray(d?.testDrives)) {
          setTestDrives(d.testDrives);
          localStorage.setItem(STORAGE_KEYS.TEST_DRIVES, JSON.stringify(d.testDrives));
        }
      }),
    ]).catch(() => {});
  }, []);

  // On initial mount, fetch cars once in background, and defer auxiliary endpoints
  useEffect(() => {
    refreshCars();
    // Defer auxiliary data fetching so customer inventory renders with highest CPU and network priority
    const timer = setTimeout(() => {
      refreshAuxiliaryData();
    }, 2500);
    return () => clearTimeout(timer);
  }, [refreshCars, refreshAuxiliaryData]);

  const changeCity = useCallback((city: string) => {
    setSelectedCity(city);
    localStorage.setItem(STORAGE_KEYS.CITY, city);
  }, []);

  const toggleWishlist = useCallback((carId: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(carId);
      const updated = exists ? prev.filter((id) => id !== carId) : [...prev, carId];
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isWishlisted = useCallback((carId: string) => wishlistIds.includes(carId), [wishlistIds]);

  const addSellRequest = useCallback((req: SellRequest) => {
    setSellRequests((prev) => {
      const updated = [req, ...prev];
      localStorage.setItem(STORAGE_KEYS.SELL_REQUESTS, JSON.stringify(updated));
      return updated;
    });
    fetch('/api/sell', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    }).catch((err) => console.error('Error saving sell request:', err));
  }, []);

  const addTestDrive = useCallback((booking: TestDriveBooking) => {
    setTestDrives((prev) => {
      const updated = [booking, ...prev];
      localStorage.setItem(STORAGE_KEYS.TEST_DRIVES, JSON.stringify(updated));
      return updated;
    });
    fetch('/api/test-drive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
    }).catch((err) => console.error('Error saving test drive:', err));
  }, []);

  const addCarListing = useCallback((newCar: Car) => {
    setCars((prev) => {
      const updated = [newCar, ...prev];
      localStorage.setItem(STORAGE_KEYS.CUSTOM_CARS, JSON.stringify(updated));
      return updated;
    });
    fetch('/api/cars?admin=true', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCar),
    }).catch((err) => console.error('Error saving car listing:', err));
  }, []);

  const removeCarListing = useCallback((carId: string) => {
    setCars((prev) => {
      const updated = prev.filter((c) => c.id !== carId);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_CARS, JSON.stringify(updated));

      const deleted = getStoredItem<string[]>(STORAGE_KEYS.DELETED_CARS, []);
      if (!deleted.includes(carId)) {
        const newDeleted = [...deleted, carId];
        localStorage.setItem(STORAGE_KEYS.DELETED_CARS, JSON.stringify(newDeleted));
      }
      return updated;
    });
    fetch(`/api/cars?id=${encodeURIComponent(carId)}`, {
      method: 'DELETE',
    }).catch((err) => console.error('Error deleting car:', err));
  }, []);

  const updateCarListing = useCallback((updatedCar: Car) => {
    setCars((prev) => {
      const updated = prev.map((c) => (c.id === updatedCar.id ? updatedCar : c));
      localStorage.setItem(STORAGE_KEYS.CUSTOM_CARS, JSON.stringify(updated));
      return updated;
    });
    fetch('/api/cars?admin=true', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCar),
    }).catch((err) => console.error('Error updating car listing:', err));
  }, []);

  const addInquiry = useCallback((inquiry: CarInquiry) => {
    setInquiries((prev) => {
      const updated = [inquiry, ...prev];
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(updated));
      return updated;
    });
    fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiry),
    }).catch((err) => console.error('Error saving inquiry:', err));
  }, []);

  const removeInquiry = useCallback((inquiryId: string) => {
    setInquiries((prev) => {
      const updated = prev.filter((inq) => inq.id !== inquiryId);
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(updated));
      return updated;
    });
    fetch(`/api/inquiries?id=${encodeURIComponent(inquiryId)}`, {
      method: 'DELETE',
    }).catch((err) => console.error('Error deleting inquiry:', err));
  }, []);

  const updateInquiryStatus = useCallback((inquiryId: string, status: CarInquiry['status']) => {
    setInquiries((prev) => {
      const updated = prev.map((inq) => (inq.id === inquiryId ? { ...inq, status } : inq));
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(updated));
      return updated;
    });
    fetch('/api/inquiries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: inquiryId, status }),
    }).catch((err) => console.error('Error updating inquiry status:', err));
  }, []);

  const addPDIBooking = useCallback((booking: PDIBooking) => {
    setPdiBookings((prev) => {
      const updated = [booking, ...prev];
      localStorage.setItem(STORAGE_KEYS.PDI_BOOKINGS, JSON.stringify(updated));
      return updated;
    });
    fetch('/api/pdi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
    }).catch((err) => console.error('Error saving PDI booking:', err));
  }, []);

  const value: RecarsContextType = {
    isHydrated,
    selectedCity,
    changeCity,
    wishlistIds,
    toggleWishlist,
    isWishlisted,
    cars,
    sellRequests,
    testDrives,
    inquiries,
    pdiBookings,
    addSellRequest,
    addTestDrive,
    addCarListing,
    updateCarListing,
    removeCarListing,
    addInquiry,
    removeInquiry,
    updateInquiryStatus,
    addPDIBooking,
    refreshCars,
    refreshAuxiliaryData,
  };

  return <RecarsContext.Provider value={value}>{children}</RecarsContext.Provider>;
}

export function useRecarsState(): RecarsContextType {
  const context = useContext(RecarsContext);
  if (context) {
    return context;
  }

  // Safe fallback if called outside RecarsProvider
  return {
    isHydrated: true,
    selectedCity: 'Warangal',
    changeCity: () => {},
    wishlistIds: [],
    toggleWishlist: () => {},
    isWishlisted: () => false,
    cars: [],
    sellRequests: [],
    testDrives: [],
    inquiries: [],
    pdiBookings: [],
    addSellRequest: () => {},
    addTestDrive: () => {},
    addCarListing: () => {},
    updateCarListing: () => {},
    removeCarListing: () => {},
    addInquiry: () => {},
    removeInquiry: () => {},
    updateInquiryStatus: () => {},
    addPDIBooking: () => {},
    refreshCars: async () => {},
    refreshAuxiliaryData: async () => {},
  };
}
