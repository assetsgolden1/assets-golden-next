import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Maximize, BedDouble, Bath, MapPin, ExternalLink, ChevronRight, ArrowLeft } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { getPropertyBySlug, getAllPropertySlugs } from '@/lib/supabase/queries'
import PropertyGalleryClient from '@/components/PropertyGalleryClient'
import PropertyDescriptionExpand from '@/components/properties/PropertyDescriptionExpand'
import { translatePropertyType, translatePropertyTitle } from '@/lib/propertyTypes'
import PropertyContactModal from '@/components/PropertyContactModal'
import { ZONE_SLUGS } from '@/lib/constants/spainZones'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllPropertySlugs()
  return slugs.map((slug) => ({ slug }))
}

export const dynamicParams = true
export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { data } = await getPropertyBySlug(slug)

  if (!data) return { title: 'Propiedad no encontrada — Assets Golden' }

  return {
    title: data.title,
    description:
      data.description?.slice(0, 160) ??
      `${data.property_type ?? 'Propiedad'} en ${data.location ?? 'España'}. ${data.price ? `Precio: ${data.price.toLocaleString('es-ES')} ${data.currency ?? 'EUR'}.` : ''}`,
    openGraph: {
      images: data.image_url ? [{ url: data.image_url }] : [],
    },
  }
}

function formatPrice(price: number | null, currency: string | null): string {
  if (!price) return 'Precio a consultar'
  return price.toLocaleString('es-ES', {
    style: 'currency',
    currency: currency ?? 'EUR',
    maximumFractionDigits: 0,
  })
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params

  // Redirigir rutas SEO de zona a la página de España con filtros
  if (slug in ZONE_SLUGS) {
    redirect(`/destinos/espana?zona=${slug}`)
  }

  const { data: property } = await getPropertyBySlug(slug)

  if (!property) notFound()

  const gallery = Array.isArray(property.gallery_urls) ? property.gallery_urls : []
  const allImages = [
    ...(property.image_url ? [property.image_url] : []),
    ...gallery,
  ].slice(0, 6)

  // JSON-LD Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description ?? undefined,
    url: `https://assetsgolden.com/propiedades/${slug}`,
    image: allImages,
    ...(property.price && {
      price: property.price,
      priceCurrency: property.currency ?? 'EUR',
    }),
    ...(property.location && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: property.location,
        addressCountry: property.country ?? 'ES',
      },
    }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="container-luxury py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-gold transition-colors">Inicio</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/propiedades" className="hover:text-gold transition-colors">Propiedades</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground line-clamp-1">{property.title}</span>
        </div>
      </nav>

      {/* Botón volver */}
      <div className="container-luxury pb-2">
        <Link
          href="/propiedades"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a propiedades
        </Link>
      </div>

      {/* Galería con hero + thumbnails + lightbox */}
      {allImages.length > 0 ? (
        <PropertyGalleryClient images={allImages} title={property.title} />
      ) : (
        <section className="bg-muted">
          <div className="h-64 gradient-navy flex items-center justify-center">
            <span className="font-display text-2xl text-gold/40">Assets Golden</span>
          </div>
        </section>
      )}

      {/* Contenido */}
      <section className="section-padding bg-background">
        <div className="container-luxury">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Columna principal */}
            <div className="lg:col-span-2">
              {/* Tipo + ubicación */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {property.property_type && (
                  <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
                    {translatePropertyType(property.property_type)}
                  </span>
                )}
                {(property.location || property.province) && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-gold" />
                    {[property.location, property.province]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                )}
              </div>

              <h1 className="font-display text-3xl font-semibold text-foreground md:text-4xl leading-tight">
                {translatePropertyTitle(property.title)}
              </h1>

              {/* Precio */}
              <div className="mt-4 font-display text-2xl font-medium text-gold">
                {formatPrice(property.price, property.currency)}
              </div>

              {/* Stats — 3 columnas */}
              <div className="grid grid-cols-3 gap-4 py-6 border-y border-border mt-6">
                <div className="flex flex-col items-center gap-2 text-center">
                  <BedDouble className="h-6 w-6 text-gold" />
                  <span className="text-2xl font-display font-semibold text-foreground">
                    {property.bedrooms ?? '—'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {property.bedrooms === 1 ? 'Habitación' : 'Habitaciones'}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <Bath className="h-6 w-6 text-gold" />
                  <span className="text-2xl font-display font-semibold text-foreground">
                    {property.bathrooms ?? '—'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {property.bathrooms === 1 ? 'Baño' : 'Baños'}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <Maximize className="h-6 w-6 text-gold" />
                  <span className="text-2xl font-display font-semibold text-foreground">
                    {property.area_sqm ?? '—'}
                  </span>
                  <span className="text-xs text-muted-foreground">m²</span>
                </div>
              </div>

              {/* Descripción */}
              {property.description && (
                <div className="mt-8">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    Descripción
                  </h2>
                  <PropertyDescriptionExpand description={property.description} />
                </div>
              )}

              {/* Features */}
              {Array.isArray(property.features) && property.features.length > 0 && (
                <div className="mt-8">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    Características
                  </h2>
                  <ul className="grid grid-cols-2 gap-2">
                    {(property.features as string[]).map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="text-gold">·</span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Enlace externo */}
              {property.idealista_url && (
                <div className="mt-8">
                  <a
                    href={property.idealista_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ver en Idealista
                  </a>
                </div>
              )}
            </div>

            {/* Sidebar — formulario de contacto */}
            <aside>
              <div className="sticky top-28 card-premium rounded-xl p-6">
                <h3 className="font-display text-xl font-semibold text-foreground mb-1">
                  ¿Le interesa esta propiedad?
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Contacte con un especialista para obtener más información.
                </p>

                <div className="space-y-3">
                  <PropertyContactModal
                    propertyId={property.id}
                    propertyTitle={property.title}
                    propertySlug={property.slug ?? ''}
                  />
                  <a
                    href="tel:+34611853001"
                    className={buttonVariants({ variant: 'navyOutline', size: 'lg', className: 'w-full' })}
                  >
                    Llamar ahora
                  </a>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    Referencia: {property.external_id ?? 'AG-' + property.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
