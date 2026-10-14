-- ========================================================
-- RECARS SUPABASE DATABASE SCHEMA
-- Cars, Customers, Customer Cars (Sell Requests), Inquiries, Test Drives, Wishlists
-- ========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. CARS TABLE (Verified Vehicle Inventory)
CREATE TABLE IF NOT EXISTS public.cars (
    id TEXT PRIMARY KEY,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    variant TEXT NOT NULL,
    year INTEGER NOT NULL,
    price BIGINT NOT NULL,
    original_price BIGINT,
    emi_per_month INTEGER,
    kilometers INTEGER NOT NULL,
    fuel_type TEXT NOT NULL,
    transmission TEXT NOT NULL,
    body_type TEXT NOT NULL,
    ownership TEXT NOT NULL DEFAULT '1st Owner',
    city TEXT NOT NULL DEFAULT 'Hyderabad',
    location_area TEXT,
    image TEXT NOT NULL,
    gallery_images JSONB DEFAULT '[]'::jsonb,
    score INTEGER DEFAULT 95,
    is_verified BOOLEAN DEFAULT true,
    is_select BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cars_make_model ON public.cars(make, model);
CREATE INDEX IF NOT EXISTS idx_cars_city ON public.cars(city);
CREATE INDEX IF NOT EXISTS idx_cars_price ON public.cars(price);
CREATE INDEX IF NOT EXISTS idx_cars_body_type ON public.cars(body_type);
CREATE INDEX IF NOT EXISTS idx_cars_created_at ON public.cars(created_at DESC);

-- 2. CUSTOMERS TABLE (Customer Directory & Profiles)
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    city TEXT DEFAULT 'Hyderabad',
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- 3. CUSTOMER CARS / SELL REQUESTS TABLE (Cars offered for sale by customers)
CREATE TABLE IF NOT EXISTS public.customer_cars (
    id TEXT PRIMARY KEY,
    customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
    registration_number TEXT,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    variant TEXT,
    year INTEGER NOT NULL,
    fuel_type TEXT NOT NULL,
    transmission TEXT NOT NULL,
    kilometers INTEGER DEFAULT 30000,
    ownership TEXT DEFAULT '1st Owner',
    accident_history TEXT DEFAULT 'None',
    service_history TEXT DEFAULT 'Authorized Dealership Records',
    insurance_status TEXT DEFAULT 'Comprehensive Valid',
    seller_name TEXT NOT NULL,
    seller_phone TEXT NOT NULL,
    seller_city TEXT NOT NULL DEFAULT 'Hyderabad',
    seller_address TEXT,
    preferred_inspection_date TEXT,
    preferred_inspection_time TEXT,
    estimated_price_min BIGINT,
    estimated_price_max BIGINT,
    status TEXT NOT NULL DEFAULT 'Valuation Submitted',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_customer_cars_phone ON public.customer_cars(seller_phone);
CREATE INDEX IF NOT EXISTS idx_customer_cars_status ON public.customer_cars(status);
CREATE INDEX IF NOT EXISTS idx_customer_cars_created_at ON public.customer_cars(created_at DESC);

-- 4. CAR INQUIRIES TABLE (Customer inquiries for specific cars)
CREATE TABLE IF NOT EXISTS public.car_inquiries (
    id TEXT PRIMARY KEY,
    car_id TEXT REFERENCES public.cars(id) ON DELETE SET NULL,
    car_title TEXT NOT NULL,
    car_image TEXT,
    car_price BIGINT,
    user_name TEXT NOT NULL,
    user_phone TEXT NOT NULL,
    user_email TEXT,
    city TEXT DEFAULT 'Hyderabad',
    inquiry_type TEXT NOT NULL DEFAULT 'General Inquiry',
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'New',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_inquiries_car_id ON public.car_inquiries(car_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.car_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.car_inquiries(created_at DESC);

-- 5. TEST DRIVE BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.test_drives (
    id TEXT PRIMARY KEY,
    car_id TEXT REFERENCES public.cars(id) ON DELETE SET NULL,
    car_title TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_phone TEXT NOT NULL,
    preferred_date TEXT NOT NULL,
    preferred_time_slot TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Home Test Drive',
    hub_location TEXT,
    status TEXT NOT NULL DEFAULT 'Confirmed',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_test_drives_car_id ON public.test_drives(car_id);
CREATE INDEX IF NOT EXISTS idx_test_drives_status ON public.test_drives(status);

-- 6. WISHLISTS TABLE
CREATE TABLE IF NOT EXISTS public.wishlists (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_identifier TEXT NOT NULL,
    car_id TEXT REFERENCES public.cars(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_identifier, car_id)
);
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON public.wishlists(user_identifier);

-- Row Level Security (RLS)
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Role Grants
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;

-- Policies
DROP POLICY IF EXISTS "Allow public read access to cars" ON public.cars;
CREATE POLICY "Allow public read access to cars" ON public.cars FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write access to cars" ON public.cars;
CREATE POLICY "Allow write access to cars" ON public.cars FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to customers" ON public.customers;
CREATE POLICY "Allow all access to customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to customer_cars" ON public.customer_cars;
CREATE POLICY "Allow all access to customer_cars" ON public.customer_cars FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to car_inquiries" ON public.car_inquiries;
CREATE POLICY "Allow all access to car_inquiries" ON public.car_inquiries FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to test_drives" ON public.test_drives;
CREATE POLICY "Allow all access to test_drives" ON public.test_drives FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to wishlists" ON public.wishlists;
CREATE POLICY "Allow all access to wishlists" ON public.wishlists FOR ALL USING (true) WITH CHECK (true);
