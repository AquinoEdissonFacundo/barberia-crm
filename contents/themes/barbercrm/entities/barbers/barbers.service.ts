import { queryWithRLS } from '@nextsparkjs/core/lib/db'
import type { BarberSchedule } from './barbers.types'

export interface LinkAccountData {
  linkedUserId: string | null
  barberName: string
  barberEmail: string | null
  members: Array<{ userId: string; name: string | null; email: string }>
}

export class BarbersService {
  static async getSchedule(
    barberId: string,
    teamId: string,
    userId: string
  ): Promise<{ schedule: BarberSchedule } | null> {
    const rows = await queryWithRLS<{ schedule: BarberSchedule }>(
      `SELECT schedule FROM "barbers" WHERE id = $1 AND "teamId" = $2`,
      [barberId, teamId],
      userId
    )
    return rows[0] ? { schedule: rows[0].schedule } : null
  }

  static async updateSchedule(
    barberId: string,
    teamId: string,
    userId: string,
    schedule: BarberSchedule
  ): Promise<boolean> {
    const rows = await queryWithRLS<{ id: string }>(
      `UPDATE "barbers" SET schedule = $1, "updatedAt" = now()
       WHERE id = $2 AND "teamId" = $3
       RETURNING id`,
      [JSON.stringify(schedule), barberId, teamId],
      userId
    )
    return rows.length > 0
  }

  static async getLinkAccountData(
    barberId: string,
    teamId: string,
    userId: string
  ): Promise<LinkAccountData | null> {
    const barberRows = await queryWithRLS<{ userId: string | null; name: string; email: string | null }>(
      `SELECT "userId", name, email FROM "barbers" WHERE id = $1 AND "teamId" = $2`,
      [barberId, teamId],
      userId
    )
    if (!barberRows[0]) return null

    const members = await queryWithRLS<{ userId: string; name: string | null; email: string }>(
      `SELECT tm."userId", u.name, u.email
       FROM "team_members" tm
       JOIN "users" u ON u.id = tm."userId"
       WHERE tm."teamId" = $1
       ORDER BY tm."joinedAt" ASC`,
      [teamId],
      userId
    )

    return {
      linkedUserId: barberRows[0].userId,
      barberName: barberRows[0].name,
      barberEmail: barberRows[0].email ?? null,
      members,
    }
  }

  static async linkAccount(
    barberId: string,
    teamId: string,
    userId: string,
    linkedUserId: string | null
  ): Promise<boolean> {
    const rows = await queryWithRLS<{ id: string }>(
      `UPDATE "barbers" SET "userId" = $1, "updatedAt" = now()
       WHERE id = $2 AND "teamId" = $3
       RETURNING id`,
      [linkedUserId, barberId, teamId],
      userId
    )
    return rows.length > 0
  }

  static async isMemberOfTeam(
    targetUserId: string,
    teamId: string,
    requestingUserId: string
  ): Promise<boolean> {
    const rows = await queryWithRLS<{ userId: string }>(
      `SELECT "userId" FROM "team_members" WHERE "userId" = $1 AND "teamId" = $2`,
      [targetUserId, teamId],
      requestingUserId
    )
    return rows.length > 0
  }

  static async findByUserId(
    targetUserId: string,
    teamId: string,
    requestingUserId: string
  ): Promise<{ id: string; name: string } | null> {
    const rows = await queryWithRLS<{ id: string; name: string }>(
      `SELECT id, name FROM "barbers" WHERE "userId" = $1 AND "teamId" = $2 AND active = true`,
      [targetUserId, teamId],
      requestingUserId
    )
    return rows[0] ?? null
  }
}
