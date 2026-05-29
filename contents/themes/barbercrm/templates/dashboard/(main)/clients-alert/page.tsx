'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Clock, CheckCircle, Phone, MessageCircle, RefreshCw, BellRing } from 'lucide-react'

interface ClientAlert {
  id: string
  name: string
  phone: string | null
  preferredService: string | null
  visitFrequency: number | null
  lastVisitDate: string | null
  daysSinceLastVisit: number | null
  status: 'overdue' | 'due-soon' | 'ok' | 'never-visited'
}

interface AlertData {
  summary: {
    overdue: number
    dueSoon: number
    ok: number
    total: number
  }
  overdue: ClientAlert[]
  dueSoon: ClientAlert[]
  ok: ClientAlert[]
}

type TabId = 'overdue' | 'due-soon' | 'ok'

function openWhatsApp(phone: string, name: string, service: string | null) {
  const clean = phone.replace(/\D/g, '')
  const msg = encodeURIComponent(
    `Hola ${name} 👋 ¿Cómo estás? Ya pasó un tiempo desde tu última visita. ¿Te gustaría agendar tu ${service || 'próxima visita'}? Tenemos disponibilidad esta semana.`
  )
  window.open(`https://wa.me/${clean}?text=${msg}`, '_blank')
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

function getAvatarColor(name: string) {
  const colors = [
    'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  ]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

function UrgencyBar({ days, frequency }: { days: number | null; frequency: number | null }) {
  if (!days || !frequency) return null
  const pct = Math.min((days / frequency) * 100, 100)
  const color = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-400' : 'bg-emerald-500'
  return (
    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function ClientCard({ client, urgency }: { client: ClientAlert; urgency: 'high' | 'medium' | 'low' }) {
  const ring = {
    high: 'ring-1 ring-red-200 dark:ring-red-800',
    medium: 'ring-1 ring-amber-200 dark:ring-amber-800',
    low: 'ring-1 ring-emerald-200 dark:ring-emerald-800',
  }

  const badgeStyle = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  }

  const daysLabel =
    client.daysSinceLastVisit !== null
      ? `${client.daysSinceLastVisit}d`
      : 'Nunca'

  const subtitle = [
    client.preferredService,
    client.visitFrequency ? `c/ ${client.visitFrequency}d` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className={`flex items-center gap-4 rounded-2xl bg-card p-4 ${ring[urgency]} shadow-sm hover:shadow-md transition-shadow`}>
      {/* Avatar */}
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold ${getAvatarColor(client.name)}`}>
        {getInitials(client.name)}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm leading-tight truncate">{client.name}</p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{subtitle || 'Sin datos'}</p>
        <UrgencyBar days={client.daysSinceLastVisit} frequency={client.visitFrequency} />
      </div>

      {/* Days badge */}
      <span className={`shrink-0 rounded-xl px-2.5 py-1 text-xs font-bold tabular-nums ${badgeStyle[urgency]}`}>
        {daysLabel}
      </span>

      {/* Actions */}
      {client.phone ? (
        <div className="flex shrink-0 gap-1.5">
          <a
            href={`tel:${client.phone}`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background hover:bg-muted transition-colors"
            title="Llamar"
          >
            <Phone className="h-3.5 w-3.5" />
          </a>
          <button
            onClick={() => openWhatsApp(client.phone!, client.name, client.preferredService)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white transition-colors"
            title="WhatsApp"
          >
            <MessageCircle className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <span className="shrink-0 text-xs text-muted-foreground">Sin tel.</span>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  count,
  sub,
  accent,
}: {
  icon: React.ReactNode
  label: string
  count: number
  sub: string
  accent: string
}) {
  return (
    <div className={`rounded-2xl p-5 border ${accent}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium opacity-70 uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold mt-1 tabular-nums">{count}</p>
          <p className="text-xs opacity-60 mt-0.5">{sub}</p>
        </div>
        <div className="mt-0.5 opacity-80">{icon}</div>
      </div>
    </div>
  )
}

const TABS: { id: TabId; label: string; icon: React.ReactNode; emptyMsg: string }[] = [
  {
    id: 'overdue',
    label: 'Atrasados',
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    emptyMsg: 'Ningún cliente atrasado. ¡Todo al día!',
  },
  {
    id: 'due-soon',
    label: 'Por vencer',
    icon: <Clock className="h-3.5 w-3.5" />,
    emptyMsg: 'Ningún cliente próximo a vencer.',
  },
  {
    id: 'ok',
    label: 'Al día',
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    emptyMsg: 'Sin clientes con visita reciente.',
  },
]

export default function ClientsAlertPage() {
  const [data, setData] = useState<AlertData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('overdue')

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/barber-ai/clients-alert')
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      setData(json)
      if (json.overdue.length === 0 && json.dueSoon.length > 0) setActiveTab('due-soon')
      else if (json.overdue.length === 0 && json.dueSoon.length === 0) setActiveTab('ok')
    } catch {
      setError('No se pudieron cargar los clientes. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const tabClients = data
    ? activeTab === 'overdue'
      ? data.overdue
      : activeTab === 'due-soon'
      ? data.dueSoon
      : data.ok
    : []

  const tabCount = data
    ? { overdue: data.overdue.length, 'due-soon': data.dueSoon.length, ok: data.ok.length }
    : { overdue: 0, 'due-soon': 0, ok: 0 }

  const urgencyMap: Record<TabId, 'high' | 'medium' | 'low'> = {
    overdue: 'high',
    'due-soon': 'medium',
    ok: 'low',
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30">
            <BellRing className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">Clientes a contactar</h1>
            <p className="text-xs text-muted-foreground">Basado en la frecuencia de visita</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Stat cards */}
      {data && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
            label="Atrasados"
            count={data.summary.overdue}
            sub="contactar ya"
            accent="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 text-red-900 dark:text-red-100"
          />
          <StatCard
            icon={<Clock className="h-5 w-5 text-amber-500" />}
            label="Por vencer"
            count={data.summary.dueSoon}
            sub="esta semana"
            accent="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-100"
          />
          <StatCard
            icon={<CheckCircle className="h-5 w-5 text-emerald-500" />}
            label="Al día"
            count={data.summary.ok}
            sub="sin acción"
            accent="border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-100"
          />
        </div>
      )}

      {/* Tabs */}
      {data && data.summary.total > 0 && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-border">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id
              const count = tabCount[tab.id]
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 px-3 py-3 text-xs font-medium transition-colors relative
                    ${isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                  {count > 0 && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none
                      ${tab.id === 'overdue' ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400' :
                        tab.id === 'due-soon' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400' :
                        'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400'}`}>
                      {count}
                    </span>
                  )}
                  {isActive && (
                    <span className={`absolute bottom-0 left-0 right-0 h-0.5
                      ${tab.id === 'overdue' ? 'bg-red-500' : tab.id === 'due-soon' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Tab content */}
          <div className="p-3 space-y-2">
            {tabClients.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  {TABS.find(t => t.id === activeTab)?.emptyMsg}
                </p>
              </div>
            ) : (
              tabClients.map(c => (
                <ClientCard key={c.id} client={c} urgency={urgencyMap[activeTab]} />
              ))
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Empty state */}
      {data && data.summary.total === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
            <BellRing className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-semibold">Sin clientes todavía</p>
          <p className="text-sm text-muted-foreground mt-1">Agregá clientes para empezar a hacer seguimiento</p>
        </div>
      )}
    </div>
    </div>
  )
}
