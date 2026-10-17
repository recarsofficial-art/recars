import { Pool, QueryResult } from 'pg';
import { createClient } from '@supabase/supabase-js';
import { Car, SellRequest, TestDriveBooking, CarInquiry, Negotiation, InspectionConfig, PDIBooking } from './types';

function getDatabaseConnectionString(): string {
  let envUrl = (process.env.DATABASE_URL || '').trim();

  // 1. Direct db.<project>.supabase.co is IPv6-only and fails with ENOTFOUND on IPv4 serverless hosts like Vercel.
  if (!envUrl || envUrl.includes('db.kgzzobdvwryijuubyzbh.supabase.co')) {
    return 'postgresql://postgres.kgzzobdvwryijuubyzbh:Recars%402026@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';
  }

  // 2. CRITICAL PRODUCTION FIX: Port 5432 on Supabase pooler is Session Mode (limited to pool_size: 15).
  // Connecting in session mode causes "(EMAXCONNSESSION) max clients reached in session mode".
  // Automatically rewrite any Supabase pooler connection from port 5432 (Session) to 6543 (Transaction Mode).
  if (envUrl.includes('pooler.supabase.com:5432')) {
    envUrl = envUrl.replace('pooler.supabase.com:5432', 'pooler.supabase.com:6543');
  }

  return envUrl;
}

const connectionString = getDatabaseConnectionString();

// Shared PostgreSQL Connection Pool Singleton for Next.js (Serverless & Persistent)
declare global {
  // eslint-disable-next-line no-var
  var __recarsPool: Pool | undefined;
}

function createRecarsPool(): Pool {
  const p = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    // Keep pool size lean (5) so concurrent serverless instances never exhaust the backend pool limit
    max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX, 10) : 5,
    // Fast idle timeout (10s) to return connections back to the pooler promptly
    idleTimeoutMillis: 10000,
    // 5-second acquisition timeout so callers fail fast with safe error instead of hanging
    connectionTimeoutMillis: 5000,
    // Allow process/lambda event loop to exit cleanly
    allowExitOnIdle: true,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  });

  p.on('error', (err) => {
    // Catch unexpected errors on idle clients so they are safely discarded without crashing the process
    console.error('[DATABASE_POOL_ERROR] Idle client error:', {
      message: err?.message,
      code: (err as any)?.code,
    });
  });

  return p;
}

// Preserve pool singleton on globalThis across all environments (both production and development)
if (!globalThis.__recarsPool) {
  globalThis.__recarsPool = createRecarsPool();
}

export const pool: Pool = globalThis.__recarsPool;

export class DatabaseError extends Error {
  public code?: string;
  public isConnectionError: boolean;
  constructor(message: string, code?: string, isConnectionError = false) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.isConnectionError = isConnectionError;
  }
}

/**
 * Resilient query wrapper with single bounded retry for transient connection drops.
 * Logs diagnostic details server-side while safeguarding sensitive user parameters.
 */
