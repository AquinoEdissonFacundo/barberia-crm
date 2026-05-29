'use client'

import { useEffect } from 'react'
import { ExternalLink } from 'lucide-react'

export default function BookingPageRedirect() {
  useEffect(() => {
    const teamId = localStorage.getItem('activeTeamId')
    if (teamId) {
      window.open(`/book/${teamId}`, '_blank', 'noopener,noreferrer')
      history.back()
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
      <ExternalLink className="h-8 w-8" />
      <p className="text-sm">Abriendo página de reservas...</p>
    </div>
  )
}
