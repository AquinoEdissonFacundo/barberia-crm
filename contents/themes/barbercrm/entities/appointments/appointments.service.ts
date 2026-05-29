import { queryWithRLS } from '@nextsparkjs/core/lib/db'

export interface AppointmentRow {
  id: string
  date: string
  time: string
  status: string
  totalPrice: number | null
  bookingSource: string | null
  notes: string | null
  clientDisplayName: string | null
  clientPhone: string | null
  barberName: string | null
  serviceName: string | null
  clientId: string | null
  barberId: string | null
  serviceId: string | null
  createdAt: string
}

export interface CalendarRow {
  id: string
  date: string
  time: string
  status: string
  totalPrice: number | null
  bookingSource: string
  clientName: string | null
  clientPhone: string | null
  serviceName: string | null
  barberName: string | null
  clientDisplayName: string | null
}

export class AppointmentsService {
  static async listWithDetails(
    userId: string,
    teamId: string,
    filters: { status?: string; date?: string }
  ): Promise<AppointmentRow[]> {
    const conditions: string[] = [`a."teamId" = $1`]
    const params: unknown[] = [teamId]

    if (filters.status) {
      params.push(filters.status)
      conditions.push(`a.status = $${params.length}`)
    }
    if (filters.date) {
      params.push(filters.date)
      conditions.push(`a.date = $${params.length}`)
    }

    return queryWithRLS<AppointmentRow>(
      `SELECT
         a.id,
         a.date,
         a.time,
         a.status,
         a."totalPrice",
         a."bookingSource",
         a.notes,
         COALESCE(c.name, a."clientName")  AS "clientDisplayName",
         COALESCE(c.phone, a."clientPhone") AS "clientPhone",
         b.name AS "barberName",
         s.name AS "serviceName",
         a."clientId",
         a."barberId",
         a."serviceId",
         a."createdAt"
       FROM "appointments" a
       LEFT JOIN "clients"  c ON c.id = a."clientId"
       LEFT JOIN "barbers"  b ON b.id = a."barberId"
       LEFT JOIN "services" s ON s.id = a."serviceId"
       WHERE ${conditions.join(' AND ')}
       ORDER BY a.date DESC, a.time DESC`,
      params,
      userId
    )
  }

  static async listForWeek(
    userId: string,
    teamId: string,
    weekStart: string,
    weekEnd: string,
    barberId: string | null
  ): Promise<CalendarRow[]> {
    return queryWithRLS<CalendarRow>(
      `SELECT
         a.id, a.date, a.time, a.status, a."totalPrice",
         a."bookingSource", a."clientName", a."clientPhone",
         s.name AS "serviceName",
         b.name AS "barberName",
         COALESCE(c.name, a."clientName") AS "clientDisplayName"
       FROM "appointments" a
       LEFT JOIN "services" s ON s.id = a."serviceId"
       LEFT JOIN "barbers"  b ON b.id = a."barberId"
       LEFT JOIN "clients"  c ON c.id = a."clientId"
       WHERE a."teamId" = $1
         AND a.date >= $2
         AND a.date <  $3
         ${barberId ? 'AND a."barberId" = $4' : ''}
       ORDER BY a.date ASC, a.time ASC`,
      barberId ? [teamId, weekStart, weekEnd, barberId] : [teamId, weekStart, weekEnd],
      userId
    )
  }
}
