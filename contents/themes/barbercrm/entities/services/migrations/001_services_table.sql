-- Migration: 001_services_table.sql
-- Description: Services table for BarberCRM

DROP TABLE IF EXISTS public."services" CASCADE;

CREATE TABLE IF NOT EXISTS public."services" (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"    TEXT NOT NULL REFERENCES public."users"(id) ON DELETE CASCADE,
  "teamId"    TEXT NOT NULL REFERENCES public."teams"(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  duration    INTEGER NOT NULL DEFAULT 30,
  category    TEXT NOT NULL DEFAULT 'haircut',
  active      BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT services_category_check CHECK (category IN ('haircut', 'beard', 'color', 'treatment', 'other')),
  CONSTRAINT services_price_positive CHECK (price >= 0),
  CONSTRAINT services_duration_positive CHECK (duration > 0)
);

DROP TRIGGER IF EXISTS services_set_updated_at ON public."services";
CREATE TRIGGER services_set_updated_at
BEFORE UPDATE ON public."services"
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_services_team_id  ON public."services"("teamId");
CREATE INDEX IF NOT EXISTS idx_services_category ON public."services"(category);
CREATE INDEX IF NOT EXISTS idx_services_active   ON public."services"(active);

ALTER TABLE public."services" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Services team can do all" ON public."services";

CREATE POLICY "Services team can do all"
ON public."services" FOR ALL TO authenticated
USING (public.is_superadmin() OR "teamId" = ANY(public.get_user_team_ids()))
WITH CHECK (public.is_superadmin() OR "teamId" = ANY(public.get_user_team_ids()));