export async function safeDbQuery<T = any>(
  text: string,
  params?: any[],
  context = 'query'
): Promise<{ rows: T[]; rowCount: number | null }> {
  const maxAttempts = 2;
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await pool.query(text, params);
      return { rows: result.rows, rowCount: result.rowCount };
    } catch (err: any) {
      lastError = err;
      const isTransient =
        err?.code === '57P01' || // admin_shutdown
        err?.code === '08006' || // connection_failure
        err?.code === '08001' || // unable_to_establish_connection
        err?.code === 'ECONNRESET' ||
        err?.code === 'ETIMEDOUT' ||
        err?.code === 'EAI_AGAIN' ||
        (err?.message && err.message.includes('EMAXCONNSESSION'));

      console.error(`[DB_QUERY_ERROR] Attempt ${attempt}/${maxAttempts} in ${context}:`, {
        code: err?.code,
        message: err?.message,
        isTransient,
      });

      if (isTransient && attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 150));
        continue;
      }
      break;
    }
  }

  const isConnErr =
    lastError?.code === '08006' ||
    lastError?.code === '08001' ||
    lastError?.code === 'ECONNRESET' ||
    lastError?.code === 'ETIMEDOUT' ||
    (lastError?.message && lastError.message.includes('EMAXCONNSESSION'));

  throw new DatabaseError(
    isConnErr ? 'Database connection unavailable' : 'Database query failed',
    lastError?.code,
    isConnErr
  );
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
      rto: `${r.city || 'Warangal'} RTO`,
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
    availabilityStatus: (r.availability_status as any) || 'Available',
    manufacturingYear: r.manufacturing_year || r.year,
    registrationYear: r.registration_year || r.year,
    insuranceStatus: (r.insurance_status as any) || 'Valid',
    insuranceExpiry: r.insurance_expiry || '2026-11-20',
    insuranceType: (r.insurance_type as any) || 'Comprehensive',
    financeAvailable: (r.finance_available as any) || 'Available',
    suggestedPriceMin: r.suggested_price_min ? Number(r.suggested_price_min) : Math.round(Number(r.price) * 0.95),
    suggestedPriceMax: r.suggested_price_max ? Number(r.suggested_price_max) : Math.round(Number(r.price) * 1.05),
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
      rto: `${r.city || 'Warangal'} RTO`,
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
    availabilityStatus: (r.availability_status as any) || 'Available',
    manufacturingYear: r.manufacturing_year || r.year,
    registrationYear: r.registration_year || r.year,
    insuranceStatus: (r.insurance_status as any) || 'Valid',
    insuranceExpiry: r.insurance_expiry || '2026-11-20',
    insuranceType: (r.insurance_type as any) || 'Comprehensive',
    financeAvailable: (r.finance_available as any) || 'Available',
    suggestedPriceMin: r.suggested_price_min ? Number(r.suggested_price_min) : Math.round(Number(r.price) * 0.95),
    suggestedPriceMax: r.suggested_price_max ? Number(r.suggested_price_max) : Math.round(Number(r.price) * 1.05),
  };
}

