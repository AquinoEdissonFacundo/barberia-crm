import { Scissors } from 'lucide-react'
import type { EntityConfig } from '@nextsparkjs/core/lib/entities/types'
import { serviceFields } from './services.fields'

export const serviceEntityConfig: EntityConfig = {
  slug: 'services',
  enabled: true,
  names: { singular: 'service', plural: 'Services' },
  icon: Scissors,
  access: {
    public: false,
    api: true,
    metadata: false,
    shared: true,
  },
  ui: {
    dashboard: { showInMenu: true, showInTopbar: false },
    public: { hasArchivePage: false, hasSinglePage: false },
    features: {
      searchable: true,
      sortable: true,
      filterable: true,
      bulkOperations: false,
      importExport: false,
    },
  },
  fields: serviceFields,
}
