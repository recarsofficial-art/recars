'use client';

import { useState, useEffect } from 'react';
import { Car, SellRequest, TestDriveBooking, CarInquiry } from './types';
import { INITIAL_CARS } from './data';

const STORAGE_KEYS = {
  WISHLIST: 'recars_wishlist_ids',
  CITY: 'recars_selected_city',
  SELL_REQUESTS: 'recars_sell_requests',
  TEST_DRIVES: 'recars_test_drives',
  CUSTOM_CARS: 'recars_custom_cars',
  DELETED_CARS: 'recars_deleted_car_ids',
  INQUIRIES: 'recars_car_inquiries',
};

const INITIAL_INQUIRIES: CarInquiry[] = [];

function getStoredItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function useRecarsState() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('Warangal');
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [cars, setCars] = useState<Car[]>(INITIAL_CARS);
  const [sellRequests, setSellRequests] = useState<SellRequest[]>([]);
  const [testDrives, setTestDrives] = useState<TestDriveBooking[]>([]);
  const [inquiries, setInquiries] = useState<CarInquiry[]>(INITIAL_INQUIRIES);

  // Load from localStorage on client mount to prevent SSR hydration mismatch
  useEffect(() => {
    try {
      const storedCity = localStorage.getItem(STORAGE_KEYS.CITY);
      if (storedCity && storedCity === 'Warangal') {
        setSelectedCity('Warangal');
      } else {
        setSelectedCity('Warangal');
        localStorage.setItem(STORAGE_KEYS.CITY, 'Warangal');
      }

      const storedWishlist = getStoredItem<string[]>(STORAGE_KEYS.WISHLIST, []);
      setWishlistIds(storedWishlist);

      const custom = getStoredItem<Car[]>(STORAGE_KEYS.CUSTOM_CARS, []);
      const deleted = getStoredItem<string[]>(STORAGE_KEYS.DELETED_CARS, []);
      const combined = [...INITIAL_CARS, ...custom];
      const map = new Map<string, Car>();
      combined.forEach((c) => map.set(c.id, c));
      setCars(Array.from(map.values()).filter((c) => !deleted.includes(c.id)));

      const storedSellRequests = getStoredItem<SellRequest[]>(STORAGE_KEYS.SELL_REQUESTS, []);
      setSellRequests(storedSellRequests);

      const storedTestDrives = getStoredItem<TestDriveBooking[]>(STORAGE_KEYS.TEST_DRIVES, []);
      setTestDrives(storedTestDrives);

      const storedInquiries = getStoredItem<CarInquiry[]>(STORAGE_KEYS.INQUIRIES, INITIAL_INQUIRIES);
      setInquiries(storedInquiries);

      // Asynchronously fetch latest data from Supabase
      fetch('/api/cars')
        .then((res) => res.json())
        .then((data) => {
          if (data?.cars?.length > 0) {
            setCars(data.cars);
          }
        })
        .catch(() => {});

      fetch('/api/sell')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data?.customerCars)) {
            setSellRequests(data.customerCars);
            localStorage.setItem(STORAGE_KEYS.SELL_REQUESTS, JSON.stringify(data.customerCars));
          }
        })
        .catch(() => {});

      fetch('/api/inquiries')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data?.inquiries)) {
            setInquiries(data.inquiries);
            localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(data.inquiries));
          }
        })
        .catch(() => {});


      fetch('/api/test-drive')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data?.testDrives)) {
            setTestDrives(data.testDrives);
            localStorage.setItem(STORAGE_KEYS.TEST_DRIVES, JSON.stringify(data.testDrives));
          }
        })
        .catch(() => {});
    } catch (e) {
      console.error('Error hydrating recars store from localStorage:', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const changeCity = (city: string) => {
    setSelectedCity(city);
    localStorage.setItem(STORAGE_KEYS.CITY, city);
  };

  const toggleWishlist = (carId: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(carId);
      const updated = exists ? prev.filter((id) => id !== carId) : [...prev, carId];
      localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(updated));
      return updated;
    });
  };

  const isWishlisted = (carId: string) => wishlistIds.includes(carId);

  const addSellRequest = (req: SellRequest) => {
    setSellRequests((prev) => {
      const updated = [req, ...prev];
      localStorage.setItem(STORAGE_KEYS.SELL_REQUESTS, JSON.stringify(updated));
      return updated;
    });
    // Persist to Supabase
    fetch('/api/sell', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    }).catch((err) => console.error('Error saving sell request to Supabase:', err));
  };

  const addTestDrive = (booking: TestDriveBooking) => {
    setTestDrives((prev) => {
      const updated = [booking, ...prev];
      localStorage.setItem(STORAGE_KEYS.TEST_DRIVES, JSON.stringify(updated));
      return updated;
    });
    // Persist to Supabase
    fetch('/api/test-drive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
    }).catch((err) => console.error('Error saving test drive to Supabase:', err));
  };

  const addCarListing = (newCar: Car) => {
    setCars((prev) => {
      const updated = [newCar, ...prev];
      const customCars = updated.filter(c => !INITIAL_CARS.some(init => init.id === c.id));
      localStorage.setItem(STORAGE_KEYS.CUSTOM_CARS, JSON.stringify(customCars));
      return updated;
    });
    // Persist to Supabase
    fetch('/api/cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCar),
    }).catch((err) => console.error('Error saving car listing to Supabase:', err));
  };

  const removeCarListing = (carId: string) => {
    setCars((prev) => {
      const updated = prev.filter(c => c.id !== carId);
      const customCars = updated.filter(c => !INITIAL_CARS.some(init => init.id === c.id));
      localStorage.setItem(STORAGE_KEYS.CUSTOM_CARS, JSON.stringify(customCars));
      
      const deleted = getStoredItem<string[]>(STORAGE_KEYS.DELETED_CARS, []);
      if (!deleted.includes(carId)) {
        const newDeleted = [...deleted, carId];
        localStorage.setItem(STORAGE_KEYS.DELETED_CARS, JSON.stringify(newDeleted));
      }
      return updated;
    });
    // Remove from Supabase
    fetch(`/api/cars?id=${encodeURIComponent(carId)}`, {
      method: 'DELETE',
    }).catch((err) => console.error('Error deleting car from Supabase:', err));
  };

  const addInquiry = (inquiry: CarInquiry) => {
    setInquiries((prev) => {
      const updated = [inquiry, ...prev];
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(updated));
      return updated;
    });
    // Persist to Supabase
    fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiry),
    }).catch((err) => console.error('Error saving inquiry to Supabase:', err));
  };

  const removeInquiry = (inquiryId: string) => {
    setInquiries((prev) => {
      const updated = prev.filter(inq => inq.id !== inquiryId);
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(updated));
      return updated;
    });
    // Delete from Supabase
    fetch(`/api/inquiries?id=${encodeURIComponent(inquiryId)}`, {
      method: 'DELETE',
    }).catch((err) => console.error('Error deleting inquiry from Supabase:', err));
  };

  const updateInquiryStatus = (inquiryId: string, status: CarInquiry['status']) => {
    setInquiries((prev) => {
      const updated = prev.map(inq => inq.id === inquiryId ? { ...inq, status } : inq);
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(updated));
      return updated;
    });
    // Update in Supabase
    fetch('/api/inquiries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: inquiryId, status }),
    }).catch((err) => console.error('Error updating inquiry status in Supabase:', err));
  };

  return {
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
    addSellRequest,
    addTestDrive,
    addCarListing,
    removeCarListing,
    addInquiry,
    removeInquiry,
    updateInquiryStatus,
  };
}
