import { ShoppingBag } from 'lucide-react'
import type { EntityConfig } from '@nextsparkjs/core/lib/entities/types'
import { productFields } from './products.fields'

export const productEntityConfig: EntityConfig = {
  slug: 'products',
  enabled: true,
  names: {
    singular: 'product',
    plural: 'Products',
  },
  icon: ShoppingBag,

  access: {
    public: false,
    api: true,
    metadata: false,
    shared: true,
  },

  ui: {
    dashboard: {
      showInMenu: true,
      showInTopbar: false,
    },
    public: {
      hasArchivePage: false,
      hasSinglePage: false,
    },
    features: {
      searchable: true,
      sortable: true,
      filterable: true,
      bulkOperations: false,
      importExport: false,
    },
  },

  fields: productFields,
}
