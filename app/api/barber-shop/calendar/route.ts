import { NextRequest, NextResponse } from 'next/server'
import { getTypedSession } from '@nextsparkjs/core/lib/auth'
import { getTeamId } from '@/themes/barbercrm/lib/team.helpers'
import { AppointmentsService } from '@/themes/barbercrm/entities/appointments/appointments.service'
import { BarbersService } from '@/themes/barbercrm/entities/barbers/barbers.service'

export async function GET(request: NextRequest) {
  try {
    const session = await getTypedSession(request.headers)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const weekStart = new URL(request.url).searchParams.get('weekStart')
    if (!weekStart || !/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
      return NextResponse.json({ error: 'weekStart (YYYY-MM-DD) is required' }, { status: 400 })
    }

    const userId = session.user.id
    const teamId = await getTeamId(userId)
    if (!teamId) return NextResponse.json({ error: 'No team found' }, { status: 404 })

    const barber = await BarbersService.findByUserId(userId, teamId, userId)
    const isBarber = barber !== null

    const start = new Date(weekStart)
    const end   = new Date(start)
    end.setDate(end.getDate() + 7)
    const weekEnd = end.toISOString().split('T')[0]

    const appointments = await AppointmentsService.listForWeek(
      userId, teamId, weekStart, weekEnd, isBarber ? barber.id : null
    )

    return NextResponse.json({ appointments, isBarber, barberName: barber?.name ?? null })
  } catch (error) {
    console.error('[Calendar/GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
