export type CarBodyType = 'Hatchback' | 'Sedan' | 'SUV' | 'Luxury' | 'MUV' | 'Electric';
export type FuelType = 'Petrol' | 'Diesel' | 'Electric' | 'CNG' | 'Hybrid';
export type TransmissionType = 'Manual' | 'Automatic';
export type OwnershipType = '1st Owner' | '2nd Owner' | '3rd Owner';

export interface CarSpecification {
  engine: string;
  maxPower: string;
  torque: string;
  mileage: string;
  seatingCapacity: number;
  bootSpace: string;
  fuelTankCapacity: string;
  groundClearance: string;
  rto: string;
  regYear: number;
  insuranceValidTill: string;
  color: string;
}

export interface InspectionCheckItem {
  name: string;
  status: 'passed' | 'repaired' | 'attention';
  details?: string;
}

export interface InspectionCategory {
  category: string;
  score: number;
  totalPoints: number;
  items: InspectionCheckItem[];
}

export interface Car {
  id: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  price: number; // in INR
  originalPrice?: number;
  emiPerMonth: number;
  kilometers: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  bodyType: CarBodyType;
  ownership: OwnershipType;
  city: string;
  locationArea: string;
  image: string;
  galleryImages: string[];
  isVerified: boolean;
  isRecarsSelect: boolean;
  featured: boolean;
  inspectionScore: number; // out of 100
  inspectionCategories?: InspectionCategory[];
  specifications: CarSpecification;
  features: string[];
  description: string;
  createdAt: string;
}

export interface SellRequest {
  id: string;
  registrationNumber?: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  kilometers: number;
  ownership: OwnershipType;
  accidentHistory: 'None' | 'Minor Dent/Scratch' | 'Major Repaired';
  sellerName: string;
  sellerPhone: string;
  sellerCity: string;
  preferredInspectionDate: string;
  preferredInspectionTime: string;
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  status: 'Pending' | 'Inspection Scheduled' | 'Inspection Completed' | 'Offer Accepted' | 'Car Purchased' | 'Rejected' | string;
  createdAt: string;
}

export interface TestDriveBooking {
  id: string;
  carId: string;
  carTitle: string;
  carImage: string;
  carPrice: number;
  userName: string;
  userPhone: string;
  userEmail: string;
  city: string;
  preferredDate: string;
  preferredTimeSlot: string;
  type: 'Home Test Drive' | 'Recars Hub Visit';
  status: 'Confirmed' | 'Rescheduled' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface ValuationQuery {
  make: string;
  model: string;
  year: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  kilometers: number;
  ownership: OwnershipType;
  city: string;
}

export interface ValuationResult {
  estimatedMin: number;
  estimatedMax: number;
  fairValue: number;
  demandIndex: 'Very High' | 'High' | 'Moderate';
  depreciationScore: string;
  sampleHistoricalTrades: number;
}

export interface CarInquiry {
  id: string;
  carId: string;
  carTitle: string;
  carImage?: string;
  carPrice?: number;
  userName: string;
  userPhone: string;
  userEmail: string;
  city: string;
  inquiryType: 'Price Quote / Best Offer' | 'Inspection Report Request' | 'Home Delivery Inquiry' | 'Loan & Financing' | 'General Query';
  message: string;
  status: 'New' | 'In Progress' | 'Contacted' | 'Closed';
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
}

