'use client'

import { useParams } from 'next/navigation'
import { EntityDetailWrapper } from '@nextsparkjs/core/components/entities/wrappers/EntityDetailWrapper'
import { ClientAISummary } from '@/themes/barbercrm/components/ai/ClientAISummary'

export default function ClientDetailPage() {
  const params = useParams()
  const id = params?.id as string

  return (
    <div className="space-y-6">
      <EntityDetailWrapper entityType="clients" id={id} />
      {id && (
        <div className="px-4 pb-6 md:px-6">
          <ClientAISummary clientId={id} clientName="this client" />
        </div>
      )}
    </div>
  )
}
