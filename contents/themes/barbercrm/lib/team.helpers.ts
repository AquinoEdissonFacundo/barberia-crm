import { queryWithRLS } from '@nextsparkjs/core/lib/db'

export async function getTeamId(userId: string): Promise<string | null> {
  const rows = await queryWithRLS<{ teamId: string }>(
    `SELECT "teamId" FROM "team_members" WHERE "userId" = $1 ORDER BY "joinedAt" ASC LIMIT 1`,
    [userId],
    userId
  )
  return rows[0]?.teamId ?? null
}

export async function getTeamAndRole(userId: string): Promise<{ teamId: string; role: string } | null> {
  const rows = await queryWithRLS<{ teamId: string; role: string }>(
    `SELECT "teamId", role FROM "team_members" WHERE "userId" = $1 ORDER BY "joinedAt" ASC LIMIT 1`,
    [userId],
    userId
  )
  return rows[0] ?? null
}
