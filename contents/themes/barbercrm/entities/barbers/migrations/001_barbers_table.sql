-- Migration: 001_barbers_table.sql
-- Description: Barbers table for BarberCRM

DROP TABLE IF EXISTS public."barbers" CASCADE;

CREATE TABLE IF NOT EXISTS public."barbers" (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"    TEXT NOT NULL REFERENCES public."users"(id) ON DELETE CASCADE,
  "teamId"    TEXT NOT NULL REFERENCES public."teams"(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  phone       TEXT,
  email       TEXT,
  specialty   TEXT,
  bio         TEXT,
  active      BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS barbers_set_updated_at ON public."barbers";
CREATE TRIGGER barbers_set_updated_at
BEFORE UPDATE ON public."barbers"
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_barbers_team_id ON public."barbers"("teamId");
CREATE INDEX IF NOT EXISTS idx_barbers_active  ON public."barbers"(active);

ALTER TABLE public."barbers" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Barbers team can do all" ON public."barbers";

CREATE POLICY "Barbers team can do all"
ON public."barbers" FOR ALL TO authenticated
USING (public.is_superadmin() OR "teamId" = ANY(public.get_user_team_ids()))
WITH CHECK (public.is_superadmin() OR "teamId" = ANY(public.get_user_team_ids()));
