import { NextRequest } from 'next/server'

// --- Mocks ---
const mockGetTypedSession = jest.fn()
const mockQueryWithRLS    = jest.fn()

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((body: unknown, init?: { status?: number }) => ({
      _body: body,
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}))

jest.mock('@nextsparkjs/core/lib/auth', () => ({
  getTypedSession: (...args: unknown[]) => mockGetTypedSession(...args),
}))

jest.mock('@nextsparkjs/core/lib/db', () => ({
  queryWithRLS: (...args: unknown[]) => mockQueryWithRLS(...args),
}))

import {
  GET,
  PUT,
} from '../../../../app/api/barber-shop/barbers/[id]/link-account/route'

function makeGetRequest(id = 'barber1'): [NextRequest, { params: Promise<{ id: string }> }] {
  const req = { headers: {}, url: 'http://localhost' } as unknown as NextRequest
  return [req, { params: Promise.resolve({ id }) }]
}

function makePutRequest(body: object, id = 'barber1'): [NextRequest, { params: Promise<{ id: string }> }] {
  const req = {
    headers: {},
    url: 'http://localhost',
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest
  return [req, { params: Promise.resolve({ id }) }]
}

beforeEach(() => {
  jest.clearAllMocks()
})

// ─── GET ──────────────────────────────────────────────────────────────────────

describe('GET /api/barber-shop/barbers/[id]/link-account', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetTypedSession.mockResolvedValue(null)
    const res = await GET(...makeGetRequest())
    expect(res.status).toBe(401)
  })

  it('returns 404 when user has no team', async () => {
    mockGetTypedSession.mockResolvedValue({ user: { id: 'u1' } })
    mockQueryWithRLS.mockResolvedValueOnce([]) // no team
    const res = await GET(...makeGetRequest())
    expect(res.status).toBe(404)
  })

  it('returns 404 when barber not found in team', async () => {
    mockGetTypedSession.mockResolvedValue({ user: { id: 'u1' } })
    mockQueryWithRLS.mockResolvedValueOnce([{ teamId: 'team1' }]) // team
    mockQueryWithRLS.mockResolvedValueOnce([])                    // barber not found
    const res = await GET(...makeGetRequest('unknown-id'))
    expect(res.status).toBe(404)
  })

  it('returns barber info and team members on success', async () => {
    mockGetTypedSession.mockResolvedValue({ user: { id: 'u1' } })
    mockQueryWithRLS.mockResolvedValueOnce([{ teamId: 'team1' }])
    mockQueryWithRLS.mockResolvedValueOnce([{ userId: 'u2', name: 'Carlos', email: 'carlos@example.com' }])
    mockQueryWithRLS.mockResolvedValueOnce([
      { userId: 'u1', name: 'Owner', email: 'owner@example.com' },
      { userId: 'u2', name: 'Carlos', email: 'carlos@example.com' },
    ])

    const res = await GET(...makeGetRequest('barber1'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.linkedUserId).toBe('u2')
    expect(body.barberName).toBe('Carlos')
    expect(body.barberEmail).toBe('carlos@example.com')
    expect(body.members).toHaveLength(2)
  })

  it('returns null linkedUserId when barber is not linked', async () => {
    mockGetTypedSession.mockResolvedValue({ user: { id: 'u1' } })
    mockQueryWithRLS.mockResolvedValueOnce([{ teamId: 'team1' }])
    mockQueryWithRLS.mockResolvedValueOnce([{ userId: null, name: 'Pedro', email: null }])
    mockQueryWithRLS.mockResolvedValueOnce([])

    const res = await GET(...makeGetRequest())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.linkedUserId).toBeNull()
    expect(body.barberEmail).toBeNull()
  })
})

// ─── PUT ──────────────────────────────────────────────────────────────────────

describe('PUT /api/barber-shop/barbers/[id]/link-account', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetTypedSession.mockResolvedValue(null)
    const res = await PUT(...makePutRequest({ userId: 'u2' }))
    expect(res.status).toBe(401)
  })

  it('returns 403 when caller is a member (not owner/admin)', async () => {
    mockGetTypedSession.mockResolvedValue({ user: { id: 'u1' } })
    mockQueryWithRLS.mockResolvedValueOnce([{ teamId: 'team1', role: 'member' }]) // getTeamAndRole
    const res = await PUT(...makePutRequest({ userId: 'u2' }))
    expect(res.status).toBe(403)
  })

  it('returns 400 when userId is not a member of the team', async () => {
    mockGetTypedSession.mockResolvedValue({ user: { id: 'u1' } })
    mockQueryWithRLS.mockResolvedValueOnce([{ teamId: 'team1', role: 'owner' }]) // getTeamAndRole
    mockQueryWithRLS.mockResolvedValueOnce([])                                    // isMemberOfTeam → not found
    const res = await PUT(...makePutRequest({ userId: 'stranger' }))
    expect(res.status).toBe(400)
  })

  it('links a user account to a barber successfully', async () => {
    mockGetTypedSession.mockResolvedValue({ user: { id: 'u1' } })
    mockQueryWithRLS.mockResolvedValueOnce([{ teamId: 'team1', role: 'owner' }]) // getTeamAndRole
    mockQueryWithRLS.mockResolvedValueOnce([{ userId: 'u2' }])                   // isMemberOfTeam
    mockQueryWithRLS.mockResolvedValueOnce([{ id: 'barber1' }])                  // linkAccount UPDATE

    const res = await PUT(...makePutRequest({ userId: 'u2' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
  })

  it('unlinks a barber when userId is null', async () => {
    mockGetTypedSession.mockResolvedValue({ user: { id: 'u1' } })
    mockQueryWithRLS.mockResolvedValueOnce([{ teamId: 'team1', role: 'owner' }]) // getTeamAndRole
    // No isMemberOfTeam call since userId is null
    mockQueryWithRLS.mockResolvedValueOnce([{ id: 'barber1' }])                  // linkAccount UPDATE

    const res = await PUT(...makePutRequest({ userId: null }))
    expect(res.status).toBe(200)
  })

  it('returns 404 when barber is not found during update', async () => {
    mockGetTypedSession.mockResolvedValue({ user: { id: 'u1' } })
    mockQueryWithRLS.mockResolvedValueOnce([{ teamId: 'team1', role: 'admin' }]) // getTeamAndRole
    mockQueryWithRLS.mockResolvedValueOnce([{ userId: 'u2' }])                   // isMemberOfTeam
    mockQueryWithRLS.mockResolvedValueOnce([])                                    // linkAccount UPDATE → not found

    const res = await PUT(...makePutRequest({ userId: 'u2' }))
    expect(res.status).toBe(404)
  })

  it('returns 500 on unexpected error', async () => {
    mockGetTypedSession.mockResolvedValue({ user: { id: 'u1' } })
    mockQueryWithRLS.mockRejectedValue(new Error('DB down'))
    const res = await PUT(...makePutRequest({ userId: 'u2' }))
    expect(res.status).toBe(500)
  })
})
