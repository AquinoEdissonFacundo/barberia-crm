'use client'

import { useEffect, useState, useCallback } from 'react'
import { Wand2, Check, Save, RefreshCw, Image as ImageIcon, Copy, ExternalLink, Palette, Type } from 'lucide-react'
import type { ShopSettings } from '@/themes/barbercrm/lib/shop-settings.types'
import { DEFAULT_SHOP_SETTINGS } from '@/themes/barbercrm/lib/shop-settings.types'
import { ImageUpload } from '@nextsparkjs/core/components/ui/image-upload'
import type { UploadedImage } from '@nextsparkjs/core/components/ui/image-upload'

function urlToImages(url: string | null | undefined): UploadedImage[] {
  if (!url) return []
  return [{ id: '0', name: 'image', size: 0, url }]
}

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4 ${className}`}>
      {children}
    </div>
  )
}

function SectionLabel({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-tight">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{desc}</p>
      </div>
    </div>
  )
}

export default function CustomizeShopPage() {
  const [settings, setSettings] = useState<Partial<ShopSettings>>(DEFAULT_SHOP_SETTINGS)
  const [logoImages, setLogoImages] = useState<UploadedImage[]>([])
  const [bgImages, setBgImages]     = useState<UploadedImage[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [teamId, setTeamId]     = useState<string | null>(null)
  const [copied, setCopied]     = useState(false)

  const bookingUrl = teamId && typeof window !== 'undefined'
    ? `${window.location.origin}/book/${teamId}`
    : ''

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/barber-shop/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data)
        setTeamId(data.teamId ?? null)
        setLogoImages(urlToImages(data.logoUrl))
        setBgImages(urlToImages(data.backgroundImageUrl))
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function save() {
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

  async function copyUrl() {
    await navigator.clipboard.writeText(bookingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <Wand2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Personalizar Barbería</h1>
            <p className="text-xs text-muted-foreground">Logo, fondo, color y texto de tu página de reservas</p>
          </div>
        </div>

        {/* Booking link preview */}
        {teamId && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-xs font-semibold text-primary mb-2">Vista previa de tu página pública</p>
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono">
                {bookingUrl}
              </code>
              <button
                onClick={copyUrl}
                className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2 text-xs hover:bg-muted transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
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

        {/* Images: logo + background */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Logo */}
          <SectionCard>
            <SectionLabel
              icon={<ImageIcon className="h-4 w-4 text-primary" />}
              title="Logo"
              desc="Cuadrado. Se muestra en el banner de reservas."
            />
            <div className="w-full overflow-hidden">
              <ImageUpload
                value={logoImages}
                onChange={imgs => {
                  setLogoImages(imgs)
                  setSettings(s => ({ ...s, logoUrl: imgs[0]?.url ?? null }))
                }}
                maxImages={1}
                aspectRatio="square"
              />
            </div>
            {settings.logoUrl && (
              <div className="flex justify-center pt-1">
                <img
                  src={settings.logoUrl}
                  alt="Vista previa del logo"
                  className="h-20 w-20 rounded-2xl object-cover border border-border shadow-sm"
                />
              </div>
            )}
          </SectionCard>

          {/* Background */}
          <SectionCard>
            <SectionLabel
              icon={<ImageIcon className="h-4 w-4 text-primary" />}
              title="Imagen de fondo"
              desc="Banner superior en la página de reservas."
            />
            <div className="w-full overflow-hidden">
              <ImageUpload
                value={bgImages}
                onChange={imgs => {
                  setBgImages(imgs)
                  setSettings(s => ({ ...s, backgroundImageUrl: imgs[0]?.url ?? null }))
                }}
                maxImages={1}
                aspectRatio="landscape"
              />
            </div>
            {settings.backgroundImageUrl && (
              <div className="w-full overflow-hidden rounded-xl border border-border">
                <img
                  src={settings.backgroundImageUrl}
                  alt="Vista previa del fondo"
                  className="w-full h-24 object-cover"
                />
              </div>
            )}
          </SectionCard>
        </div>

        {/* Color + Shop name */}
        <div className="grid gap-4 sm:grid-cols-2">
          <SectionCard>
            <SectionLabel
              icon={<Palette className="h-4 w-4 text-primary" />}
              title="Color de marca"
              desc="Fondo del banner cuando no hay imagen."
            />
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.brandColor ?? '#18181b'}
                onChange={e => setSettings(s => ({ ...s, brandColor: e.target.value }))}
                className="h-12 w-12 cursor-pointer rounded-xl border border-border bg-background p-1"
              />
              <div>
                <p className="text-sm font-mono font-medium">{settings.brandColor ?? '#18181b'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Color principal</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionLabel
              icon={<Type className="h-4 w-4 text-primary" />}
              title="Nombre del local"
              desc="Se muestra en grande en el banner."
            />
            <input
              type="text"
              value={settings.shopName ?? ''}
              onChange={e => setSettings(s => ({ ...s, shopName: e.target.value || undefined }))}
              maxLength={100}
              placeholder="Ej: Barbería El Corte"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </SectionCard>
        </div>

        {/* Welcome text */}
        <SectionCard>
          <SectionLabel
            icon={<Type className="h-4 w-4 text-primary" />}
            title="Texto de bienvenida"
            desc="Frase corta debajo del nombre. Máx. 200 caracteres."
          />
          <div className="space-y-1">
            <textarea
              value={settings.welcomeText ?? ''}
              onChange={e => setSettings(s => ({ ...s, welcomeText: e.target.value || null }))}
              maxLength={200}
              rows={3}
              placeholder="Ej: Tu corte, tu estilo. Reservá en segundos."
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-xs text-muted-foreground text-right">
              {(settings.welcomeText ?? '').length}/200
            </p>
          </div>
        </SectionCard>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving
              ? <RefreshCw className="h-4 w-4 animate-spin" />
              : saved
              ? <Check className="h-4 w-4" />
              : <Save className="h-4 w-4" />}
            {saved ? '¡Guardado!' : 'Guardar cambios'}
          </button>
          {saveError && (
            <p className="text-xs text-red-600 dark:text-red-400">{saveError}</p>
          )}
        </div>
      </div>
    </div>
  )
}
