/**
 * Auto-generated Documentation Registry
 *
 * Generated at: 2026-05-31T16:00:45.260Z
 * Theme: barbercrm
 * Public sections: 1
 * Superadmin sections: 2
 * Total pages: 4
 *
 * Structure:
 * - public: User-facing documentation → /docs
 * - superadmin: Admin documentation → /superadmin/docs
 *
 * DO NOT EDIT - This file is auto-generated
 */

// Inline type definitions for npm mode (avoids import issues since DTS is disabled)
export interface DocPageMeta {
  slug: string
  title: string
  order: number
  path: string
  source: 'public' | 'superadmin'
}

export interface DocSectionMeta {
  slug: string
  title: string
  order: number
  pages: DocPageMeta[]
  source: 'public' | 'superadmin'
}

export interface DocsRegistryStructure {
  public: DocSectionMeta[]
  superadmin: DocSectionMeta[]
  all: DocSectionMeta[]
}

export const DOCS_REGISTRY: DocsRegistryStructure = {
  "public": [
    {
      "title": "Overview",
      "slug": "overview",
      "order": 1,
      "pages": [
        {
          "slug": "introduction",
          "title": "Introduction",
          "order": 1,
          "path": "\\contents\\themes\\barbercrm\\docs\\public\\01-overview\\01-introduction.md",
          "source": "public"
        },
        {
          "slug": "customization",
          "title": "Customization",
          "order": 2,
          "path": "\\contents\\themes\\barbercrm\\docs\\public\\01-overview\\02-customization.md",
          "source": "public"
        }
      ],
      "source": "public"
    }
  ],
  "superadmin": [
    {
      "title": "Setup",
      "slug": "setup",
      "order": 1,
      "pages": [
        {
          "slug": "configuration",
          "title": "Configuration",
          "order": 1,
          "path": "\\contents\\themes\\barbercrm\\docs\\superadmin\\01-setup\\01-configuration.md",
          "source": "superadmin"
        }
      ],
      "source": "superadmin"
    },
    {
      "title": "Entities",
      "slug": "entities",
      "order": 2,
      "pages": [
        {
          "slug": "tasks",
          "title": "Tasks",
          "order": 1,
          "path": "\\contents\\themes\\barbercrm\\docs\\superadmin\\02-entities\\01-tasks.md",
          "source": "superadmin"
        }
      ],
      "source": "superadmin"
    }
  ],
  "all": [
    {
      "title": "Overview",
      "slug": "overview",
      "order": 1,
      "pages": [
        {
          "slug": "introduction",
          "title": "Introduction",
          "order": 1,
          "path": "\\contents\\themes\\barbercrm\\docs\\public\\01-overview\\01-introduction.md",
          "source": "public"
        },
        {
          "slug": "customization",
          "title": "Customization",
          "order": 2,
          "path": "\\contents\\themes\\barbercrm\\docs\\public\\01-overview\\02-customization.md",
          "source": "public"
        }
      ],
      "source": "public"
    },
    {
      "title": "Setup",
      "slug": "setup",
      "order": 1,
      "pages": [
        {
          "slug": "configuration",
          "title": "Configuration",
          "order": 1,
          "path": "\\contents\\themes\\barbercrm\\docs\\superadmin\\01-setup\\01-configuration.md",
          "source": "superadmin"
        }
      ],
      "source": "superadmin"
    },
    {
      "title": "Entities",
      "slug": "entities",
      "order": 2,
      "pages": [
        {
          "slug": "tasks",
          "title": "Tasks",
          "order": 1,
          "path": "\\contents\\themes\\barbercrm\\docs\\superadmin\\02-entities\\01-tasks.md",
          "source": "superadmin"
        }
      ],
      "source": "superadmin"
    }
  ]
} as const

export type DocsRegistry = typeof DOCS_REGISTRY

/**
 * Get all documentation sections (public + superadmin)
 */
export function getAllDocSections(): DocSectionMeta[] {
  return DOCS_REGISTRY.all
}

/**
 * Get public documentation sections only (for /docs)
 */
export function getPublicDocSections(): DocSectionMeta[] {
  return DOCS_REGISTRY.public
}

/**
 * Get superadmin documentation sections only (for /superadmin/docs)
 */
export function getSuperadminDocSections(): DocSectionMeta[] {
  return DOCS_REGISTRY.superadmin
}

/**
 * Find a section by slug
 */
export function findDocSection(slug: string): DocSectionMeta | undefined {
  return DOCS_REGISTRY.all.find(section => section.slug === slug)
}

/**
 * Find a section by slug in a specific category
 */
export function findDocSectionInCategory(slug: string, category: 'public' | 'superadmin'): DocSectionMeta | undefined {
  return DOCS_REGISTRY[category].find(section => section.slug === slug)
}

/**
 * Find a page within a section
 */
export function findDocPage(sectionSlug: string, pageSlug: string): DocPageMeta | undefined {
  const section = findDocSection(sectionSlug)
  return section?.pages.find(page => page.slug === pageSlug)
}
