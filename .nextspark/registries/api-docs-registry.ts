/**
 * Auto-generated API Docs Registry
 *
 * Generated at: 2026-05-31T16:00:45.261Z
 * Theme: barbercrm
 * Total docs: 17
 *
 * DO NOT EDIT - This file is auto-generated
 */

import type { ApiDocsRegistryStructure, ApiDocEntry } from '@nextsparkjs/core/types/api-presets'

// Re-export types
export type { ApiDocsRegistryStructure, ApiDocEntry }

export const API_DOCS_REGISTRY: ApiDocsRegistryStructure = {
  docs: {
  '/api/v1/pages': {
    path: 'contents/themes/barbercrm/entities/pages/api/docs.md',
    title: 'Pages API',
    endpoint: '/api/v1/pages',
    source: 'entity'
  },
  '/api/v1/posts': {
    path: 'contents/themes/barbercrm/entities/posts/api/docs.md',
    title: 'Posts API',
    endpoint: '/api/v1/posts',
    source: 'entity'
  },
  '/api/v1/tasks': {
    path: 'contents/themes/barbercrm/entities/tasks/api/docs.md',
    title: 'Tasks API',
    endpoint: '/api/v1/tasks',
    source: 'entity'
  },
  '/api/v1/api-keys': {
    path: 'node_modules/@nextsparkjs/core/templates/app/api/v1/api-keys/docs.md',
    title: 'API Keys API',
    endpoint: '/api/v1/api-keys',
    source: 'core'
  },
  '/api/v1/auth': {
    path: 'node_modules/@nextsparkjs/core/templates/app/api/v1/auth/docs.md',
    title: 'Auth API',
    endpoint: '/api/v1/auth',
    source: 'core'
  },
  '/api/v1/billing': {
    path: 'node_modules/@nextsparkjs/core/templates/app/api/v1/billing/docs.md',
    title: 'Billing API',
    endpoint: '/api/v1/billing',
    source: 'core'
  },
  '/api/v1/blocks': {
    path: 'node_modules/@nextsparkjs/core/templates/app/api/v1/blocks/docs.md',
    title: 'Blocks API',
    endpoint: '/api/v1/blocks',
    source: 'core'
  },
  '/api/v1/cron': {
    path: 'node_modules/@nextsparkjs/core/templates/app/api/v1/cron/docs.md',
    title: 'Cron API',
    endpoint: '/api/v1/cron',
    source: 'core'
  },
  '/api/v1/devtools': {
    path: 'node_modules/@nextsparkjs/core/templates/app/api/v1/devtools/docs.md',
    title: 'DevTools API',
    endpoint: '/api/v1/devtools',
    source: 'core'
  },
  '/api/v1/media': {
    path: 'node_modules/@nextsparkjs/core/templates/app/api/v1/media/docs.md',
    title: 'Media API',
    endpoint: '/api/v1/media',
    source: 'core'
  },
  '/api/v1/plugin': {
    path: 'node_modules/@nextsparkjs/core/templates/app/api/v1/plugin/docs.md',
    title: 'Plugin API',
    endpoint: '/api/v1/plugin',
    source: 'core'
  },
  '/api/v1/post-categories': {
    path: 'node_modules/@nextsparkjs/core/templates/app/api/v1/post-categories/docs.md',
    title: 'Post Categories API',
    endpoint: '/api/v1/post-categories',
    source: 'core'
  },
  '/api/v1/team-invitations': {
    path: 'node_modules/@nextsparkjs/core/templates/app/api/v1/team-invitations/docs.md',
    title: 'Team Invitations API',
    endpoint: '/api/v1/team-invitations',
    source: 'core'
  },
  '/api/v1/teams': {
    path: 'node_modules/@nextsparkjs/core/templates/app/api/v1/teams/docs.md',
    title: 'Teams API',
    endpoint: '/api/v1/teams',
    source: 'core'
  },
  '/api/v1/theme': {
    path: 'node_modules/@nextsparkjs/core/templates/app/api/v1/theme/docs.md',
    title: 'Theme API',
    endpoint: '/api/v1/theme',
    source: 'core'
  },
  '/api/v1/users': {
    path: 'node_modules/@nextsparkjs/core/templates/app/api/v1/users/docs.md',
    title: 'Users API',
    endpoint: '/api/v1/users',
    source: 'core'
  },
  '/api/v1/[entity]': {
    path: 'node_modules/@nextsparkjs/core/templates/app/api/v1/[entity]/docs.md',
    title: 'Dynamic Entity API',
    endpoint: '/api/v1/[entity]',
    source: 'core'
  }
  },
  meta: {
    totalDocs: 17,
    generatedAt: '2026-05-31T16:00:45.261Z',
    themeName: 'barbercrm'
  }
}

/**
 * Get doc entry for a specific endpoint
 * Also tries to match base endpoint for paths with parameters
 */
export function getDocForEndpoint(endpoint: string): ApiDocEntry | undefined {
  // Try exact match first
  if (API_DOCS_REGISTRY.docs[endpoint]) {
    return API_DOCS_REGISTRY.docs[endpoint]
  }

  // Try matching base endpoint (e.g., /api/v1/customers/123 -> /api/v1/customers)
  const baseEndpoint = endpoint.replace(/\/[^/]+$/, '')
  if (API_DOCS_REGISTRY.docs[baseEndpoint]) {
    return API_DOCS_REGISTRY.docs[baseEndpoint]
  }

  return undefined
}

/**
 * Check if endpoint has documentation
 */
export function hasDoc(endpoint: string): boolean {
  return !!getDocForEndpoint(endpoint)
}

/**
 * Get all documented endpoints
 */
export function getAllDocEndpoints(): string[] {
  return Object.keys(API_DOCS_REGISTRY.docs)
}
