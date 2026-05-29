import { NextRequest, NextResponse } from 'next/server'
import { getTypedSession } from '@nextsparkjs/core/lib/auth'
import { queryWithRLS, queryOneWithRLS } from '@nextsparkjs/core/lib/db'
import { EmailFactory } from '@nextsparkjs/core/lib/email/factory'
import { sendTeamInvitationEmail } from '@nextsparkjs/core/lib/email/send'
import { I18N_CONFIG } from '@nextsparkjs/core/lib/config'

async function getTeamId(userId: string): Promise<string | null> {
  const rows = await queryWithRLS<{ teamId: string }>(
    `SELECT "teamId" FROM "team_members" WHERE "userId" = $1 ORDER BY "joinedAt" ASC LIMIT 1`,
    [userId],
    userId
  )
  return rows[0]?.teamId ?? null
}

export async function POST(
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

    // Only owner or admin can invite
    const memberRows = await queryWithRLS<{ role: string }>(
      `SELECT role FROM "team_members" WHERE "userId" = $1 AND "teamId" = $2`,
      [session.user.id, teamId],
      session.user.id
    )
    const role = memberRows[0]?.role
    if (!role || !['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get barber email
    const barberRows = await queryWithRLS<{ name: string; email: string | null }>(
      `SELECT name, email FROM "barbers" WHERE id = $1 AND "teamId" = $2`,
      [id, teamId],
      session.user.id
    )
    const barber = barberRows[0]
    if (!barber) return NextResponse.json({ error: 'Barber not found' }, { status: 404 })
    if (!barber.email) {
      return NextResponse.json({ error: 'El barbero no tiene email registrado' }, { status: 400 })
    }

    const email = barber.email.trim().toLowerCase()

    // Check if already a team member
    const existingMember = await queryOneWithRLS<{ id: string }>(
      `SELECT tm.id FROM "team_members" tm
       JOIN "users" u ON u.id = tm."userId"
       WHERE tm."teamId" = $1 AND lower(u.email) = $2`,
      [teamId, email],
      session.user.id
    )
    if (existingMember) {
      return NextResponse.json({ error: 'Ya es miembro del equipo' }, { status: 409, statusText: 'ALREADY_MEMBER' })
    }

    // Check for existing pending invitation
    const existingInvite = await queryOneWithRLS<{ id: string }>(
      `SELECT id FROM "team_invitations"
       WHERE "teamId" = $1 AND lower(email) = $2 AND status = 'pending'`,
      [teamId, email],
      session.user.id
    )
    if (existingInvite) {
      return NextResponse.json({ error: 'Ya tiene una invitación pendiente' }, { status: 409, statusText: 'PENDING' })
    }

    // Get team name for the email
    const teamRows = await queryWithRLS<{ name: string }>(
      `SELECT name FROM "teams" WHERE id = $1`,
      [teamId],
      session.user.id
    )
    const teamName = teamRows[0]?.name ?? 'la barbería'

    // Create invitation
    const token = globalThis.crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    await queryWithRLS<{ id: string }>(
      `INSERT INTO "team_invitations" ("teamId", email, role, status, token, "invitedBy", "expiresAt")
       VALUES ($1, $2, 'member', 'pending', $3, $4, $5)
       RETURNING id`,
      [teamId, email, token, session.user.id, expiresAt.toISOString()],
      session.user.id
    )

    // Send email
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
    const acceptUrl = `${baseUrl}/accept-invite/${token}`

    try {
      const emailProvider = EmailFactory.getInstance()
      const emailContent = await sendTeamInvitationEmail({
        inviteeEmail: email,
        inviterName: session.user.email ?? session.user.name ?? 'El dueño',
        teamName,
        role: 'member',
        acceptUrl,
        expiresIn: '7 días',
        appName: process.env.NEXT_PUBLIC_APP_NAME || 'BarberCRM',
      }, I18N_CONFIG.defaultLocale)

      await emailProvider.send({
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
      })
    } catch (emailError) {
      console.error('[BarberInvite] Email failed:', emailError)
      // Invitation was created — log the accept URL so the owner can share it manually
      console.log(`[BarberInvite] Accept URL for ${barber.name}: ${acceptUrl}`)
    }

    return NextResponse.json({ ok: true, email })
  } catch (error) {
    console.error('[BarberInvite/POST] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
