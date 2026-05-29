'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CalendarCheck, Users, Scissors, Sparkles,
  CalendarDays, BellRing, ExternalLink, Copy, Check,
  Wand2, Store, Package, CheckSquare,
  TrendingUp, TrendingDown, DollarSign, Clock, Star,
} from 'lucide-react'

interface ShopSettings {
  shopName?: string
  teamId?: string
}

interface Stats {
  appointmentsThisWeek: number
  appointmentsLastWeek: number
  revenueThisWeek: number
  revenueLastWeek: number
  todayCount: number
  completedThisMonth: number
  topBarber: { name: string; count: number } | null
  topService: { name: string; count: number } | null
}

function calcChange(current: number, previous: number): { text: string; up: boolean } | null {
  if (previous === 0) return null
  const pct = Math.round(((current - previous) / previous) * 100)
  return { text: pct >= 0 ? `+${pct}%` : `${pct}%`, up: pct >= 0 }
}

function formatRevenue(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}k`
  return `$${n}`
}

const QUICK_ACTIONS = [
  {
    href: '/dashboard/appointments',
    icon: CalendarCheck,
    label: 'Citas',
    desc: 'Ver y gestionar turnos',
    color: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
  },
  {
    href: '/dashboard/clients',
    icon: Users,
    label: 'Clientes',
    desc: 'Base de datos de clientes',
    color: 'border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300',
  },
  {
    href: '/dashboard/barbers',
    icon: Scissors,
    label: 'Barberos',
    desc: 'Equipo de trabajo',
    color: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
  },
  {
    href: '/dashboard/services',
    icon: Sparkles,
    label: 'Servicios',
    desc: 'Catálogo de servicios',
    color: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
  },
  {
    href: '/dashboard/calendar',
    icon: CalendarDays,
    label: 'Mi calendario',
    desc: 'Vista semanal de turnos',
    color: 'border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300',
  },
  {
    href: '/dashboard/clients-alert',
    icon: BellRing,
    label: 'Clientes a contactar',
    desc: 'Seguimiento de visitas',
    color: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300',
  },
]

const TOOLS = [
  { href: '/dashboard/shop-config', icon: Store, label: 'Config. Barbería' },
  { href: '/dashboard/customize', icon: Wand2, label: 'Personalizar' },
  { href: '/dashboard/products', icon: Package, label: 'Productos' },
  { href: '/dashboard/tasks', icon: CheckSquare, label: 'Tareas' },
]

export default function DashboardPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<ShopSettings | null>(null)
  const [copied, setCopied]     = useState(false)
  const [stats, setStats]       = useState<Stats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/barber-shop/settings')
      .then(r => (r.ok ? r.json() : null))
      .then(d => setSettings(d))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/barber-shop/stats')
      .then(r => (r.ok ? r.json() : null))
      .then(d => { setStats(d); setStatsLoading(false) })
      .catch(() => setStatsLoading(false))
  }, [])

  const bookingUrl =
    settings?.teamId && typeof window !== 'undefined'
      ? `${window.location.origin}/book/${settings.teamId}`
      : null

  async function copyUrl() {
    if (!bookingUrl) return
    await navigator.clipboard.writeText(bookingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{settings?.shopName ?? 'Panel'}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Bienvenido de vuelta</p>
      </div>

      {/* Booking link */}
      {bookingUrl && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-xs font-semibold text-primary mb-2">Tu página de reservas</p>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono">
              {bookingUrl}
            </code>
            <button
              onClick={copyUrl}
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs hover:bg-muted transition-colors"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs hover:bg-muted transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Abrir</span>
            </a>
          </div>
        </div>
      )}

      {/* Stats */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Resumen
        </h2>

        {statsLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-border bg-card h-24" />
            ))}
          </div>
        ) : (
          <>
            {/* 4 stat cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* Turnos esta semana */}
              {(() => {
                const change = stats ? calcChange(stats.appointmentsThisWeek, stats.appointmentsLastWeek) : null
                return (
                  <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">Esta semana</p>
                      <CalendarCheck className="h-4 w-4 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold">{stats?.appointmentsThisWeek ?? '—'}</p>
                    <p className="text-xs text-muted-foreground">turnos</p>
                    {change && (
                      <div className={`flex items-center gap-1 text-xs font-medium ${change.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                        {change.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {change.text} vs sem. ant.
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Ingresos esta semana */}
              {(() => {
                const change = stats ? calcChange(stats.revenueThisWeek, stats.revenueLastWeek) : null
                return (
                  <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">Ingresos</p>
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-bold">{stats ? formatRevenue(stats.revenueThisWeek) : '—'}</p>
                    <p className="text-xs text-muted-foreground">esta semana</p>
                    {change && (
                      <div className={`flex items-center gap-1 text-xs font-medium ${change.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                        {change.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {change.text} vs sem. ant.
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Turnos hoy */}
              <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Hoy</p>
                  <Clock className="h-4 w-4 text-amber-500" />
                </div>
                <p className="text-2xl font-bold">{stats?.todayCount ?? '—'}</p>
                <p className="text-xs text-muted-foreground">turnos activos</p>
              </div>

              {/* Completados este mes */}
              <div className="rounded-2xl border border-border bg-card p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Este mes</p>
                  <Check className="h-4 w-4 text-violet-500" />
                </div>
                <p className="text-2xl font-bold">{stats?.completedThisMonth ?? '—'}</p>
                <p className="text-xs text-muted-foreground">completados</p>
              </div>
            </div>

            {/* Spotlight: top barber + top service */}
            {(stats?.topBarber || stats?.topService) && (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {stats?.topBarber && (
                  <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                      <Scissors className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Barbero más ocupado</p>
                      <p className="truncate text-sm font-semibold">{stats.topBarber.name}</p>
                      <p className="text-xs text-muted-foreground">{stats.topBarber.count} citas este mes</p>
                    </div>
                  </div>
                )}
                {stats?.topService && (
                  <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
                      <Star className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Servicio más popular</p>
                      <p className="truncate text-sm font-semibold">{stats.topService.name}</p>
                      <p className="text-xs text-muted-foreground">{stats.topService.count} reservas este mes</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Acceso rápido
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {QUICK_ACTIONS.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex flex-col gap-2.5 rounded-2xl border p-4 text-left transition-all hover:scale-[1.02] hover:shadow-md active:scale-[0.98] ${item.color}`}
              >
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                <div>
                  <p className="text-sm font-semibold leading-tight">{item.label}</p>
                  <p className="mt-0.5 hidden text-xs leading-tight opacity-70 sm:block">{item.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Tools */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Herramientas
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TOOLS.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className="flex items-center gap-2.5 rounded-2xl border border-border bg-card p-3.5 text-left text-sm font-medium transition-colors hover:bg-muted/50"
              >
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{item.label}</span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