export async function dbInsertCar(car: Car): Promise<void> {
  const sql = `
    INSERT INTO public.cars (
      id, make, model, variant, year, price, original_price, emi_per_month,
      kilometers, fuel_type, transmission, body_type, ownership, city,
      location_area, image, gallery_images, score, is_verified, is_select, description,
      availability_status, manufacturing_year, registration_year, insurance_status,
      insurance_expiry, insurance_type, finance_available, suggested_price_min, suggested_price_max
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21,
      $22, $23, $24, $25, $26, $27, $28, $29, $30
    )
    ON CONFLICT (id) DO UPDATE SET
      price = EXCLUDED.price,
      kilometers = EXCLUDED.kilometers,
      score = EXCLUDED.score,
      availability_status = EXCLUDED.availability_status,
      ownership = EXCLUDED.ownership,
      manufacturing_year = EXCLUDED.manufacturing_year,
      registration_year = EXCLUDED.registration_year,
      insurance_status = EXCLUDED.insurance_status,
      insurance_expiry = EXCLUDED.insurance_expiry,
      insurance_type = EXCLUDED.insurance_type,
      finance_available = EXCLUDED.finance_available,
      suggested_price_min = EXCLUDED.suggested_price_min,
      suggested_price_max = EXCLUDED.suggested_price_max,
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
    car.ownership || '1st Owner',
    car.city,
    car.locationArea || null,
    car.image,
    JSON.stringify(car.galleryImages || [car.image]),
    car.inspectionScore || 95,
    car.isVerified ?? true,
    car.isRecarsSelect ?? true,
    car.description || null,
    car.availabilityStatus || 'Available',
    car.manufacturingYear || car.year,
    car.registrationYear || car.year,
    car.insuranceStatus || 'Valid',
    car.insuranceExpiry || '2026-11-20',
    car.insuranceType || 'Comprehensive',
    car.financeAvailable || 'Available',
    car.suggestedPriceMin || Math.round(car.price * 0.95),
    car.suggestedPriceMax || Math.round(car.price * 1.05),
  ]);
}

export async function dbUpdateCarAvailability(id: string, status: string): Promise<boolean> {
  const res = await pool.query(
    'UPDATE public.cars SET availability_status = $1, updated_at = now() WHERE id = $2',
    [status, id]
  );
  return (res.rowCount || 0) > 0;
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
  const res = await safeDbQuery<{ id: string }>(
    sql,
    [c.name, c.phone, c.email || null, c.city || 'Warangal', c.address || null],
    'dbUpsertCustomer'
  );
  return res.rows[0].id;
}

export async function dbGetCustomers(): Promise<CustomerRecord[]> {
  const { rows } = await safeDbQuery<any>(
    'SELECT * FROM public.customers ORDER BY created_at DESC',
    [],
    'dbGetCustomers'
  );
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
  const { rows } = await safeDbQuery<any>(
    `SELECT * FROM public.customers 
     WHERE phone = $1 
        OR email ILIKE $2 
        OR ($3 <> '' AND phone LIKE $4)
     LIMIT 1`,
    [trimmed, trimmed, digitsOnly, `%${digitsOnly}%`],
    'dbFindCustomer'
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
  const sellerName = req.sellerName || 'Customer';
  const sellerPhone = req.sellerPhone || '+91 99087 96677';
  const sellerCity = req.sellerCity || 'Warangal';

  // Ensure customer exists
  let customerId: string | null = null;
  if (sellerPhone) {
    try {
      customerId = await dbUpsertCustomer({
        id: '',
        name: sellerName,
        phone: sellerPhone,
        city: sellerCity,
      });
    } catch (e) {
      console.warn('Customer upsert non-critical notice:', e);
    }
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
    req.registrationNumber || 'TS 09 EA 4589',
    req.make,
    req.model,
    req.variant || '',
    req.year || 2022,
    req.fuelType || 'Petrol',
    req.transmission || 'Automatic',
    req.kilometers || 35000,
    req.ownership || '1st Owner',
    req.accidentHistory || 'No',
    sellerName,
    sellerPhone,
    sellerCity,
    req.preferredInspectionDate || 'Tomorrow',
    req.preferredInspectionTime || '11:00 AM - 01:00 PM',
    req.estimatedPriceMin || 0,
    req.estimatedPriceMax || 0,
    req.status || 'Inspection Scheduled',
  ]);

  // Cross-index into car_inquiries so it immediately shows up in BOTH Car Inquiries and Sell Requests workspaces
  try {
    const inqSql = `
      INSERT INTO public.car_inquiries (
        id, car_title, user_name, user_phone, user_email, city, inquiry_type, message, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      )
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        updated_at = now();
    `;
    await pool.query(inqSql, [
      req.id,
      `${req.year || ''} ${req.make} ${req.model} (${req.variant || 'Standard'})`.trim(),
      sellerName,
      sellerPhone,
      'Recars.in@gmail.com',
      sellerCity,
      'Sell / Doorstep Inspection Request',
      `Sell Request ${req.id} for ${req.year || ''} ${req.make} ${req.model}. Preferred Inspection: ${req.preferredInspectionDate || 'Tomorrow'} (${req.preferredInspectionTime || '11:00 AM - 01:00 PM'}).`,
      'New'
    ]);
  } catch (err) {
    console.warn('Cross-indexing sell request into inquiries notice:', err);
  }
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
    city: r.city || 'Warangal',
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
    city: r.city || 'Warangal',
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

// ========================================================
// 6. NEGOTIATIONS DATABASE OPERATIONS
// ========================================================

export async function dbGetNegotiations(filter?: {
  carId?: string;
  customerPhone?: string;
  status?: string;
}): Promise<Negotiation[]> {
  let sql = 'SELECT * FROM public.negotiations WHERE 1=1';
  const values: any[] = [];
  let idx = 1;

  if (filter?.carId) {
    sql += ` AND car_id = $${idx++}`;
    values.push(filter.carId);
  }
  if (filter?.customerPhone) {
    sql += ` AND customer_phone = $${idx++}`;
    values.push(filter.customerPhone);
  }
  if (filter?.status && filter.status !== 'All') {
    sql += ` AND status = $${idx++}`;
    values.push(filter.status);
  }

  sql += ' ORDER BY updated_at DESC';

  const { rows } = await pool.query(sql, values);
  return rows.map((r) => ({
    id: r.id,
    carId: r.car_id,
    carTitle: r.car_title,
    carImage: r.car_image,
    listedPrice: Number(r.listed_price),
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    customerEmail: r.customer_email,
    customerOffer: Number(r.customer_offer),
    counterOffer: r.counter_offer ? Number(r.counter_offer) : undefined,
    finalPrice: r.final_price ? Number(r.final_price) : undefined,
    status: r.status,
    notes: r.notes,
    offerHistory: typeof r.offer_history === 'string' ? JSON.parse(r.offer_history) : (r.offer_history || []),
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
  }));
}

export async function dbGetNegotiationById(id: string): Promise<Negotiation | null> {
  const { rows } = await pool.query('SELECT * FROM public.negotiations WHERE id = $1 LIMIT 1', [id]);
  if (!rows.length) return null;
  const r = rows[0];
  return {
    id: r.id,
    carId: r.car_id,
    carTitle: r.car_title,
    carImage: r.car_image,
    listedPrice: Number(r.listed_price),
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    customerEmail: r.customer_email,
    customerOffer: Number(r.customer_offer),
    counterOffer: r.counter_offer ? Number(r.counter_offer) : undefined,
    finalPrice: r.final_price ? Number(r.final_price) : undefined,
    status: r.status,
    notes: r.notes,
    offerHistory: typeof r.offer_history === 'string' ? JSON.parse(r.offer_history) : (r.offer_history || []),
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
  };
}

export async function dbCreateNegotiation(neg: Negotiation): Promise<void> {
  if (neg.customerPhone) {
    try {
      await dbUpsertCustomer({
        id: '',
        name: neg.customerName,
        phone: neg.customerPhone,
        email: neg.customerEmail,
      });
    } catch (e) {
      console.warn('Customer upsert notice:', e);
    }
  }

  const initialHistory = neg.offerHistory && neg.offerHistory.length > 0 ? neg.offerHistory : [
    {
      id: `off-${Date.now()}`,
      sender: 'customer',
      senderName: neg.customerName,
      amount: neg.customerOffer,
      message: neg.notes || 'Initial customer offer',
      timestamp: new Date().toISOString(),
    }
  ];

  const sql = `
    INSERT INTO public.negotiations (
      id, car_id, car_title, car_image, listed_price,
      customer_name, customer_phone, customer_email,
      customer_offer, counter_offer, final_price, status, notes,
      offer_history, created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, now(), now()
    )
    ON CONFLICT (id) DO UPDATE SET
      customer_offer = EXCLUDED.customer_offer,
      notes = EXCLUDED.notes,
      offer_history = EXCLUDED.offer_history,
      updated_at = now();
  `;

  await pool.query(sql, [
    neg.id,
    neg.carId,
    neg.carTitle,
    neg.carImage || null,
    neg.listedPrice,
    neg.customerName,
    neg.customerPhone,
    neg.customerEmail || null,
    neg.customerOffer,
    neg.counterOffer || null,
    neg.finalPrice || null,
    neg.status || 'Pending',
    neg.notes || null,
    JSON.stringify(initialHistory),
  ]);
}

export async function dbUpdateNegotiationStatus(
  id: string,
  action: 'accept' | 'reject' | 'counter' | 'customer_accept',
  payload: {
    counterOffer?: number;
    finalPrice?: number;
    notes?: string;
    actorName?: string;
  }
): Promise<Negotiation | null> {
  const current = await dbGetNegotiationById(id);
  if (!current) return null;

  let newStatus = current.status;
  let counterOffer = current.counterOffer;
  let finalPrice = current.finalPrice;
  const history = [...(current.offerHistory || [])];

  if (action === 'accept') {
    newStatus = 'Accepted';
    finalPrice = payload.finalPrice || current.customerOffer;
    history.push({
      id: `off-${Date.now()}`,
      sender: 'admin',
      senderName: payload.actorName || 'Recars Sales Team',
      amount: finalPrice,
      message: payload.notes || 'Offer accepted by Recars. Ready for booking.',
      timestamp: new Date().toISOString(),
    });
  } else if (action === 'reject') {
    newStatus = 'Rejected';
    history.push({
      id: `off-${Date.now()}`,
      sender: 'admin',
      senderName: payload.actorName || 'Recars Sales Team',
      amount: current.customerOffer,
      message: payload.notes || 'Offer could not be accepted at this time.',
      timestamp: new Date().toISOString(),
    });
  } else if (action === 'counter') {
    newStatus = 'Counteroffer';
    counterOffer = payload.counterOffer || current.listedPrice;
    history.push({
      id: `off-${Date.now()}`,
      sender: 'admin',
      senderName: payload.actorName || 'Recars Pricing Desk',
      amount: counterOffer,
      message: payload.notes || `Counteroffer proposed: ₹${counterOffer.toLocaleString('en-IN')}`,
      timestamp: new Date().toISOString(),
    });
  } else if (action === 'customer_accept') {
    newStatus = 'Accepted';
    finalPrice = current.counterOffer || current.customerOffer;
    history.push({
      id: `off-${Date.now()}`,
      sender: 'customer',
      senderName: current.customerName,
      amount: finalPrice,
      message: 'Customer accepted the counteroffer!',
      timestamp: new Date().toISOString(),
    });
  }

  const sql = `
    UPDATE public.negotiations SET
      status = $1,
      counter_offer = $2,
      final_price = $3,
      notes = COALESCE($4, notes),
      offer_history = $5,
      updated_at = now()
    WHERE id = $6
    RETURNING *;
  `;

  await pool.query(sql, [
    newStatus,
    counterOffer || null,
    finalPrice || null,
    payload.notes || null,
    JSON.stringify(history),
    id,
  ]);

  return await dbGetNegotiationById(id);
}

// ========================================================
// 7. SYSTEM SETTINGS & INSPECTION CONFIG OPERATIONS
// ========================================================

export async function dbGetInspectionConfig(): Promise<InspectionConfig> {
  const defaultConf: InspectionConfig = {
    sellerInspectionFee: 999,
    sellerReportFee: 1199,
    buyerInspectionFee: 999,
    pdiInspectionFee: 2499,
    pdiReportFee: 2499,
    freeInspectionActive: false,
  };
  try {
    const { rows } = await pool.query("SELECT value FROM public.settings WHERE key = 'inspection_config' LIMIT 1");
    if (!rows.length) return defaultConf;
    const val = typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
    return { ...defaultConf, ...val };
  } catch (e) {
    return defaultConf;
  }
}

export async function dbUpdateInspectionConfig(config: Partial<InspectionConfig>): Promise<InspectionConfig> {
  const current = await dbGetInspectionConfig();
  const updated: InspectionConfig = { ...current, ...config };
  await pool.query(
    `INSERT INTO public.settings (key, value, updated_at)
     VALUES ('inspection_config', $1, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [JSON.stringify(updated)]
  );
  return updated;
}

