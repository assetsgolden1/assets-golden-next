'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { propertyTypeMap } from '@/lib/propertyTypes'

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF']
const STATUSES = [
  { value: 'active', label: 'Activa' },
  { value: 'available', label: 'Disponible' },
  { value: 'inactive', label: 'Inactiva' },
]

const INPUT_CLS =
  'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

export default function NuevaPropiedadPage() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDev, setIsDev] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)

  // Campos controlados para ubicación
  const [country, setCountry] = useState('')
  const [location, setLocation] = useState('')
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [useCustomCity, setUseCustomCity] = useState(false)

  useEffect(() => {
    if (!country) {
      setAvailableCities([])
      setUseCustomCity(false)
      setLocation('')
      return
    }
    fetch(`/api/admin/get-cities?country=${encodeURIComponent(country)}`)
      .then((r) => r.json())
      .then((d) => {
        setAvailableCities(d.cities ?? [])
        setUseCustomCity(false)
        setLocation('')
      })
  }, [country])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const form = e.currentTarget
      const rawData = new FormData(form)

      let imageUrl: string | null = null
      const file = rawData.get('image') as File | null
      if (file && file.size > 0) {
        const fd = new FormData()
        fd.append('file', file)
        const uploadRes = await fetch('/api/admin/upload-image', { method: 'POST', body: fd })
        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) {
          setErrorMsg(uploadData.error ?? 'Error subiendo imagen')
          setStatus('error')
          return
        }
        imageUrl = uploadData.url
      }

      const res = await fetch('/api/admin/create-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:        rawData.get('title'),
          description:  rawData.get('description'),
          price:        rawData.get('price'),
          currency:     rawData.get('currency'),
          location,          // controlado
          province:     rawData.get('province'),
          country,           // controlado
          bedrooms:     rawData.get('bedrooms'),
          bathrooms:    rawData.get('bathrooms'),
          area_sqm:     rawData.get('area_sqm'),
          property_type: rawData.get('property_type'),
          status:       rawData.get('status'),
          idealista_url: rawData.get('idealista_url'),
          is_development: isDev,
          featured:     isFeatured,
          image_url:    imageUrl,
        }),
      })

      const result = await res.json()
      if (!res.ok) {
        setErrorMsg(result.error ?? 'Error desconocido')
        setStatus('error')
      } else {
        setStatus('success')
        setTimeout(() => router.push('/admin/propiedades'), 1500)
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error inesperado')
      setStatus('error')
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nueva propiedad</h1>
        <p className="text-sm text-gray-500 mt-1">Complete los campos para añadir una propiedad al catálogo.</p>
      </div>

      {status === 'success' && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
          ✓ Propiedad creada correctamente. Redirigiendo...
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* Imagen */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Imagen principal</h2>
          <div className="flex gap-4 items-start">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-32 h-24 object-cover rounded-lg border border-gray-200" />
            ) : (
              <div className="w-32 h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                Sin imagen
              </div>
            )}
            <div className="flex-1">
              <input
                type="file" name="image" accept="image/*" onChange={handleImageChange}
                className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-[#0a1628] file:text-white hover:file:bg-[#1a2638] cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1.5">JPG, PNG, WebP. Máximo recomendado: 2 MB.</p>
            </div>
          </div>
        </div>

        {/* Información básica */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Información básica</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Título *</label>
              <input name="title" required className={INPUT_CLS} placeholder="Ej: Villa con vistas al mar en Marbella" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de propiedad</label>
                <select name="property_type" className={`${INPUT_CLS} bg-white`}>
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
                <select name="status" className={`${INPUT_CLS} bg-white`}>
                  {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
              <textarea
                name="description" rows={4} className={`${INPUT_CLS} resize-none`}
                placeholder="Descripción detallada de la propiedad..."
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
              <input name="price" type="number" min="0" className={INPUT_CLS} placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Divisa</label>
              <select name="currency" className={`${INPUT_CLS} bg-white`}>
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
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={INPUT_CLS}
                placeholder="España"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Provincia</label>
              <input name="province" className={INPUT_CLS} placeholder="Málaga" />
            </div>

            {/* Ciudad dinámica */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Ciudad / Zona</label>

              {availableCities.length > 0 && !useCustomCity ? (
                <select
                  value={location}
                  onChange={(e) => {
                    if (e.target.value === '__nueva__') {
                      setUseCustomCity(true)
                      setLocation('')
                    } else {
                      setLocation(e.target.value)
                    }
                  }}
                  className={`${INPUT_CLS} bg-white`}
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
                    type="text"
                    placeholder="Ej: Mendoza"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={`${INPUT_CLS} flex-1`}
                  />
                  {availableCities.length > 0 && (
                    <button
                      type="button"
                      onClick={() => { setUseCustomCity(false); setLocation('') }}
                      className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-200 whitespace-nowrap"
                    >
                      ← Ver existentes
                    </button>
                  )}
                </div>
              )}

              {location && !useCustomCity && availableCities.length > 0 && (
                <p className="text-xs text-green-600 mt-1">✓ Ciudad existente — aparecerá en los filtros</p>
              )}
              {useCustomCity && location && (
                <p className="text-xs text-amber-500 mt-1">✓ Nueva ciudad — se creará automáticamente</p>
              )}
              {!country && (
                <p className="text-xs text-gray-400 mt-1">Escribe el país primero para ver ciudades disponibles</p>
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
              <input name="bedrooms" type="number" min="0" className={INPUT_CLS} placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Baños</label>
              <input name="bathrooms" type="number" min="0" className={INPUT_CLS} placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Superficie (m²)</label>
              <input name="area_sqm" type="number" min="0" className={INPUT_CLS} placeholder="0" />
            </div>
          </div>
        </div>

        {/* Opciones */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Opciones</h2>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={isDev} onChange={(e) => setIsDev(e.target.checked)} className="w-4 h-4 rounded" />
              <span className="text-sm text-gray-700">Es una promoción / desarrollo</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="w-4 h-4 rounded" />
              <span className="text-sm text-gray-700">Marcar como destacada</span>
            </label>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">URL de Idealista (opcional)</label>
            <input name="idealista_url" type="url" className={INPUT_CLS} placeholder="https://www.idealista.com/inmueble/..." />
          </div>
        </div>

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{errorMsg}</div>
        )}

        <div className="flex gap-3 pb-8">
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="bg-[#0a1628] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1a2638] transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? 'Guardando...' : 'Crear propiedad'}
          </button>
          <a href="/admin/propiedades" className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors">
            Cancelar
          </a>
        </div>
      </form>
    </div>
  )
}
