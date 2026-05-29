'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Clock, Scissors, User, Calendar, Phone, CheckCircle, Loader2, AlertTriangle, MessageCircle, Package } from 'lucide-react'
import type { ShopSettings } from '@/themes/barbercrm/lib/shop-settings.types'

interface Service {
  id: string; name: string; price: number; duration: number; category: string; description: string | null
}
interface Barber {
  id: string; name: string; specialty: string | null; bio: string | null
}
interface Product {
  id: string; name: string; description: string | null; price: number; imageUrl: string | null; category: string
}

function BrandingHeader({ settings }: { settings: ShopSettings }) {
  const hasContent = settings.logoUrl || settings.shopName || settings.welcomeText || settings.backgroundImageUrl
  if (!hasContent) return null

  const hasBg   = !!settings.backgroundImageUrl
  const color   = settings.brandColor ?? '#18181b'

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={hasBg
        ? { backgroundImage: `url(${settings.backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '200px' }
        : { background: `linear-gradient(135deg, ${color}, ${color}bb)`, minHeight: '160px' }
      }
    >
      {hasBg && <div className="absolute inset-0 bg-black/55" />}
      <div className="relative flex flex-col items-center justify-center py-10 px-6 text-white text-center gap-2">
        {settings.logoUrl && (
          <img
            src={settings.logoUrl}
            alt="Logo"
            className="h-16 w-16 rounded-2xl object-cover shadow-lg mb-1"
          />
        )}
        {settings.shopName && (
          <h1 className="text-2xl font-bold drop-shadow-sm">{settings.shopName}</h1>
        )}
        {settings.welcomeText && (
          <p className="text-sm text-white/80 max-w-xs">{settings.welcomeText}</p>
        )}
      </div>
    </div>
  )
}

const DAY_NAMES_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTH_NAMES_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

function toYMD(date: Date): string {
  return date.toISOString().split('T')[0]
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

// Minimal inline calendar (no dep on ui/calendar to avoid server component issues)
function MiniCalendar({
  selected, onSelect, disabledDays,
}: { selected: string | null; onSelect: (ymd: string) => void; disabledDays: number[] }) {
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date(); d.setDate(1); return d
  })
  const today = toYMD(new Date())

  const year  = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  function prevMonth() { setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)) }
  function nextMonth() { setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)) }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 select-none">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} aria-label="Mes anterior" className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold capitalize">
          {MONTH_NAMES_ES[month]} {year}
        </span>
        <button onClick={nextMonth} aria-label="Mes siguiente" className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_NAMES_ES.map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const date = new Date(year, month, day)
          const ymd = toYMD(date)
          const isPast     = ymd < today
          const isDisabled = isPast || disabledDays.includes(date.getDay())
          const isSelected = ymd === selected
          const isToday    = ymd === today

          return (
            <button
              key={i}
              onClick={() => !isDisabled && onSelect(ymd)}
              disabled={isDisabled}
              className={`rounded-lg py-1.5 text-xs font-medium transition-colors
                ${isSelected ? 'bg-primary text-primary-foreground' :
                  isToday    ? 'border border-primary text-primary' :
                  isDisabled ? 'text-muted-foreground/40 cursor-not-allowed' :
                               'hover:bg-muted'
                }`}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function BookingPage() {
  const { teamId } = useParams() as { teamId: string }

  const [step, setStep]         = useState(0)
  const [loading, setLoading]   = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState<string | null>(null)   // config load error → full-page
  const [confirmError, setConfirmError] = useState<string | null>(null) // submit error → inline
  const [success, setSuccess]   = useState<{ appointmentId: string; whatsappUrl: string | null } | null>(null)

  const [settings, setSettings] = useState<ShopSettings | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [barbers, setBarbers]   = useState<Barber[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [slots, setSlots]       = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)

  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedBarber, setSelectedBarber]   = useState<Barber | null>(null)
  const [selectedDate, setSelectedDate]       = useState<string | null>(null)
  const [selectedTime, setSelectedTime]       = useState<string | null>(null)
  const [clientName, setClientName]           = useState('')
  const [clientPhone, setClientPhone]         = useState('')

  // Load barbershop config
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/booking/${teamId}/config`)
        if (!res.ok) {
          const err = await res.json()
          setError(err.error ?? 'Esta barbería no tiene reservas online disponibles.')
          return
        }
        const data = await res.json()
        setSettings(data.settings)
        setServices(data.services)
        setBarbers(data.barbers)
        setProducts(data.products ?? [])
      } catch {
        setError('No se pudo cargar la información de la barbería.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [teamId])

  // Load slots when date is selected
  const loadSlots = useCallback(async () => {
    if (!selectedBarber || !selectedService || !selectedDate) return
    setSlotsLoading(true)
    setSlots([])
    try {
      const res = await fetch(
        `/api/booking/${teamId}/availability?barberId=${selectedBarber.id}&serviceId=${selectedService.id}&date=${selectedDate}`
      )
      if (res.ok) {
        const data = await res.json()
        setSlots(data.slots ?? [])
      }
    } finally {
      setSlotsLoading(false)
    }
  }, [teamId, selectedBarber, selectedService, selectedDate])

  useEffect(() => {
    if (step === 3 && selectedDate) loadSlots()
  }, [step, selectedDate, loadSlots])

  async function confirm() {
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime || !clientName) return
    setSubmitting(true)
    setConfirmError(null)
    try {
      const res = await fetch(`/api/booking/${teamId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          barberId:  selectedBarber.id,
          date: selectedDate,
          time: selectedTime,
          clientName,
          clientPhone: clientPhone || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setConfirmError(data.error ?? 'Error al confirmar la reserva.')
        return
      }
      if (data.requiresPayment) {
        window.location.href = data.checkoutUrl
        return
      }
      setSuccess({ appointmentId: data.appointmentId, whatsappUrl: data.whatsappUrl })
    } finally {
      setSubmitting(false)
    }
  }

  const depositAmount = selectedService && settings?.depositPercent
    ? (selectedService.price * settings.depositPercent / 100).toFixed(2)
    : null

  // ─── Loading / Error / Success states ───────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error && !submitting) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-sm text-center space-y-3">
          <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
          <p className="font-semibold">No disponible</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-5">
          <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto" />
          <div>
            <h2 className="text-xl font-bold">¡Turno confirmado!</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedService?.name} con {selectedBarber?.name} el {selectedDate} a las {selectedTime}
            </p>
          </div>
          {success.whatsappUrl && (
            <a
              href={success.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-2xl bg-[#25D366] hover:bg-[#1ebe5d] text-white px-5 py-3 text-sm font-medium transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Enviar confirmación por WhatsApp
            </a>
          )}
        </div>
      </div>
    )
  }

  // ─── Wizard steps ────────────────────────────────────────────────────────────

  const steps = [
    { label: 'Servicio', icon: <Scissors className="h-3.5 w-3.5" /> },
    { label: 'Barbero',  icon: <User className="h-3.5 w-3.5" /> },
    { label: 'Fecha',    icon: <Calendar className="h-3.5 w-3.5" /> },
    { label: 'Horario',  icon: <Clock className="h-3.5 w-3.5" /> },
    { label: 'Confirmar',icon: <CheckCircle className="h-3.5 w-3.5" /> },
  ]

  const canGoNext = [
    !!selectedService,
    !!selectedBarber,
    !!selectedDate,
    !!selectedTime,
    !!clientName,
  ][step]

  return (
    <div className="min-h-[60vh] flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-lg space-y-6">
        <BrandingHeader settings={settings!} />

        {/* Products catalog */}
        {products.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Nuestros Productos</h2>
            <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible">
              {products.map(p => (
                <div
                  key={p.id}
                  className="flex-none w-36 sm:w-auto rounded-2xl border border-border bg-card overflow-hidden"
                >
                  <div className="aspect-square w-full bg-muted overflow-hidden">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold leading-tight truncate">{p.name}</p>
                    {p.description && (
                      <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2 mt-0.5">{p.description}</p>
                    )}
                    <p className="text-xs font-bold mt-1">${p.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center gap-1">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-1 flex-1">
              <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors
                ${i === step ? 'bg-primary text-primary-foreground' :
                  i < step  ? 'bg-primary/20 text-primary' :
                               'bg-muted text-muted-foreground'}`}>
                {s.icon}{s.label}
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px ${i < step ? 'bg-primary/40' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="rounded-2xl border border-border bg-card p-5 min-h-65">

          {/* Step 0 — Service */}
          {step === 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-sm">Elegí un servicio</h2>
              <div className="grid gap-2">
                {services.map(s => (
                  <button
                    key={s.id}
                    data-cy="service-card"
                    onClick={() => setSelectedService(s)}
                    className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition-colors
                      ${selectedService?.id === s.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'}`}
                  >
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.duration} min</p>
                    </div>
                    <span className="text-sm font-bold">${s.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1 — Barber */}
          {step === 1 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-sm">Elegí un barbero</h2>
              <div className="grid gap-2">
                {barbers.map(b => (
                  <button
                    key={b.id}
                    data-cy="barber-card"
                    onClick={() => setSelectedBarber(b)}
                    className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-colors
                      ${selectedBarber?.id === b.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'}`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-sm font-semibold">
                      {getInitials(b.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{b.name}</p>
                      {b.specialty && <p className="text-xs text-muted-foreground">{b.specialty}</p>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Date */}
          {step === 2 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-sm">Elegí una fecha</h2>
              <div data-cy="date-picker">
                <MiniCalendar
                  selected={selectedDate}
                  onSelect={date => { setSelectedDate(date); setSelectedTime(null) }}
                  disabledDays={[]}
                />
              </div>
            </div>
          )}

          {/* Step 3 — Time */}
          {step === 3 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-sm">
                Elegí un horario — {selectedDate}
              </h2>
              {slotsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : slots.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">No hay horarios disponibles para este día.</p>
                  <button onClick={() => setStep(2)} className="mt-2 text-xs text-primary underline">
                    Elegir otro día
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {slots.map(slot => (
                    <button
                      key={slot}
                      data-cy="time-slot"
                      onClick={() => setSelectedTime(slot)}
                      className={`rounded-xl border py-2 text-xs font-medium transition-colors
                        ${selectedTime === slot ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4 — Contact + Confirm */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-sm">Tus datos</h2>

              {/* Summary */}
              <div className="rounded-xl bg-muted/40 p-3 text-xs space-y-1 text-muted-foreground">
                <p><span className="font-medium text-foreground">{selectedService?.name}</span> · ${selectedService?.price}</p>
                <p>Con <span className="font-medium text-foreground">{selectedBarber?.name}</span></p>
                <p>{selectedDate} a las <span className="font-medium text-foreground">{selectedTime}</span></p>
                {depositAmount && (
                  <p className="text-amber-600 dark:text-amber-400 font-medium">
                    Seña requerida: ${depositAmount} ({settings?.depositPercent}%)
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">Nombre *</label>
                  <input
                    type="text"
                    data-cy="client-name-input"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Teléfono (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    data-cy="client-phone-input"
                    value={clientPhone}
                    onChange={e => setClientPhone(e.target.value)}
                    placeholder="+54 9 11 1234-5678"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {confirmError && (
                <p className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 p-3 text-xs text-red-600">
                  {confirmError}
                </p>
              )}

              <button
                data-cy="confirm-btn"
                onClick={confirm}
                disabled={submitting || !clientName}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Confirmando...</>
                ) : depositAmount ? (
                  <>Pagar seña ${depositAmount} y confirmar</>
                ) : (
                  <>Confirmar turno</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Atrás
          </button>

          {step < 4 && (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canGoNext}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-30 transition-colors"
            >
              Siguiente <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
