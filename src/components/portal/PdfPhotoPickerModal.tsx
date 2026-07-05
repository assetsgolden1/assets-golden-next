'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X, FileDown, Loader2 } from 'lucide-react'
import { MAX_PDF_PHOTOS } from '@/lib/portal/propertyImages'

interface Props {
  open: boolean
  onClose: () => void
  images: string[]
  propertyId: string
  /** Nombre base del archivo (sin extensión), típicamente el slug. */
  downloadName: string
}

/**
 * Modal para que el agente elija hasta {@link MAX_PDF_PHOTOS} fotos (y su orden)
 * antes de generar la ficha PDF. El orden de selección es el orden del PDF:
 * la 1ª elegida es la portada. Manda los índices al endpoint por POST.
 */
export function PdfPhotoPickerModal({ open, onClose, images, propertyId, downloadName }: Props) {
  // Selección inicial: las primeras fotos (hasta el tope), en orden.
  const [selected, setSelected] = useState<number[]>(() =>
    images.slice(0, Math.min(MAX_PDF_PHOTOS, images.length)).map((_, i) => i),
  )
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  // Cerrar con Escape.
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !generating) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, generating, onClose])

  if (!open) return null

  const atMax = selected.length >= MAX_PDF_PHOTOS

  function toggle(i: number) {
    setError('')
    setSelected(prev => {
      if (prev.includes(i)) return prev.filter(x => x !== i)
      if (prev.length >= MAX_PDF_PHOTOS) return prev
      return [...prev, i]
    })
  }

  async function handleGenerate() {
    if (selected.length === 0 || generating) return
    setGenerating(true)
    setError('')
    try {
      const res = await fetch(`/api/portal/generate-pdf/${propertyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIndices: selected }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setError(json.error ?? `No se pudo generar el PDF (error ${res.status}).`)
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${downloadName}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      onClose()
    } catch {
      setError('Error de red al generar el PDF. Revisá tu conexión e intentá de nuevo.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={() => !generating && onClose()}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="font-display text-xl text-primary">Elegí las fotos del PDF</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Hasta {MAX_PDF_PHOTOS} fotos, en el orden que las marques. Se agregan grandes al final del PDF, después de la descripción.
            </p>
          </div>
          <button
            onClick={() => !generating && onClose()}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Grid de fotos */}
        <div className="grid grid-cols-2 gap-3 overflow-y-auto p-6 sm:grid-cols-3">
          {images.map((url, i) => {
            const order = selected.indexOf(i)
            const isSelected = order !== -1
            const disabled = !isSelected && atMax
            return (
              <button
                key={i}
                type="button"
                onClick={() => toggle(i)}
                disabled={disabled}
                className={`group relative block overflow-hidden rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-gold ring-2 ring-gold/30'
                    : disabled
                      ? 'border-transparent opacity-40'
                      : 'border-transparent hover:border-gold/50'
                }`}
              >
                <Image
                  src={url}
                  alt={`Foto ${i + 1}`}
                  width={300}
                  height={200}
                  style={{ height: '7rem', width: '100%', objectFit: 'cover', display: 'block' }}
                />
                {isSelected && (
                  <span className="pointer-events-none absolute inset-0 bg-gold/15" />
                )}
                {/* Número de orden en el PDF */}
                {isSelected && (
                  <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-primary shadow">
                    {order + 1}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4">
          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">
              <strong className="text-foreground">{selected.length}</strong> / {MAX_PDF_PHOTOS} seleccionadas
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => !generating && onClose()}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerate}
                disabled={selected.length === 0 || generating}
                className="flex items-center gap-2 rounded-lg bg-gold px-5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-gold/90 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generando PDF...
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4" />
                    Generar PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
