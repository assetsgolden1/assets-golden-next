'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, MapPin, Maximize, BedDouble, Bath, FileDown, ChevronRight } from 'lucide-react'
import PropertyGalleryClient from '@/components/PropertyGalleryClient'
import PropertyDescriptionExpand from '@/components/properties/PropertyDescriptionExpand'
import { translatePropertyType, translatePropertyTitle } from '@/lib/propertyTypes'
import { toSentenceCase } from '@/lib/utils/normalizeText'
import type { Property } from '@/types'

interface Props {
  property: Property
}

function formatPrice(price: number | null, currency: string | null): string {
  if (!price) return 'Precio a consultar'
  return price.toLocaleString('es-ES', {
    style: 'currency',
    currency: currency ?? 'EUR',
    maximumFractionDigits: 0,
  })
}

export function PortalPropertyDetail({ property }: Props) {
  const [downloading, setDownloading] = useState(false)

  const gallery = Array.isArray(property.gallery_urls) ? property.gallery_urls : []
  const allImages = [
    ...(property.image_url ? [property.image_url] : []),
    ...gallery,
  ].slice(0, 10)

  async function handleDownload() {
    setDownloading(true)
    try {
      const res = await fetch(`/api/portal/generate-pdf/${property.id}`)
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        alert(json.error ?? 'Error generando el PDF')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${property.slug ?? property.id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Error de red al generar el PDF')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/portal" className="hover:text-gold transition-colors">
            Propiedades
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground line-clamp-1">{property.title}</span>
        </div>
      </nav>

      {/* Volver */}
      <div className="mb-4">
        <Link
          href="/portal"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al catálogo
        </Link>
      </div>

      {/* Galería */}
      {allImages.length > 0 ? (
        <div className="mb-8 rounded-xl overflow-hidden">
          <PropertyGalleryClient images={allImages} title={property.title} />
        </div>
      ) : (
        <div className="mb-8 h-64 bg-muted rounded-xl gradient-navy flex items-center justify-center">
          <span className="font-display text-2xl text-gold/40">Assets Golden</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna principal */}
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {property.property_type && (
              <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
                {translatePropertyType(property.property_type)}
              </span>
            )}
            {(property.location || property.province) && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-gold" />
                {[property.location, property.province].filter(Boolean).join(', ')}
              </span>
            )}
          </div>

          <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4 leading-tight">
            {toSentenceCase(translatePropertyTitle(property.title))}
          </h1>

          <p className="font-display text-2xl font-medium text-gold mb-6">
            {formatPrice(property.price, property.currency)}
          </p>

          {/* Ficha técnica */}
          <div className="flex flex-wrap gap-4 mb-8 p-4 bg-muted/40 rounded-xl">
            {property.area_sqm != null && (
              <div className="flex items-center gap-2 text-sm">
                <Maximize className="h-4 w-4 text-gold" />
                <span>{property.area_sqm} m²</span>
              </div>
            )}
            {property.bedrooms != null && (
              <div className="flex items-center gap-2 text-sm">
                <BedDouble className="h-4 w-4 text-gold" />
                <span>{property.bedrooms} habitaciones</span>
              </div>
            )}
            {property.bathrooms != null && (
              <div className="flex items-center gap-2 text-sm">
                <Bath className="h-4 w-4 text-gold" />
                <span>{property.bathrooms} baños</span>
              </div>
            )}
            {property.country && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gold" />
                <span>{property.country}</span>
              </div>
            )}
          </div>

          {/* Descripción */}
          {property.description && (
            <div className="mb-8">
              <h2 className="font-display text-xl text-foreground mb-3">Descripción</h2>
              <PropertyDescriptionExpand description={property.description} />
            </div>
          )}

          {/* Características */}
          {Array.isArray(property.features) && property.features.length > 0 && (
            <div>
              <h2 className="font-display text-xl text-foreground mb-3">Características</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {property.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Columna lateral: acciones */}
        <div className="space-y-4">
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-6">
            <h3 className="font-display text-lg text-primary mb-4">Acciones</h3>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gold hover:bg-gold/90 text-primary font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              {downloading ? 'Generando PDF...' : 'Descargar PDF'}
            </button>

            <p className="text-xs text-muted-foreground text-center mt-3">
              Ficha completa en PDF para compartir con clientes
            </p>
          </div>

          {/* Referencia */}
          <div className="bg-muted/40 rounded-xl p-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Referencia</span>
              <span className="font-mono text-xs">{property.external_id ?? property.id.slice(0, 8)}</span>
            </div>
            {property.classification && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Clasificación</span>
                <span>{property.classification}</span>
              </div>
            )}
            {property.status && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado</span>
                <span className="capitalize">{property.status}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
