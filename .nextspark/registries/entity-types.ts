// 🤖 AUTO-GENERATED FILE - DO NOT EDIT
// Generated at: 2026-05-31T16:00:45.247Z
// Source: scripts/build-registry.mjs

// ==================== Auto-Generated Entity Types ====================

/**
 * All discovered entity names from themes and plugins
 * Auto-generated from registry discovery
 */
export type EntityName = 'patterns' | 'appointments' | 'barbers' | 'clients' | 'pages' | 'posts' | 'products' | 'services' | 'tasks'

/**
 * System search result types
 */
export type SystemSearchType = 'task' | 'page' | 'setting' | 'entity'

/**
 * Combined search result types (system + entities)
 */
export type SearchResultType = SystemSearchType | EntityName

/**
 * Auto-generated search type priorities for relevance scoring
 * Higher numbers = higher priority in search results
 */
export const SEARCH_TYPE_PRIORITIES: Record<SearchResultType, number> = {
  // System types (fixed priorities)
  'task': 1,
  'setting': 3,
  'page': 5,
  'entity': 7,

  // Auto-generated entity priorities (based on discovery order)
  'patterns': 19,
  'appointments': 18,
  'barbers': 17,
  'clients': 16,
  'pages': 15,
  'posts': 14,
  'products': 13,
  'services': 12,
  'tasks': 11
} as const

// ==================== Registry Metadata ====================

// Query functions have been moved to: @nextsparkjs/core/lib/services/entity-type.service
// Import from there instead:
// import { EntityTypeService } from '@nextsparkjs/core/lib/services/entity-type.service'
// - EntityTypeService.isEntityType(type) - Check if type is entity vs system
// - EntityTypeService.getAllNames() - Get all entity names
// - EntityTypeService.getPriority(type) - Get search priority for type

export const ENTITY_METADATA = {
  totalEntities: 9,
  entityNames: ['patterns', 'appointments', 'barbers', 'clients', 'pages', 'posts', 'products', 'services', 'tasks'],
  generatedAt: '2026-05-31T16:00:45.247Z',
  source: 'build-registry.mjs'
} as const
