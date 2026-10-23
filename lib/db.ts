import { Pool, QueryResult } from 'pg';
import { createClient } from '@supabase/supabase-js';
import {
  Car,
  SellRequest,
  TestDriveBooking,
  CarInquiry,
  Negotiation,
  InspectionConfig,
  PDIBooking,
  RegisteredDealer,
  CarCareEnquiry,
  CarCareStatus,
  VehicleAnalyticsItem,
  AdminAnalyticsSummary,
  VehicleRibbon,
  CarFinderRequest,
  CarFinderStatus,
} from './types';

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

let dealerSchemaInitPromise: Promise<void> | null = null;
export async function ensureDealerAndCarsSchema(): Promise<void> {
  if (!dealerSchemaInitPromise) {
    dealerSchemaInitPromise = (async () => {
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS public.dealers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            contact_person TEXT,
            phone TEXT NOT NULL,
            email TEXT,
            city TEXT DEFAULT 'Warangal',
            address TEXT,
            status TEXT DEFAULT 'Active',
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
          );

          ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS vehicle_source TEXT DEFAULT 'Individual Seller';
          ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS dealer_id TEXT;
          ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS dealer_name TEXT;
          ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS dealer_contact TEXT;
          ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS uploaded_by TEXT DEFAULT 'Seller';
          ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS uploaded_by_user_id TEXT;
          ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS uploaded_by_role TEXT;
          ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS listing_status TEXT DEFAULT 'Published';
          ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS registration_number TEXT;
          ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ DEFAULT now();
          ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS sold_at TIMESTAMPTZ;
          ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS custom_ribbons JSONB DEFAULT '[]'::jsonb;
          ALTER TABLE public.cars ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

          CREATE INDEX IF NOT EXISTS idx_cars_vehicle_source ON public.cars(vehicle_source);
          CREATE INDEX IF NOT EXISTS idx_cars_dealer_id ON public.cars(dealer_id);
          CREATE INDEX IF NOT EXISTS idx_cars_avail_status ON public.cars(availability_status);

          CREATE TABLE IF NOT EXISTS public.vehicle_views (
            id BIGSERIAL PRIMARY KEY,
            car_id TEXT NOT NULL,
            session_id TEXT,
            ip_hash TEXT,
            created_at TIMESTAMPTZ DEFAULT now()
          );
          CREATE INDEX IF NOT EXISTS idx_vehicle_views_car_id ON public.vehicle_views(car_id);
          CREATE INDEX IF NOT EXISTS idx_vehicle_views_created_at ON public.vehicle_views(created_at);

          CREATE TABLE IF NOT EXISTS public.car_care_enquiries (
            id TEXT PRIMARY KEY,
            customer_name TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            customer_email TEXT,
            car_make TEXT NOT NULL,
            car_model TEXT NOT NULL,
            car_year INT,
            services JSONB NOT NULL DEFAULT '[]'::jsonb,
            preferred_location TEXT NOT NULL,
            preferred_date DATE,
            additional_requirements TEXT,
            status TEXT NOT NULL DEFAULT 'New',
            internal_notes TEXT DEFAULT '',
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
          );
          CREATE INDEX IF NOT EXISTS idx_car_care_enquiries_status ON public.car_care_enquiries(status);
          CREATE INDEX IF NOT EXISTS idx_car_care_enquiries_created_at ON public.car_care_enquiries(created_at DESC);

          CREATE TABLE IF NOT EXISTS public.car_finder_requests (
            id TEXT PRIMARY KEY,
            customer_name TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            customer_email TEXT,
            preferred_brand TEXT NOT NULL,
            preferred_model TEXT,
            budget_min NUMERIC,
            budget_max NUMERIC,
            budget_range TEXT,
            preferred_fuel TEXT,
            preferred_transmission TEXT,
            preferred_year TEXT,
            preferred_location TEXT,
            additional_requirements TEXT,
            status TEXT NOT NULL DEFAULT 'New',
            internal_notes TEXT DEFAULT '',
            matched_car_ids JSONB DEFAULT '[]'::jsonb,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
          );
          CREATE INDEX IF NOT EXISTS idx_car_finder_status ON public.car_finder_requests(status);
          CREATE INDEX IF NOT EXISTS idx_car_finder_brand ON public.car_finder_requests(preferred_brand);
          CREATE INDEX IF NOT EXISTS idx_car_finder_created_at ON public.car_finder_requests(created_at DESC);
        `);
      } catch (err: any) {
        console.warn('[DB_INIT] ensureDealerAndCarsSchema warning:', err?.message);
      }
    })();
  }
  return dealerSchemaInitPromise;
}

export async function dbGetCars(filter?: {
  make?: string;
  bodyType?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<Car[]> {
  await ensureDealerAndCarsSchema();
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
    featured: Boolean(r.featured),
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
    statusUpdatedAt: r.status_updated_at ? new Date(r.status_updated_at).toISOString() : (r.created_at ? new Date(r.created_at).toISOString() : undefined),
    soldAt: r.sold_at ? new Date(r.sold_at).toISOString() : undefined,
    manufacturingYear: r.manufacturing_year || r.year,
    registrationYear: r.registration_year || r.year,
    insuranceStatus: (r.insurance_status as any) || 'Valid',
    insuranceExpiry: r.insurance_expiry || '2026-11-20',
    insuranceType: (r.insurance_type as any) || 'Comprehensive',
    financeAvailable: (r.finance_available as any) || 'Available',
    suggestedPriceMin: r.suggested_price_min ? Number(r.suggested_price_min) : Math.round(Number(r.price) * 0.95),
    suggestedPriceMax: r.suggested_price_max ? Number(r.suggested_price_max) : Math.round(Number(r.price) * 1.05),
    vehicleSource: (r.vehicle_source as any) || 'Individual Seller',
    dealerId: r.dealer_id || undefined,
    dealerName: r.dealer_name || undefined,
    dealerContact: r.dealer_contact || undefined,
    uploadedBy: (r.uploaded_by as any) || 'Seller',
    uploadedByUserId: r.uploaded_by_user_id || undefined,
    uploadedByRole: r.uploaded_by_role || undefined,
    listingStatus: (r.listing_status as any) || 'Published',
    registrationNumber: r.registration_number || undefined,
  }));
}

export async function dbGetCarById(id: string): Promise<Car | null> {
  await ensureDealerAndCarsSchema();
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
    featured: Boolean(r.featured),
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
    statusUpdatedAt: r.status_updated_at ? new Date(r.status_updated_at).toISOString() : (r.created_at ? new Date(r.created_at).toISOString() : undefined),
    soldAt: r.sold_at ? new Date(r.sold_at).toISOString() : undefined,
    manufacturingYear: r.manufacturing_year || r.year,
    registrationYear: r.registration_year || r.year,
    insuranceStatus: (r.insurance_status as any) || 'Valid',
    insuranceExpiry: r.insurance_expiry || '2026-11-20',
    insuranceType: (r.insurance_type as any) || 'Comprehensive',
    financeAvailable: (r.finance_available as any) || 'Available',
    suggestedPriceMin: r.suggested_price_min ? Number(r.suggested_price_min) : Math.round(Number(r.price) * 0.95),
    suggestedPriceMax: r.suggested_price_max ? Number(r.suggested_price_max) : Math.round(Number(r.price) * 1.05),
    vehicleSource: (r.vehicle_source as any) || 'Individual Seller',
    dealerId: r.dealer_id || undefined,
    dealerName: r.dealer_name || undefined,
    dealerContact: r.dealer_contact || undefined,
    uploadedBy: (r.uploaded_by as any) || 'Seller',
    uploadedByUserId: r.uploaded_by_user_id || undefined,
    uploadedByRole: r.uploaded_by_role || undefined,
    listingStatus: (r.listing_status as any) || 'Published',
    registrationNumber: r.registration_number || undefined,
    customRibbons: Array.isArray(r.custom_ribbons)
      ? r.custom_ribbons
      : typeof r.custom_ribbons === 'string'
      ? JSON.parse(r.custom_ribbons)
      : [],
  };
}

export async function dbInsertCar(car: Car): Promise<void> {
  await ensureDealerAndCarsSchema();
  const sql = `
    INSERT INTO public.cars (
      id, make, model, variant, year, price, original_price, emi_per_month,
      kilometers, fuel_type, transmission, body_type, ownership, city,
      location_area, image, gallery_images, score, is_verified, is_select, description,
      availability_status, manufacturing_year, registration_year, insurance_status,
      insurance_expiry, insurance_type, finance_available, suggested_price_min, suggested_price_max,
      vehicle_source, dealer_id, dealer_name, dealer_contact, uploaded_by, uploaded_by_user_id, uploaded_by_role,
      listing_status, registration_number, custom_ribbons, featured
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21,
      $22, $23, $24, $25, $26, $27, $28, $29, $30,
      $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41
    )
    ON CONFLICT (id) DO UPDATE SET
      make = EXCLUDED.make,
      model = EXCLUDED.model,
      variant = EXCLUDED.variant,
      year = EXCLUDED.year,
      price = EXCLUDED.price,
      original_price = EXCLUDED.original_price,
      emi_per_month = EXCLUDED.emi_per_month,
      kilometers = EXCLUDED.kilometers,
      fuel_type = EXCLUDED.fuel_type,
      transmission = EXCLUDED.transmission,
      body_type = EXCLUDED.body_type,
      ownership = EXCLUDED.ownership,
      city = EXCLUDED.city,
      location_area = EXCLUDED.location_area,
      image = EXCLUDED.image,
      gallery_images = EXCLUDED.gallery_images,
      score = EXCLUDED.score,
      is_verified = EXCLUDED.is_verified,
      is_select = EXCLUDED.is_select,
      description = EXCLUDED.description,
      availability_status = EXCLUDED.availability_status,
      manufacturing_year = EXCLUDED.manufacturing_year,
      registration_year = EXCLUDED.registration_year,
      insurance_status = EXCLUDED.insurance_status,
      insurance_expiry = EXCLUDED.insurance_expiry,
      insurance_type = EXCLUDED.insurance_type,
      finance_available = EXCLUDED.finance_available,
      suggested_price_min = EXCLUDED.suggested_price_min,
      suggested_price_max = EXCLUDED.suggested_price_max,
      vehicle_source = EXCLUDED.vehicle_source,
      dealer_id = EXCLUDED.dealer_id,
      dealer_name = EXCLUDED.dealer_name,
      dealer_contact = EXCLUDED.dealer_contact,
      uploaded_by = EXCLUDED.uploaded_by,
      uploaded_by_user_id = EXCLUDED.uploaded_by_user_id,
      uploaded_by_role = EXCLUDED.uploaded_by_role,
      listing_status = EXCLUDED.listing_status,
      registration_number = EXCLUDED.registration_number,
      custom_ribbons = EXCLUDED.custom_ribbons,
      featured = EXCLUDED.featured,
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
    car.vehicleSource || 'Individual Seller',
    car.dealerId || null,
    car.dealerName || null,
    car.dealerContact || null,
    car.uploadedBy || 'Seller',
    car.uploadedByUserId || null,
    car.uploadedByRole || null,
    car.listingStatus || 'Published',
    car.registrationNumber || null,
    JSON.stringify(car.customRibbons || []),
    Boolean(car.featured),
  ]);
}

