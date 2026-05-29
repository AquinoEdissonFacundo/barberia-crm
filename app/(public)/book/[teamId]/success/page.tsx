'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { CheckCircle, Loader2, AlertTriangle, MessageCircle, Calendar } from 'lucide-react'

interface AppointmentInfo {
  id: string
  date: string
  time: string
  clientName: string | null
  depositStatus: string
  status: string
  serviceName: string | null
  barberName: string | null
}

export default function BookingSuccessPage() {
  const { teamId } = useParams() as { teamId: string }
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [appointment, setAppointment] = useState<AppointmentInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setError('No se encontró la sesión de pago.')
      setLoading(false)
      return
    }
    async function verify() {
      try {
        const res = await fetch(`/api/booking/${teamId}/verify-payment?session_id=${sessionId}`)
        if (!res.ok) {
          setError('No se pudo verificar el pago. Contactá a la barbería.')
          return
        }
        const data = await res.json()
        setAppointment(data.appointment)
      } catch {
        setError('Error al verificar el pago.')
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, [teamId, sessionId])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">Verificando tu pago...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-sm text-center space-y-3">
          <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
          <p className="font-semibold">Hubo un problema</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (!appointment) return null

  const whatsappMsg = encodeURIComponent(
    `Hola! Soy ${appointment.clientName ?? 'un cliente'} y acabo de pagar la seña para mi turno de ${appointment.serviceName} el ${appointment.date} a las ${appointment.time}. ¡Muchas gracias!`
  )

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mx-auto">
          <CheckCircle className="h-10 w-10 text-emerald-500" />
        </div>

        <div>
          <h1 className="text-2xl font-bold">¡Pago confirmado!</h1>
          <p className="text-sm text-muted-foreground mt-1">Tu turno está reservado.</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 text-left space-y-3">
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Fecha y hora</p>
              <p className="text-sm font-semibold">{appointment.date} a las {appointment.time}</p>
            </div>
          </div>
          {appointment.serviceName && (
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Servicio</p>
                <p className="text-sm font-semibold">{appointment.serviceName}</p>
              </div>
            </div>
          )}
          {appointment.barberName && (
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Barbero</p>
                <p className="text-sm font-semibold">{appointment.barberName}</p>
              </div>
            </div>
          )}
        </div>

        <a
          href={`https://wa.me/?text=${whatsappMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-2xl bg-[#25D366] hover:bg-[#1ebe5d] text-white px-5 py-3 text-sm font-medium transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          Enviar comprobante por WhatsApp
        </a>
      </div>
    </div>
  )
}
