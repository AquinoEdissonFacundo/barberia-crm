import { NextRequest } from 'next/server'

// --- Mocks ---
const mockGetTypedSession = jest.fn()
const mockQueryWithRLS    = jest.fn()
const mockQueryOneWithRLS = jest.fn()
const mockSendEmail       = jest.fn()
const mockSendTeamInvitationEmail = jest.fn()

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((body: unknown, init?: { status?: number; statusText?: string }) => ({
      _body: body,
      status: init?.status ?? 200,
      statusText: init?.statusText ?? '',
      json: async () => body,
    })),
  },
}))

jest.mock('@nextsparkjs/core/lib/auth', () => ({
  getTypedSession: (...args: unknown[]) => mockGetTypedSession(...args),
}))

jest.mock('@nextsparkjs/core/lib/db', () => ({
  queryWithRLS:    (...args: unknown[]) => mockQueryWithRLS(...args),
  queryOneWithRLS: (...args: unknown[]) => mockQueryOneWithRLS(...args),
}))

jest.mock('@nextsparkjs/core/lib/email/factory', () => ({
  EmailFactory: {
    getInstance: () => ({ send: mockSendEmail }),
  },
}))

jest.mock('@nextsparkjs/core/lib/email/send', () => ({
  sendTeamInvitationEmail: (...args: unknown[]) => mockSendTeamInvitationEmail(...args),
}))

jest.mock('@nextsparkjs/core/lib/config', () => ({
  I18N_CONFIG: { defaultLocale: 'es' },
}))

import { POST } from '../../../../app/api/barber-shop/barbers/[id]/invite/route'

function makeRequest(id = 'barber1'): [NextRequest, { params: Promise<{ id: string }> }] {
  const req = { headers: {}, url: 'http://localhost' } as unknown as NextRequest
  return [req, { params: Promise.resolve({ id }) }]
}

function setupOwnerSession() {
  mockGetTypedSession.mockResolvedValue({ user: { id: 'owner1', email: 'owner@example.com' } })
  mockQueryWithRLS.mockResolvedValueOnce([{ teamId: 'team1' }])       // getTeamId
  mockQueryWithRLS.mockResolvedValueOnce([{ role: 'owner' }])          // role check
}

beforeEach(() => {
  jest.clearAllMocks()
  mockSendTeamInvitationEmail.mockResolvedValue({ subject: 'Invitation', html: '<p>invite</p>' })
  mockSendEmail.mockResolvedValue(undefined)
})

describe('POST /api/barber-shop/barbers/[id]/invite', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetTypedSession.mockResolvedValue(null)
    const res = await POST(...makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns 404 when user has no team', async () => {
    mockGetTypedSession.mockResolvedValue({ user: { id: 'u1' } })
    mockQueryWithRLS.mockResolvedValueOnce([]) // no team
    const res = await POST(...makeRequest())
    expect(res.status).toBe(404)
  })

  it('returns 403 when caller is a member (not owner/admin)', async () => {
    mockGetTypedSession.mockResolvedValue({ user: { id: 'u1' } })
    mockQueryWithRLS.mockResolvedValueOnce([{ teamId: 'team1' }])
    mockQueryWithRLS.mockResolvedValueOnce([{ role: 'member' }])
    const res = await POST(...makeRequest())
    expect(res.status).toBe(403)
  })

  it('returns 404 when barber not found', async () => {
    setupOwnerSession()
    mockQueryWithRLS.mockResolvedValueOnce([]) // barber not found
    const res = await POST(...makeRequest('missing-barber'))
    expect(res.status).toBe(404)
  })

  it('returns 400 when barber has no email', async () => {
    setupOwnerSession()
    mockQueryWithRLS.mockResolvedValueOnce([{ name: 'Carlos', email: null }])
    const res = await POST(...makeRequest())
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('email')
  })

  it('returns 409 ALREADY_MEMBER when barber email is already a team member', async () => {
    setupOwnerSession()
    mockQueryWithRLS.mockResolvedValueOnce([{ name: 'Carlos', email: 'carlos@example.com' }])
    mockQueryOneWithRLS.mockResolvedValueOnce({ id: 'tm1' }) // existing member
    const res = await POST(...makeRequest())
    expect(res.status).toBe(409)
    expect(res.statusText).toBe('ALREADY_MEMBER')
  })

  it('returns 409 PENDING when there is already a pending invitation', async () => {
    setupOwnerSession()
    mockQueryWithRLS.mockResolvedValueOnce([{ name: 'Carlos', email: 'carlos@example.com' }])
    mockQueryOneWithRLS.mockResolvedValueOnce(null)           // not a member
    mockQueryOneWithRLS.mockResolvedValueOnce({ id: 'inv1' }) // pending invite
    const res = await POST(...makeRequest())
    expect(res.status).toBe(409)
    expect(res.statusText).toBe('PENDING')
  })

  it('creates invitation and sends email on success', async () => {
    setupOwnerSession()
    mockQueryWithRLS.mockResolvedValueOnce([{ name: 'Carlos', email: 'carlos@example.com' }])
    mockQueryOneWithRLS.mockResolvedValueOnce(null) // not a member
    mockQueryOneWithRLS.mockResolvedValueOnce(null) // no pending invite
    mockQueryWithRLS.mockResolvedValueOnce([{ name: 'Barbería El Maestro' }]) // team name
    mockQueryWithRLS.mockResolvedValueOnce([{ id: 'inv-new' }])              // INSERT invitation

    const res = await POST(...makeRequest())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.email).toBe('carlos@example.com')
    expect(mockSendEmail).toHaveBeenCalledTimes(1)
  })

  it('still returns 200 even when email fails (invitation was created)', async () => {
    setupOwnerSession()
    mockQueryWithRLS.mockResolvedValueOnce([{ name: 'Carlos', email: 'carlos@example.com' }])
    mockQueryOneWithRLS.mockResolvedValueOnce(null)
    mockQueryOneWithRLS.mockResolvedValueOnce(null)
    mockQueryWithRLS.mockResolvedValueOnce([{ name: 'Barbería' }])
    mockQueryWithRLS.mockResolvedValueOnce([{ id: 'inv-new' }])
    mockSendEmail.mockRejectedValue(new Error('SMTP error'))

    const res = await POST(...makeRequest())
    expect(res.status).toBe(200)
  })

  it('returns 500 on unexpected error', async () => {
    mockGetTypedSession.mockResolvedValue({ user: { id: 'u1' } })
    mockQueryWithRLS.mockRejectedValue(new Error('DB down'))
    const res = await POST(...makeRequest())
    expect(res.status).toBe(500)
  })
})
