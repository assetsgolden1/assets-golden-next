'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { propertyTypeMap } from '@/lib/propertyTypes'

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF']
const CLASSIFICATIONS = [
  { value: '', label: 'Normal' },
  { value: 'promotion', label: 'Promoción' },
  { value: 'investment', label: 'Inversión' },
]
const MAX_PHOTOS = 30

const INPUT_CLS =
  'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

export default function NuevaPropiedadPage() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])
  const [isDev, setIsDev] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)
  const [classification, setClassification] = useState('')

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

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    if (galleryFiles.length + selected.length > MAX_PHOTOS) {
      alert(`Máximo ${MAX_PHOTOS} fotos. Ya tenés ${galleryFiles.length}, intentás agregar ${selected.length}.`)
      e.target.value = ''
      return
    }
    const previews = selected.map((f) => URL.createObjectURL(f))
    setGalleryFiles((prev) => [...prev, ...selected])
    setGalleryPreviews((prev) => [...prev, ...previews])
    e.target.value = ''
  }

  function removePhoto(i: number) {
    URL.revokeObjectURL(galleryPreviews[i])
    setGalleryFiles((prev) => prev.filter((_, idx) => idx !== i))
    setGalleryPreviews((prev) => prev.filter((_, idx) => idx !== i))
  }

  function makeMain(i: number) {
    setGalleryFiles((prev) => {
      const next = [...prev]
      const [item] = next.splice(i, 1)
      return [item, ...next]
    })
    setGalleryPreviews((prev) => {
      const next = [...prev]
      const [item] = next.splice(i, 1)
      return [item, ...next]
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const form = e.currentTarget
      const rawData = new FormData(form)

      // Subir fotos secuencialmente
      const uploadedUrls: string[] = []
      for (const file of galleryFiles) {
        const fd = new FormData()
        fd.append('file', file)
        const uploadRes = await fetch('/api/admin/upload-image', { method: 'POST', body: fd })
        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) {
          setErrorMsg(uploadData.error ?? 'Error subiendo imagen')
          setStatus('error')
          return
        }
        if (uploadData.url) uploadedUrls.push(uploadData.url)
      }

      const res = await fetch('/api/admin/create-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:         rawData.get('title'),
          description:   rawData.get('description'),
          price:         rawData.get('price'),
          currency:      rawData.get('currency'),
          location,
          province:      rawData.get('province'),
          country,
          bedrooms:      rawData.get('bedrooms'),
          bathrooms:     rawData.get('bathrooms'),
          area_sqm:      rawData.get('area_sqm'),
          property_type: rawData.get('property_type'),
          idealista_url: rawData.get('idealista_url'),
          is_development: isDev,
          featured:      isFeatured,
          classification: classification || null,
          image_url:     uploadedUrls[0] ?? null,
          gallery_urls:  uploadedUrls,
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
        {/* Imágenes */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-1">Imágenes</h2>
          <p className="text-xs text-gray-400 mb-4">
            La primera foto será la imagen principal. Máximo {MAX_PHOTOS} fotos.
          </p>
          {galleryPreviews.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
              {galleryPreviews.map((src, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img
                    src={src}
                    alt={`Foto ${i + 1}`}
                    style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 6 }}
                  />
                  {i === 0 && (
                    <span style={{
                      position: 'absolute', top: 4, left: 4,
                      backgroundColor: '#D4AF37', color: '#131D2E',
                      fontSize: 10, fontWeight: 700,
                      padding: '2px 6px', borderRadius: 4,
                    }}>
                      Principal
                    </span>
                  )}
                  {i !== 0 && (
                    <button
                      type="button"
                      onClick={() => makeMain(i)}
                      title="Hacer principal"
                      style={{
                        position: 'absolute', bottom: 4, left: 4,
                        backgroundColor: '#D4AF37', color: '#131D2E',
                        border: 'none', borderRadius: 4,
                        fontSize: 10, fontWeight: 700,
                        padding: '2px 5px', cursor: 'pointer',
                      }}
                    >
                      ⭐ Principal
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    style={{
                      position: 'absolute', top: 4, right: 4,
                      backgroundColor: '#dc2626', color: 'white',
                      border: 'none', borderRadius: '50%',
                      width: 20, height: 20, fontSize: 14,
                      cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      padding: 0, lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {galleryFiles.length < MAX_PHOTOS ? (
            <>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesChange}
                className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-[#0a1628] file:text-white hover:file:bg-[#1a2638] cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1.5">
                JPG, PNG, WebP.{' '}
                {galleryFiles.length > 0
                  ? `${galleryFiles.length}/${MAX_PHOTOS} fotos seleccionadas.`
                  : `Podés seleccionar hasta ${MAX_PHOTOS} fotos.`}
              </p>
            </>
          ) : (
            <p className="text-xs text-amber-600">Límite de {MAX_PHOTOS} fotos alcanzado.</p>
          )}
        </div>

        {/* Información básica */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Información básica</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Título *</label>
              <input name="title" required className={INPUT_CLS} placeholder="Ej: Villa con vistas al mar en Marbella" />
            </div>

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
              <label className="block text-xs font-medium text-gray-600 mb-1">Clasificación</label>
              <div className="flex gap-4 pt-1">
                {CLASSIFICATIONS.map((c) => (
                  <label key={c.value} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-700">
                    <input
                      type="radio"
                      name="classification_radio"
                      value={c.value}
                      checked={classification === c.value}
                      onChange={() => setClassification(c.value)}
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
