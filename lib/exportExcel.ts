/**
 * Recars Admin Excel / CSV Data Exporter
 * Formats database records into Microsoft Excel-compatible CSV files
 * with UTF-8 BOM (\uFEFF) for proper Unicode & currency handling.
 */

import {
  Car as CarType,
  CarInquiry,
  SellRequest,
  TestDriveBooking,
  Negotiation,
  PDIBooking,
  CarCareEnquiry,
  CarFinderRequest,
} from '@/lib/types';

/**
 * Universal CSV downloader with UTF-8 BOM for Microsoft Excel compatibility
 */
export function downloadExcelCSV(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): void {
  if (typeof window === 'undefined') return;

  const sanitizeCell = (val: string | number | boolean | null | undefined): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    // Escape quotes and wrap if commas, quotes or newlines are present
    if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = headers.map(sanitizeCell).join(',');
  const rowLines = rows.map((row) => row.map(sanitizeCell).join(','));
  const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const cleanName = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.setAttribute('download', cleanName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getTodayStamp(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatCleanDate(isoOrDateStr?: string | null): string {
  if (!isoOrDateStr) return 'N/A';
  try {
    const d = new Date(isoOrDateStr);
    if (isNaN(d.getTime())) return String(isoOrDateStr);
    return d.toISOString().replace('T', ' ').substring(0, 19);
  } catch {
    return String(isoOrDateStr);
  }
}

// ==========================================
// 1. REGISTERED CUSTOMERS DIRECTORY EXPORT
// ==========================================
export function exportCustomersToExcel(
  customers: any[],
  inquiries: CarInquiry[] = [],
  sellRequests: SellRequest[] = []
): void {
  const headers = [
    'Customer ID',
    'Customer Name',
    'Phone Number',
    'Email Address',
    'City / Hub',
    'Full Address',
    'Registered Date',
    'Car Inquiries Count',
    'Sell Requests Count',
    'Total Interactions',
  ];

  const rows = customers.map((c) => {
    const phone = (c.phone || '').trim();
    const email = (c.email || '').trim().toLowerCase();
    const inqCount = inquiries.filter(
      (i) => (phone && i.userPhone?.includes(phone)) || (email && i.userEmail?.toLowerCase() === email)
    ).length;
    const sellCount = sellRequests.filter(
      (s) => phone && s.sellerPhone?.includes(phone)
    ).length;

    return [
      c.id || '',
      c.name || 'Unnamed Customer',
      c.phone || '',
      c.email || '',
      c.city || 'Warangal',
      c.address || '',
      formatCleanDate(c.created_at || c.createdAt),
      inqCount,
      sellCount,
      inqCount + sellCount,
    ];
  });

  downloadExcelCSV(`Recars_Registered_Customers_${getTodayStamp()}`, headers, rows);
}

// ==========================================
// 2. CAR INQUIRIES EXPORT
// ==========================================
export function exportInquiriesToExcel(inquiries: CarInquiry[]): void {
  const headers = [
    'Inquiry ID',
    'Date & Time',
    'Customer Name',
    'Phone Number',
    'Email Address',
    'City',
    'Vehicle Inquired',
    'Car ID',
    'Car Price (INR)',
    'Inquiry Category',
    'Status',
    'Customer Message / Details',
  ];

  const rows = inquiries.map((i) => [
    i.id,
    formatCleanDate(i.createdAt),
    i.userName || '',
    i.userPhone || '',
    i.userEmail || '',
    i.city || '',
    i.carTitle || 'General Inquiry',
    i.carId || '',
    i.carPrice || '',
    i.inquiryType || 'Interested in Vehicle',
    i.status || 'New',
    i.message || '',
  ]);

  downloadExcelCSV(`Recars_Customer_Inquiries_${getTodayStamp()}`, headers, rows);
}

// ==========================================
// 3. CUSTOMER SELL REQUESTS EXPORT
// ==========================================
export function exportSellRequestsToExcel(sellRequests: SellRequest[]): void {
  const headers = [
    'Request ID',
    'Date Submitted',
    'Seller Name',
    'Phone Number',
    'City / Location',
    'Vehicle Make',
    'Model',
    'Variant',
    'Mfg Year',
    'Kilometers Driven',
    'Fuel Type',
    'Transmission',
    'Ownership',
    'Accident History',
    'Seller Asking Price (INR)',
    'Suggested Listing Price (INR)',
    'Estimated Min (INR)',
    'Estimated Max (INR)',
    'Inspection Status',
    'Inspection Slot Date',
    'Inspection Slot Time',
    'Inspection Fee Status',
    'Doorstep Fee (INR)',
    'Published Vehicle ID',
  ];

  const rows = sellRequests.map((s) => [
    s.id,
    formatCleanDate(s.createdAt),
    s.sellerName || '',
    s.sellerPhone || '',
    s.sellerCity || 'Warangal',
    s.make || '',
    s.model || '',
    s.variant || '',
    s.year || '',
    s.kilometers || 0,
    s.fuelType || '',
    s.transmission || '',
    s.ownership || '',
    s.accidentHistory || 'None',
    s.expectedPrice || s.suggestedListingPrice || '',
    s.suggestedListingPrice || s.expectedPrice || '',
    s.estimatedPriceMin || '',
    s.estimatedPriceMax || '',
    s.status || 'Pending',
    s.preferredInspectionDate || '',
    s.preferredInspectionTime || '',
    s.inspectionFeeStatus || 'Pay at Doorstep',
    s.inspectionFee || 999,
    s.publishedCarId || '',
  ]);

  downloadExcelCSV(`Recars_Customer_Sell_Requests_${getTodayStamp()}`, headers, rows);
}

// ==========================================
// 4. VEHICLE INVENTORY EXPORT
// ==========================================
export function exportCarsInventoryToExcel(cars: CarType[]): void {
  const headers = [
    'Car ID',
    'Make',
    'Model',
    'Variant',
    'Registration Year',
    'Manufacturing Year',
    'Price (INR)',
    'EMI / Month (INR)',
    'Kilometers Driven',
    'Fuel Type',
    'Transmission',
    'Body Type',
    'Ownership',
    'Hub City',
    'Hub Location Area',
    'Availability Status',
    'Listing Status',
    'Vehicle Source',
    'Dealer / Seller Name',
    'Dealer Contact',
    'Inspection Score',
    'Recars Select',
    'Featured',
    'Insurance Status',
    'Insurance Expiry',
    'Insurance Type',
    'Finance Available',
    'Total Views',
    'Registration Number',
    'Published Date',
  ];

  const rows = cars.map((c) => [
    c.id,
    c.make,
    c.model,
    c.variant || '',
    c.registrationYear || c.year,
    c.manufacturingYear || c.year,
    c.price,
    c.emiPerMonth || '',
    c.kilometers,
    c.fuelType,
    c.transmission,
    c.bodyType,
    c.ownership,
    c.city,
    c.locationArea || '',
    c.availabilityStatus || 'Available',
    c.listingStatus || 'Published',
    c.vehicleSource || 'Individual Seller',
    c.dealerName || '',
    c.dealerContact || '',
    c.inspectionScore || 96,
    c.isRecarsSelect ? 'Yes' : 'No',
    c.featured ? 'Yes' : 'No',
    c.insuranceStatus || 'Valid',
    c.insuranceExpiry || '',
    c.insuranceType || 'Comprehensive',
    c.financeAvailable || 'Available',
    (c as any).viewsCount || 0,
    c.registrationNumber || '',
    formatCleanDate(c.createdAt),
  ]);

  downloadExcelCSV(`Recars_Vehicle_Inventory_${getTodayStamp()}`, headers, rows);
}

// ==========================================
// 5. TEST DRIVE APPOINTMENTS EXPORT
// ==========================================
export function exportTestDrivesToExcel(testDrives: TestDriveBooking[]): void {
  const headers = [
    'Booking ID',
    'Date Booked',
    'Customer Name',
    'Phone Number',
    'Email Address',
    'Vehicle Title',
    'Car ID',
    'Car Price (INR)',
    'Hub / City',
    'Appointment Type',
    'Preferred Date',
    'Preferred Time Slot',
    'Status',
  ];

  const rows = testDrives.map((td) => [
    td.id,
    formatCleanDate(td.createdAt),
    td.userName || '',
    td.userPhone || '',
    td.userEmail || '',
    td.carTitle || '',
    td.carId || '',
    td.carPrice || '',
    td.city || '',
    td.type || 'Recars Hub Visit',
    td.preferredDate || '',
    td.preferredTimeSlot || '',
    td.status || 'Confirmed',
  ]);

  downloadExcelCSV(`Recars_Test_Drive_Bookings_${getTodayStamp()}`, headers, rows);
}

// ==========================================
// 6. PRICE NEGOTIATIONS EXPORT
// ==========================================
export function exportNegotiationsToExcel(negotiations: Negotiation[]): void {
  const headers = [
    'Deal ID',
    'Initiated Date',
    'Customer Name',
    'Phone Number',
    'Email Address',
    'Vehicle Title',
    'Car ID',
    'Listed Price (INR)',
    'Customer Offer (INR)',
    'Counter Offer (INR)',
    'Final Agreed Price (INR)',
    'Status',
    'Total Offer Rounds',
    'Staff Notes',
    'Last Updated',
  ];

  const rows = negotiations.map((n) => [
    n.id,
    formatCleanDate(n.createdAt),
    n.customerName || '',
    n.customerPhone || '',
    n.customerEmail || '',
    n.carTitle || '',
    n.carId || '',
    n.listedPrice || '',
    n.customerOffer || '',
    n.counterOffer || '',
    n.finalPrice || '',
    n.status || 'Pending',
    n.offerHistory?.length || 1,
    n.notes || '',
    formatCleanDate(n.updatedAt),
  ]);

  downloadExcelCSV(`Recars_Price_Negotiations_${getTodayStamp()}`, headers, rows);
}

// ==========================================
// 7. CAR FINDER REQUESTS EXPORT
// ==========================================
export function exportCarFinderToExcel(requests: CarFinderRequest[]): void {
  const headers = [
    'Request ID',
    'Date Submitted',
    'Customer Name',
    'Phone Number',
    'Email Address',
    'Preferred Brand',
    'Preferred Model',
    'Budget Range',
    'Budget Min (INR)',
    'Budget Max (INR)',
    'Preferred Fuel',
    'Preferred Transmission',
    'Preferred Year',
    'Preferred Location',
    'Additional Requirements',
    'Status',
    'Staff Internal Notes',
  ];

  const rows = requests.map((r) => [
    r.id,
    formatCleanDate(r.createdAt),
    r.customerName || '',
    r.customerPhone || r.mobileNumber || '',
    r.customerEmail || r.email || '',
    r.customBrand || r.preferredBrand || 'Any',
    r.preferredModel || 'Any',
    r.budgetRange || '',
    r.budgetMin || '',
    r.budgetMax || '',
    r.preferredFuel || 'Any',
    r.preferredTransmission || 'Any',
    r.preferredYear || 'Any',
    r.preferredLocation || '',
    r.additionalRequirements || '',
    r.status || 'Pending Review',
    r.internalNotes || '',
  ]);

  downloadExcelCSV(`Recars_Car_Finder_Requests_${getTodayStamp()}`, headers, rows);
}

// ==========================================
// 8. CAR CARE & PPF ENQUIRIES EXPORT
// ==========================================
export function exportCarCareToExcel(enquiries: CarCareEnquiry[]): void {
  const headers = [
    'Enquiry ID',
    'Date Submitted',
    'Customer Name',
    'Phone Number',
    'Email Address',
    'Vehicle Make',
    'Vehicle Model',
    'Vehicle Year',
    'Selected Services',
    'Preferred Location',
    'Preferred Date',
    'Status',
    'Staff Internal Notes',
  ];

  const rows = enquiries.map((c) => [
    c.id,
    formatCleanDate(c.createdAt),
    c.customerName || c.fullName || '',
    c.customerPhone || c.mobileNumber || '',
    c.customerEmail || '',
    c.vehicleBrand || c.carMake || '',
    c.vehicleModel || c.carModel || '',
    c.vehicleYear || c.carYear || '',
    Array.isArray(c.services) ? c.services.join('; ') : '',
    c.preferredLocation || '',
    c.preferredDate || '',
    c.status || 'New',
    c.internalNotes || '',
  ]);

  downloadExcelCSV(`Recars_Car_Care_PPF_Enquiries_${getTodayStamp()}`, headers, rows);
}

// ==========================================
// 9. PDI BOOKINGS EXPORT
// ==========================================
export function exportPDIBookingsToExcel(bookings: PDIBooking[]): void {
  const headers = [
    'Booking ID',
    'Date Booked',
    'Customer Name',
    'Phone Number',
    'Email Address',
    'City',
    'Car Make',
    'Car Model',
    'Car Variant',
    'Dealership Name',
    'Dealership Address',
    'Preferred Inspection Date',
    'Preferred Time Slot',
    'Package Type',
    'Inspection Fee (INR)',
    'Payment Status',
    'Assigned Representative',
    'Representative Phone',
    'Booking Status',
    'Special Instructions',
  ];

  const rows = bookings.map((b) => [
    b.id,
    formatCleanDate(b.createdAt),
    b.customerName || '',
    b.customerPhone || '',
    b.customerEmail || '',
    b.city || '',
    b.carMake || '',
    b.carModel || '',
    b.carVariant || '',
    b.dealershipName || '',
    b.dealershipAddress || '',
    b.preferredDate || '',
    b.preferredTimeSlot || '',
    b.packageType || 'Standard PDI',
    b.fee || 1999,
    b.paymentStatus || 'Pay on Inspection',
    b.assignedRepresentative?.name || 'Unassigned',
    b.assignedRepresentative?.phone || '',
    b.status || 'Booked',
    b.specialInstructions || '',
  ]);

  downloadExcelCSV(`Recars_PDI_Bookings_${getTodayStamp()}`, headers, rows);
}

// ==========================================
// 10. MASTER COMPREHENSIVE ALL-DATA EXPORT
// ==========================================
export function exportMasterAllDataToExcel(data: {
  customers?: any[];
  inquiries?: CarInquiry[];
  sellRequests?: SellRequest[];
  testDrives?: TestDriveBooking[];
  negotiations?: Negotiation[];
  carFinder?: CarFinderRequest[];
  carCare?: CarCareEnquiry[];
  pdi?: PDIBooking[];
  cars?: CarType[];
}): void {
  const headers = [
    'Data Category',
    'Record ID',
    'Timestamp',
    'Customer Name',
    'Phone Number',
    'Email Address',
    'City / Location',
    'Vehicle / Service Subject',
    'Value / Price (INR)',
    'Current Status',
    'Key Details / Notes',
  ];

  const masterRows: (string | number | boolean | null | undefined)[][] = [];

  // Customers
  (data.customers || []).forEach((c) => {
    masterRows.push([
      'Customer Record',
      c.id || '',
      formatCleanDate(c.created_at || c.createdAt),
      c.name || 'Customer',
      c.phone || '',
      c.email || '',
      c.city || 'Warangal',
      c.address || '',
      '',
      'Registered User',
      `Registered Customer on Recars Platform`,
    ]);
  });

  // Inquiries
  (data.inquiries || []).forEach((i) => {
    masterRows.push([
      'Car Inquiry',
      i.id,
      formatCleanDate(i.createdAt),
      i.userName || '',
      i.userPhone || '',
      i.userEmail || '',
      i.city || '',
      i.carTitle || 'Car Inquiry',
      i.carPrice || '',
      i.status || 'New',
      `Type: ${i.inquiryType || 'General'} | Message: ${i.message || ''}`,
    ]);
  });

  // Sell Requests
  (data.sellRequests || []).forEach((s) => {
    masterRows.push([
      'Sell Car Request',
      s.id,
      formatCleanDate(s.createdAt),
      s.sellerName || '',
      s.sellerPhone || '',
      '',
      s.sellerCity || 'Warangal',
      `${s.year || ''} ${s.make || ''} ${s.model || ''} (${s.variant || ''})`,
      s.expectedPrice || s.suggestedListingPrice || s.estimatedPriceMax || '',
      s.status || 'Pending',
      `Km: ${s.kilometers || 0} | Fuel: ${s.fuelType || ''} | Inspection: ${s.preferredInspectionDate || ''} (${s.preferredInspectionTime || ''})`,
    ]);
  });

  // Test Drives
  (data.testDrives || []).forEach((td) => {
    masterRows.push([
      'Test Drive Booking',
      td.id,
      formatCleanDate(td.createdAt),
      td.userName || '',
      td.userPhone || '',
      td.userEmail || '',
      td.city || '',
      td.carTitle || '',
      td.carPrice || '',
      td.status || 'Confirmed',
      `Appointment: ${td.preferredDate || ''} ${td.preferredTimeSlot || ''} (${td.type || ''})`,
    ]);
  });

  // Negotiations
  (data.negotiations || []).forEach((n) => {
    masterRows.push([
      'Price Negotiation',
      n.id,
      formatCleanDate(n.createdAt),
      n.customerName || '',
      n.customerPhone || '',
      n.customerEmail || '',
      '',
      n.carTitle || '',
      n.customerOffer || n.listedPrice || '',
      n.status || 'Pending',
      `Listed: ₹${n.listedPrice?.toLocaleString('en-IN') || 0} | Offer: ₹${n.customerOffer?.toLocaleString('en-IN') || 0} | Counter: ₹${n.counterOffer?.toLocaleString('en-IN') || 'None'} | Notes: ${n.notes || ''}`,
    ]);
  });

  // Car Finder
  (data.carFinder || []).forEach((r) => {
    masterRows.push([
      'Car Finder Request',
      r.id,
      formatCleanDate(r.createdAt),
      r.customerName || '',
      r.customerPhone || r.mobileNumber || '',
      r.customerEmail || r.email || '',
      r.preferredLocation || '',
      `${r.customBrand || r.preferredBrand || 'Any'} ${r.preferredModel || 'Any'}`,
      r.budgetRange || '',
      r.status || 'Pending Review',
      `Fuel: ${r.preferredFuel || 'Any'} | Transmission: ${r.preferredTransmission || 'Any'} | Notes: ${r.additionalRequirements || r.internalNotes || ''}`,
    ]);
  });

  // Car Care
  (data.carCare || []).forEach((c) => {
    masterRows.push([
      'Car Care & PPF',
      c.id,
      formatCleanDate(c.createdAt),
      c.customerName || c.fullName || '',
      c.customerPhone || c.mobileNumber || '',
      c.customerEmail || '',
      c.preferredLocation || '',
      `${c.vehicleBrand || c.carMake || ''} ${c.vehicleModel || c.carModel || ''}`,
      '',
      c.status || 'New',
      `Services: ${(c.services || []).join(', ')} | Notes: ${c.internalNotes || ''}`,
    ]);
  });

  // PDI
  (data.pdi || []).forEach((b) => {
    masterRows.push([
      'PDI Inspection',
      b.id,
      formatCleanDate(b.createdAt),
      b.customerName || '',
      b.customerPhone || '',
      b.customerEmail || '',
      b.city || '',
      `${b.carMake || ''} ${b.carModel || ''} (${b.carVariant || ''})`,
      b.fee || 1999,
      b.status || 'Booked',
      `Dealership: ${b.dealershipName || ''} | Slot: ${b.preferredDate || ''} ${b.preferredTimeSlot || ''} | Payment: ${b.paymentStatus || ''}`,
    ]);
  });

  // Inventory
  (data.cars || []).forEach((car) => {
    masterRows.push([
      'Vehicle Inventory',
      car.id,
      formatCleanDate(car.createdAt),
      car.dealerName || 'Recars Hub',
      car.dealerContact || '',
      '',
      car.city,
      `${car.year} ${car.make} ${car.model} (${car.variant || 'Standard'})`,
      car.price,
      car.availabilityStatus || 'Available',
      `Km: ${car.kilometers?.toLocaleString('en-IN') || 0} | Fuel: ${car.fuelType} | Score: ${car.inspectionScore || 96}/100 | Views: ${(car as any).viewsCount || 0}`,
    ]);
  });

  downloadExcelCSV(`Recars_MASTER_ALL_DATA_REPORT_${getTodayStamp()}`, headers, masterRows);
}
