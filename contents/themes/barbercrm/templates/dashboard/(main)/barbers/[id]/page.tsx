'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { EntityDetailWrapper } from '@nextsparkjs/core/components/entities/wrappers/EntityDetailWrapper'
import { Link2, UserCheck, RefreshCw, Check, Copy, ExternalLink, Mail, AlertCircle } from 'lucide-react'

interface TeamMember {
  userId: string
  name: string | null
  email: string
}

export default function BarberDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const isCreate = id === 'create'

  const [linkedUserId, setLinkedUserId] = useState<string | null>(null)
  const [barberName, setBarberName]     = useState<string>('')
  const [barberEmail, setBarberEmail]   = useState<string | null>(null)
  const [members, setMembers]           = useState<TeamMember[]>([])
  const [inviting, setInviting]         = useState(false)
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'sent' | 'already_member' | 'pending' | 'no_email' | 'error'>('idle')
  const [inviteMsg, setInviteMsg]       = useState<string>('')
  const [loading, setLoading]           = useState(true)
  const [saving, setSaving]             = useState(false)
  const [saved, setSaved]               = useState(false)
  const [saveError, setSaveError]       = useState<string | null>(null)
  const [selected, setSelected]         = useState<string>('')
  const [copied, setCopied]             = useState(false)

  const calendarLink = typeof window !== 'undefined'
    ? `${window.location.origin}/dashboard/calendar`
    : '/dashboard/calendar'

  function copyLink() {
    navigator.clipboard.writeText(calendarLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const load = useCallback(async () => {
    if (!id || isCreate) return
    setLoading(true)
    try {
      const res = await fetch(`/api/barber-shop/barbers/${id}/link-account`)
      if (res.ok) {
        const data = await res.json()
        setLinkedUserId(data.linkedUserId ?? null)
        setBarberName(data.barberName ?? '')
        setBarberEmail(data.barberEmail ?? null)
        setMembers(data.members ?? [])
        setSelected(data.linkedUserId ?? '')
        if (!data.barberEmail) setInviteStatus('no_email')
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  async function save() {
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch(`/api/barber-shop/barbers/${id}/link-account`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selected || null }),
      })
      if (res.ok) {
        setLinkedUserId(selected || null)
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      } else {
        const data = await res.json().catch(() => ({}))
        setSaveError(data.error ?? 'Error al guardar.')
      }
    } catch {
      setSaveError('Error de conexión.')
    } finally {
      setSaving(false)
    }
  }

  async function sendInvite() {
    setInviting(true)
    try {
      const res = await fetch(`/api/barber-shop/barbers/${id}/invite`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setInviteStatus('sent')
        setInviteMsg(data.email ?? barberEmail ?? '')
      } else if (res.status === 409) {
        const isAlready = res.statusText === 'ALREADY_MEMBER'
        setInviteStatus(isAlready ? 'already_member' : 'pending')
        setInviteMsg(data.error ?? '')
      } else {
        setInviteStatus('error')
        setInviteMsg(data.error ?? 'Error al enviar la invitación.')
      }
    } catch {
      setInviteStatus('error')
      setInviteMsg('Error de conexión.')
    } finally {
      setInviting(false)
    }
  }

  const linkedMember = members.find(m => m.userId === linkedUserId)

  if (isCreate) {
    return <EntityDetailWrapper entityType="barbers" id={id} />
  }

  return (
    <div className="space-y-6">
      <EntityDetailWrapper entityType="barbers" id={id} />

      {/* Shareable access link */}
      <div className="px-4 md:px-6">
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
              <ExternalLink className="h-4 w-4 text-violet-500" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                Link de acceso{barberName ? ` — ${barberName}` : ''}
              </p>
              <p className="text-xs text-muted-foreground">
                Compartí este link con el barbero para que inicie sesión y vea sus turnos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
            <span className="flex-1 truncate text-sm font-mono text-muted-foreground">
              {calendarLink}
            </span>
            <button
              onClick={copyLink}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
            >
              {copied
                ? <><Check className="h-3.5 w-3.5 text-emerald-500" /> Copiado</>
                : <><Copy className="h-3.5 w-3.5" /> Copiar</>}
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            El barbero debe tener una cuenta en el sistema. Primero invitalo desde{' '}
            <strong>Configuración → Equipo</strong>, luego vinculá su cuenta aquí abajo.
          </p>
        </div>
      </div>

      {/* Invite section */}
      {!loading && (
        <div className="px-4 md:px-6">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                <Mail className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-semibold">Invitar a unirse</p>
                <p className="text-xs text-muted-foreground">
                  Enviá una invitación al email del barbero para que cree su cuenta.
                </p>
              </div>
            </div>

            {inviteStatus === 'no_email' ? (
              <div className="flex items-center gap-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-3 py-2.5">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Este barbero no tiene email registrado. Editá el perfil y agregá uno para poder invitarlo.
                </p>
              </div>
            ) : inviteStatus === 'sent' ? (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2.5">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Invitación enviada a <strong>{inviteMsg}</strong>. El barbero recibirá un email con el link para registrarse.
                </p>
              </div>
            ) : inviteStatus === 'already_member' ? (
              <div className="flex items-center gap-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-3 py-2.5">
                <UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Ya es miembro del equipo. Vinculá su cuenta en la sección de abajo.
                </p>
              </div>
            ) : inviteStatus === 'pending' ? (
              <div className="flex items-center gap-2 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-3 py-2.5">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Ya tiene una invitación pendiente. Esperá que la acepte o revisá Configuración → Equipo.
                </p>
              </div>
            ) : inviteStatus === 'error' ? (
              <p className="text-xs text-red-600 dark:text-red-400">{inviteMsg}</p>
            ) : (
              <div className="flex items-center gap-3">
                {barberEmail && (
                  <p className="text-xs text-muted-foreground flex-1 truncate">
                    Se enviará a <span className="font-medium text-foreground">{barberEmail}</span>
                  </p>
                )}
                <button
                  onClick={sendInvite}
                  disabled={inviting}
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {inviting
                    ? <RefreshCw className="h-4 w-4 animate-spin" />
                    : <Mail className="h-4 w-4" />}
                  Enviar invitación
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Linked account section */}
      <div className="px-4 pb-6 md:px-6">
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Link2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Cuenta vinculada</p>
              <p className="text-xs text-muted-foreground">
                El integrante del equipo que puede ver sus propios turnos en el calendario.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Cargando…
            </div>
          ) : (
            <>
              {/* Current status */}
              {linkedMember ? (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-3 py-2.5">
                  <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-sm text-emerald-700 dark:text-emerald-300">
                    Vinculado a{' '}
                    <strong>{linkedMember.name ?? linkedMember.email}</strong>
                    {linkedMember.name && (
                      <span className="ml-1 text-xs opacity-70">({linkedMember.email})</span>
                    )}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sin cuenta vinculada — el barbero no puede ver sus turnos en el sistema.
                </p>
              )}

              {/* Dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Asignar cuenta
                </label>
                <select
                  value={selected}
                  onChange={e => setSelected(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">— Sin vincular —</option>
                  {members.map(m => (
                    <option key={m.userId} value={m.userId}>
                      {m.name ? `${m.name} (${m.email})` : m.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Save button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={save}
                  disabled={saving || selected === (linkedUserId ?? '')}
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {saving
                    ? <RefreshCw className="h-4 w-4 animate-spin" />
                    : saved
                    ? <Check className="h-4 w-4" />
                    : <Link2 className="h-4 w-4" />}
                  {saved ? '¡Guardado!' : 'Guardar vinculación'}
                </button>
                {saveError && (
                  <p className="text-xs text-red-600 dark:text-red-400">{saveError}</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
