import { NextRequest, NextResponse } from 'next/server'
import { getTypedSession } from '@nextsparkjs/core/lib/auth'
import { getTeamId } from '@/themes/barbercrm/lib/team.helpers'
import { StatsService, EMPTY_STATS } from '@/themes/barbercrm/lib/stats.service'

export async function GET(request: NextRequest) {
  try {
    const session = await getTypedSession(request.headers)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const teamId = await getTeamId(session.user.id)
    if (!teamId) {
      return NextResponse.json(EMPTY_STATS)
    }

    const stats = await StatsService.getShopStats(teamId, session.user.id)
    return NextResponse.json(stats)
  } catch (error) {
    console.error('[Stats/GET] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
