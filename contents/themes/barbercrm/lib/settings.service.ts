import { queryWithRLS } from '@nextsparkjs/core/lib/db'
import type { ShopSettings } from './shop-settings.types'
import { DEFAULT_SHOP_SETTINGS } from './shop-settings.types'

export interface ShopSettingsInput {
  bookingMode: string
  depositPercent: number
  bufferMinutes: number
  timezone: string
  shopName?: string | null
  shopPhone?: string | null
  logoUrl?: string | null
  backgroundImageUrl?: string | null
  brandColor?: string
  welcomeText?: string | null
  shopSchedule?: object | null
}

export class SettingsService {
  static async getSettings(teamId: string, userId: string): Promise<ShopSettings> {
    const rows = await queryWithRLS<ShopSettings>(
      `SELECT * FROM "shop_settings" WHERE "teamId" = $1`,
      [teamId],
      userId
    )
    return rows[0] ?? { ...DEFAULT_SHOP_SETTINGS, teamId } as ShopSettings
  }

  static async upsertSettings(
    teamId: string,
    userId: string,
    data: ShopSettingsInput
  ): Promise<ShopSettings> {
    const scheduleJson = data.shopSchedule !== undefined ? JSON.stringify(data.shopSchedule) : null

    const rows = await queryWithRLS<ShopSettings>(
      `INSERT INTO "shop_settings" (
         "teamId", "bookingMode", "depositPercent", "bufferMinutes", "timezone",
         "shopName", "shopPhone", "logoUrl", "backgroundImageUrl", "brandColor", "welcomeText",
         "shopSchedule"
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT ("teamId") DO UPDATE SET
         "bookingMode"        = EXCLUDED."bookingMode",
         "depositPercent"     = EXCLUDED."depositPercent",
         "bufferMinutes"      = EXCLUDED."bufferMinutes",
         "timezone"           = EXCLUDED."timezone",
         "shopName"           = EXCLUDED."shopName",
         "shopPhone"          = EXCLUDED."shopPhone",
         "logoUrl"            = EXCLUDED."logoUrl",
         "backgroundImageUrl" = EXCLUDED."backgroundImageUrl",
         "brandColor"         = EXCLUDED."brandColor",
         "welcomeText"        = EXCLUDED."welcomeText",
         "shopSchedule"       = EXCLUDED."shopSchedule",
         "updatedAt"          = now()
       RETURNING *`,
      [
        teamId, data.bookingMode, data.depositPercent, data.bufferMinutes, data.timezone,
        data.shopName ?? null, data.shopPhone ?? null,
        data.logoUrl ?? null, data.backgroundImageUrl ?? null,
        data.brandColor ?? '#18181b', data.welcomeText ?? null,
        scheduleJson,
      ],
      userId
    )

    return rows[0]
  }
}
