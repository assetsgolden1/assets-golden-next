import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Maximize, BedDouble, Bath, MapPin, ExternalLink } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { getPropertyBySlug, getAllPropertySlugs } from '@/lib/supabase/queries'

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

const typeLabels: Record<string, string> = {
  villa: 'Villa',
  apartment: 'Apartamento',
  house: 'Casa',
  penthouse: 'Ático',
  land: 'Terreno',
  building: 'Edificio',
  hotel: 'Hotel',
  rural: 'Finca rural',
  townhouse: 'Adosado',
  warehouse: 'Local / Nave',
  business: 'Traspaso',
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params
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

      {/* Galería hero */}
      <section className="bg-muted">
        {allImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 max-h-[70vh]">
            <div className="relative aspect-[4/3] md:aspect-auto">
              <Image
                src={allImages[0]}
                alt={property.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            {allImages.length > 1 && (
              <div className="hidden md:grid grid-cols-2 gap-1">
                {allImages.slice(1, 5).map((img, i) => (
                  <div key={i} className="relative">
                    <Image
                      src={img}
                      alt={`${property.title} — imagen ${i + 2}`}
                      fill
                      className="object-cover"
                      sizes="25vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-64 gradient-navy flex items-center justify-center">
            <span className="font-display text-2xl text-gold/40">Assets Golden</span>
          </div>
        )}
      </section>

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
                    {typeLabels[property.property_type] ?? property.property_type}
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
                {property.title}
              </h1>

              {/* Precio */}
              <div className="mt-4 font-display text-2xl font-medium text-gold">
                {formatPrice(property.price, property.currency)}
              </div>

              {/* Stats */}
              <div className="mt-6 flex flex-wrap gap-6 py-6 border-y border-border">
                {property.area_sqm && (
                  <div className="flex items-center gap-2 text-foreground">
                    <Maximize className="h-5 w-5 text-gold" />
                    <span className="font-medium">{property.area_sqm} m²</span>
                  </div>
                )}
                {property.bedrooms && (
                  <div className="flex items-center gap-2 text-foreground">
                    <BedDouble className="h-5 w-5 text-gold" />
                    <span className="font-medium">
                      {property.bedrooms}{' '}
                      {property.bedrooms === 1 ? 'habitación' : 'habitaciones'}
                    </span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-2 text-foreground">
                    <Bath className="h-5 w-5 text-gold" />
                    <span className="font-medium">
                      {property.bathrooms}{' '}
                      {property.bathrooms === 1 ? 'baño' : 'baños'}
                    </span>
                  </div>
                )}
              </div>

              {/* Descripción */}
              {property.description && (
                <div className="mt-8">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                    Descripción
                  </h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {property.description}
                  </p>
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
                  <Link
                    href={`/contacto?propiedad=${encodeURIComponent(property.title)}`}
                    className={buttonVariants({ variant: 'gold', size: 'lg', className: 'w-full' })}
                  >
                    Solicitar información
                  </Link>
                  <a
                    href="tel:+34611853001"
                    className={buttonVariants({ variant: 'navyOutline', size: 'lg', className: 'w-full' })}
                  >
                    Llamar ahora
                  </a>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    Referencia: {property.external_id ?? property.id.slice(0, 8).toUpperCase()}
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
