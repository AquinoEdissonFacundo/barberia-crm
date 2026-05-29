import { Calendar } from 'lucide-react'
import type { EntityConfig } from '@nextsparkjs/core/lib/entities/types'
import { appointmentFields } from './appointments.fields'

export const appointmentEntityConfig: EntityConfig = {
  slug: 'appointments',
  enabled: true,
  names: { singular: 'appointment', plural: 'Appointments' },
  icon: Calendar,
  access: {
    public: false,
    api: true,
    metadata: false,
    shared: true,
  },
  ui: {
    dashboard: { showInMenu: true, showInTopbar: true },
    public: { hasArchivePage: false, hasSinglePage: false },
    features: {
      searchable: true,
      sortable: true,
      filterable: true,
      bulkOperations: false,
      importExport: false,
    },
  },
  fields: appointmentFields,
}
