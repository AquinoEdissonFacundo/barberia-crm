import { NextRequest, NextResponse } from 'next/server'
import { getTypedSession } from '@nextsparkjs/core/lib/auth'
import { getTeamId } from '@/themes/barbercrm/lib/team.helpers'
import { AppointmentsService } from '@/themes/barbercrm/entities/appointments/appointments.service'

export async function GET(request: NextRequest) {
  try {
    const session = await getTypedSession(request.headers)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const teamId = await getTeamId(session.user.id)
    if (!teamId) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const rows = await AppointmentsService.listWithDetails(session.user.id, teamId, {
      status: searchParams.get('status') ?? undefined,
      date:   searchParams.get('date')   ?? undefined,
    })

    return NextResponse.json(rows)
  } catch (error) {
    console.error('[Appointments/GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
