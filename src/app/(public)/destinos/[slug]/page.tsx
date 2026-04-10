import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin } from 'lucide-react'
import { getAllDestinationSlugs, getDestinationBySlug, getProperties } from '@/lib/supabase/queries'
import PropertyCard from '@/components/properties/PropertyCard'
import { buttonVariants } from '@/components/ui/button'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllDestinationSlugs()
  return slugs.map((slug) => ({ slug }))
}

export const dynamicParams = true
export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { data } = await getDestinationBySlug(slug)

  if (!data) return { title: 'Destino — Assets Golden' }

  return {
    title: `Propiedades en ${data.country_name} | Assets Golden`,
    description:
      data.description?.slice(0, 160) ??
      `Descubra las mejores propiedades de lujo en ${data.country_name} con Assets Golden International.`,
  }
}

export default async function DestinoPage({ params }: Props) {
  const { slug } = await params
  const { data: destination } = await getDestinationBySlug(slug)

  if (!destination) notFound()

  const { data: properties } = await getProperties({
    country: destination.country_name,
    limit: 6,
  })

  const highlights = (destination.highlights ?? []) as Array<{
    icon?: string
    title?: string
    value?: string
  }>

  const marketInfo = (destination.market_info ?? {}) as {
    avgPrice?: string
    rentalYield?: string
    priceGrowth?: string
    bestAreas?: string
  }

  return (
    <>
      {/* Hero */}
      <section className="relative h-72 md:h-96 overflow-hidden">
        {destination.hero_image_url ? (
          <Image
            src={destination.hero_image_url}
            alt={destination.country_name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 gradient-navy" />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative container-luxury h-full flex flex-col justify-end pb-10">
          <div className="flex items-center gap-2 text-gold text-xs tracking-widest uppercase mb-3">
            <MapPin className="h-4 w-4" />
            <span>Destino</span>
          </div>
          <h1 className="font-display text-4xl font-semibold text-white md:text-5xl">
            {destination.country_name}
          </h1>
          {destination.tagline && (
            <p className="mt-2 text-white/70 text-sm max-w-xl">{destination.tagline}</p>
          )}
        </div>
      </section>

      {/* Descripción */}
      {destination.description && (
        <section className="section-padding bg-background">
          <div className="container-luxury max-w-3xl">
            <p className="text-muted-foreground leading-relaxed text-base">{destination.description}</p>
          </div>
        </section>
      )}

      {/* Highlights */}
      {highlights.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container-luxury">
            <h2 className="font-display text-2xl font-semibold mb-8 text-center">Por qué {destination.country_name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {highlights.map((h, i) => (
                <div key={i} className="text-center">
                  {h.icon && <div className="text-3xl mb-2">{h.icon}</div>}
                  {h.value && (
                    <p className="font-display text-2xl font-semibold text-gold">{h.value}</p>
                  )}
                  {h.title && (
                    <p className="text-xs text-muted-foreground mt-1">{h.title}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Info de mercado */}
      {Object.keys(marketInfo).length > 0 && (
        <section className="py-12 bg-background">
          <div className="container-luxury">
            <h2 className="font-display text-2xl font-semibold mb-8">Mercado inmobiliario</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {marketInfo.avgPrice && (
                <div className="rounded-xl border border-border p-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Precio medio</p>
                  <p className="font-display text-xl font-semibold text-gold">{marketInfo.avgPrice}</p>
                </div>
              )}
              {marketInfo.rentalYield && (
                <div className="rounded-xl border border-border p-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Rentabilidad</p>
                  <p className="font-display text-xl font-semibold text-gold">{marketInfo.rentalYield}</p>
                </div>
              )}
              {marketInfo.priceGrowth && (
                <div className="rounded-xl border border-border p-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Crecimiento</p>
                  <p className="font-display text-xl font-semibold text-gold">{marketInfo.priceGrowth}</p>
                </div>
              )}
              {marketInfo.bestAreas && (
                <div className="rounded-xl border border-border p-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Mejores zonas</p>
                  <p className="text-sm font-medium">{marketInfo.bestAreas}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Propiedades en este destino */}
      {properties.length > 0 && (
        <section className="section-padding bg-muted/30">
          <div className="container-luxury">
            <h2 className="font-display text-2xl font-semibold mb-8">
              Propiedades en {destination.country_name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => (
                <PropertyCard
                  key={p.id}
                  id={p.id}
                  title={p.title}
                  slug={p.slug ?? p.id}
                  location={p.location ?? destination.country_name}
                  price={p.price}
                  currency={p.currency}
                  area_sqm={p.area_sqm}
                  bedrooms={p.bedrooms}
                  bathrooms={p.bathrooms}
                  property_type={p.property_type}
                  image_url={p.image_url}
                  featured={p.featured}
                />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href={`/propiedades?ubicacion=${encodeURIComponent(destination.country_name)}`}
                className={buttonVariants({ variant: 'goldOutline' })}
              >
                Ver todas las propiedades en {destination.country_name}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="gradient-navy py-16">
        <div className="container-luxury text-center">
          <h2 className="font-display text-2xl font-semibold text-white mb-4">
            ¿Le interesa {destination.country_name}?
          </h2>
          <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">
            Nuestros especialistas le asesorarán sobre las mejores oportunidades y aspectos legales para invertir en {destination.country_name}.
          </p>
          <Link href="/contacto" className={buttonVariants({ variant: 'gold' })}>
            Solicitar información
          </Link>
        </div>
      </section>
    </>
  )
}
