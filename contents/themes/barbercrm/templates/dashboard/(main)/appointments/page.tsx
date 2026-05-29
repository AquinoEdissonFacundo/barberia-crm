'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  CalendarCheck, RefreshCw, Search, Phone, Filter,
  ChevronDown, Circle,
} from 'lucide-react'

interface Appointment {
  id: string
  date: string
  time: string
  status: string
  totalPrice: number | null
  bookingSource: string | null
  notes: string | null
  clientDisplayName: string | null
  clientPhone: string | null
  barberName: string | null
  serviceName: string | null
}

const STATUS_LABELS: Record<string, string> = {
  scheduled:   'Programado',
  confirmed:   'Confirmado',
  'in-progress': 'En curso',
  completed:   'Completado',
  cancelled:   'Cancelado',
  'no-show':   'No asistió',
}

const STATUS_STYLES: Record<string, string> = {
  scheduled:     'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  confirmed:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'in-progress': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  completed:     'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  cancelled:     'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
  'no-show':     'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
}

const STATUS_DOT: Record<string, string> = {
  scheduled:     'text-blue-500',
  confirmed:     'text-emerald-500',
  'in-progress': 'text-amber-500',
  completed:     'text-violet-500',
  cancelled:     'text-red-500',
  'no-show':     'text-zinc-400',
}

const ALL_STATUSES = Object.keys(STATUS_LABELS)

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5)
}

function formatPrice(n: number | null): string {
  if (n === null || n === undefined) return '—'
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}k`
  return `$${n}`
}

function getInitials(name: string | null): string {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const AVATAR_COLORS = [
  'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
]

function avatarColor(name: string | null): string {
  if (!name) return AVATAR_COLORS[0]
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function AppointmentCard({ appt }: { appt: Appointment }) {
  const statusStyle = STATUS_STYLES[appt.status] ?? STATUS_STYLES.scheduled
  const dotStyle    = STATUS_DOT[appt.status]    ?? STATUS_DOT.scheduled
  const label       = STATUS_LABELS[appt.status] ?? appt.status

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 hover:shadow-sm transition-shadow">
      {/* Avatar */}
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${avatarColor(appt.clientDisplayName)}`}>
        {getInitials(appt.clientDisplayName)}
      </div>

      {/* Main info */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-tight truncate">
            {appt.clientDisplayName ?? 'Cliente desconocido'}
          </p>
          <span className={`shrink-0 rounded-lg px-2 py-0.5 text-xs font-medium ${statusStyle}`}>
            <Circle className={`inline h-1.5 w-1.5 mr-1 fill-current ${dotStyle}`} />
            {label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          {appt.serviceName && <span>{appt.serviceName}</span>}
          {appt.barberName  && <span>· {appt.barberName}</span>}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span>{formatDate(appt.date)} · {formatTime(appt.time)}</span>
          {appt.totalPrice !== null && (
            <span className="font-medium text-foreground">{formatPrice(appt.totalPrice)}</span>
          )}
          {appt.bookingSource === 'self-booking' && (
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              Online
            </span>
          )}
        </div>

        {appt.clientPhone && (
          <a
            href={`tel:${appt.clientPhone}`}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Phone className="h-3 w-3" />
            {appt.clientPhone}
          </a>
        )}

        {appt.notes && (
          <p className="text-xs text-muted-foreground italic truncate">{appt.notes}</p>
        )}
      </div>
    </div>
  )
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/barber-shop/appointments?${params}`)
      if (!res.ok) throw new Error('Failed')
      setAppointments(await res.json())
    } catch {
      setError('No se pudieron cargar las citas. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  const filtered = appointments.filter(a => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      a.clientDisplayName?.toLowerCase().includes(q) ||
      a.clientPhone?.includes(q) ||
      a.barberName?.toLowerCase().includes(q) ||
      a.serviceName?.toLowerCase().includes(q)
    )
  })

  const grouped = filtered.reduce<Record<string, Appointment[]>>((acc, a) => {
    if (!acc[a.date]) acc[a.date] = []
    acc[a.date].push(a)
    return acc
  }, {})

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
              <CalendarCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">Citas</h1>
              <p className="text-xs text-muted-foreground">
                {loading ? '...' : `${filtered.length} cita${filtered.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>

        {/* Search + filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar cliente, barbero o servicio…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-background pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(p => !p)}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-muted transition-colors"
            >
              <Filter className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{statusFilter ? STATUS_LABELS[statusFilter] : 'Estado'}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            {showStatusMenu && (
              <div className="absolute right-0 top-full z-10 mt-1 w-44 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
                <button
                  onClick={() => { setStatusFilter(''); setShowStatusMenu(false) }}
                  className={`w-full px-3 py-2 text-left text-xs hover:bg-muted transition-colors ${!statusFilter ? 'font-semibold' : ''}`}
                >
                  Todos
                </button>
                {ALL_STATUSES.map(s => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(s); setShowStatusMenu(false) }}
                    className={`w-full px-3 py-2 text-left text-xs hover:bg-muted transition-colors ${statusFilter === s ? 'font-semibold' : ''}`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-border bg-card h-20" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
              <CalendarCheck className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-semibold">Sin citas</p>
            <p className="text-sm text-muted-foreground mt-1">
              {search || statusFilter ? 'Probá con otros filtros.' : 'Todavía no hay citas registradas.'}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {sortedDates.map(date => (
              <div key={date}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {formatDate(date)}
                </p>
                <div className="space-y-2">
                  {grouped[date].map(a => (
                    <AppointmentCard key={a.id} appt={a} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
