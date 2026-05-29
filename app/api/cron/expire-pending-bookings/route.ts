import { NextRequest, NextResponse } from 'next/server'
import { queryRows } from '@nextsparkjs/core/lib/db'

// Cron schedule: every 5 minutes (see vercel.json)
// Frees slots from clients who started Stripe checkout but never completed it.
// Uses queryRows (no RLS) because this is a system-level operation across all teams.
async function run() {
  const result = await queryRows<{ id: string }>(
    `UPDATE "appointments"
     SET status = 'cancelled', "depositStatus" = 'none'
     WHERE status = 'pending'
       AND "bookingSource"   = 'self-booking'
       AND "pendingExpiresAt" < now()
       AND "depositStatus"   = 'pending'
     RETURNING id`,
    []
  )

  const count = result.length
  if (count > 0) {
    console.info(`[CronExpireBookings] Released ${count} expired pending slot(s):`, result.map(r => r.id))
  }

  return NextResponse.json({ released: count, timestamp: new Date().toISOString() })
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function checkAuth(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('[CronExpireBookings] CRON_SECRET is not set')
    return false
  }
  return request.headers.get('authorization') === `Bearer ${cronSecret}`
}

// GET — invoked by Vercel Cron (see vercel.json)
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) return unauthorized()
  try {
    return await run()
  } catch (error) {
    console.error('[CronExpireBookings] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — manual trigger from dashboard or CI
export async function POST(request: NextRequest) {
  return GET(request)
}
