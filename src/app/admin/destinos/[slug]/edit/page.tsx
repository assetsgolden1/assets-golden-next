'use client'

import { use, useEffect, useState } from 'react'
import { ArrowLeft, Upload, Info } from 'lucide-react'
import { compressImage } from '@/lib/utils/compressImage'

// Slugs con bloque editorial extenso gestionado desde el código (no editable desde el panel).
// Keys de EDITORIAL_MAP en src/lib/editorial/destinoEditorial.tsx + 'espana'.
const HARDCODED_EDITORIAL_SLUGS = new Set([
  'mexico',
  'indonesia',
  'emiratos-arabes-unidos',
  'argentina',
  'estados-unidos',
  'costa-rica',
  'reino-unido',
  'ecuador',
  'grecia',
  'paraguay',
  'espana',
])

interface FormState {
  description: string
  description_en: string
  tagline: string
  tagline_en: string
  hero_image_url: string
  card_image_url: string
}

function ImageUploader({
  label,
  value,
  onChange,
  aspectHint,
}: {
  label: string
  value: string
  onChange: (url: string) => void
  aspectHint: string
}) {
  const [uploading, setUploading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar 5 MB')
      return
    }
    setUploading(true)
    const compressed = await compressImage(file)
    const fd = new FormData()
    fd.append('file', compressed)
    fd.append('bucket', 'destination-images')
    const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd })
    const data = await res.json()
    if (!res.ok || data.error) {
      alert('Error subiendo imagen: ' + (data.error ?? 'desconocido'))
      setUploading(false)
      return
    }
    onChange(data.url)
    setUploading(false)
    e.target.value = ''
  }

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-2">{label}</label>
      <div className="flex items-start gap-4">
        {value ? (
          <img
            src={value}
            alt={label}
            className="w-32 h-20 object-cover rounded-lg border border-gray-200 flex-shrink-0"
          />
        ) : (
          <div className="w-32 h-20 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
            <Upload size={18} className="text-gray-400" />
          </div>
        )}
        <div className="flex-1">
          <label
            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 border rounded-lg cursor-pointer transition-colors ${
              uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 border-gray-300'
            }`}
          >
            <Upload size={13} />
            {uploading ? 'Subiendo…' : value ? 'Cambiar imagen' : 'Subir imagen'}
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={handleFile}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-400 mt-1">JPG/PNG/WEBP · máx 5 MB · {aspectHint}</p>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="mt-1 text-xs text-red-400 hover:text-red-600"
            >
              Quitar imagen
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function EditDestinoPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const [countryName, setCountryName] = useState('')
  const [form, setForm] = useState<FormState>({
    description: '',
    description_en: '',
    tagline: '',
    tagline_en: '',
    hero_image_url: '',
    card_image_url: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const hasHardcodedEditorial = HARDCODED_EDITORIAL_SLUGS.has(slug)

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/get-destination/${encodeURIComponent(slug)}`)
      if (!res.ok) { setLoading(false); setError('Destino no encontrado'); return }
      const data = await res.json()
      if (data.destination) {
        const d = data.destination
        setCountryName(d.country_name ?? slug)
        setForm({
          description: d.description ?? '',
          description_en: d.description_en ?? '',
          tagline: d.tagline ?? '',
          tagline_en: d.tagline_en ?? '',
          hero_image_url: d.hero_image_url ?? '',
          card_image_url: d.card_image_url ?? '',
        })
      }
      setLoading(false)
    }
    load()
  }, [slug])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)

    const res = await fetch('/api/admin/update-destination', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        description: form.description || null,
        description_en: form.description_en || null,
        tagline: form.tagline || null,
        tagline_en: form.tagline_en || null,
        hero_image_url: form.hero_image_url || null,
        card_image_url: form.card_image_url || null,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Error guardando')
      setSaving(false)
      return
    }

    setSaving(false)
    setSaved(true)
  }

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <p className="text-gray-500 text-sm">Cargando destino...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <a
        href="/admin/destinos"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
      >
        <ArrowLeft size={14} /> Volver a destinos
      </a>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar destino — {countryName}</h1>
        <p className="text-xs text-gray-400 mt-1 font-mono">slug: {slug}</p>
      </div>

      {hasHardcodedEditorial && (
        <div className="flex gap-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl px-4 py-3 text-sm mb-5">
          <Info size={16} className="flex-shrink-0 mt-0.5" />
          <p>
            Este destino tiene un bloque editorial extenso gestionado desde el código, que no se edita
            desde el panel. Los campos de abajo (subtítulo, descripción e imágenes) sí se guardan
            normalmente.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm mb-4">
          Cambios guardados correctamente.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Subtítulos del hero */}
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Subtítulo del hero</h2>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Subtítulo (Español)
            </label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: El paraíso del Caribe"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Subtítulo (Inglés)
            </label>
            <input
              type="text"
              value={form.tagline_en}
              onChange={(e) => setForm((f) => ({ ...f, tagline_en: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Eg: The Caribbean Paradise"
            />
          </div>
        </div>

        {/* Descripciones */}
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Descripción</h2>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Descripción (Español)
            </label>
            <textarea
              rows={8}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              placeholder="Descripción del destino en español. Usá líneas en blanco para separar párrafos."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Descripción (Inglés)
            </label>
            <textarea
              rows={8}
              value={form.description_en}
              onChange={(e) => setForm((f) => ({ ...f, description_en: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              placeholder="Destination description in English. Use blank lines to separate paragraphs."
            />
          </div>
          <p className="text-xs text-gray-400">
            Los párrafos separados por línea en blanco se muestran como bloques independientes en la web.
          </p>
        </div>

        {/* Imágenes */}
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-5">
          <h2 className="font-semibold text-gray-800">Imágenes</h2>

          <ImageUploader
            label="Imagen hero (cabecera de la página del destino)"
            value={form.hero_image_url}
            onChange={(url) => setForm((f) => ({ ...f, hero_image_url: url }))}
            aspectHint="panorámica, aprox 16:9"
          />

          <ImageUploader
            label="Imagen card (miniatura en el listado de destinos)"
            value={form.card_image_url}
            onChange={(url) => setForm((f) => ({ ...f, card_image_url: url }))}
            aspectHint="aprox 4:3"
          />
        </div>

        <div className="flex gap-3 pb-8">
          <button
            type="submit"
            disabled={saving}
            className="bg-[#0a1628] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1a2638] transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <a
            href="/admin/destinos"
            className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </a>
        </div>
      </form>
    </div>
  )
}
