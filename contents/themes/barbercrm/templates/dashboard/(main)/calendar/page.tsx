'use client'

import { useEffect, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, RefreshCw, Clock } from 'lucide-react'

interface AppointmentItem {
  id: string
  date: string
  time: string
  status: string
  totalPrice: number | null
  bookingSource: string
  serviceName: string | null
  barberName: string | null
  clientDisplayName: string | null
}

const STATUS_STYLE: Record<string, string> = {
  scheduled:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  confirmed:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'in-progress': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  completed:   'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  cancelled:   'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300',
  'no-show':   'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300',
  pending:     'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
}

const STATUS_LABEL: Record<string, string> = {
  scheduled: 'Agendado', confirmed: 'Confirmado', 'in-progress': 'En curso',
  completed: 'Completado', cancelled: 'Cancelado', 'no-show': 'No se presentó', pending: 'Pendiente pago',
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function toYMD(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`)
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

export default function CalendarPage() {
  const [weekStart, setWeekStart]         = useState<Date>(() => getMonday(new Date()))
  const [appointments, setAppointments]   = useState<AppointmentItem[]>([])
  const [loading, setLoading]             = useState(true)
  const [barberName, setBarberName]       = useState<string | null>(null)

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const fetchAppointments = useCallback(async (start: Date) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/barber-shop/calendar?weekStart=${toYMD(start)}`)
      if (res.ok) {
        const data = await res.json()
        setAppointments(data.appointments ?? [])
        setBarberName(data.barberName ?? null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAppointments(weekStart) }, [weekStart, fetchAppointments])

  function prevWeek() { setWeekStart(d => addDays(d, -7)) }
  function nextWeek() { setWeekStart(d => addDays(d, 7)) }
  function goToday()  { setWeekStart(getMonday(new Date())) }

  const aptsForDay = (ymd: string) =>
    appointments
      .filter(a => String(a.date).slice(0, 10) === ymd)
      .sort((a, b) => a.time.localeCompare(b.time))

  const weekLabel = (() => {
    const end = addDays(weekStart, 6)
    const from = weekStart.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
    const to   = end.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
    return `${from} — ${to}`
  })()

  const isToday = (date: Date) => toYMD(date) === toYMD(new Date())

  return (
    <div className="p-4 sm:p-6 lg:p-8">
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
            <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">
              {barberName ? `Calendario — ${barberName}` : 'Calendario de la semana'}
            </h1>
            <p className="text-xs text-muted-foreground">{weekLabel}</p>
            {barberName && (
              <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                Mis turnos
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
          >
            Hoy
          </button>
          <button onClick={prevWeek} aria-label="Semana anterior" className="flex h-8 w-8 items-center justify-center rounded-xl border border-border hover:bg-muted transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={nextWeek} aria-label="Semana siguiente" className="flex h-8 w-8 items-center justify-center rounded-xl border border-border hover:bg-muted transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
          {loading && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </div>

      {/* Week grid */}
      <div data-cy="calendar-week">
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, i) => {
          const ymd  = toYMD(day)
          const apts = aptsForDay(ymd)
          const today = isToday(day)

          return (
            <div key={ymd} className="min-h-50">
              {/* Day header */}
              <div className={`mb-2 rounded-xl px-2 py-1.5 text-center ${today ? 'bg-primary text-primary-foreground' : 'bg-muted/50'}`}>
                <p className="text-[10px] font-medium uppercase tracking-wide opacity-70">{DAY_NAMES[i === 6 ? 0 : i + 1] /* shift Sun */}</p>
                <p className="text-sm font-bold">{day.getDate()}</p>
              </div>

              {/* Appointments */}
              <div className="space-y-1.5">
                {apts.length === 0 ? (
                  <p className="text-center text-[10px] text-muted-foreground mt-4">—</p>
                ) : (
                  apts.map(apt => (
                    <div
                      key={apt.id}
                      data-cy="appointment-card"
                      className="rounded-xl border border-border bg-card p-2 space-y-1 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-2.5 w-2.5" />
                        {apt.time}
                      </div>
                      <p className="text-xs font-semibold leading-tight truncate">
                        {apt.clientDisplayName ?? 'Cliente'}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">{apt.serviceName}</p>
                      <span className={`inline-block rounded-full px-1.5 py-0.5 text-[9px] font-medium ${STATUS_STYLE[apt.status] ?? 'bg-muted text-muted-foreground'}`}>
                        {STATUS_LABEL[apt.status] ?? apt.status}
                      </span>
                      {apt.bookingSource === 'self-booking' && (
                        <span className="ml-1 inline-block rounded-full bg-violet-100 dark:bg-violet-900/30 px-1.5 py-0.5 text-[9px] text-violet-600 dark:text-violet-300">
                          Online
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {appointments.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CalendarDays className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium">Sin citas esta semana</p>
          <p className="text-sm text-muted-foreground">Navegá a otra semana o esperá nuevas reservas.</p>
        </div>
      )}
      </div>
    </div>
    </div>
  )
}