export async function dbUpdateCarFeatured(id: string, featured: boolean): Promise<boolean> {
  await ensureDealerAndCarsSchema();
  const res = await pool.query(
    'UPDATE public.cars SET featured = $1, updated_at = now() WHERE id = $2',
    [Boolean(featured), id]
  );
  return (res.rowCount || 0) > 0;
}

export async function dbGetDealers(): Promise<RegisteredDealer[]> {
  await ensureDealerAndCarsSchema();
  try {
    const { rows } = await pool.query(`
      SELECT d.*, COUNT(c.id)::int as active_cars_count
      FROM public.dealers d
      LEFT JOIN public.cars c ON (c.dealer_id = d.id OR c.dealer_name = d.name)
      GROUP BY d.id
      ORDER BY d.name ASC
    `);
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      contactPerson: r.contact_person || undefined,
      phone: r.phone,
      email: r.email || undefined,
      city: r.city || 'Warangal',
      address: r.address || undefined,
      status: r.status || 'Active',
      activeCarsCount: Number(r.active_cars_count || 0),
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : undefined,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : undefined,
    }));
  } catch (err: any) {
    console.error('dbGetDealers error:', err?.message);
    return [];
  }
}

export async function dbDeleteDealer(id: string): Promise<boolean> {
  await ensureDealerAndCarsSchema();
  try {
    const res = await pool.query('DELETE FROM public.dealers WHERE id = $1 RETURNING id', [id]);
    await pool.query('UPDATE public.cars SET dealer_id = NULL, dealer_name = NULL, dealer_contact = NULL WHERE dealer_id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  } catch (err: any) {
    console.error('dbDeleteDealer error:', err?.message);
    return false;
  }
}

export async function dbInsertDealer(dealer: RegisteredDealer): Promise<RegisteredDealer> {
  await ensureDealerAndCarsSchema();
  const id = dealer.id || `DLR-${Date.now().toString().slice(-4)}`;
  const sql = `
    INSERT INTO public.dealers (id, name, contact_person, phone, email, city, address, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      contact_person = EXCLUDED.contact_person,
      phone = EXCLUDED.phone,
      email = EXCLUDED.email,
      city = EXCLUDED.city,
      address = EXCLUDED.address,
      status = EXCLUDED.status,
      updated_at = now()
    RETURNING *;
  `;
  const { rows } = await pool.query(sql, [
    id,
    dealer.name.trim(),
    dealer.contactPerson || null,
    dealer.phone.trim(),
    dealer.email || null,
    dealer.city || 'Warangal',
    dealer.address || null,
    dealer.status || 'Active',
  ]);
  const r = rows[0];
  return {
    id: r.id,
    name: r.name,
    contactPerson: r.contact_person,
    phone: r.phone,
    email: r.email,
    city: r.city,
    address: r.address,
    status: r.status,
  };
}

export async function dbUpdateCarAvailability(id: string, status: string): Promise<boolean> {
  await ensureDealerAndCarsSchema();
  let sql: string;
  let params: any[];

  if (status === 'Sold Out') {
    sql = 'UPDATE public.cars SET availability_status = $1, sold_at = now(), status_updated_at = now(), updated_at = now() WHERE id = $2';
    params = [status, id];
  } else if (status === 'Available') {
    sql = 'UPDATE public.cars SET availability_status = $1, sold_at = NULL, status_updated_at = now(), updated_at = now() WHERE id = $2';
    params = [status, id];
  } else {
    sql = 'UPDATE public.cars SET availability_status = $1, status_updated_at = now(), updated_at = now() WHERE id = $2';
    params = [status, id];
  }

  const res = await pool.query(sql, params);
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
  created_at?: string;
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
    'SELECT id, name, phone, email, city, address, COALESCE(created_at, updated_at, now()) AS created_at FROM public.customers ORDER BY created_at DESC',
    [],
    'dbGetCustomers'
  );
  return rows.map((r) => {
    const iso = r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString();
    return {
      id: r.id,
      name: r.name,
      phone: r.phone,
      email: r.email,
      city: r.city,
      address: r.address,
      createdAt: iso,
      created_at: iso,
    };
  });
}

