'use client'

import { use, useEffect, useState } from 'react'
import { propertyTypeMap } from '@/lib/propertyTypes'

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF']
const STATUSES = [
  { value: 'active', label: 'Activa' },
  { value: 'available', label: 'Disponible' },
  { value: 'inactive', label: 'Inactiva' },
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
  status: string
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
    status: 'active',
  })
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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
          status: p.status ?? 'active',
        })
        setExistingImages(p.gallery_urls ?? (p.image_url ? [p.image_url] : []))
      }
      setLoading(false)
    }
    loadProperty()
  }, [id])

  function set(field: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function removeExistingImage(url: string) {
    setExistingImages((prev) => prev.filter((u) => u !== url))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const newImageUrls: string[] = []
      for (const file of newImages) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd })
        const data = await res.json()
        if (data.url) newImageUrls.push(data.url)
      }

      const allImages = [...existingImages, ...newImageUrls]

      const res = await fetch('/api/admin/update-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id,
          ...form,
          gallery_urls: allImages,
          image_url: allImages[0] ?? null,
        }),
      })

      const result = await res.json()
      if (!res.ok) {
        setError(result.error ?? 'Error al guardar')
        setSaving(false)
        return
      }

      window.location.href = '/admin/propiedades'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
      setSaving(false)
    }
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Imágenes */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Imágenes</h2>
          {existingImages.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {existingImages.map((url) => (
                <div key={url} className="relative">
                  <img
                    src={url}
                    alt=""
                    className="w-24 h-20 object-cover rounded-lg border border-gray-200"
                    onError={(e) => { e.currentTarget.src = '/placeholder-property.svg' }}
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(url)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setNewImages(Array.from(e.target.files ?? []))}
            className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-[#0a1628] file:text-white hover:file:bg-[#1a2638] cursor-pointer"
          />
          <p className="text-xs text-gray-400 mt-1.5">Añadir nuevas imágenes (se suman a las existentes).</p>
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
            </div>
            <div className="grid grid-cols-2 gap-3">
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
                <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
                <select
                  value={form.status}
                  onChange={(e) => set('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
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
              <label className="block text-xs font-medium text-gray-600 mb-1">País</label>
              <input
                value={form.country}
                onChange={(e) => set('country', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="España"
              />
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
              <input
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Marbella"
              />
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
