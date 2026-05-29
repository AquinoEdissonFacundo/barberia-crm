ALTER TABLE public."shop_settings"
  ADD COLUMN IF NOT EXISTS "logoUrl"            TEXT,
  ADD COLUMN IF NOT EXISTS "backgroundImageUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "brandColor"         TEXT NOT NULL DEFAULT '#18181b',
  ADD COLUMN IF NOT EXISTS "welcomeText"        TEXT;
