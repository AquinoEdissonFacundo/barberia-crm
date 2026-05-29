ALTER TABLE public."appointments"
  ADD COLUMN IF NOT EXISTS "bookingSource"    TEXT NOT NULL DEFAULT 'dashboard'
    CHECK ("bookingSource" IN ('dashboard', 'self-booking')),
  ADD COLUMN IF NOT EXISTS "depositStatus"    TEXT NOT NULL DEFAULT 'none'
    CHECK ("depositStatus" IN ('none', 'pending', 'paid', 'refunded')),
  ADD COLUMN IF NOT EXISTS "depositAmount"    NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS "stripeSessionId"  TEXT,
  ADD COLUMN IF NOT EXISTS "clientName"       TEXT,
  ADD COLUMN IF NOT EXISTS "clientPhone"      TEXT,
  ADD COLUMN IF NOT EXISTS "startAt"          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "endAt"            TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "pendingExpiresAt" TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_appointments_start_at
  ON public."appointments"("startAt");

CREATE INDEX IF NOT EXISTS idx_appointments_barber_start
  ON public."appointments"("barberId", "startAt")
  WHERE status IN ('scheduled', 'confirmed', 'in-progress', 'pending');