export async function dbFindCustomer(query: string): Promise<CustomerRecord | null> {
  const trimmed = query.trim();
  const digitsOnly = trimmed.replace(/\D/g, '');
  const { rows } = await safeDbQuery<any>(
    `SELECT id, name, phone, email, city, address, COALESCE(created_at, updated_at, now()) AS created_at FROM public.customers 
     WHERE phone = $1 
        OR email ILIKE $2 
        OR ($3 <> '' AND phone LIKE $4)
     LIMIT 1`,
    [trimmed, trimmed, digitsOnly, `%${digitsOnly}%`],
    'dbFindCustomer'
  );
  if (!rows.length) return null;
  const r = rows[0];
  const iso = r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString();
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    email: r.email,
    city: r.city,
    address: r.address,
    createdAt: iso,
    created_at: iso,
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
    publishedCarId: r.published_car_id || undefined,
    photos: Array.isArray(r.photos) ? r.photos : (typeof r.photos === 'string' ? JSON.parse(r.photos || '[]') : []),
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
      preferred_inspection_time, estimated_price_min, estimated_price_max, status, photos
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
    )
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      photos = EXCLUDED.photos,
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
    JSON.stringify(req.photos || []),
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

function inferCarDetails(make: string, model: string) {
  const m = `${make} ${model}`.toLowerCase();
  let bodyType: 'SUV' | 'Sedan' | 'Hatchback' = 'Hatchback';
  let defaultImage = '/car-creta-hd.jpg';

  if (
    m.includes('creta') || m.includes('venue') || m.includes('seltos') ||
    m.includes('brezza') || m.includes('nexon') || m.includes('thar') ||
    m.includes('scorpio') || m.includes('xuv') || m.includes('safari') ||
    m.includes('harrier') || m.includes('fortuner') || m.includes('innova') ||
    m.includes('punch') || m.includes('sonet') || m.includes('kuv')
  ) {
    bodyType = 'SUV';
    defaultImage = m.includes('brezza') ? '/car-brezza.jpg' : m.includes('seltos') ? '/car-seltos.jpg' : '/car-creta-real.jpg';
  } else if (
    m.includes('city') || m.includes('verna') || m.includes('ciaz') ||
    m.includes('dzire') || m.includes('amaze') || m.includes('aura') ||
    m.includes('octavia') || m.includes('slavia') || m.includes('virtus')
  ) {
    bodyType = 'Sedan';
    defaultImage = '/car-city.jpg';
  } else {
    bodyType = 'Hatchback';
    defaultImage = m.includes('i20') ? '/car-i20.jpg' : '/car-baleno.jpg';
  }

  return { bodyType, defaultImage };
}

