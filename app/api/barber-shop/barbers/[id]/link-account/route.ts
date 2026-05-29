import { NextRequest, NextResponse } from 'next/server'
import { getTypedSession } from '@nextsparkjs/core/lib/auth'
import { getTeamAndRole, getTeamId } from '@/themes/barbercrm/lib/team.helpers'
import { BarbersService } from '@/themes/barbercrm/entities/barbers/barbers.service'

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

    const data = await BarbersService.getLinkAccountData(id, teamId, session.user.id)
    if (!data) return NextResponse.json({ error: 'Barber not found' }, { status: 404 })

    return NextResponse.json(data)
  } catch (error) {
    console.error('[BarberLinkAccount/GET] Error:', error)
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

    const { userId } = await request.json() as { userId: string | null }

    if (userId !== null && userId !== undefined) {
      const isMember = await BarbersService.isMemberOfTeam(userId, member.teamId, session.user.id)
      if (!isMember) {
        return NextResponse.json({ error: 'User is not a member of this team' }, { status: 400 })
      }
    }

    const updated = await BarbersService.linkAccount(id, member.teamId, session.user.id, userId ?? null)
    if (!updated) return NextResponse.json({ error: 'Barber not found' }, { status: 404 })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[BarberLinkAccount/PUT] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
