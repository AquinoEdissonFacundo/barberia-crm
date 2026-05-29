'use client'

import { useEffect, useState, useCallback } from 'react'
import { Store, Clock, Percent, Globe, Check, Save, RefreshCw, CalendarDays } from 'lucide-react'
import type { ShopSettings, ShopSchedule, DayOfWeek } from '@/themes/barbercrm/lib/shop-settings.types'
import { DEFAULT_SHOP_SETTINGS, DEFAULT_SHOP_SCHEDULE, LATAM_TIMEZONES } from '@/themes/barbercrm/lib/shop-settings.types'

const BOOKING_MODES = [
  {
    value: 'appointment-only' as const,
    label: 'Solo con turno',
    desc: 'Los clientes deben reservar online. No se aceptan walk-ins.',
  },
  {
    value: 'both' as const,
    label: 'Turnos y walk-ins',
    desc: 'Los clientes pueden reservar online o presentarse sin turno.',
  },
  {
    value: 'walk-in-only' as const,
    label: 'Solo walk-in',
    desc: 'No hay reservas online. Los clientes se presentan directamente.',
  },
]

const BUFFER_OPTIONS = [0, 5, 10, 15, 20, 30]

const DAYS: { key: DayOfWeek; label: string; short: string }[] = [
  { key: 'mon', label: 'Lunes',     short: 'Lun' },
  { key: 'tue', label: 'Martes',    short: 'Mar' },
  { key: 'wed', label: 'Miércoles', short: 'Mié' },
  { key: 'thu', label: 'Jueves',    short: 'Jue' },
  { key: 'fri', label: 'Viernes',   short: 'Vie' },
  { key: 'sat', label: 'Sábado',    short: 'Sáb' },
  { key: 'sun', label: 'Domingo',   short: 'Dom' },
]

// Generate time options: 06:00 – 23:00 in 30 min steps
const TIME_OPTIONS: string[] = []
for (let h = 6; h <= 23; h++) {
  TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:00`)
  if (h < 23) TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:30`)
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
      {children}
    </div>
  )
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        {icon}
      </div>
      <p className="text-sm font-semibold">{title}</p>
    </div>
  )
}

