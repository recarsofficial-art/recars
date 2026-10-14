import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';
import { Car, SellRequest, TestDriveBooking, CarInquiry } from './types';

const connectionString = process.env.DATABASE_URL || '';

// Shared PostgreSQL Connection Pool for Next.js Server
declare global {
  // eslint-disable-next-line no-var
  var __recarsPool: Pool | undefined;
}

export const pool =
  global.__recarsPool ||
  new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
  });

if (process.env.NODE_ENV !== 'production') {
  global.__recarsPool = pool;
}

// Supabase client instance (works with Supabase URL & optional anon key)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kgzzobdvwryijuubyzbh.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// ========================================================
// 1. CARS INVENTORY DATABASE OPERATIONS
// ========================================================

export async function dbGetCars(filter?: {
  make?: string;
  bodyType?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<Car[]> {
  let sql = 'SELECT * FROM public.cars WHERE 1=1';
  const values: any[] = [];
  let idx = 1;

  if (filter?.make) {
    sql += ` AND make = $${idx++}`;
    values.push(filter.make);
  }
  if (filter?.bodyType) {
    sql += ` AND body_type = $${idx++}`;
    values.push(filter.bodyType);
  }
  if (filter?.city && filter.city !== 'All') {
    sql += ` AND city = $${idx++}`;
    values.push(filter.city);
  }
  if (filter?.minPrice) {
    sql += ` AND price >= $${idx++}`;
    values.push(filter.minPrice);
  }
  if (filter?.maxPrice) {
    sql += ` AND price <= $${idx++}`;
    values.push(filter.maxPrice);
  }

  sql += ' ORDER BY created_at DESC';

  const { rows } = await pool.query(sql, values);
  return rows.map((r) => ({
    id: r.id,
    make: r.make,
    model: r.model,
    variant: r.variant,
    year: r.year,
    price: Number(r.price),
    originalPrice: r.original_price ? Number(r.original_price) : undefined,
    emiPerMonth: r.emi_per_month || Math.round((Number(r.price) * 0.8 * 0.09) / 12),
    kilometers: r.kilometers,
    fuelType: r.fuel_type,
    transmission: r.transmission,
    bodyType: r.body_type,
    ownership: r.ownership,
    city: r.city,
    locationArea: r.location_area || `${r.city} Recars Hub`,
    image: r.image,
    galleryImages: typeof r.gallery_images === 'string' ? JSON.parse(r.gallery_images) : r.gallery_images || [r.image],
    isVerified: r.is_verified,
    isRecarsSelect: r.is_select,
    featured: r.is_select,
    inspectionScore: r.score || 95,
    specifications: {
      engine: '1498 cc, 4 Cylinders Inline',
      maxPower: '115 bhp @ 6000 rpm',
      torque: '144 Nm @ 4500 rpm',
      mileage: '17.5 kmpl',
      seatingCapacity: 5,
      bootSpace: '430 Litres',
      fuelTankCapacity: '45 Litres',
      groundClearance: '180 mm',
      rto: `${r.city || 'Hyderabad'} RTO`,
      regYear: r.year,
      insuranceValidTill: 'Comprehensive Valid',
      color: 'Pearl White',
    },
    features: [
      'Automatic Climate Control',
      'Touchscreen Infotainment System',
      'Rear Parking Camera & Sensors',
      'Dual Front Airbags & ABS with EBD',
      'Keyless Push Button Start/Stop',
    ],
    description: r.description || `${r.year} ${r.make} ${r.model} verified by Recars engineers.`,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
  }));
}

export async function dbGetCarById(id: string): Promise<Car | null> {
  const { rows } = await pool.query('SELECT * FROM public.cars WHERE id = $1 LIMIT 1', [id]);
  if (!rows.length) return null;
  const r = rows[0];
  return {
    id: r.id,
    make: r.make,
    model: r.model,
    variant: r.variant,
    year: r.year,
    price: Number(r.price),
    originalPrice: r.original_price ? Number(r.original_price) : undefined,
    emiPerMonth: r.emi_per_month,
    kilometers: r.kilometers,
    fuelType: r.fuel_type,
    transmission: r.transmission,
    bodyType: r.body_type,
    ownership: r.ownership,
    city: r.city,
    locationArea: r.location_area,
    image: r.image,
    galleryImages: typeof r.gallery_images === 'string' ? JSON.parse(r.gallery_images) : r.gallery_images || [r.image],
    isVerified: r.is_verified,
    isRecarsSelect: r.is_select,
    featured: r.is_select,
    inspectionScore: r.score || 95,
    specifications: {
      engine: '1498 cc, 4 Cylinders Inline',
      maxPower: '115 bhp @ 6000 rpm',
      torque: '144 Nm @ 4500 rpm',
      mileage: '17.5 kmpl',
      seatingCapacity: 5,
      bootSpace: '430 Litres',
      fuelTankCapacity: '45 Litres',
      groundClearance: '180 mm',
      rto: `${r.city || 'Hyderabad'} RTO`,
      regYear: r.year,
      insuranceValidTill: 'Comprehensive Valid',
      color: 'Pearl White',
    },
    features: [
      'Automatic Climate Control',
      'Touchscreen Infotainment System',
      'Rear Parking Camera & Sensors',
      'Dual Front Airbags & ABS with EBD',
      'Keyless Push Button Start/Stop',
    ],
    description: r.description || `${r.year} ${r.make} ${r.model} verified by Recars engineers.`,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
  };
}

export async function dbInsertCar(car: Car): Promise<void> {
  const sql = `
    INSERT INTO public.cars (
      id, make, model, variant, year, price, original_price, emi_per_month,
      kilometers, fuel_type, transmission, body_type, ownership, city,
      location_area, image, gallery_images, score, is_verified, is_select, description
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
    )
    ON CONFLICT (id) DO UPDATE SET
      price = EXCLUDED.price,
      kilometers = EXCLUDED.kilometers,
      score = EXCLUDED.score,
      updated_at = now();
  `;
  await pool.query(sql, [
    car.id,
    car.make,
    car.model,
    car.variant,
    car.year,
    car.price,
    car.originalPrice || null,
    car.emiPerMonth || null,
    car.kilometers,
    car.fuelType,
    car.transmission,
    car.bodyType,
    car.ownership,
    car.city,
    car.locationArea || null,
    car.image,
    JSON.stringify(car.galleryImages || [car.image]),
    car.inspectionScore || 95,
    car.isVerified ?? true,
    car.isRecarsSelect ?? true,
    car.description || null,
  ]);
}

export async function dbDeleteCar(id: string): Promise<boolean> {
  const res = await pool.query('DELETE FROM public.cars WHERE id = $1', [id]);
  return (res.rowCount || 0) > 0;
}

// ========================================================
// 2. CUSTOMERS DATABASE OPERATIONS
// ========================================================

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  address?: string;
  createdAt?: string;
}

export async function dbUpsertCustomer(c: CustomerRecord): Promise<string> {
  const sql = `
    INSERT INTO public.customers (name, phone, email, city, address)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (phone) DO UPDATE SET
      name = EXCLUDED.name,
      email = COALESCE(EXCLUDED.email, customers.email),
      city = COALESCE(EXCLUDED.city, customers.city),
      address = COALESCE(EXCLUDED.address, customers.address),
      updated_at = now()
    RETURNING id;
  `;
  const res = await pool.query(sql, [c.name, c.phone, c.email || null, c.city || 'Hyderabad', c.address || null]);
  return res.rows[0].id;
}

export async function dbGetCustomers(): Promise<CustomerRecord[]> {
  const { rows } = await pool.query('SELECT * FROM public.customers ORDER BY created_at DESC');
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    phone: r.phone,
    email: r.email,
    city: r.city,
    address: r.address,
    createdAt: r.created_at,
  }));
}

