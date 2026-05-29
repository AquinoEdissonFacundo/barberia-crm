import { parseEntityFromPathname, isAllowedForRole } from '../role-routing'

describe('parseEntityFromPathname', () => {
  it('returns null for non-dashboard paths', () => {
    expect(parseEntityFromPathname('/')).toBeNull()
    expect(parseEntityFromPathname('/login')).toBeNull()
    expect(parseEntityFromPathname('/dashboard')).toBeNull()
  })

  it('parses list action for bare entity path', () => {
    expect(parseEntityFromPathname('/dashboard/barbers')).toEqual({ entity: 'barbers', action: 'list' })
    expect(parseEntityFromPathname('/dashboard/appointments')).toEqual({ entity: 'appointments', action: 'list' })
  })

  it('parses create action', () => {
    expect(parseEntityFromPathname('/dashboard/barbers/create')).toEqual({ entity: 'barbers', action: 'create' })
  })

  it('parses read action for entity with id', () => {
    expect(parseEntityFromPathname('/dashboard/barbers/abc-123')).toEqual({ entity: 'barbers', action: 'read' })
  })

  it('parses update action for entity with id/edit', () => {
    expect(parseEntityFromPathname('/dashboard/barbers/abc-123/edit')).toEqual({ entity: 'barbers', action: 'update' })
  })

  it('handles different entity names', () => {
    expect(parseEntityFromPathname('/dashboard/calendar')).toEqual({ entity: 'calendar', action: 'list' })
    expect(parseEntityFromPathname('/dashboard/settings')).toEqual({ entity: 'settings', action: 'list' })
    expect(parseEntityFromPathname('/dashboard/services')).toEqual({ entity: 'services', action: 'list' })
  })
})

describe('isAllowedForRole', () => {
  describe('owner and admin', () => {
    const unrestricted = ['owner', 'admin']
    for (const role of unrestricted) {
      it(`${role} can access any path`, () => {
        expect(isAllowedForRole(role, '/dashboard/barbers')).toBe(true)
        expect(isAllowedForRole(role, '/dashboard/appointments')).toBe(true)
        expect(isAllowedForRole(role, '/dashboard/settings')).toBe(true)
        expect(isAllowedForRole(role, '/dashboard/calendar')).toBe(true)
      })
    }
  })

  describe('member and viewer', () => {
    const restricted = ['member', 'viewer']
    for (const role of restricted) {
      it(`${role} is allowed on /dashboard/calendar`, () => {
        expect(isAllowedForRole(role, '/dashboard/calendar')).toBe(true)
        expect(isAllowedForRole(role, '/dashboard/calendar?weekStart=2026-01-01')).toBe(true)
      })

      it(`${role} is allowed on /dashboard/settings`, () => {
        expect(isAllowedForRole(role, '/dashboard/settings')).toBe(true)
        expect(isAllowedForRole(role, '/dashboard/settings/profile')).toBe(true)
      })

      it(`${role} is blocked from /dashboard/barbers`, () => {
        expect(isAllowedForRole(role, '/dashboard/barbers')).toBe(false)
      })

      it(`${role} is blocked from /dashboard/appointments`, () => {
        expect(isAllowedForRole(role, '/dashboard/appointments')).toBe(false)
      })

      it(`${role} is blocked from /dashboard/services`, () => {
        expect(isAllowedForRole(role, '/dashboard/services')).toBe(false)
      })
    }
  })

  it('unknown roles are treated as restricted', () => {
    expect(isAllowedForRole('superadmin', '/dashboard/barbers')).toBe(true)
    expect(isAllowedForRole('', '/dashboard/barbers')).toBe(true)
  })
})
