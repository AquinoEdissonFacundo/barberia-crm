import { NextRequest, NextResponse } from 'next/server'
import { getTypedSession } from '@nextsparkjs/core/lib/auth'
import { getTeamAndRole, getTeamId } from '@/themes/barbercrm/lib/team.helpers'
import { BarbersService } from '@/themes/barbercrm/entities/barbers/barbers.service'
import type { BarberSchedule } from '@/themes/barbercrm/entities/barbers/barbers.types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getTypedSession(request.headers)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const teamId = await getTeamId(session.user.id)
    if (!teamId) return NextResponse.json({ error: 'No team found' }, { status: 404 })

    const result = await BarbersService.getSchedule(id, teamId, session.user.id)
    if (!result) return NextResponse.json({ error: 'Barber not found' }, { status: 404 })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[BarberSchedule/GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getTypedSession(request.headers)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const member = await getTeamAndRole(session.user.id)
    if (!member) return NextResponse.json({ error: 'No team found' }, { status: 404 })
    if (!['owner', 'admin'].includes(member.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const schedule: BarberSchedule = await request.json()

    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
    const timeRe = /^\d{2}:\d{2}$/
    for (const day of days) {
      const d = schedule[day]
      if (!d || typeof d.enabled !== 'boolean' || !timeRe.test(d.start) || !timeRe.test(d.end)) {
        return NextResponse.json({ error: `Invalid schedule for day: ${day}` }, { status: 400 })
      }
      if (d.start >= d.end) {
        return NextResponse.json({ error: `start must be before end for day: ${day}` }, { status: 400 })
      }
    }

    const updated = await BarbersService.updateSchedule(id, member.teamId, session.user.id, schedule)
    if (!updated) return NextResponse.json({ error: 'Barber not found' }, { status: 404 })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[BarberSchedule/PUT] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