export async function dbFindCustomer(query: string): Promise<CustomerRecord | null> {
  const trimmed = query.trim();
  const digitsOnly = trimmed.replace(/\D/g, '');
  const { rows } = await pool.query(
    `SELECT * FROM public.customers 
     WHERE phone = $1 
        OR email ILIKE $2 
        OR ($3 <> '' AND phone LIKE $4)
     LIMIT 1`,
    [trimmed, trimmed, digitsOnly, `%${digitsOnly}%`]
  );
  if (!rows.length) return null;
  const r = rows[0];
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    email: r.email,
    city: r.city,
    address: r.address,
    createdAt: r.created_at,
  };
}


// ========================================================
// 3. CUSTOMER CARS / SELL REQUESTS
// ========================================================

export async function dbGetCustomerCars(): Promise<SellRequest[]> {
  const { rows } = await pool.query('SELECT * FROM public.customer_cars ORDER BY created_at DESC');
  return rows.map((r) => ({
    id: r.id,
    registrationNumber: r.registration_number || '',
    make: r.make,
    model: r.model,
    variant: r.variant || '',
    year: r.year,
    fuelType: r.fuel_type,
    transmission: r.transmission,
    kilometers: r.kilometers,
    ownership: r.ownership,
    accidentHistory: r.accident_history,
    sellerName: r.seller_name,
    sellerPhone: r.seller_phone,
    sellerCity: r.seller_city,
    preferredInspectionDate: r.preferred_inspection_date || 'Doorstep on Request',
    preferredInspectionTime: r.preferred_inspection_time || '10:00 AM - 12:00 PM',
    estimatedPriceMin: Number(r.estimated_price_min) || 0,
    estimatedPriceMax: Number(r.estimated_price_max) || 0,
    status: r.status,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
  }));
}

