import { NextRequest, NextResponse } from 'next/server'
import { getTypedSession } from '@nextsparkjs/core/lib/auth'
import { queryWithRLS } from '@nextsparkjs/core/lib/db'

interface ClientAlert {
  id: string
  name: string
  phone: string | null
  preferredService: string | null
  visitFrequency: number | null
  lastVisitDate: string | null
  daysSinceLastVisit: number | null
  status: 'overdue' | 'due-soon' | 'ok' | 'never-visited'
}

export async function GET(request: NextRequest) {
  try {
    const session = await getTypedSession(request.headers)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const clients = await queryWithRLS<ClientAlert>(
      `SELECT
        c.id,
        c.name,
        c.phone,
        c."preferredService",
        c."visitFrequency",
        MAX(a.date) as "lastVisitDate",
        CASE
          WHEN MAX(a.date) IS NULL THEN NULL
          ELSE EXTRACT(DAY FROM now() - MAX(a.date)::timestamptz)::integer
        END as "daysSinceLastVisit",
        CASE
          WHEN MAX(a.date) IS NULL THEN 'never-visited'
          WHEN c."visitFrequency" IS NULL THEN 'ok'
          WHEN EXTRACT(DAY FROM now() - MAX(a.date)::timestamptz) >= c."visitFrequency" THEN 'overdue'
          WHEN EXTRACT(DAY FROM now() - MAX(a.date)::timestamptz) >= c."visitFrequency" * 0.8 THEN 'due-soon'
          ELSE 'ok'
        END as status
      FROM clients c
      LEFT JOIN appointments a ON a."clientId" = c.id AND a.status = 'completed'
      GROUP BY c.id, c.name, c.phone, c."preferredService", c."visitFrequency"
      ORDER BY
        CASE
          WHEN MAX(a.date) IS NULL THEN 0
          WHEN c."visitFrequency" IS NOT NULL AND EXTRACT(DAY FROM now() - MAX(a.date)::timestamptz) >= c."visitFrequency" THEN 1
          WHEN c."visitFrequency" IS NOT NULL AND EXTRACT(DAY FROM now() - MAX(a.date)::timestamptz) >= c."visitFrequency" * 0.8 THEN 2
          ELSE 3
        END ASC,
        "daysSinceLastVisit" DESC NULLS FIRST`,
      [],
      userId
    )

    const overdue = clients.filter(c => c.status === 'overdue' || c.status === 'never-visited')
    const dueSoon = clients.filter(c => c.status === 'due-soon')
    const ok = clients.filter(c => c.status === 'ok')

    return NextResponse.json({
      summary: {
        overdue: overdue.length,
        dueSoon: dueSoon.length,
        ok: ok.length,
        total: clients.length,
      },
      overdue,
      dueSoon,
      ok,
    })

  } catch (error) {
    console.error('[ClientsAlert] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
