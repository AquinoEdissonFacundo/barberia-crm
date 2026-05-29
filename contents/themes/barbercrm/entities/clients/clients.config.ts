import { Users } from 'lucide-react'
import type { EntityConfig } from '@nextsparkjs/core/lib/entities/types'
import { clientFields } from './clients.fields'

export const clientEntityConfig: EntityConfig = {
  slug: 'clients',
  enabled: true,
  names: { singular: 'client', plural: 'Clients' },
  icon: Users,
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
      filterable: false,
      bulkOperations: false,
      importExport: false,
    },
  },
  fields: clientFields,
}