export async function dbApproveAndPublishCustomerCar(params: {
  requestId: string;
  listingPrice?: number;
  image?: string;
  galleryImages?: string[];
  city?: string;
  locationArea?: string;
  inspectionScore?: number;
  isVerified?: boolean;
  isSelect?: boolean;
  featured?: boolean;
  description?: string;
}): Promise<{ car: Car; requestId: string }> {
  const { rows } = await pool.query('SELECT * FROM public.customer_cars WHERE id = $1 LIMIT 1', [params.requestId]);
  if (!rows.length) {
    throw new Error(`Sell request ${params.requestId} not found.`);
  }
  const req = rows[0];

  const carId = req.published_car_id || `recars-sell-${Date.now()}`;
  const inferred = inferCarDetails(req.make || '', req.model || '');
  const customerPhotos: string[] = Array.isArray(req.photos)
    ? req.photos
    : (typeof req.photos === 'string' ? JSON.parse(req.photos || '[]') : []);

  const price = Number(params.listingPrice) || Number(req.suggested_listing_price) || Number(req.estimated_price_max) || 750000;
  const city = params.city || req.seller_city || 'Warangal';
  const mainImage = params.image || (customerPhotos.length > 0 ? customerPhotos[0] : inferred.defaultImage);
  const gallery = params.galleryImages && params.galleryImages.length > 0
    ? params.galleryImages
    : (customerPhotos.length > 0 ? customerPhotos : [mainImage]);

  const newCar: Car = {
    id: carId,
    make: req.make,
    model: req.model,
    variant: req.variant || 'Standard',
    year: Number(req.year) || 2022,
    price: price,
    emiPerMonth: Math.round(price * 0.021),
    kilometers: Number(req.kilometers) || 30000,
    fuelType: req.fuel_type || 'Petrol',
    transmission: req.transmission || 'Manual',
    bodyType: inferred.bodyType,
    ownership: req.ownership || '1st Owner',
    city: city,
    locationArea: params.locationArea || `${city} Recars Hub`,
    image: mainImage,
    galleryImages: gallery,
    isVerified: params.isVerified ?? true,
    isRecarsSelect: params.isSelect ?? true,
    featured: Boolean(params.featured),
    inspectionScore: params.inspectionScore || 96,
    specifications: {
      engine: '1498 cc, 4 Cylinders Inline',
      maxPower: '115 bhp @ 6000 rpm',
      torque: '144 Nm @ 4500 rpm',
      mileage: '17.5 kmpl',
      seatingCapacity: 5,
      bootSpace: '430 Litres',
      fuelTankCapacity: '45 Litres',
      groundClearance: '180 mm',
      rto: `${city} RTO`,
      regYear: Number(req.year) || 2022,
      insuranceValidTill: 'Comprehensive Valid',
      color: 'Pearl White',
    },
    features: [
      '28+ Point Engineer Inspected',
      'Certified Non-Accidental Guarantee',
      'Clean RTO Documents & Verified Ownership',
      'Dual Airbags & Anti-Lock Braking System (ABS)',
      'Touchscreen Infotainment & Power Steering',
    ],
    description: params.description || `Inspected & certified ${req.year} ${req.make} ${req.model} (${req.variant || 'Standard'}). Certified by Recars engineering team with 28+ quality checkpoints. Available for hub viewing & test drives in ${city}.`,
    createdAt: new Date().toISOString(),
    availabilityStatus: 'Available',
    manufacturingYear: Number(req.year) || 2022,
    registrationYear: Number(req.year) || 2022,
    insuranceStatus: 'Valid',
    insuranceExpiry: 'Nov 2026',
    insuranceType: 'Comprehensive',
    financeAvailable: 'Available',
    suggestedPriceMin: Math.round(price * 0.95),
    suggestedPriceMax: Math.round(price * 1.05),
  };

  // Insert or update in public.cars
  await dbInsertCar(newCar);

  // Update customer_cars record
  await pool.query(
    'UPDATE public.customer_cars SET status = $1, published_car_id = $2, updated_at = now() WHERE id = $3',
    ['Approved & Published', carId, params.requestId]
  );

  return { car: newCar, requestId: params.requestId };
}

