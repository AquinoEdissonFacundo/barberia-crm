import { NextRequest, NextResponse } from 'next/server'
import { queryWithRLS } from '@nextsparkjs/core/lib/db'
import type { ShopSettings } from '@/themes/barbercrm/lib/shop-settings.types'
import { DEFAULT_SHOP_SETTINGS } from '@/themes/barbercrm/lib/shop-settings.types'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params

    const settingsRows = await queryWithRLS<ShopSettings>(
      `SELECT "bookingMode", "depositPercent", "bufferMinutes", "timezone",
              "shopName", "shopPhone", "logoUrl", "backgroundImageUrl",
              "brandColor", "welcomeText"
       FROM "shop_settings" WHERE "teamId" = $1`,
      [teamId]
    )

    // Use defaults if the owner hasn't configured the shop yet
    const settings: ShopSettings = settingsRows[0] ?? { ...DEFAULT_SHOP_SETTINGS, teamId }

    if (settings.bookingMode === 'walk-in-only') {
      return NextResponse.json(
        { error: 'Online booking is not available for this barbershop', bookingMode: 'walk-in-only' },
        { status: 403 }
      )
    }

    const [services, barbers, products] = await Promise.all([
      queryWithRLS<{ id: string; name: string; price: number; duration: number; category: string; description: string | null }>(
        `SELECT id, name, price, duration, category, description
         FROM "services"
         WHERE "teamId" = $1 AND active = true
         ORDER BY name`,
        [teamId]
      ),
      queryWithRLS<{ id: string; name: string; specialty: string | null; bio: string | null; schedule: unknown }>(
        `SELECT id, name, specialty, bio, schedule
         FROM "barbers"
         WHERE "teamId" = $1 AND active = true
         ORDER BY name`,
        [teamId]
      ),
      queryWithRLS<{ id: string; name: string; description: string | null; price: number; imageUrl: string | null; category: string }>(
        `SELECT id, name, description, price, "imageUrl", category
         FROM "products"
         WHERE "teamId" = $1
         ORDER BY name`,
        [teamId]
      ),
    ])

    return NextResponse.json({
      settings,
      services,
      barbers,
      products,
    })
  } catch (error) {
    console.error('[Booking/Config] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
