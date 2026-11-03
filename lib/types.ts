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
  fitnessValidTill?: string | number;
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
  soldInDuration?: string; // Highlight vehicle sold speed, e.g. "4 Hours", "24 Hours", "2 Days", "3 Days"
  manufacturingYear?: number;
  registrationYear?: number;
  fitnessValidUntil?: string | number; // Extended validity / fitness year (e.g. 2029) when 15-year life expires
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

export interface PPFSpecificationPackage {
  id: string;
  title: string;
  brand: string;
  microns: string;
  finishType?: string;
  warrantyYears?: string;
  mrp: number;
  discountPercent: number;
  offerPrice: number;
  validityDate?: string;
  images: string[];
  features?: string[];
  location?: string;
  contactPhones?: string[];
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export const DEFAULT_PPF_PACKAGES: PPFSpecificationPackage[] = [
  {
    id: 'ppf-bike-enfield',
    title: 'Royal Enfield Bike Gloss PPF',
    brand: 'The Detailing Mafia',
    microns: '180–200 Micron TPU',
    finishType: 'Gloss PPF',
    warrantyYears: '5 Year Warranty',
    mrp: 19000,
    discountPercent: 25,
    offerPrice: 14250,
    validityDate: 'Limited Time Pre-Booking Offer',
    images: ['/ppf/ppf-bike-enfield.jpg'],
    features: [
      'Scratch Resistant Self-Healing TPU',
      'High Gloss Candy Finish',
      'UV & Oxidation Protection',
      'Water Repellent Hydrophobic Surface',
      'Keeps Your Bike Looking Showroom New',
    ],
    location: 'Tellapur - Osman Nagar Road',
    contactPhones: ['9032172211', '7780267514'],
    isActive: true,
    createdAt: '2026-11-01T00:00:00.000Z',
  },
  {
    id: 'ppf-cars-matty-gloss',
    title: 'Premium Matty Black & Gloss PPF',
    brand: 'The Detailing Mafia',
    microns: '200 Micron Self-Healing TPU',
    finishType: 'Matty Black & Ultra Gloss PPF',
    warrantyYears: '10 Year Warranty',
    mrp: 100000,
    discountPercent: 25,
    offerPrice: 75000,
    validityDate: 'Special Studio Discount',
    images: ['/ppf/ppf-cars-matty-gloss.jpg'],
    features: [
      '10 Year Comprehensive Warranty',
      'Stone Chip & Highway Gravel Protection',
      'Deep Scratch Self-Healing with Heat Memory',
      'Anti-Yellowing UV Shield',
      'Available in Matty Black or Ultra Gloss',
    ],
    location: 'Tellapur - Osman Nagar Road',
    contactPhones: ['9032172211', '7780267514'],
    isActive: true,
    createdAt: '2026-11-01T00:00:00.000Z',
  },
  {
    id: 'ppf-studio-launch',
    title: 'Premium Car Detailing Studio Pre-Booking',
    brand: 'The Detailing Mafia',
    microns: '180–220 Micron Hydrophobic Film',
    finishType: 'Color, Texture & Clear PPF',
    warrantyYears: '5 to 10 Years',
    mrp: 120000,
    discountPercent: 25,
    offerPrice: 90000,
    validityDate: 'Pre-Bookings Open • Flat 25% OFF',
    images: ['/ppf/ppf-studio-launch.jpg'],
    features: [
      'Ceramic Coating (9H/10H)',
      'Paint Protection Film (PPF)',
      'Color & Texture PPF Options',
      'Sunroof & Windshield Protection Film',
      'Window Films & Ceramic Wash Included',
    ],
    location: 'Thellapur – Osman Nagar Road',
    contactPhones: ['9032172211', '7780267514'],
    isActive: true,
    createdAt: '2026-11-01T00:00:00.000Z',
  },
];

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
  soldInDuration?: string;
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



