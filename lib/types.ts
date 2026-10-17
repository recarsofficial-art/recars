export type CarBodyType = 'Hatchback' | 'Sedan' | 'SUV' | 'Luxury' | 'MUV' | 'Electric';
export type FuelType = 'Petrol' | 'Diesel' | 'Electric' | 'CNG' | 'Hybrid';
export type TransmissionType = 'Manual' | 'Automatic';
export type OwnershipType = '1st Owner' | '2nd Owner' | '3rd Owner' | '4th Owner +';
export type VehicleAvailability = 'Available' | 'Reserved' | 'Sold Out';
export type InsuranceStatus = 'Valid' | 'Expired' | 'Unavailable';
export type InsuranceType = 'Comprehensive' | 'Zero Depreciation' | 'Third Party';
export type FinanceAvailability = 'Available' | 'Not Available' | 'Subject to Approval';

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

  // New fields for Recars enhanced system
  availabilityStatus?: VehicleAvailability;
  manufacturingYear?: number;
  registrationYear?: number;
  insuranceStatus?: InsuranceStatus;
  insuranceExpiry?: string;
  insuranceType?: InsuranceType;
  financeAvailable?: FinanceAvailability;
  suggestedPriceMin?: number;
  suggestedPriceMax?: number;
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
  inspectionFee?: number;
  inspectionFeeStatus?: 'Pending' | 'Pay at Doorstep' | 'Paid' | 'Waived' | string;
  suggestedListingPrice?: number;
  publishedCarId?: string;
  photos?: string[];
  status: 'Pending' | 'Inspection Scheduled' | 'Inspection Completed' | 'Offer Accepted' | 'Car Purchased' | 'Approved & Published' | 'Rejected' | string;
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
  inquiryType: 'Interested in Vehicle' | 'Price Quote / Best Offer' | 'Inspection Report Request' | 'Home Delivery Inquiry' | 'Loan & Financing' | 'General Query' | 'Sell / Doorstep Inspection Request' | 'Pre-Delivery Inspection (PDI)';
  message: string;
  status: 'New' | 'In Progress' | 'Contacted' | 'Closed' | 'Representative Dispatched' | 'Inspection Completed' | string;
  createdAt: string;
}

export interface PDIBooking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  city: string;
  dealershipName: string;
  dealershipAddress: string;
  carMake: string;
  carModel: string;
  carVariant?: string;
  fuelType?: FuelType | string;
  transmission?: TransmissionType | string;
  vinOrChassis?: string;
  preferredDate: string;
  preferredTimeSlot: string;
  specialInstructions?: string;
  packageType: 'Standard PDI' | 'Comprehensive PDI + Diagnostic Scan' | 'Complete PDI Report' | string;
  fee: number;
  paymentStatus: 'Pay on Inspection' | 'Paid Online';
  status: 'Booked' | 'Representative Assigned' | 'Representative Dispatched' | 'Inspection Completed' | 'Report Delivered' | 'Cancelled' | string;
  assignedRepresentative?: {
    name: string;
    phone: string;
    badgeId: string;
  };
  createdAt: string;
}

export interface NegotiationOfferHistoryItem {
  id: string;
  sender: 'customer' | 'admin';
  senderName: string;
  amount: number;
  message?: string;
  timestamp: string;
}

export interface Negotiation {
  id: string;
  carId: string;
  carTitle: string;
  carImage?: string;
  listedPrice: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerOffer: number;
  counterOffer?: number;
  finalPrice?: number;
  status: 'Pending' | 'Counteroffer' | 'Accepted' | 'Rejected' | 'Expired';
  notes?: string;
  offerHistory: NegotiationOfferHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InspectionConfig {
  sellerInspectionFee: number;
  sellerReportFee?: number;
  buyerInspectionFee: number;
  pdiInspectionFee?: number;
  pdiReportFee?: number;
  freeInspectionActive: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
}


