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
  statusUpdatedAt?: string;
  soldAt?: string;
  manufacturingYear?: number;
  registrationYear?: number;
  insuranceStatus?: InsuranceStatus;
  insuranceExpiry?: string;
  insuranceType?: InsuranceType;
  financeAvailable?: FinanceAvailability;
  suggestedPriceMin?: number;
  suggestedPriceMax?: number;

  // Dealer Identification & Vehicle Source (Admin Portal only)
  vehicleSource?: 'Individual Seller' | 'Dealer' | 'Admin';
  dealerId?: string;
  dealerName?: string;
  dealerContact?: string;
  uploadedBy?: 'Admin' | 'Dealer' | 'Seller';
  uploadedByUserId?: string;
  uploadedByRole?: string;
  listingStatus?: 'Pending' | 'Approved' | 'Published' | 'Rejected' | 'Sold';
  registrationNumber?: string;
  customRibbons?: VehicleRibbon[];
}

export type VehicleSource = 'Individual Seller' | 'Dealer' | 'Admin';
export type UploadedByRole = 'Admin' | 'Dealer' | 'Seller';
export type ListingWorkflowStatus = 'Pending' | 'Approved' | 'Published' | 'Rejected' | 'Sold';

export interface RegisteredDealer {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  city?: string;
  address?: string;
  status?: string;
  activeCarsCount?: number;
  createdAt?: string;
  updatedAt?: string;
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

// ========================================================
// CAR CARE & PPF ENQUIRIES TYPES
// ========================================================
export type CarCareServiceType =
  | 'Paint Protection Film (PPF)'
  | 'Ceramic Coating'
  | 'Teflon Coating'
  | 'Anti-Rust Treatment';

export type CarCareStatus =
  | 'New'
  | 'Contacted'
  | 'Quotation Sent'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled';

export interface CarCareEnquiry {
  id: string;
  customerName: string;
  fullName: string;
  customerPhone: string;
  mobileNumber: string;
  customerEmail?: string;
  carMake: string;
  vehicleBrand: string;
  carModel: string;
  vehicleModel: string;
  carYear?: number | string;
  vehicleYear?: number | string;
  services: string[];
  preferredLocation: string;
  preferredDate?: string;
  additionalRequirements?: string;
  status: CarCareStatus;
  internalNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

// ========================================================
// VEHICLE ANALYTICS & VIEW TRACKING TYPES
// ========================================================
export interface VehicleAnalyticsItem {
  id: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  manufacturingYear?: number;
  price: number;
  image: string;
  city: string;
  availabilityStatus: VehicleAvailability;
  statusUpdatedAt?: string;
  soldAt?: string;
  dealerName?: string;
  vehicleSource?: string;
  viewsCount: number;
  viewCount?: number;
  inquiriesCount: number;
  enquiryCount?: number;
  negotiationsCount: number;
  totalInteractions: number;
  createdAt: string;
}

export interface AdminAnalyticsSummary {
  totalActiveListings: number;
  totalSoldVehicles: number;
  totalReservedVehicles: number;
  totalDetailViews: number;
  totalEnquiries: number;
  mostViewedBrand?: string;
  mostViewedModel?: string;
  mostViewedBudget?: string;
  mostViewedVehicles: VehicleAnalyticsItem[];
  mostEnquiredVehicles: VehicleAnalyticsItem[];
  recentEnquiries: CarInquiry[];
  insights: {
    mostViewedBrand: string;
    mostViewedModel: string;
    mostViewedBudget: string;
    conversionRate: string;
  };
}

// ========================================================
// VEHICLE RIBBONS & CAPTIONS TYPES
// ========================================================
export type RibbonColor = 'red' | 'rose' | 'amber' | 'emerald' | 'blue' | 'purple' | 'dark';

export interface VehicleRibbon {
  text: string;
  color?: RibbonColor;
  priority?: number; // Lower number = higher precedence
  isCustom?: boolean;
}

// ========================================================
// CAR FINDER ("LET US FIND YOUR CAR") TYPES
// ========================================================
export type CarFinderStatus = 'New' | 'Searching' | 'Matched' | 'Contacted' | 'Closed';

export interface CarFinderRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  mobileNumber?: string;
  customerEmail?: string;
  email?: string;
  preferredBrand: string;
  customBrand?: string;
  preferredModel?: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetRange?: string;
  preferredFuel?: string;
  preferredTransmission?: string;
  preferredYear?: number | string;
  preferredLocation?: string;
  additionalRequirements?: string;
  status: CarFinderStatus;
  internalNotes?: string;
  matchedCarIds?: string[];
  createdAt: string;
  updatedAt?: string;
}



