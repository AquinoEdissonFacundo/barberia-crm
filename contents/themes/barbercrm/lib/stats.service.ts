import { queryWithRLS } from '@nextsparkjs/core/lib/db'

export interface ShopStats {
  appointmentsThisWeek: number
  appointmentsLastWeek: number
  revenueThisWeek: number
  revenueLastWeek: number
  todayCount: number
  completedThisMonth: number
  topBarber: { name: string; count: number } | null
  topService: { name: string; count: number } | null
}

export const EMPTY_STATS: ShopStats = {
  appointmentsThisWeek: 0,
  appointmentsLastWeek: 0,
  revenueThisWeek: 0,
  revenueLastWeek: 0,
  todayCount: 0,
  completedThisMonth: 0,
  topBarber: null,
  topService: null,
}

export class StatsService {
  static async getShopStats(teamId: string, userId: string): Promise<ShopStats> {
    const countsRows = await queryWithRLS<{
      thisWeek: number
      lastWeek: number
      revenueThisWeek: string
      revenueLastWeek: string
      todayCount: number
      completedThisMonth: number
    }>(
      `SELECT
        COUNT(*) FILTER (
          WHERE date >= date_trunc('week', CURRENT_DATE)
            AND date <  date_trunc('week', CURRENT_DATE) + interval '7 days'
        )::int AS "thisWeek",

        COUNT(*) FILTER (
          WHERE date >= date_trunc('week', CURRENT_DATE) - interval '7 days'
            AND date <  date_trunc('week', CURRENT_DATE)
        )::int AS "lastWeek",

        COALESCE(SUM("totalPrice") FILTER (
          WHERE status = 'completed'
            AND date >= date_trunc('week', CURRENT_DATE)
            AND date <  date_trunc('week', CURRENT_DATE) + interval '7 days'
        ), 0)::text AS "revenueThisWeek",

        COALESCE(SUM("totalPrice") FILTER (
          WHERE status = 'completed'
            AND date >= date_trunc('week', CURRENT_DATE) - interval '7 days'
            AND date <  date_trunc('week', CURRENT_DATE)
        ), 0)::text AS "revenueLastWeek",

        COUNT(*) FILTER (
          WHERE date = CURRENT_DATE
            AND status IN ('scheduled', 'confirmed', 'in-progress')
        )::int AS "todayCount",

        COUNT(*) FILTER (
          WHERE status = 'completed'
            AND date >= date_trunc('month', CURRENT_DATE)
        )::int AS "completedThisMonth"

       FROM "appointments"
       WHERE "teamId" = $1`,
      [teamId],
      userId
    )

    const counts = countsRows[0] ?? {
      thisWeek: 0, lastWeek: 0,
      revenueThisWeek: '0', revenueLastWeek: '0',
      todayCount: 0, completedThisMonth: 0,
    }

    const topBarberRows = await queryWithRLS<{ name: string; count: number }>(
      `SELECT b.name, COUNT(a.id)::int AS count
       FROM "appointments" a
       JOIN "barbers" b ON b.id = a."barberId"
       WHERE a."teamId" = $1
         AND a.date >= date_trunc('month', CURRENT_DATE)
       GROUP BY b.id, b.name
       ORDER BY count DESC
       LIMIT 1`,
      [teamId],
      userId
    )

    const topServiceRows = await queryWithRLS<{ name: string; count: number }>(
      `SELECT s.name, COUNT(a.id)::int AS count
       FROM "appointments" a
       JOIN "services" s ON s.id = a."serviceId"
       WHERE a."teamId" = $1
         AND a.date >= date_trunc('month', CURRENT_DATE)
       GROUP BY s.id, s.name
       ORDER BY count DESC
       LIMIT 1`,
      [teamId],
      userId
    )

    return {
      appointmentsThisWeek: counts.thisWeek,
      appointmentsLastWeek: counts.lastWeek,
      revenueThisWeek:      Number(counts.revenueThisWeek),
      revenueLastWeek:      Number(counts.revenueLastWeek),
      todayCount:           counts.todayCount,
      completedThisMonth:   counts.completedThisMonth,
      topBarber:  topBarberRows[0]  ?? null,
      topService: topServiceRows[0] ?? null,
    }
  }
}
