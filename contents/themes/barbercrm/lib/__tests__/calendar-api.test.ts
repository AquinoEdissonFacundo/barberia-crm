import { NextRequest } from 'next/server'

// --- Mocks ---
const mockGetTypedSession = jest.fn()
const mockQueryWithRLS = jest.fn()

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

// Import AFTER mocks are registered
import { GET } from '../../../../app/api/barber-shop/calendar/route'

function makeRequest(weekStart?: string): NextRequest {
  const url = `http://localhost/api/barber-shop/calendar${weekStart ? `?weekStart=${weekStart}` : ''}`
  return {
    headers: {},
    url,
  } as unknown as NextRequest
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('GET /api/barber-shop/calendar', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetTypedSession.mockResolvedValue(null)
    const res = await GET(makeRequest('2026-01-05'))
    expect(res.status).toBe(401)
  })

  it('returns 400 when weekStart is missing', async () => {
    mockGetTypedSession.mockResolvedValue({ user: { id: 'u1' } })
    const res = await GET(makeRequest())
    expect(res.status).toBe(400)
  })

  it('returns 400 when weekStart format is invalid', async () => {
    mockGetTypedSession.mockResolvedValue({ user: { id: 'u1' } })
    const res = await GET(makeRequest('01-05-2026'))
    expect(res.status).toBe(400)
  })

  it('returns 404 when user has no team', async () => {
    mockGetTypedSession.mockResolvedValue({ user: { id: 'u1' } })
    mockQueryWithRLS.mockResolvedValueOnce([]) // team_members query
    const res = await GET(makeRequest('2026-01-05'))
    expect(res.status).toBe(404)
  })

  it('returns appointments for owner (no barber filter)', async () => {
    mockGetTypedSession.mockResolvedValue({ user: { id: 'u1' } })
    // team_members → has team
    mockQueryWithRLS.mockResolvedValueOnce([{ teamId: 'team1' }])
    // barbers → user is not a barber
    mockQueryWithRLS.mockResolvedValueOnce([])
    // appointments
    const appts = [{ id: 'a1', date: '2026-01-05', time: '10:00', status: 'scheduled' }]
    mockQueryWithRLS.mockResolvedValueOnce(appts)

    const res = await GET(makeRequest('2026-01-05'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.isBarber).toBe(false)
    expect(body.barberName).toBeNull()
    expect(body.appointments).toHaveLength(1)
  })

  it('returns filtered appointments for a barber member', async () => {
    mockGetTypedSession.mockResolvedValue({ user: { id: 'u2' } })
    // team_members → has team
    mockQueryWithRLS.mockResolvedValueOnce([{ teamId: 'team1' }])
    // barbers → user is a barber
    mockQueryWithRLS.mockResolvedValueOnce([{ id: 'b1', name: 'Juan' }])
    // appointments (filtered by barberId)
    const appts = [{ id: 'a2', date: '2026-01-05', time: '11:00', status: 'scheduled', barberName: 'Juan' }]
    mockQueryWithRLS.mockResolvedValueOnce(appts)

    const res = await GET(makeRequest('2026-01-05'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.isBarber).toBe(true)
    expect(body.barberName).toBe('Juan')
    expect(body.appointments).toHaveLength(1)
  })

  it('returns 500 on unexpected error', async () => {
    mockGetTypedSession.mockResolvedValue({ user: { id: 'u1' } })
    mockQueryWithRLS.mockRejectedValue(new Error('DB down'))
    const res = await GET(makeRequest('2026-01-05'))
    expect(res.status).toBe(500)
  })
})
