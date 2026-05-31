'use client'

import { use, useEffect, useState, useRef } from 'react'
import { propertyTypeMap } from '@/lib/propertyTypes'
import { toSentenceCase } from '@/lib/utils/normalizeText'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { SortableImage } from '@/components/admin/SortableImage'

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF']

const COUNTRIES = [
  'Argentina',
  'Costa Rica',
  'Ecuador',
  'Emiratos Árabes Unidos',
  'España',
  'Estados Unidos',
  'Grecia',
  'Indonesia',
  'México',
  'Paraguay',
  'Reino Unido',
]

const CLASSIFICATIONS = [
  { value: '', label: 'Normal' },
  { value: 'promotion', label: 'Promoción' },
  { value: 'investment', label: 'Inversión' },
]

interface FormState {
  title: string
  country: string
  province: string
  location: string
  property_type: string
  price: string
  currency: string
  area_sqm: string
  bedrooms: string
  bathrooms: string
  description: string
  featured: boolean
  hidden: boolean
  sold: boolean
  classification: string
}

export default function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [form, setForm] = useState<FormState>({
    title: '',
    country: '',
    province: '',
    location: '',
    property_type: '',
    price: '',
    currency: 'EUR',
    area_sqm: '',
    bedrooms: '',
    bathrooms: '',
    description: '',
    featured: false,
    hidden: false,
    sold: false,
    classification: '',
  })
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [useCustomCity, setUseCustomCity] = useState(false)
  const initialLoadDone = useRef(false)
  const [meta, setMeta] = useState<{
    ref_code: string | null
    external_id: string | null
    external_source: string | null
    last_synced_at: string | null
  } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setExistingImages((imgs) => {
      const oldIndex = imgs.indexOf(active.id as string)
      const newIndex = imgs.indexOf(over.id as string)
      return arrayMove(imgs, oldIndex, newIndex)
    })
  }

  // Cargar ciudades cuando cambia el país (no en la carga inicial para no resetear)
  useEffect(() => {
    if (!initialLoadDone.current) return
    if (!form.country) { setAvailableCities([]); return }
    fetch(`/api/admin/get-cities?country=${encodeURIComponent(form.country)}`)
      .then((r) => r.json())
      .then((d) => {
        setAvailableCities(d.cities ?? [])
        setUseCustomCity(false)
      })
  }, [form.country])

  useEffect(() => {
    async function loadProperty() {
      const res = await fetch(`/api/admin/get-property/${id}`)
      const data = await res.json()
      if (data.property) {
        const p = data.property
        setForm({
          title: p.title ?? '',
          country: p.country ?? '',
          province: p.province ?? '',
          location: p.location ?? '',
          property_type: p.property_type ?? '',
          price: p.price?.toString() ?? '',
          currency: p.currency ?? 'EUR',
          area_sqm: p.area_sqm?.toString() ?? '',
          bedrooms: p.bedrooms?.toString() ?? '',
          bathrooms: p.bathrooms?.toString() ?? '',
          description: p.description ?? '',
          featured: p.featured ?? false,
          hidden: p.hidden ?? false,
          sold: p.sold ?? false,
          classification: p.classification ?? '',
        })
        const imgs = p.gallery_urls ?? []
        if (imgs.length > 0) {
          setExistingImages(imgs)
        } else if (p.image_url) {
          setExistingImages([p.image_url])
        } else {
          setExistingImages([])
        }
        setMeta({
          ref_code: p.ref_code ?? null,
          external_id: p.external_id ?? null,
          external_source: p.external_source ?? null,
          last_synced_at: p.last_synced_at ?? null,
        })
        // Cargar ciudades del país actual al iniciar
        if (p.country) {
          fetch(`/api/admin/get-cities?country=${encodeURIComponent(p.country)}`)
            .then((r) => r.json())
            .then((d) => {
              setAvailableCities(d.cities ?? [])
              setUseCustomCity(!d.cities?.includes(p.location ?? ''))
            })
        }
      }
      setLoading(false)
      initialLoadDone.current = true
    }
    loadProperty()
  }, [id])

  function set(field: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function makeMainImage(i: number) {
    setExistingImages((prev) => {
      const next = [...prev]
      const [item] = next.splice(i, 1)
      return [item, ...next]
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.country.trim()) {
      setError("El campo 'país' es obligatorio")
      return
    }
    setSaving(true)
    setError('')

    const newImageUrls: string[] = []
    for (const file of newImages) {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd })
      if (!res.ok) {
        const text = await res.text()
        console.error('Upload failed:', text)
        setError('Error subiendo imagen')
        setSaving(false)
        return
      }
      const data = await res.json()
      if (data.error) {
        setError(data.error)
        setSaving(false)
        return
      }
      if (data.url) newImageUrls.push(data.url)
    }

    const allImages = [...existingImages, ...newImageUrls]

    const res = await fetch('/api/admin/update-property', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        ...form,
        gallery_urls: allImages,
        image_url: allImages[0] ?? null,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Error guardando')
      setSaving(false)
      return
    }

    window.location.href = '/admin/propiedades'
  }

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-gray-500 text-sm">Cargando propiedad...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar propiedad</h1>
        <p className="text-sm text-gray-500 mt-1">Modifique los campos y guarde los cambios.</p>
      </div>

      {/* Bloque de identificadores — solo lectura */}
      {meta && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-0.5">Ref. interna</span>
            <span className="font-mono text-gray-700">{meta.ref_code ?? '—'}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-0.5">Cód. HabiHub</span>
            {meta.external_id
              ? <span className="font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{meta.external_id}</span>
              : <span className="text-gray-400">—</span>}
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-0.5">Fuente</span>
            <span className="text-gray-600">{meta.external_source ?? 'manual'}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-0.5">Última sync</span>
            <span className="text-gray-600">
              {meta.last_synced_at
                ? new Date(meta.last_synced_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : '—'}
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Imágenes */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Imágenes</h2>
          {existingImages.length > 0 && (
            <div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>
                Imágenes actuales ({existingImages.length} / 30) — arrastrá para reordenar
              </p>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={existingImages} strategy={rectSortingStrategy}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
                    {existingImages.map((url, i) => (
                      <SortableImage
                        key={url}
                        url={url}
                        index={i}
                        onRemove={() => setExistingImages(prev => prev.filter((_, idx) => idx !== i))}
                        onMakeMain={() => makeMainImage(i)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
          {existingImages.length < 30 ? (
            <>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? [])
                  const remaining = 30 - existingImages.length
                  if (files.length > remaining) {
                    alert(`Solo quedan ${remaining} fotos disponibles (límite 30).`)
                    setNewImages(files.slice(0, remaining))
                  } else {
                    setNewImages(files)
                  }
                  e.target.value = ''
                }}
                className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-[#0a1628] file:text-white hover:file:bg-[#1a2638] cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1.5">
                Añadir nuevas imágenes (se suman a las existentes).{' '}
                {newImages.length > 0 && <span className="text-blue-600">{newImages.length} seleccionada{newImages.length > 1 ? 's' : ''}.</span>}
              </p>
            </>
          ) : (
            <p className="text-xs text-amber-600">Límite de 30 fotos alcanzado.</p>
          )}
        </div>

        {/* Información básica */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Información básica</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Título *</label>
              <input
                required
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {toSentenceCase(form.title) !== form.title && (
                <p className="mt-1 text-xs text-amber-600">
                  Se mostrará como: <span className="font-medium">{toSentenceCase(form.title)}</span>
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de propiedad</label>
              <select
                value={form.property_type}
                onChange={(e) => set('property_type', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Sin especificar</option>
                {Object.entries(propertyTypeMap)
                  .filter(([key]) => !key.includes('-') && !key.includes(' ') || key === 'ground_floor')
                  .map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Clasificación</label>
              <div className="flex gap-4">
                {CLASSIFICATIONS.map((c) => (
                  <label key={c.value} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-700">
                    <input
                      type="radio"
                      name="classification"
                      value={c.value}
                      checked={form.classification === c.value}
                      onChange={() => set('classification', c.value)}
                      className="w-4 h-4"
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Precio */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Precio</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Precio</label>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Divisa</label>
              <select
                value={form.currency}
                onChange={(e) => set('currency', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Ubicación</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">País *</label>
              <select
                required
                value={form.country}
                onChange={(e) => set('country', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="" disabled>Seleccionar país</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                {form.country && !COUNTRIES.includes(form.country) && (
                  <option value={form.country}>{form.country} (valor actual)</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Provincia</label>
              <input
                value={form.province}
                onChange={(e) => set('province', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Málaga"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Ciudad / Zona</label>

              {availableCities.length > 0 && !useCustomCity ? (
                <select
                  value={form.location}
                  onChange={(e) => {
                    if (e.target.value === '__nueva__') {
                      setUseCustomCity(true)
                      set('location', '')
                    } else {
                      set('location', e.target.value)
                    }
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Seleccionar ciudad</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                  <option value="__nueva__">➕ Añadir nueva ciudad...</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={form.location}
                    onChange={(e) => set('location', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                    placeholder="Marbella"
                  />
                  {availableCities.length > 0 && (
                    <button
                      type="button"
                      onClick={() => { setUseCustomCity(false); set('location', '') }}
                      className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-200 whitespace-nowrap"
                    >
                      ← Ver existentes
                    </button>
                  )}
                </div>
              )}

              {form.location && !useCustomCity && availableCities.length > 0 && (
                <p className="text-xs text-green-600 mt-1">✓ Ciudad existente — aparecerá en los filtros</p>
              )}
              {useCustomCity && form.location && (
                <p className="text-xs text-amber-500 mt-1">✓ Nueva ciudad — se creará automáticamente</p>
              )}
            </div>
          </div>
        </div>

        {/* Características */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Características</h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Dormitorios</label>
              <input
                type="number"
                min="0"
                value={form.bedrooms}
                onChange={(e) => set('bedrooms', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Baños</label>
              <input
                type="number"
                min="0"
                value={form.bathrooms}
                onChange={(e) => set('bathrooms', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Superficie (m²)</label>
              <input
                type="number"
                min="0"
                value={form.area_sqm}
                onChange={(e) => set('area_sqm', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Opciones */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Opciones</h2>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700">Marcar como destacada</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.hidden}
                onChange={(e) => set('hidden', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700">Ocultar de la web</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.sold}
                onChange={(e) => set('sold', e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700">Marcar como vendida</span>
            </label>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pb-8">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#0a1628] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1a2638] transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <a
            href="/admin/propiedades"
            className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </a>
        </div>
      </form>
    </div>
  )
}
