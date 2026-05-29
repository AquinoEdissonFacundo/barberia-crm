-- Migration: 001_products_table.sql
-- Description: Products table for BarberCRM

DROP TABLE IF EXISTS public."products" CASCADE;

CREATE TABLE IF NOT EXISTS public."products" (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"     TEXT NOT NULL REFERENCES public."users"(id) ON DELETE CASCADE,
  "teamId"     TEXT NOT NULL REFERENCES public."teams"(id) ON DELETE CASCADE,

  name         TEXT NOT NULL,
  description  TEXT,
  price        NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock        INTEGER NOT NULL DEFAULT 0,
  category     TEXT NOT NULL DEFAULT 'other',

  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT products_category_check CHECK (category IN ('shampoo', 'conditioner', 'styling', 'tools', 'other')),
  CONSTRAINT products_price_positive CHECK (price >= 0),
  CONSTRAINT products_stock_positive CHECK (stock >= 0)
);

DROP TRIGGER IF EXISTS products_set_updated_at ON public."products";
CREATE TRIGGER products_set_updated_at
BEFORE UPDATE ON public."products"
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_products_team_id  ON public."products"("teamId");
CREATE INDEX IF NOT EXISTS idx_products_category ON public."products"(category);

ALTER TABLE public."products" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Products team can do all" ON public."products";

CREATE POLICY "Products team can do all"
ON public."products"
FOR ALL TO authenticated
USING (
  public.is_superadmin()
  OR
  "teamId" = ANY(public.get_user_team_ids())
)
WITH CHECK (
  public.is_superadmin()
  OR
  "teamId" = ANY(public.get_user_team_ids())
);
