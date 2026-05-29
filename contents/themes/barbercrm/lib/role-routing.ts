type EntityAction = 'list' | 'read' | 'create' | 'update' | 'delete'

export interface ParsedRoute {
  entity: string
  action: EntityAction
}

export function parseEntityFromPathname(pathname: string): ParsedRoute | null {
  const match = pathname.match(/^\/dashboard\/([^/]+)(?:\/(.*))?$/)
  if (!match) return null

  const entity = match[1]
  const rest   = match[2] || ''

  if (rest === '' || rest === '/') return { entity, action: 'list' }
  if (rest === 'create')           return { entity, action: 'create' }
  if (rest.match(/^[^/]+\/edit$/)) return { entity, action: 'update' }
  if (rest.match(/^[^/]+$/))       return { entity, action: 'read' }

  return { entity, action: 'read' }
}

const MEMBER_ALLOWED_PREFIXES = ['/dashboard/calendar', '/dashboard/settings']

export function isAllowedForRole(role: string, pathname: string): boolean {
  if (role !== 'member' && role !== 'viewer') return true
  return MEMBER_ALLOWED_PREFIXES.some(p => pathname.startsWith(p))
}