// ========================================================
// 8. PRE-DELIVERY INSPECTION (PDI) DATABASE OPERATIONS
// ========================================================

let pdiTableInitPromise: Promise<void> | null = null;
async function ensurePdiTable(): Promise<void> {
  if (!pdiTableInitPromise) {
    pdiTableInitPromise = (async () => {
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS public.pdi_bookings (
            id TEXT PRIMARY KEY,
            customer_name TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            customer_email TEXT,
            city TEXT DEFAULT 'Warangal',
            dealership_name TEXT NOT NULL,
            dealership_address TEXT NOT NULL,
            car_make TEXT NOT NULL,
            car_model TEXT NOT NULL,
            car_variant TEXT,
            fuel_type TEXT,
            transmission TEXT,
            vin_or_chassis TEXT,
            preferred_date TEXT NOT NULL,
            preferred_time_slot TEXT NOT NULL,
            special_instructions TEXT,
            package_type TEXT DEFAULT 'Standard PDI',
            fee BIGINT DEFAULT 2499,
            payment_status TEXT DEFAULT 'Pay on Inspection',
            status TEXT DEFAULT 'Booked',
            assigned_representative JSONB,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
          );
          CREATE INDEX IF NOT EXISTS idx_pdi_phone ON public.pdi_bookings(customer_phone);
          CREATE INDEX IF NOT EXISTS idx_pdi_status ON public.pdi_bookings(status);
          CREATE INDEX IF NOT EXISTS idx_pdi_date ON public.pdi_bookings(preferred_date);
        `);
      } catch (err) {
        console.warn('Notice: pdi_bookings table auto-create skipped or handled:', err);
      }
    })();
  }
  return pdiTableInitPromise;
}

export async function dbGetPDIBookings(): Promise<PDIBooking[]> {
  try {
    await ensurePdiTable();
    const { rows } = await pool.query('SELECT * FROM public.pdi_bookings ORDER BY created_at DESC');
    return rows.map((r: any) => ({
      id: r.id,
      customerName: r.customer_name,
      customerPhone: r.customer_phone,
      customerEmail: r.customer_email || '',
      city: r.city || 'Warangal',
      dealershipName: r.dealership_name,
      dealershipAddress: r.dealership_address,
      carMake: r.car_make,
      carModel: r.car_model,
      carVariant: r.car_variant || '',
      fuelType: r.fuel_type || 'Petrol',
      transmission: r.transmission || 'Automatic',
      vinOrChassis: r.vin_or_chassis || '',
      preferredDate: r.preferred_date,
      preferredTimeSlot: r.preferred_time_slot,
      specialInstructions: r.special_instructions || '',
      packageType: r.package_type || 'Standard PDI',
      fee: Number(r.fee) || 2499,
      paymentStatus: r.payment_status || 'Pay on Inspection',
      status: r.status || 'Booked',
      assignedRepresentative: r.assigned_representative ? (typeof r.assigned_representative === 'string' ? JSON.parse(r.assigned_representative) : r.assigned_representative) : undefined,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching PDI bookings:', error);
    return [];
  }
}

export async function dbInsertPDIBooking(booking: PDIBooking): Promise<void> {
  await ensurePdiTable();

  // 1. Record customer directory profile
  if (booking.customerPhone) {
    try {
      await dbUpsertCustomer({
        id: '',
        name: booking.customerName,
        phone: booking.customerPhone,
        email: booking.customerEmail || '',
        city: booking.city || 'Warangal',
        address: `${booking.dealershipName}, ${booking.dealershipAddress}`,
      });
    } catch (e) {
      console.warn('Customer upsert non-critical warning:', e);
    }
  }

  // 2. Insert into pdi_bookings table
  const sql = `
    INSERT INTO public.pdi_bookings (
      id, customer_name, customer_phone, customer_email, city,
      dealership_name, dealership_address, car_make, car_model, car_variant,
      fuel_type, transmission, vin_or_chassis, preferred_date, preferred_time_slot,
      special_instructions, package_type, fee, payment_status, status,
      assigned_representative
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15,
      $16, $17, $18, $19, $20,
      $21
    )
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      assigned_representative = EXCLUDED.assigned_representative,
      updated_at = now();
  `;

  await pool.query(sql, [
    booking.id,
    booking.customerName,
    booking.customerPhone,
    booking.customerEmail || null,
    booking.city || 'Warangal',
    booking.dealershipName,
    booking.dealershipAddress,
    booking.carMake,
    booking.carModel,
    booking.carVariant || null,
    booking.fuelType || 'Petrol',
    booking.transmission || 'Automatic',
    booking.vinOrChassis || null,
    booking.preferredDate,
    booking.preferredTimeSlot,
    booking.specialInstructions || null,
    booking.packageType || 'Standard PDI',
    booking.fee || 2499,
    booking.paymentStatus || 'Pay on Inspection',
    booking.status || 'Booked',
    booking.assignedRepresentative ? JSON.stringify(booking.assignedRepresentative) : null,
  ]);

  // 3. Mirror into car_inquiries so it seamlessly surfaces in omnichannel alerts
  try {
    const inqMsg = `[PDI Booking] New Car: ${booking.carMake} ${booking.carModel} (${booking.carVariant || 'Standard'}). Dealership: ${booking.dealershipName}, ${booking.dealershipAddress}. Date: ${booking.preferredDate} (${booking.preferredTimeSlot}). Fee: ₹${booking.fee} (${booking.paymentStatus}). Notes: ${booking.specialInstructions || 'None'}`;
    await dbInsertInquiry({
      id: `inq-pdi-${booking.id}`,
      carId: '',
      carTitle: `${booking.carMake} ${booking.carModel} (New Car PDI)`,
      carPrice: booking.fee,
      userName: booking.customerName,
      userPhone: booking.customerPhone,
      userEmail: booking.customerEmail || '',
      city: booking.city,
      inquiryType: 'Pre-Delivery Inspection (PDI)',
      message: inqMsg,
      status: 'New',
      createdAt: booking.createdAt,
    });
  } catch (err) {
    console.warn('Non-critical: mirroring PDI booking into inquiries:', err);
  }
}

export async function dbUpdatePDIBookingStatus(
  id: string,
  status: string,
  assignedRepresentative?: { name: string; phone: string; badgeId: string }
): Promise<boolean> {
  await ensurePdiTable();
  let sql = 'UPDATE public.pdi_bookings SET status = $1, updated_at = now()';
  const params: any[] = [status];

  if (assignedRepresentative) {
    sql += ', assigned_representative = $2 WHERE id = $3';
    params.push(JSON.stringify(assignedRepresentative), id);
  } else {
    sql += ' WHERE id = $2';
    params.push(id);
  }

  const res = await pool.query(sql, params);
  return (res.rowCount || 0) > 0;
}

export async function dbDeletePDIBooking(id: string): Promise<boolean> {
  await ensurePdiTable();
  const res = await pool.query('DELETE FROM public.pdi_bookings WHERE id = $1', [id]);
  return (res.rowCount || 0) > 0;
}


