-- Migration: 001_clients_table.sql
-- Description: Clients table for BarberCRM

DROP TABLE IF EXISTS public."clients" CASCADE;

CREATE TABLE IF NOT EXISTS public."clients" (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"          TEXT NOT NULL REFERENCES public."users"(id) ON DELETE CASCADE,
  "teamId"          TEXT NOT NULL REFERENCES public."teams"(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  phone             TEXT,
  email             TEXT,
  notes             TEXT,
  "preferredService" TEXT,
  "visitFrequency"  INTEGER,
  "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS clients_set_updated_at ON public."clients";
CREATE TRIGGER clients_set_updated_at
BEFORE UPDATE ON public."clients"
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_clients_team_id ON public."clients"("teamId");
CREATE INDEX IF NOT EXISTS idx_clients_name    ON public."clients"(name);

ALTER TABLE public."clients" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Clients team can do all" ON public."clients";

CREATE POLICY "Clients team can do all"
ON public."clients" FOR ALL TO authenticated
USING (public.is_superadmin() OR "teamId" = ANY(public.get_user_team_ids()))
WITH CHECK (public.is_superadmin() OR "teamId" = ANY(public.get_user_team_ids()));
