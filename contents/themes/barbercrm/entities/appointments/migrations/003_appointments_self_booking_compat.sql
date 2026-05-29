-- Migration: 003_appointments_self_booking_compat.sql
-- Allow public self-booking: userId and clientId become nullable,
-- and an RLS policy permits anonymous INSERT for self-bookings.

-- 1. Drop FK + NOT NULL on userId so anonymous clients can book
ALTER TABLE public."appointments"
  DROP CONSTRAINT IF EXISTS appointments_userid_fkey,
  ALTER COLUMN "userId" DROP NOT NULL;

-- 2. Make clientId nullable (self-booking clients have no CRM record yet)
ALTER TABLE public."appointments"
  ALTER COLUMN "clientId" DROP NOT NULL;

-- 3. Add RLS policy for public self-booking INSERT (no auth required)
DROP POLICY IF EXISTS "Public self-booking insert" ON public."appointments";
CREATE POLICY "Public self-booking insert"
ON public."appointments"
FOR INSERT
TO public
WITH CHECK (
  "bookingSource" = 'self-booking'
  AND "teamId" IN (SELECT id FROM public."teams")
);

-- 4. Allow public SELECT of self-booking appointments (needed for verify-payment page)
DROP POLICY IF EXISTS "Public self-booking select by stripe session" ON public."appointments";
CREATE POLICY "Public self-booking select by stripe session"
ON public."appointments"
FOR SELECT
TO public
USING (
  "bookingSource" = 'self-booking'
  AND "stripeSessionId" IS NOT NULL
);

-- 5. Allow public UPDATE for Stripe webhook (depositStatus, status)
DROP POLICY IF EXISTS "Public self-booking update by stripe session" ON public."appointments";
CREATE POLICY "Public self-booking update by stripe session"
ON public."appointments"
FOR UPDATE
TO public
USING (
  "bookingSource" = 'self-booking'
  AND "stripeSessionId" IS NOT NULL
)
WITH CHECK (
  "bookingSource" = 'self-booking'
);
