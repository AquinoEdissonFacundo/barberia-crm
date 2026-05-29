import { NextRequest, NextResponse } from 'next/server'
import { queryWithRLS } from '@nextsparkjs/core/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params
    const sessionId = new URL(request.url).searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id is required' }, { status: 400 })
    }

    const rows = await queryWithRLS<{
      id: string
      date: string
      time: string
      clientName: string | null
      clientPhone: string | null
      depositStatus: string
      status: string
      serviceName: string | null
      barberName: string | null
    }>(
      `SELECT
        a.id, a.date, a.time, a."clientName", a."clientPhone",
        a."depositStatus", a.status,
        s.name as "serviceName",
        b.name as "barberName"
       FROM "appointments" a
       LEFT JOIN "services" s ON s.id = a."serviceId"
       LEFT JOIN "barbers"  b ON b.id = a."barberId"
       WHERE a."stripeSessionId" = $1 AND a."teamId" = $2`,
      [sessionId, teamId]
    )

    if (!rows[0]) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    return NextResponse.json({ appointment: rows[0] })
  } catch (error) {
    console.error('[Booking/VerifyPayment] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
