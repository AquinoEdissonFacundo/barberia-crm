import { NextRequest, NextResponse } from 'next/server'
import { getTypedSession } from '@nextsparkjs/core/lib/auth'
import { queryWithRLS } from '@nextsparkjs/core/lib/db'

const VALID_CATEGORIES = ['shampoo', 'conditioner', 'styling', 'tools', 'other']

async function getTeamAndRole(userId: string): Promise<{ teamId: string; role: string } | null> {
  const rows = await queryWithRLS<{ teamId: string; role: string }>(
    `SELECT "teamId", role FROM "team_members" WHERE "userId" = $1 ORDER BY "joinedAt" ASC LIMIT 1`,
    [userId],
    userId
  )
  return rows[0] ?? null
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

    const userId = session.user.id
    const { id } = await params

    const member = await getTeamAndRole(userId)
    if (!member) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 })
    }
    if (!['owner', 'admin'].includes(member.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verify product belongs to this team
    const existing = await queryWithRLS<{ id: string }>(
      `SELECT id FROM "products" WHERE id = $1 AND "teamId" = $2`,
      [id, member.teamId],
      userId
    )
    if (!existing[0]) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, price, stock, category, imageUrl } = body

    const updates: string[] = []
    const values: unknown[] = []
    let i = 1

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ error: 'name must be a non-empty string' }, { status: 400 })
      }
      updates.push(`name = $${i++}`); values.push(name.trim())
    }
    if (description !== undefined) {
      updates.push(`description = $${i++}`); values.push(description ?? null)
    }
    if (price !== undefined) {
      const n = Number(price)
      if (isNaN(n) || n < 0) return NextResponse.json({ error: 'price must be >= 0' }, { status: 400 })
      updates.push(`price = $${i++}`); values.push(n)
    }
    if (stock !== undefined) {
      const n = Number(stock)
      if (isNaN(n) || n < 0) return NextResponse.json({ error: 'stock must be >= 0' }, { status: 400 })
      updates.push(`stock = $${i++}`); values.push(n)
    }
    if (category !== undefined) {
      updates.push(`category = $${i++}`); values.push(VALID_CATEGORIES.includes(category) ? category : 'other')
    }
    if (imageUrl !== undefined) {
      updates.push(`"imageUrl" = $${i++}`); values.push(imageUrl ?? null)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    updates.push(`"updatedAt" = now()`)
    values.push(id)

    await queryWithRLS(
      `UPDATE "products" SET ${updates.join(', ')} WHERE id = $${i}`,
      values,
      userId
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[Products/PUT] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getTypedSession(request.headers)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { id } = await params

    const member = await getTeamAndRole(userId)
    if (!member) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 })
    }
    if (!['owner', 'admin'].includes(member.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const deleted = await queryWithRLS<{ id: string }>(
      `DELETE FROM "products" WHERE id = $1 AND "teamId" = $2 RETURNING id`,
      [id, member.teamId],
      userId
    )

    if (!deleted[0]) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[Products/DELETE] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
