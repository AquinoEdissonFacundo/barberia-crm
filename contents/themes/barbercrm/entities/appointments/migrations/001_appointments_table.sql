-- Migration: 001_appointments_table.sql
-- Description: Appointments table for BarberCRM

DROP TABLE IF EXISTS public."appointments" CASCADE;

CREATE TABLE IF NOT EXISTS public."appointments" (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"     TEXT NOT NULL REFERENCES public."users"(id) ON DELETE CASCADE,
  "teamId"     TEXT NOT NULL REFERENCES public."teams"(id) ON DELETE CASCADE,
  "clientId"   TEXT NOT NULL,
  "barberId"   TEXT NOT NULL,
  "serviceId"  TEXT NOT NULL,
  date         DATE NOT NULL,
  time         TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'scheduled',
  notes        TEXT,
  "totalPrice" NUMERIC(10,2),
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT appointments_status_check CHECK (status IN ('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'))
);

DROP TRIGGER IF EXISTS appointments_set_updated_at ON public."appointments";
CREATE TRIGGER appointments_set_updated_at
BEFORE UPDATE ON public."appointments"
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_appointments_team_id   ON public."appointments"("teamId");
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON public."appointments"("clientId");
CREATE INDEX IF NOT EXISTS idx_appointments_barber_id ON public."appointments"("barberId");
CREATE INDEX IF NOT EXISTS idx_appointments_date      ON public."appointments"(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status    ON public."appointments"(status);

ALTER TABLE public."appointments" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Appointments team can do all" ON public."appointments";

CREATE POLICY "Appointments team can do all"
ON public."appointments" FOR ALL TO authenticated
USING (public.is_superadmin() OR "teamId" = ANY(public.get_user_team_ids()))
WITH CHECK (public.is_superadmin() OR "teamId" = ANY(public.get_user_team_ids()));
