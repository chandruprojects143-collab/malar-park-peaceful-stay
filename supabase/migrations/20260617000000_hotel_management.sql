-- =====================================================
-- Malar Park Hotel Management Tables
-- Run this in the Supabase SQL Editor (or via CLI)
-- =====================================================

-- Enable pgcrypto for bcrypt password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- =====================================================
-- Admin role enum (admin and reception only)
-- =====================================================
DO $$ BEGIN
  CREATE TYPE admin_role AS ENUM ('admin', 'reception');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================
-- Admin Users
-- Username = role name ('admin' | 'reception')
-- Login is verified via the verify_admin_login RPC
-- so the password_hash is never exposed to the client
-- =====================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT UNIQUE NOT NULL,
  role          admin_role NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Secure RPC: returns the user row only when password matches
CREATE OR REPLACE FUNCTION public.verify_admin_login(p_username TEXT, p_password TEXT)
RETURNS TABLE(id UUID, username TEXT, role admin_role)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
BEGIN
  RETURN QUERY
  SELECT au.id, au.username, au.role
  FROM   public.admin_users au
  WHERE  au.username      = p_username
    AND  au.password_hash = extensions.crypt(p_password, au.password_hash);
END;
$$;

-- Default credentials (change passwords after first login)
INSERT INTO public.admin_users (username, role, password_hash) VALUES
  ('admin',     'admin',     extensions.crypt('malar2024',     extensions.gen_salt('bf'))),
  ('reception', 'reception', extensions.crypt('reception2024', extensions.gen_salt('bf')))
ON CONFLICT (username) DO NOTHING;

-- RLS: block all direct table access; login only via RPC above
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
GRANT EXECUTE ON FUNCTION public.verify_admin_login TO anon;

-- =====================================================
-- Room status enum
-- =====================================================
DO $$ BEGIN
  CREATE TYPE room_status_type AS ENUM ('available', 'occupied', 'cleaning');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================
-- Hotel Rooms  (operational — distinct from CMS `rooms` table)
-- Tracks physical room numbers, live status, guest info
-- =====================================================
CREATE TABLE IF NOT EXISTS public.hotel_rooms (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number         TEXT UNIQUE NOT NULL,
  type           TEXT NOT NULL DEFAULT 'Deluxe',
  description    TEXT,
  capacity       INTEGER NOT NULL DEFAULT 2,
  amenities      TEXT[] NOT NULL DEFAULT '{}',
  status         room_status_type NOT NULL DEFAULT 'available',
  rate           INTEGER NOT NULL DEFAULT 1200,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add columns to existing table (safe if already present via IF NOT EXISTS equivalent)
ALTER TABLE public.hotel_rooms ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.hotel_rooms ADD COLUMN IF NOT EXISTS capacity INTEGER NOT NULL DEFAULT 2;
ALTER TABLE public.hotel_rooms ADD COLUMN IF NOT EXISTS amenities TEXT[] NOT NULL DEFAULT '{}';
-- Remove operational columns no longer needed
ALTER TABLE public.hotel_rooms DROP COLUMN IF EXISTS guest_name;
ALTER TABLE public.hotel_rooms DROP COLUMN IF EXISTS check_in_date;
ALTER TABLE public.hotel_rooms DROP COLUMN IF EXISTS checkout_date;
ALTER TABLE public.hotel_rooms DROP COLUMN IF EXISTS advance;
ALTER TABLE public.hotel_rooms DROP COLUMN IF EXISTS balance;
ALTER TABLE public.hotel_rooms DROP COLUMN IF EXISTS payment_method;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_hotel_rooms_updated ON public.hotel_rooms;
CREATE TRIGGER trg_hotel_rooms_updated
  BEFORE UPDATE ON public.hotel_rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed 12 default rooms
INSERT INTO public.hotel_rooms (number, type, rate) VALUES
  ('101', 'Deluxe', 1200), ('102', 'Deluxe', 1200),
  ('103', 'Deluxe', 1200), ('104', 'Deluxe', 1200),
  ('105', 'Family', 1800), ('106', 'Family', 1800),
  ('107', 'Family', 1800), ('108', 'Family', 1800),
  ('109', 'Suite',  2500), ('110', 'Suite',  2500),
  ('111', 'Suite',  2500), ('112', 'Suite',  2500)
ON CONFLICT (number) DO NOTHING;

ALTER TABLE public.hotel_rooms ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hotel_rooms TO anon;
-- Internal hotel tool: access gated by the app's own password; anon key is sufficient
CREATE POLICY "hotel_rooms_anon_all" ON public.hotel_rooms FOR ALL TO anon USING (true) WITH CHECK (true);

-- =====================================================
-- Bookings  (reception check-in entries)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number    TEXT NOT NULL,
  guest_name     TEXT NOT NULL,
  check_in_date  DATE NOT NULL,
  checkout_date  DATE,
  room_price     INTEGER NOT NULL DEFAULT 0,
  advance        INTEGER NOT NULL DEFAULT 0,
  balance        INTEGER NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash', 'UPI', 'Card')),
  date           DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO anon;
CREATE POLICY "bookings_anon_all" ON public.bookings FOR ALL TO anon USING (true) WITH CHECK (true);

-- =====================================================
-- Collections  (daily cash / payment breakdown)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.collections (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date           DATE NOT NULL DEFAULT CURRENT_DATE,
  room_rent      INTEGER NOT NULL DEFAULT 0,
  upi_payment    INTEGER NOT NULL DEFAULT 0,
  cash           INTEGER NOT NULL DEFAULT 0,
  online_booking INTEGER NOT NULL DEFAULT 0,
  extra_charges  INTEGER NOT NULL DEFAULT 0,
  laundry_income INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collections TO anon;
CREATE POLICY "collections_anon_all" ON public.collections FOR ALL TO anon USING (true) WITH CHECK (true);
