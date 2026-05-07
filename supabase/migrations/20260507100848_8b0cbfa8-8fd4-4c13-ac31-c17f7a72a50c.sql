
-- Extend requests table for richer fuel + mechanic flows and OTP verification
ALTER TABLE public.requests
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS landmark text,
  ADD COLUMN IF NOT EXISTS fuel_type text,
  ADD COLUMN IF NOT EXISTS vehicle_type text,
  ADD COLUMN IF NOT EXISTS vehicle_model text,
  ADD COLUMN IF NOT EXISTS problem_type text,
  ADD COLUMN IF NOT EXISTS otp_code text,
  ADD COLUMN IF NOT EXISTS otp_verified boolean NOT NULL DEFAULT false;

-- Add new statuses if missing
DO $$ BEGIN
  ALTER TYPE public.request_status ADD VALUE IF NOT EXISTS 'reached';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TYPE public.request_status ADD VALUE IF NOT EXISTS 'otp_pending';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