export async function dbDelistCustomerCar(requestId: string): Promise<boolean> {
  const { rows } = await pool.query('SELECT published_car_id FROM public.customer_cars WHERE id = $1 LIMIT 1', [requestId]);
  if (!rows.length) return false;
  const carId = rows[0].published_car_id;
  if (carId) {
    await dbDeleteCar(carId);
  }
  await pool.query(
    'UPDATE public.customer_cars SET status = $1, updated_at = now() WHERE id = $2',
    ['Inspection Completed', requestId]
  );
  return true;
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

async function resolveValidCarId(carId?: string | null): Promise<string | null> {
  if (!carId) return null;
  try {
    const res = await pool.query('SELECT id FROM public.cars WHERE id = $1 LIMIT 1', [carId]);
    return res.rows.length > 0 ? carId : null;
  } catch {
    return null;
  }
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

  const validCarId = await resolveValidCarId(inq.carId);

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
    validCarId,
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

  const validCarId = await resolveValidCarId(td.carId);

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
    validCarId,
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

// ========================================================
// 10. EMAIL NOTIFICATION DATABASE OPERATIONS
// ========================================================

export interface EmailNotificationRecord {
  id: string;
  enquiryId: string;
  enquiryType: string;
  recipient: string;
  subject: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  status: 'pending' | 'sent' | 'failed';
  errorMessage?: string;
  attempts?: number;
  payload?: any;
  sentAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

let notificationTableInitPromise: Promise<void> | null = null;
export async function ensureNotificationTable(): Promise<void> {
  if (!notificationTableInitPromise) {
    notificationTableInitPromise = (async () => {
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS public.email_notifications (
            id TEXT PRIMARY KEY,
            enquiry_id TEXT NOT NULL,
            enquiry_type TEXT NOT NULL,
            recipient TEXT NOT NULL,
            subject TEXT NOT NULL,
            customer_name TEXT,
            customer_phone TEXT,
            customer_email TEXT,
            status TEXT NOT NULL DEFAULT 'pending',
            error_message TEXT,
            attempts INT DEFAULT 0,
            payload JSONB,
            sent_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
          );
          CREATE INDEX IF NOT EXISTS idx_email_enquiry_id ON public.email_notifications(enquiry_id);
          CREATE INDEX IF NOT EXISTS idx_email_status ON public.email_notifications(status);
        `);
      } catch (err) {
        console.warn('Notice: email_notifications table auto-create notice:', err);
      }
    })();
  }
  return notificationTableInitPromise;
}

export async function dbUpsertEmailNotification(record: EmailNotificationRecord): Promise<void> {
  await ensureNotificationTable();
  const sql = `
    INSERT INTO public.email_notifications (
      id, enquiry_id, enquiry_type, recipient, subject, customer_name,
      customer_phone, customer_email, status, error_message, attempts,
      payload, sent_at, updated_at
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, now()
    )
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      error_message = EXCLUDED.error_message,
      attempts = public.email_notifications.attempts + 1,
      sent_at = EXCLUDED.sent_at,
      updated_at = now();
  `;
  await pool.query(sql, [
    record.id,
    record.enquiryId,
    record.enquiryType,
    record.recipient,
    record.subject,
    record.customerName || null,
    record.customerPhone || null,
    record.customerEmail || null,
    record.status,
    record.errorMessage || null,
    record.attempts || 1,
    JSON.stringify(record.payload || {}),
    record.sentAt ? new Date(record.sentAt) : null,
  ]);
}

export async function dbGetEmailNotificationByEnquiryId(enquiryId: string): Promise<EmailNotificationRecord | null> {
  await ensureNotificationTable();
  const { rows } = await pool.query(
    'SELECT * FROM public.email_notifications WHERE enquiry_id = $1 ORDER BY created_at DESC LIMIT 1',
    [enquiryId]
  );
  if (!rows.length) return null;
  const r = rows[0];
  return {
    id: r.id,
    enquiryId: r.enquiry_id,
    enquiryType: r.enquiry_type,
    recipient: r.recipient,
    subject: r.subject,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    customerEmail: r.customer_email,
    status: r.status,
    errorMessage: r.error_message,
    attempts: r.attempts,
    payload: r.payload,
    sentAt: r.sent_at ? new Date(r.sent_at).toISOString() : null,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
  };
}

export async function dbGetEmailNotifications(limit = 100): Promise<EmailNotificationRecord[]> {
  await ensureNotificationTable();
  const { rows } = await pool.query(
    'SELECT * FROM public.email_notifications ORDER BY created_at DESC LIMIT $1',
    [limit]
  );
  return rows.map((r: any) => ({
    id: r.id,
    enquiryId: r.enquiry_id,
    enquiryType: r.enquiry_type,
    recipient: r.recipient,
    subject: r.subject,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    customerEmail: r.customer_email,
    status: r.status,
    errorMessage: r.error_message,
    attempts: r.attempts,
    payload: r.payload,
    sentAt: r.sent_at ? new Date(r.sent_at).toISOString() : null,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
  }));
}

// ========================================================
// 8. UPLOADED IMAGES DATABASE STORAGE (Serverless & Persistent Fallback)
// ========================================================

let uploadedImagesTableInitPromise: Promise<void> | null = null;

export async function ensureUploadedImagesTable(): Promise<void> {
  if (!uploadedImagesTableInitPromise) {
    uploadedImagesTableInitPromise = (async () => {
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS public.uploaded_images (
            filename TEXT PRIMARY KEY,
            mime_type TEXT NOT NULL DEFAULT 'image/webp',
            data BYTEA NOT NULL,
            size INTEGER NOT NULL,
            created_at TIMESTAMPTZ DEFAULT now()
          );
          CREATE INDEX IF NOT EXISTS idx_uploaded_images_created_at ON public.uploaded_images(created_at DESC);
        `);
      } catch (err: any) {
        console.warn('[DB_INIT] Warning initializing uploaded_images table:', err?.message);
      }
    })();
  }
  return uploadedImagesTableInitPromise;
}

export async function dbSaveUploadedImage(
  filename: string,
  mimeType: string,
  data: Buffer
): Promise<string> {
  await ensureUploadedImagesTable();
  const sql = `
    INSERT INTO public.uploaded_images (filename, mime_type, data, size, created_at)
    VALUES ($1, $2, $3, $4, now())
    ON CONFLICT (filename) DO UPDATE SET
      data = EXCLUDED.data,
      size = EXCLUDED.size,
      mime_type = EXCLUDED.mime_type;
  `;
  await safeDbQuery(sql, [filename, mimeType, data, data.length], 'dbSaveUploadedImage');
  return `/api/images/${filename}`;
}

export async function dbGetUploadedImage(
  filename: string
): Promise<{ data: Buffer; mimeType: string } | null> {
  await ensureUploadedImagesTable();
  const sql = `SELECT data, mime_type FROM public.uploaded_images WHERE filename = $1 LIMIT 1;`;
  const { rows } = await safeDbQuery<{ data: Buffer; mime_type: string }>(
    sql,
    [filename],
    'dbGetUploadedImage'
  );
  if (!rows || rows.length === 0) return null;
  return {
    data: rows[0].data,
    mimeType: rows[0].mime_type,
  };
}

// ========================================================
// 9. VEHICLE VIEW TRACKING & ANALYTICS OPERATIONS
// ========================================================

export async function dbRecordVehicleView(
  carId: string,
  sessionId?: string,
  ipHash?: string
): Promise<boolean> {
  await ensureDealerAndCarsSchema();
  try {
    if (sessionId || ipHash) {
      const checkSql = `
        SELECT id FROM public.vehicle_views
        WHERE car_id = $1
          AND (
            ($2::text IS NOT NULL AND session_id = $2)
            OR ($3::text IS NOT NULL AND ip_hash = $3)
          )
          AND created_at > now() - INTERVAL '15 minutes'
        LIMIT 1;
      `;
      const existing = await pool.query(checkSql, [carId, sessionId || null, ipHash || null]);
      if (existing.rows.length > 0) {
        return false; // Deduplicated
      }
    }

    await pool.query(
      `INSERT INTO public.vehicle_views (car_id, session_id, ip_hash, created_at) VALUES ($1, $2, $3, now())`,
      [carId, sessionId || null, ipHash || null]
    );
    return true;
  } catch (err: any) {
    console.error('[DB_RECORD_VIEW_ERROR]', err?.message);
    return false;
  }
}

export async function dbGetAdminAnalytics(filters?: {
  timePeriod?: 'today' | '7d' | '30d' | 'all' | string;
  budgetRange?: string;
  make?: string;
  model?: string;
  sortBy?: 'views' | 'enquiries' | 'price_desc' | 'price_asc' | 'newest' | string;
}): Promise<AdminAnalyticsSummary> {
  await ensureDealerAndCarsSchema();

  let timeCondition = '';
  if (filters?.timePeriod === 'today') {
    timeCondition = "WHERE created_at >= now() - INTERVAL '24 hours'";
  } else if (filters?.timePeriod === '7d') {
    timeCondition = "WHERE created_at >= now() - INTERVAL '7 days'";
  } else if (filters?.timePeriod === '30d') {
    timeCondition = "WHERE created_at >= now() - INTERVAL '30 days'";
  }

  // 1. Overview counts
  const [activeRes, soldRes, resRes, viewsRes, inqRes] = await Promise.all([
    pool.query("SELECT COUNT(*)::int as count FROM public.cars WHERE availability_status != 'Sold Out'"),
    pool.query("SELECT COUNT(*)::int as count FROM public.cars WHERE availability_status = 'Sold Out'"),
    pool.query("SELECT COUNT(*)::int as count FROM public.cars WHERE availability_status = 'Reserved'"),
    pool.query(`SELECT COUNT(*)::int as count FROM public.vehicle_views ${timeCondition}`),
    pool.query("SELECT COUNT(*)::int as count FROM public.car_inquiries"),
  ]);

  const totalActiveListings = activeRes.rows[0]?.count || 0;
  const totalSoldVehicles = soldRes.rows[0]?.count || 0;
  const totalReservedVehicles = resRes.rows[0]?.count || 0;
  const totalDetailViews = viewsRes.rows[0]?.count || 0;
  const totalEnquiries = inqRes.rows[0]?.count || 0;

  // 2. Ranked vehicles query with views in period and inquiries
  let carFilterSql = 'WHERE 1=1';
  const carFilterParams: any[] = [];
  let paramIdx = 1;

  if (filters?.budgetRange && filters.budgetRange !== 'all') {
    switch (filters.budgetRange) {
      case 'under_3l':
        carFilterSql += ' AND c.price < 300000';
        break;
      case '3l_5l':
        carFilterSql += ' AND c.price >= 300000 AND c.price <= 500000';
        break;
      case '5l_8l':
        carFilterSql += ' AND c.price > 500000 AND c.price <= 800000';
        break;
      case '8l_12l':
        carFilterSql += ' AND c.price > 800000 AND c.price <= 1200000';
        break;
      case '12l_20l':
        carFilterSql += ' AND c.price > 1200000 AND c.price <= 2000000';
        break;
      case 'above_20l':
        carFilterSql += ' AND c.price > 2000000';
        break;
    }
  }

  if (filters?.make && filters.make !== 'all') {
    carFilterSql += ` AND c.make = $${paramIdx++}`;
    carFilterParams.push(filters.make);
  }

  if (filters?.model && filters.model !== 'all') {
    carFilterSql += ` AND c.model = $${paramIdx++}`;
    carFilterParams.push(filters.model);
  }

  let orderBySql = 'ORDER BY views_count DESC, inq_count DESC, c.created_at DESC';
  if (filters?.sortBy === 'enquiries') {
    orderBySql = 'ORDER BY (inq_count + neg_count) DESC, views_count DESC, c.created_at DESC';
  } else if (filters?.sortBy === 'price_desc') {
    orderBySql = 'ORDER BY c.price DESC';
  } else if (filters?.sortBy === 'price_asc') {
    orderBySql = 'ORDER BY c.price ASC';
  } else if (filters?.sortBy === 'newest') {
    orderBySql = 'ORDER BY c.created_at DESC';
  }

  const query = `
    SELECT 
      c.id, c.make, c.model, c.variant, c.year, c.price, c.image, c.city,
      c.availability_status, c.status_updated_at, c.sold_at, c.dealer_name, c.vehicle_source, c.created_at,
      COALESCE(v.views_count, 0)::int as views_count,
      COALESCE(i.inq_count, 0)::int as inq_count,
      COALESCE(n.neg_count, 0)::int as neg_count
    FROM public.cars c
    LEFT JOIN (
      SELECT car_id, COUNT(*)::int as views_count 
      FROM public.vehicle_views
      ${timeCondition}
      GROUP BY car_id
    ) v ON v.car_id = c.id
    LEFT JOIN (
      SELECT car_id, COUNT(*)::int as inq_count
      FROM public.car_inquiries
      GROUP BY car_id
    ) i ON i.car_id = c.id
    LEFT JOIN (
      SELECT car_id, COUNT(*)::int as neg_count
      FROM public.negotiations
      GROUP BY car_id
    ) n ON n.car_id = c.id
    ${carFilterSql}
    ${orderBySql}
  `;

  const { rows } = await pool.query(query, carFilterParams);

  const mostViewedVehicles: VehicleAnalyticsItem[] = rows.map((r: any) => ({
    id: r.id,
    make: r.make,
    model: r.model,
    variant: r.variant,
    year: r.year,
    price: Number(r.price),
    image: r.image,
    city: r.city,
    availabilityStatus: r.availability_status || 'Available',
    statusUpdatedAt: r.status_updated_at ? new Date(r.status_updated_at).toISOString() : undefined,
    soldAt: r.sold_at ? new Date(r.sold_at).toISOString() : undefined,
    dealerName: r.dealer_name || undefined,
    vehicleSource: r.vehicle_source || 'Individual Seller',
    viewsCount: Number(r.views_count || 0),
    inquiriesCount: Number(r.inq_count || 0),
    negotiationsCount: Number(r.neg_count || 0),
    totalInteractions: Number(r.views_count || 0) + Number(r.inq_count || 0) + Number(r.neg_count || 0),
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
  }));

  const mostEnquiredVehicles = [...mostViewedVehicles].sort(
    (a, b) => (b.inquiriesCount + b.negotiationsCount) - (a.inquiriesCount + a.negotiationsCount)
  );

  // 3. Compute Insights
  const brandViews: Record<string, number> = {};
  const modelViews: Record<string, number> = {};
  const budgetViews = {
    'Under ₹3 Lakh': 0,
    '₹3–5 Lakh': 0,
    '₹5–8 Lakh': 0,
    '₹8–12 Lakh': 0,
    '₹12–20 Lakh': 0,
    'Above ₹20 Lakh': 0,
  };

  for (const v of mostViewedVehicles) {
    brandViews[v.make] = (brandViews[v.make] || 0) + v.viewsCount;
    const modelKey = `${v.make} ${v.model}`;
    modelViews[modelKey] = (modelViews[modelKey] || 0) + v.viewsCount;

    if (v.price < 300000) budgetViews['Under ₹3 Lakh'] += v.viewsCount;
    else if (v.price <= 500000) budgetViews['₹3–5 Lakh'] += v.viewsCount;
    else if (v.price <= 800000) budgetViews['₹5–8 Lakh'] += v.viewsCount;
    else if (v.price <= 1200000) budgetViews['₹8–12 Lakh'] += v.viewsCount;
    else if (v.price <= 2000000) budgetViews['₹12–20 Lakh'] += v.viewsCount;
    else budgetViews['Above ₹20 Lakh'] += v.viewsCount;
  }

  const topBrand = Object.entries(brandViews).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Hyundai';
  const topModel = Object.entries(modelViews).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Hyundai Creta';
  const topBudget = Object.entries(budgetViews).sort((a, b) => b[1] - a[1])[0]?.[0] || '₹8–12 Lakh';
  const convRate = totalDetailViews > 0 ? ((totalEnquiries / totalDetailViews) * 100).toFixed(1) + '%' : '0.0%';

  // 4. Fetch recent inquiries for dashboard overview
  const recentInqRes = await pool.query(
    'SELECT * FROM public.car_inquiries ORDER BY created_at DESC LIMIT 6'
  );
  const recentEnquiries = recentInqRes.rows.map((r: any) => ({
    id: r.id,
    carId: r.car_id,
    carTitle: r.car_title,
    carImage: r.car_image,
    carPrice: Number(r.car_price || 0),
    userName: r.user_name,
    userPhone: r.user_phone,
    userEmail: r.user_email,
    city: r.city,
    inquiryType: r.inquiry_type,
    message: r.message,
    status: r.status,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
  }));

  return {
    totalActiveListings,
    totalSoldVehicles,
    totalReservedVehicles,
    totalDetailViews,
    totalEnquiries,
    mostViewedVehicles,
    mostEnquiredVehicles,
    recentEnquiries,
    insights: {
      mostViewedBrand: topBrand,
      mostViewedModel: topModel,
      mostViewedBudget: topBudget,
      conversionRate: convRate,
    },
  };
}

export async function dbGetTrendingCars(limit = 6): Promise<Car[]> {
  await ensureDealerAndCarsSchema();
  const query = `
    SELECT c.*, COALESCE(v.views_count, 0)::int as views_count
    FROM public.cars c
    LEFT JOIN (
      SELECT car_id, COUNT(*)::int as views_count
      FROM public.vehicle_views
      WHERE created_at >= now() - INTERVAL '30 days'
      GROUP BY car_id
    ) v ON v.car_id = c.id
    ORDER BY views_count DESC, c.score DESC, c.created_at DESC
    LIMIT $1;
  `;
  const { rows } = await pool.query(query, [limit]);
  return rows.map((r: any) => ({
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
    featured: Boolean(r.featured),
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
    features: ['Automatic Climate Control', 'Touchscreen Infotainment System', 'Rear Parking Camera & Sensors'],
    description: r.description || `${r.year} ${r.make} ${r.model}`,
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    availabilityStatus: r.availability_status || 'Available',
    statusUpdatedAt: r.status_updated_at ? new Date(r.status_updated_at).toISOString() : undefined,
    soldAt: r.sold_at ? new Date(r.sold_at).toISOString() : undefined,
    vehicleSource: r.vehicle_source || 'Individual Seller',
    dealerId: r.dealer_id || undefined,
    dealerName: r.dealer_name || undefined,
    dealerContact: r.dealer_contact || undefined,
    customRibbons: Array.isArray(r.custom_ribbons)
      ? r.custom_ribbons
      : typeof r.custom_ribbons === 'string'
      ? JSON.parse(r.custom_ribbons)
      : [],
  }));
}

// ========================================================
// 10. CAR CARE & PPF ENQUIRIES OPERATIONS
// ========================================================

export async function dbInsertCarCareEnquiry(
  enquiry: CarCareEnquiry
): Promise<{ success: boolean; duplicate?: boolean; id: string }> {
  await ensureDealerAndCarsSchema();

  // Deduplication check: same phone + same make + model within 5 minutes
  const dupCheckSql = `
    SELECT id FROM public.car_care_enquiries
    WHERE customer_phone = $1
      AND car_make = $2
      AND car_model = $3
      AND created_at > now() - INTERVAL '5 minutes'
    LIMIT 1;
  `;
  const dupRes = await pool.query(dupCheckSql, [enquiry.customerPhone, enquiry.carMake, enquiry.carModel]);
  if (dupRes.rows.length > 0) {
    return { success: true, duplicate: true, id: dupRes.rows[0].id };
  }

  const sql = `
    INSERT INTO public.car_care_enquiries (
      id, customer_name, customer_phone, customer_email,
      car_make, car_model, car_year, services, preferred_location,
      preferred_date, additional_requirements, status, internal_notes, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, now(), now())
  `;

  await safeDbQuery(
    sql,
    [
      enquiry.id,
      enquiry.customerName,
      enquiry.customerPhone,
      enquiry.customerEmail || null,
      enquiry.carMake,
      enquiry.carModel,
      enquiry.carYear ? Number(enquiry.carYear) : null,
      JSON.stringify(enquiry.services || []),
      enquiry.preferredLocation,
      enquiry.preferredDate || null,
      enquiry.additionalRequirements || null,
      enquiry.status || 'New',
      enquiry.internalNotes || '',
    ],
    'dbInsertCarCareEnquiry'
  );

  return { success: true, duplicate: false, id: enquiry.id };
}

export async function dbGetCarCareEnquiries(
  statusFilter?: string,
  search?: string
): Promise<CarCareEnquiry[]> {
  await ensureDealerAndCarsSchema();
  let sql = 'SELECT * FROM public.car_care_enquiries WHERE 1=1';
  const params: any[] = [];
  let idx = 1;

  if (statusFilter && statusFilter !== 'All') {
    sql += ` AND status = $${idx++}`;
    params.push(statusFilter);
  }

  if (search && search.trim()) {
    const q = `%${search.trim().toLowerCase()}%`;
    sql += ` AND (LOWER(customer_name) LIKE $${idx} OR customer_phone LIKE $${idx} OR LOWER(car_make) LIKE $${idx} OR LOWER(car_model) LIKE $${idx} OR LOWER(id) LIKE $${idx})`;
    params.push(q);
    idx++;
  }

  sql += ' ORDER BY created_at DESC';
  const { rows } = await pool.query(sql, params);

  return rows.map((r: any) => ({
    id: r.id,
    customerName: r.customer_name,
    fullName: r.customer_name,
    customerPhone: r.customer_phone,
    mobileNumber: r.customer_phone,
    customerEmail: r.customer_email || undefined,
    carMake: r.car_make,
    vehicleBrand: r.car_make,
    carModel: r.car_model,
    vehicleModel: r.car_model,
    carYear: r.car_year || undefined,
    vehicleYear: r.car_year || undefined,
    services: Array.isArray(r.services) ? r.services : (typeof r.services === 'string' ? JSON.parse(r.services) : []),
    preferredLocation: r.preferred_location,
    preferredDate: r.preferred_date ? new Date(r.preferred_date).toISOString().split('T')[0] : undefined,
    additionalRequirements: r.additional_requirements || undefined,
    status: (r.status as CarCareStatus) || 'New',
    internalNotes: r.internal_notes || '',
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
  }));
}

export async function dbUpdateCarCareEnquiryStatus(
  id: string,
  status: CarCareStatus | string,
  internalNotes?: string
): Promise<boolean> {
  await ensureDealerAndCarsSchema();
  let sql: string;
  let params: any[];

  if (internalNotes !== undefined) {
    sql = 'UPDATE public.car_care_enquiries SET status = $1, internal_notes = $2, updated_at = now() WHERE id = $3';
    params = [status, internalNotes, id];
  } else {
    sql = 'UPDATE public.car_care_enquiries SET status = $1, updated_at = now() WHERE id = $2';
    params = [status, id];
  }

  const res = await pool.query(sql, params);
  return (res.rowCount || 0) > 0;
}

// ========================================================
// 11. VEHICLE RIBBONS OPERATIONS
// ========================================================

export async function dbUpdateCarRibbons(id: string, ribbons: VehicleRibbon[]): Promise<boolean> {
  await ensureDealerAndCarsSchema();
  const res = await pool.query(
    'UPDATE public.cars SET custom_ribbons = $1::jsonb, updated_at = now() WHERE id = $2',
    [JSON.stringify(ribbons || []), id]
  );
  return (res.rowCount || 0) > 0;
}

// ========================================================
// 12. CAR FINDER ("LET US FIND YOUR CAR") OPERATIONS
// ========================================================

export async function dbInsertCarFinderRequest(req: CarFinderRequest): Promise<void> {
  await ensureDealerAndCarsSchema();
  const sql = `
    INSERT INTO public.car_finder_requests (
      id, customer_name, customer_phone, customer_email,
      preferred_brand, preferred_model, budget_min, budget_max, budget_range,
      preferred_fuel, preferred_transmission, preferred_year, preferred_location,
      additional_requirements, status, internal_notes, matched_car_ids,
      created_at, updated_at
    ) VALUES (
      $1, $2, $3, $4,
      $5, $6, $7, $8, $9,
      $10, $11, $12, $13,
      $14, $15, $16, $17,
      now(), now()
    )
    ON CONFLICT (id) DO UPDATE SET
      status = EXCLUDED.status,
      internal_notes = EXCLUDED.internal_notes,
      matched_car_ids = EXCLUDED.matched_car_ids,
      updated_at = now();
  `;
  await pool.query(sql, [
    req.id,
    req.customerName,
    req.customerPhone,
    req.customerEmail || null,
    req.preferredBrand,
    req.preferredModel || null,
    req.budgetMin || null,
    req.budgetMax || null,
    req.budgetRange || null,
    req.preferredFuel || null,
    req.preferredTransmission || null,
    req.preferredYear ? String(req.preferredYear) : null,
    req.preferredLocation || null,
    req.additionalRequirements || null,
    req.status || 'New',
    req.internalNotes || '',
    JSON.stringify(req.matchedCarIds || []),
  ]);
}

export async function dbGetCarFinderRequests(filters?: {
  status?: string;
  brand?: string;
  search?: string;
}): Promise<CarFinderRequest[]> {
  await ensureDealerAndCarsSchema();
  let sql = 'SELECT * FROM public.car_finder_requests WHERE 1=1';
  const params: any[] = [];
  let idx = 1;

  if (filters?.status && filters.status !== 'All') {
    sql += ` AND status = $${idx++}`;
    params.push(filters.status);
  }

  if (filters?.brand && filters.brand !== 'All') {
    sql += ` AND LOWER(preferred_brand) = LOWER($${idx++})`;
    params.push(filters.brand);
  }

  if (filters?.search && filters.search.trim()) {
    const q = `%${filters.search.trim().toLowerCase()}%`;
    sql += ` AND (LOWER(customer_name) LIKE $${idx} OR customer_phone LIKE $${idx} OR LOWER(preferred_brand) LIKE $${idx} OR LOWER(COALESCE(preferred_model, '')) LIKE $${idx} OR LOWER(id) LIKE $${idx})`;
    params.push(q);
    idx++;
  }

  sql += ' ORDER BY created_at DESC';
  const { rows } = await pool.query(sql, params);

  return rows.map((r: any) => ({
    id: r.id,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    mobileNumber: r.customer_phone,
    customerEmail: r.customer_email || undefined,
    email: r.customer_email || undefined,
    preferredBrand: r.preferred_brand,
    preferredModel: r.preferred_model || undefined,
    budgetMin: r.budget_min ? Number(r.budget_min) : undefined,
    budgetMax: r.budget_max ? Number(r.budget_max) : undefined,
    budgetRange: r.budget_range || undefined,
    preferredFuel: r.preferred_fuel || undefined,
    preferredTransmission: r.preferred_transmission || undefined,
    preferredYear: r.preferred_year || undefined,
    preferredLocation: r.preferred_location || undefined,
    additionalRequirements: r.additional_requirements || undefined,
    status: (r.status as CarFinderStatus) || 'New',
    internalNotes: r.internal_notes || '',
    matchedCarIds: Array.isArray(r.matched_car_ids)
      ? r.matched_car_ids
      : typeof r.matched_car_ids === 'string'
      ? JSON.parse(r.matched_car_ids)
      : [],
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
  }));
}

export async function dbUpdateCarFinderRequest(
  id: string,
  updates: {
    status?: CarFinderStatus;
    internalNotes?: string;
    matchedCarIds?: string[];
  }
): Promise<boolean> {
  await ensureDealerAndCarsSchema();
  const sets: string[] = [];
  const params: any[] = [];
  let idx = 1;

  if (updates.status) {
    sets.push(`status = $${idx++}`);
    params.push(updates.status);
  }
  if (updates.internalNotes !== undefined) {
    sets.push(`internal_notes = $${idx++}`);
    params.push(updates.internalNotes);
  }
  if (updates.matchedCarIds !== undefined) {
    sets.push(`matched_car_ids = $${idx++}::jsonb`);
    params.push(JSON.stringify(updates.matchedCarIds));
  }

  if (sets.length === 0) return true;

  sets.push(`updated_at = now()`);
  params.push(id);

  const sql = `UPDATE public.car_finder_requests SET ${sets.join(', ')} WHERE id = $${idx}`;
  const res = await pool.query(sql, params);
  return (res.rowCount || 0) > 0;
}

export async function dbMatchCarsForRequest(req: {
  preferredBrand?: string;
  preferredModel?: string;
  budgetMin?: number;
  budgetMax?: number;
  preferredFuel?: string;
  preferredTransmission?: string;
}): Promise<Car[]> {
  const allCars = await dbGetCars();
  return allCars.filter((car) => {
    // Only available or reserved cars, exclude sold out
    if (car.availabilityStatus === 'Sold Out') return false;

    // Brand matching
    if (req.preferredBrand && req.preferredBrand !== 'Any' && req.preferredBrand !== 'All') {
      const b = req.preferredBrand.toLowerCase().trim();
      const carMake = car.make.toLowerCase().trim();
      if (!carMake.includes(b) && !b.includes(carMake)) return false;
    }

    // Model matching
    if (req.preferredModel && req.preferredModel.trim()) {
      const m = req.preferredModel.toLowerCase().trim();
      const carModel = car.model.toLowerCase().trim();
      if (!carModel.includes(m) && !m.includes(carModel)) return false;
    }

    // Budget matching (with 10% flexible grace window)
    if (req.budgetMax && req.budgetMax > 0) {
      if (car.price > req.budgetMax * 1.1) return false;
    }
    if (req.budgetMin && req.budgetMin > 0) {
      if (car.price < req.budgetMin * 0.9) return false;
    }

    // Fuel matching
    if (req.preferredFuel && req.preferredFuel !== 'Any' && req.preferredFuel !== 'All') {
      if (car.fuelType.toLowerCase() !== req.preferredFuel.toLowerCase()) return false;
    }

    // Transmission matching
    if (req.preferredTransmission && req.preferredTransmission !== 'Any' && req.preferredTransmission !== 'All') {
      if (car.transmission.toLowerCase() !== req.preferredTransmission.toLowerCase()) return false;
    }

    return true;
  });
}