export async function dbInsertCustomerCar(req: SellRequest): Promise<void> {
  // First ensure customer exists
  let customerId: string | null = null;
  if (req.sellerPhone) {
    customerId = await dbUpsertCustomer({
      id: '',
      name: req.sellerName,
      phone: req.sellerPhone,
      city: req.sellerCity,
    });
  }

  const sql = `
    INSERT INTO public.customer_cars (
      id, customer_id, registration_number, make, model, variant, year,
      fuel_type, transmission, kilometers, ownership, accident_history,
      seller_name, seller_phone, seller_city, preferred_inspection_date,
      preferred_inspection_time, estimated_price_min, estimated_price_max, status
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
    )
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      updated_at = now();
  `;
  await pool.query(sql, [
    req.id,
    customerId,
    req.registrationNumber,
    req.make,
    req.model,
    req.variant,
    req.year,
    req.fuelType,
    req.transmission,
    req.kilometers,
    req.ownership,
    req.accidentHistory,
    req.sellerName,
    req.sellerPhone,
    req.sellerCity,
    req.preferredInspectionDate,
    req.preferredInspectionTime,
    req.estimatedPriceMin,
    req.estimatedPriceMax,
    req.status,
  ]);
}

export async function dbUpdateCustomerCarStatus(id: string, status: string): Promise<boolean> {
  const res = await pool.query(
    'UPDATE public.customer_cars SET status = $1, updated_at = now() WHERE id = $2',
    [status, id]
  );
  return (res.rowCount || 0) > 0;
}

// ========================================================
// 4. CAR INQUIRIES DATABASE OPERATIONS
// ========================================================

export async function dbGetInquiries(): Promise<CarInquiry[]> {
  const { rows } = await pool.query('SELECT * FROM public.car_inquiries ORDER BY created_at DESC');
  return rows.map((r) => ({
    id: r.id,
    carId: r.car_id || '',
    carTitle: r.car_title,
    carImage: r.car_image,
    carPrice: Number(r.car_price) || 0,
    userName: r.user_name,
    userPhone: r.user_phone,
    userEmail: r.user_email || '',
    city: r.city || 'Hyderabad',
    inquiryType: r.inquiry_type,
    message: r.message,
    status: r.status,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
  }));
}

export async function dbInsertInquiry(inq: CarInquiry): Promise<void> {
  // Ensure customer profile is recorded
  if (inq.userPhone) {
    await dbUpsertCustomer({
      id: '',
      name: inq.userName,
      phone: inq.userPhone,
      email: inq.userEmail,
      city: inq.city,
    });
  }

  const sql = `
    INSERT INTO public.car_inquiries (
      id, car_id, car_title, car_image, car_price, user_name, user_phone,
      user_email, city, inquiry_type, message, status
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
    )
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      updated_at = now();
  `;
  await pool.query(sql, [
    inq.id,
    inq.carId || null,
    inq.carTitle,
    inq.carImage,
    inq.carPrice,
    inq.userName,
    inq.userPhone,
    inq.userEmail,
    inq.city,
    inq.inquiryType,
    inq.message,
    inq.status,
  ]);
}

export async function dbUpdateInquiryStatus(id: string, status: string): Promise<boolean> {
  const res = await pool.query(
    'UPDATE public.car_inquiries SET status = $1, updated_at = now() WHERE id = $2',
    [status, id]
  );
  return (res.rowCount || 0) > 0;
}

export async function dbDeleteInquiry(id: string): Promise<boolean> {
  const res = await pool.query('DELETE FROM public.car_inquiries WHERE id = $1', [id]);
  return (res.rowCount || 0) > 0;
}

// ========================================================
// 5. TEST DRIVES DATABASE OPERATIONS
// ========================================================

export async function dbGetTestDrives(): Promise<TestDriveBooking[]> {
  const { rows } = await pool.query('SELECT * FROM public.test_drives ORDER BY created_at DESC');
  return rows.map((r) => ({
    id: r.id,
    carId: r.car_id || '',
    carTitle: r.car_title,
    carImage: r.car_image || '/car-creta-real.jpg',
    carPrice: Number(r.car_price) || 1250000,
    userName: r.user_name,
    userPhone: r.user_phone,
    userEmail: r.user_email || `${r.user_name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
    city: r.city || 'Hyderabad',
    preferredDate: r.preferred_date,
    preferredTimeSlot: r.preferred_time_slot,
    type: r.type === 'Recars Hub Visit' ? 'Recars Hub Visit' : 'Home Test Drive',
    status: r.status || 'Confirmed',
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
  }));
}

export async function dbInsertTestDrive(td: TestDriveBooking): Promise<void> {
  if (td.userPhone) {
    await dbUpsertCustomer({
      id: '',
      name: td.userName,
      phone: td.userPhone,
      email: td.userEmail,
      city: td.city,
    });
  }

  const sql = `
    INSERT INTO public.test_drives (
      id, car_id, car_title, user_name, user_phone, preferred_date,
      preferred_time_slot, type, status
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9
    )
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      updated_at = now();
  `;
  await pool.query(sql, [
    td.id,
    td.carId || null,
    td.carTitle,
    td.userName,
    td.userPhone,
    td.preferredDate,
    td.preferredTimeSlot,
    td.type,
    td.status,
  ]);
}
