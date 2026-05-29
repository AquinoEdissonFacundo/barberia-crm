import { UserCheck } from 'lucide-react'
import type { EntityConfig } from '@nextsparkjs/core/lib/entities/types'
import { barberFields } from './barbers.fields'

export const barberEntityConfig: EntityConfig = {
  slug: 'barbers',
  enabled: true,
  names: { singular: 'barber', plural: 'Barbers' },
  icon: UserCheck,
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
  fields: barberFields,
}
