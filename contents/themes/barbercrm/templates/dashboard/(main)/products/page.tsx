'use client'

import { useEffect, useState, useCallback } from 'react'
import { Package, Plus, Pencil, Trash2, RefreshCw, X, Save, Check } from 'lucide-react'
import { ImageUpload } from '@nextsparkjs/core/components/ui/image-upload'
import type { UploadedImage } from '@nextsparkjs/core/components/ui/image-upload'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  category: string
  imageUrl: string | null
  createdAt: string
}

type Category = 'shampoo' | 'conditioner' | 'styling' | 'tools' | 'other'

const CATEGORY_LABELS: Record<string, string> = {
  shampoo: 'Shampoo',
  conditioner: 'Acondicionador',
  styling: 'Styling',
  tools: 'Herramientas',
  other: 'Otro',
}

const CATEGORY_COLORS: Record<string, string> = {
  shampoo:     'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  conditioner: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  styling:     'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  tools:       'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  other:       'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
}

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  stock: '0',
  category: 'other' as Category,
  imageUrl: null as string | null,
}

function urlToImages(url: string | null | undefined): UploadedImage[] {
  if (!url) return []
  return [{ id: '0', name: 'image', size: 0, url }]
}

function formatPrice(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}k`
  return `$${n}`
}

function ProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: Product
  onEdit: (p: Product) => void
  onDelete: (id: string) => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden">
      {/* Image */}
      <div className="relative aspect-square w-full bg-muted overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}
        <span className={`absolute top-2 left-2 rounded-lg px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_COLORS[product.category] ?? CATEGORY_COLORS.other}`}>
          {CATEGORY_LABELS[product.category] ?? product.category}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 p-3 flex-1">
        <p className="text-sm font-semibold leading-tight truncate">{product.name}</p>
        {product.description && (
          <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{product.description}</p>
        )}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-sm font-bold">{formatPrice(product.price)}</span>
          <span className="text-xs text-muted-foreground">Stock: {product.stock}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1.5 border-t border-border p-2">
        <button
          onClick={() => onEdit(product)}
          className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-border bg-background py-1.5 text-xs font-medium hover:bg-muted transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </button>
        {confirmDelete ? (
          <>
            <button
              onClick={() => onDelete(product.id)}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-red-500 text-white py-1.5 text-xs font-medium hover:bg-red-600 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Confirmar
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-background hover:bg-muted transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-background hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-950/20 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

function ProductModal({
  product,
  onClose,
  onSaved,
}: {
  product: Product | null
  onClose: () => void
  onSaved: () => void
}) {
  const isEdit = !!product
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [images, setImages] = useState<UploadedImage[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description ?? '',
        price: String(product.price),
        stock: String(product.stock),
        category: (product.category as Category) ?? 'other',
        imageUrl: product.imageUrl,
      })
      setImages(urlToImages(product.imageUrl))
    } else {
      setForm({ ...EMPTY_FORM })
      setImages([])
    }
  }, [product])

  async function handleSave() {
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return }
    const price = Number(form.price)
    const stock = Number(form.stock)
    if (isNaN(price) || price < 0) { setError('El precio debe ser >= 0.'); return }
    if (isNaN(stock) || stock < 0) { setError('El stock debe ser >= 0.'); return }

    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description || null,
        price,
        stock,
        category: form.category,
        imageUrl: form.imageUrl,
      }
      const url    = isEdit ? `/api/v1/products/${product!.id}` : '/api/v1/products'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Error al guardar.')
        return
      }
      setSaved(true)
      setTimeout(() => { setSaved(false); onSaved(); onClose() }, 800)
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-border bg-card shadow-xl max-h-[90dvh] overflow-y-auto">
        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="p-5 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">{isEdit ? 'Editar producto' : 'Nuevo producto'}</h2>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-muted transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Image */}
          <div>
            <p className="text-xs font-semibold mb-2">Imagen</p>
            <ImageUpload
              value={images}
              onChange={imgs => {
                setImages(imgs)
                setForm(f => ({ ...f, imageUrl: imgs[0]?.url ?? null }))
              }}
              maxImages={1}
              aspectRatio="square"
            />
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-semibold">Nombre *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              maxLength={100}
              placeholder="Ej: Pomada moldeadora"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold">Descripción</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              maxLength={300}
              rows={2}
              placeholder="Descripción breve del producto…"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold">Precio *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="0.00"
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold">Stock</label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                placeholder="0"
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold">Categoría</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving
              ? <RefreshCw className="h-4 w-4 animate-spin" />
              : saved
              ? <Check className="h-4 w-4" />
              : <Save className="h-4 w-4" />}
            {saved ? '¡Guardado!' : isEdit ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [editTarget, setEditTarget] = useState<Product | null | undefined>(undefined)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/products')
      if (!res.ok) throw new Error('Failed')
      const json = await res.json()
      setProducts(json.data ?? json)
    } catch {
      setError('No se pudieron cargar los productos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/v1/products/${id}`, { method: 'DELETE' })
      setProducts(p => p.filter(x => x.id !== id))
    } catch {
      // silently ignore — product card will remain
    }
  }

  const showModal = editTarget !== undefined

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold leading-tight">Productos</h1>
                <p className="text-xs text-muted-foreground">
                  {loading ? '...' : `${products.length} producto${products.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={load}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </button>
              <button
                onClick={() => setEditTarget(null)}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Agregar</span>
              </button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-border bg-card aspect-[3/4]" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
                <Package className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="font-semibold">Sin productos todavía</p>
              <p className="text-sm text-muted-foreground mt-1 mb-5">
                Agregá productos para mostrarlos en tu página de reservas
              </p>
              <button
                onClick={() => setEditTarget(null)}
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Agregar primer producto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {products.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onEdit={setEditTarget}
                  onDelete={handleDelete}
                />
              ))}
              {/* Add card */}
              <button
                onClick={() => setEditTarget(null)}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border aspect-square hover:border-primary/50 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary"
              >
                <Plus className="h-6 w-6" />
                <span className="text-xs font-medium">Agregar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ProductModal
          product={editTarget ?? null}
          onClose={() => setEditTarget(undefined)}
          onSaved={load}
        />
      )}
    </>
  )
}
