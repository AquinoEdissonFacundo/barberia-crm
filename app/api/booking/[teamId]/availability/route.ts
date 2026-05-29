import { NextRequest, NextResponse } from 'next/server'
import { queryWithRLS } from '@nextsparkjs/core/lib/db'
import { computeAvailableSlots } from '@/themes/barbercrm/lib/availability'
import type { BarberSchedule } from '@/themes/barbercrm/entities/barbers/barbers.types'
import type { ShopSettings } from '@/themes/barbercrm/lib/shop-settings.types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params
    const { searchParams } = new URL(request.url)
    const barberId  = searchParams.get('barberId')
    const serviceId = searchParams.get('serviceId')
    const date      = searchParams.get('date') // "YYYY-MM-DD"

    if (!barberId || !serviceId || !date) {
      return NextResponse.json(
        { error: 'barberId, serviceId and date are required' },
        { status: 400 }
      )
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }

    const [barberRows, serviceRows, settingsRows] = await Promise.all([
      queryWithRLS<{ schedule: BarberSchedule }>(
        `SELECT schedule FROM "barbers" WHERE id = $1 AND "teamId" = $2 AND active = true`,
        [barberId, teamId]
      ),
      queryWithRLS<{ duration: number }>(
        `SELECT duration FROM "services" WHERE id = $1 AND "teamId" = $2 AND active = true`,
        [serviceId, teamId]
      ),
      queryWithRLS<Pick<ShopSettings, 'bufferMinutes'>>(
        `SELECT "bufferMinutes" FROM "shop_settings" WHERE "teamId" = $1`,
        [teamId]
      ),
    ])

    if (!barberRows[0] || !serviceRows[0]) {
      return NextResponse.json({ error: 'Barber or service not found' }, { status: 404 })
    }

    const bufferMinutes   = settingsRows[0]?.bufferMinutes ?? 0
    const serviceDuration = serviceRows[0].duration
    const schedule        = barberRows[0].schedule

    // Get existing appointments for that barber on that date
    const existing = await queryWithRLS<{ time: string; serviceDuration: number }>(
      `SELECT a.time, s.duration as "serviceDuration"
       FROM "appointments" a
       JOIN "services" s ON s.id = a."serviceId"
       WHERE a."barberId" = $1
         AND a."teamId"   = $2
         AND a.date       = $3
         AND a.status IN ('scheduled', 'confirmed', 'in-progress', 'pending')`,
      [barberId, teamId, date]
    )

    const slots = computeAvailableSlots(
      schedule,
      serviceDuration,
      bufferMinutes,
      existing,
      date
    )

    return NextResponse.json({ slots })
  } catch (error) {
    console.error('[Booking/Availability] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