function ScheduleEditor({
  schedule,
  onChange,
}: {
  schedule: ShopSchedule
  onChange: (s: ShopSchedule) => void
}) {
  function toggleDay(day: DayOfWeek) {
    onChange({ ...schedule, [day]: { ...schedule[day], open: !schedule[day].open } })
  }

  function setTime(day: DayOfWeek, field: 'from' | 'to', value: string) {
    onChange({ ...schedule, [day]: { ...schedule[day], [field]: value } })
  }

  return (
    <div className="space-y-2">
      {DAYS.map(({ key, label, short }) => {
        const day = schedule[key]
        return (
          <div
            key={key}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
              day.open ? 'border-border bg-background' : 'border-border/50 bg-muted/30'
            }`}
          >
            {/* Toggle */}
            <button
              type="button"
              role="switch"
              aria-checked={day.open}
              onClick={() => toggleDay(key)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none ${
                day.open ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                  day.open ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>

            {/* Day name */}
            <span className={`w-16 text-sm font-medium shrink-0 ${day.open ? '' : 'text-muted-foreground'}`}>
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{short}</span>
            </span>

            {/* Time inputs */}
            {day.open ? (
              <div className="flex flex-1 items-center gap-2 min-w-0">
                <select
                  value={day.from}
                  onChange={e => setTime(key, 'from', e.target.value)}
                  className="flex-1 min-w-0 rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <span className="text-xs text-muted-foreground shrink-0">–</span>
                <select
                  value={day.to}
                  onChange={e => setTime(key, 'to', e.target.value)}
                  className="flex-1 min-w-0 rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            ) : (
              <span className="flex-1 text-xs text-muted-foreground">Cerrado</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function ShopSettingsPage() {
  const [settings, setSettings] = useState<Partial<ShopSettings>>(DEFAULT_SHOP_SETTINGS)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/barber-shop/settings')
      if (res.ok) {
        const data = await res.json()
        // Merge saved schedule with defaults so all 7 days are always present
        if (!data.shopSchedule) data.shopSchedule = DEFAULT_SHOP_SCHEDULE
        setSettings(data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function saveSettings() {
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch('/api/barber-shop/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      } else {
        const data = await res.json().catch(() => ({}))
        setSaveError(data.error ?? 'Error al guardar. Intentá de nuevo.')
      }
    } catch {
      setSaveError('Error de conexión. Intentá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const examplePrice = 50
  const depositPreview = settings.depositPercent
    ? `$${((examplePrice * settings.depositPercent) / 100).toFixed(2)}`
    : '$0'

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <Store className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Configuración de Barbería</h1>
            <p className="text-xs text-muted-foreground">Modo de reserva, horarios y zona horaria</p>
          </div>
        </div>

        {/* Booking mode */}
        <SectionCard>
          <SectionTitle icon={<Clock className="h-4 w-4 text-primary" />} title="Modo de reserva" />
          <div className="space-y-2">
            {BOOKING_MODES.map(mode => (
              <label
                key={mode.value}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                  settings.bookingMode === mode.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/40'
                }`}
              >
                <input
                  type="radio"
                  name="bookingMode"
                  value={mode.value}
                  checked={settings.bookingMode === mode.value}
                  onChange={() => setSettings(s => ({ ...s, bookingMode: mode.value }))}
                  className="mt-0.5 accent-primary"
                />
                <div>
                  <p className="text-sm font-medium">{mode.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{mode.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </SectionCard>

        {/* Schedule */}
        <SectionCard>
          <SectionTitle icon={<CalendarDays className="h-4 w-4 text-primary" />} title="Horario de atención" />
          <p className="text-xs text-muted-foreground -mt-1">
            Días y horas en que la barbería recibe turnos.
          </p>
          <ScheduleEditor
            schedule={settings.shopSchedule ?? DEFAULT_SHOP_SCHEDULE}
            onChange={s => setSettings(prev => ({ ...prev, shopSchedule: s }))}
          />
        </SectionCard>

        {/* Deposit + Buffer */}
        {settings.bookingMode !== 'walk-in-only' && (
          <SectionCard>
            <SectionTitle icon={<Percent className="h-4 w-4 text-primary" />} title="Pago al reservar" />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Porcentaje de seña</p>
                  <p className="text-xs text-muted-foreground">El cliente paga este % al reservar. 0% = gratis.</p>
                </div>
                <span className="text-2xl font-bold tabular-nums">
                  {settings.depositPercent ?? 0}%
                </span>
              </div>
              <input
                type="range"
                min={0} max={100} step={5}
                value={settings.depositPercent ?? 0}
                onChange={e => setSettings(s => ({ ...s, depositPercent: Number(e.target.value) }))}
                className="w-full accent-primary"
              />
              {(settings.depositPercent ?? 0) > 0 && (
                <p className="text-xs text-muted-foreground">
                  Ejemplo: en un servicio de ${examplePrice} el cliente paga{' '}
                  <span className="font-medium text-foreground">{depositPreview}</span> de seña.
                </p>
              )}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div>
                <p className="text-sm font-medium">Buffer entre turnos</p>
                <p className="text-xs text-muted-foreground">Tiempo de limpieza entre un turno y el siguiente.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {BUFFER_OPTIONS.map(min => (
                  <button
                    key={min}
                    onClick={() => setSettings(s => ({ ...s, bufferMinutes: min }))}
                    className={`rounded-xl px-4 py-2 text-xs font-medium transition-colors ${
                      settings.bufferMinutes === min
                        ? 'bg-primary text-primary-foreground'
                        : 'border border-border hover:bg-muted'
                    }`}
                  >
                    {min === 0 ? 'Sin buffer' : `${min} min`}
                  </button>
                ))}
              </div>
            </div>
          </SectionCard>
        )}

        {/* Timezone */}
        <SectionCard>
          <SectionTitle icon={<Globe className="h-4 w-4 text-primary" />} title="Zona horaria" />
          <select
            value={settings.timezone ?? 'America/Argentina/Buenos_Aires'}
            onChange={e => setSettings(s => ({ ...s, timezone: e.target.value }))}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {LATAM_TIMEZONES.map(tz => (
              <option key={tz.value} value={tz.value}>{tz.label}</option>
            ))}
          </select>
        </SectionCard>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving
              ? <RefreshCw className="h-4 w-4 animate-spin" />
              : saved
              ? <Check className="h-4 w-4" />
              : <Save className="h-4 w-4" />}
            {saved ? '¡Guardado!' : 'Guardar configuración'}
          </button>
          {saveError && (
            <p className="text-xs text-red-600 dark:text-red-400">{saveError}</p>
          )}
        </div>
      </div>
    </div>
  )
}
