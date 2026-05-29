CREATE TABLE IF NOT EXISTS public."shop_settings" (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "teamId"         TEXT NOT NULL UNIQUE,
  "bookingMode"    TEXT NOT NULL DEFAULT 'both'
    CHECK ("bookingMode" IN ('appointment-only', 'both', 'walk-in-only')),
  "depositPercent" INTEGER NOT NULL DEFAULT 0
    CHECK ("depositPercent" >= 0 AND "depositPercent" <= 100),
  "bufferMinutes"  INTEGER NOT NULL DEFAULT 0,
  "timezone"       TEXT NOT NULL DEFAULT 'America/Argentina/Buenos_Aires',
  "shopName"       TEXT,
  "shopPhone"      TEXT,
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS shop_settings_set_updated_at ON public."shop_settings";
CREATE TRIGGER shop_settings_set_updated_at
  BEFORE UPDATE ON public."shop_settings"
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS idx_shop_settings_team_id
  ON public."shop_settings"("teamId");

ALTER TABLE public."shop_settings" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shop_settings_team_policy" ON public."shop_settings";
CREATE POLICY "shop_settings_team_policy"
  ON public."shop_settings" FOR ALL TO authenticated
  USING (
    public.is_superadmin()
    OR "teamId" = ANY(public.get_user_team_ids())
  )
  WITH CHECK (
    public.is_superadmin()
    OR "teamId" = ANY(public.get_user_team_ids())
  );
