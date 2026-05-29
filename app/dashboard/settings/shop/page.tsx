'use client'

import { getTemplateOrDefaultClient } from '@nextsparkjs/registries/template-registry.client'
import ShopSettingsDefault from '@/themes/barbercrm/templates/dashboard/settings/shop/page'

export default getTemplateOrDefaultClient(
  'app/dashboard/settings/shop/page.tsx',
  ShopSettingsDefault
)
