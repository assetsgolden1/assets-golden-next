import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import type { ElementType } from 'react'
import { MapPin, ChevronRight, ArrowLeft, Sun, TrendingUp, Building2, Star, Globe, Shield, BarChart3 } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import {
  getAllDestinationSlugs,
  getDestinationBySlug,
  getPropertiesForDestination,
  getCitiesForDestination,
  getPropertyTypesForDestination,
} from '@/lib/supabase/queries'
import { DestinationFilters } from '@/components/DestinationFilters'
import { PaginationBar } from '@/components/PaginationBar'
import PropertyCard from '@/components/properties/PropertyCard'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    ciudad?: string
    tipo?: string
    precio_min?: string
    precio_max?: string
    habitaciones?: string
    orden?: string
    page?: string
  }>
}

export async function generateStaticParams() {
  const slugs = await getAllDestinationSlugs()
  return slugs.map((slug) => ({ slug }))
}

export const dynamicParams = true
export const revalidate = 3600

const ICON_MAP: Record<string, ElementType> = {
  Sun, TrendingUp, Building: Building2, Building2,
  Star, Globe, Shield, BarChart3, MapPin,
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const sp = await searchParams
  const { data } = await getDestinationBySlug(slug)

  if (!data) return { title: 'Destino — Assets Golden' }

  const ciudad = sp.ciudad ?? null
  let title = `Propiedades en ${data.country_name} | Assets Golden`
  let description =
    data.description?.slice(0, 160) ??
    `Descubra las mejores propiedades de lujo en ${data.country_name} con Assets Golden International.`

  if (ciudad) {
    title = `Propiedades en ${ciudad}, ${data.country_name} | Assets Golden`
    description = `Apartamentos, villas y áticos de lujo en ${ciudad}, ${data.country_name}.`
  }

  return {
    title,
    description,
    openGraph: { images: data.hero_image_url ? [{ url: data.hero_image_url }] : [] },
  }
}

const LIMIT = 24

export default async function DestinoPage({ params, searchParams }: Props) {
  const { slug } = await params

  // España tiene su propia página estática
  if (slug === 'espana') redirect('/destinos/espana')

  const { data: destination } = await getDestinationBySlug(slug)
  if (!destination) notFound()

  const sp = await searchParams
  const ciudad       = sp.ciudad ?? ''
  const tipo         = sp.tipo ?? ''
  const precioMin    = sp.precio_min   ? parseInt(sp.precio_min)   : null
  const precioMax    = sp.precio_max   ? parseInt(sp.precio_max)   : null
  const habitaciones = sp.habitaciones ? parseInt(sp.habitaciones) : null
  const orden        = (sp.orden as 'reciente' | 'precio_asc' | 'precio_desc') ?? 'reciente'
  const page         = Math.max(1, parseInt(sp.page ?? '1'))
  const offset       = (page - 1) * LIMIT

  const countryName = destination.country_name

  const [{ data: properties, count }, cities, types] = await Promise.all([
    getPropertiesForDestination(countryName, {
      ciudad: ciudad || undefined,
      tipo:   tipo   || undefined,
      precioMin, precioMax, habitaciones, orden,
      limit: LIMIT, offset,
    }),
    getCitiesForDestination(countryName),
    getPropertyTypesForDestination(countryName),
  ])

  const totalCount = count ?? 0
  const totalPages = Math.ceil(totalCount / LIMIT)

  const highlights = (destination.highlights ?? []) as Array<{
    icon?: string; title?: string; value?: string
  }>
  const marketInfo = (destination.market_info ?? {}) as {
    avgPrice?: string; rentalYield?: string; priceGrowth?: string; bestAreas?: string
  }
  const hasMarketInfo = Object.values(marketInfo).some(Boolean)

  const currentFilters = { ciudad, tipo, precioMin, precioMax, habitaciones, orden }
  const pageParams: Record<string, string | undefined> = {
    ciudad:        ciudad       || undefined,
    tipo:          tipo         || undefined,
    precio_min:    precioMin    ? String(precioMin)    : undefined,
    precio_max:    precioMax    ? String(precioMax)    : undefined,
    habitaciones:  habitaciones ? String(habitaciones) : undefined,
    orden:         orden !== 'reciente' ? orden : undefined,
  }

  return (
    <>
      {/* Breadcrumb */}
      <section className="bg-secondary border-b border-border">
        <div className="container-luxury py-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-gold transition-colors">Inicio</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/destinos" className="hover:text-gold transition-colors">Destinos</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">{destination.country_name}</span>
          {ciudad && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium">{ciudad}</span>
            </>
          )}
        </div>
      </section>

      {/* Hero */}
      <section className="relative h-80 md:h-[420px] overflow-hidden">
        {(destination.hero_image_url ?? destination.card_image_url) ? (
          <Image
            src={(destination.hero_image_url ?? destination.card_image_url)!}
            alt={destination.country_name}
            fill unoptimized className="object-cover" priority sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 gradient-navy" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-primary/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-transparent" />

        <div className="relative container-luxury h-full flex flex-col justify-end pb-12">
          <Link
            href="/destinos"
            className="mb-6 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-gold transition-colors w-fit"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Volver a Destinos
          </Link>
          <div className="flex items-center gap-2 text-gold text-xs tracking-widest uppercase mb-3">
            <MapPin className="h-4 w-4" />
            <span>Destino de inversión</span>
          </div>
          <h1 className="font-display text-4xl font-semibold text-white md:text-5xl lg:text-6xl leading-tight">
            {destination.country_name}
          </h1>
          {destination.tagline && (
            <p className="mt-3 text-white/70 text-base max-w-xl leading-relaxed">
              {destination.tagline}
            </p>
          )}
          <p className="mt-4 inline-flex items-center gap-2 text-gold text-sm font-medium">
            <span className="h-px w-8 bg-gold" />
            {totalCount.toLocaleString('es-ES')}{' '}
            {totalCount === 1 ? 'propiedad disponible' : 'propiedades disponibles'}
          </p>
        </div>
      </section>

      {/* Stats mercado */}
      {(marketInfo.avgPrice || marketInfo.rentalYield || marketInfo.priceGrowth) && (
        <section className="bg-gold py-6">
          <div className="container-luxury">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              {marketInfo.avgPrice && (
                <div>
                  <span className="font-display text-2xl font-bold text-navy">{marketInfo.avgPrice}</span>
                  <p className="text-xs text-navy/70 mt-1 uppercase tracking-wide">Precio medio</p>
                </div>
              )}
              {marketInfo.rentalYield && (
                <div>
                  <span className="font-display text-2xl font-bold text-navy">{marketInfo.rentalYield}</span>
                  <p className="text-xs text-navy/70 mt-1 uppercase tracking-wide">Rentabilidad</p>
                </div>
              )}
              {marketInfo.priceGrowth && (
                <div>
                  <span className="font-display text-2xl font-bold text-navy">{marketInfo.priceGrowth}</span>
                  <p className="text-xs text-navy/70 mt-1 uppercase tracking-wide">Crecimiento</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Descripción */}
      {destination.description && (
        <section className="py-12 bg-background">
          <div className="container-luxury max-w-3xl">
            <p className="text-muted-foreground leading-relaxed text-base">
              {destination.description}
            </p>
          </div>
        </section>
      )}

      {/* Highlights */}
      {highlights.length > 0 && (
        <section className="py-12 bg-secondary">
          <div className="container-luxury">
            <div className="mb-8 text-center">
              <h2 className="font-display text-2xl font-semibold">Por qué {destination.country_name}</h2>
              <div className="divider-gold mx-auto mt-4" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {highlights.map((h, i) => (
                <div key={i} className="card-premium rounded-xl p-6 text-center">
                  {h.icon && (() => {
                    const Icon = ICON_MAP[h.icon!]
                    return Icon
                      ? <Icon className="w-8 h-8 text-gold mx-auto mb-3" />
                      : <div className="text-3xl mb-3">{h.icon}</div>
                  })()}
                  {h.value && <p className="font-display text-2xl font-semibold text-gold">{h.value}</p>}
                  {h.title && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{h.title}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mercado inmobiliario */}
      {hasMarketInfo && (
        <section className="py-12 bg-background">
          <div className="container-luxury">
            <div className="mb-8">
              <p className="text-xs tracking-[0.25em] text-gold uppercase mb-2">Datos del mercado</p>
              <h2 className="font-display text-2xl font-semibold">Mercado inmobiliario</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {marketInfo.avgPrice && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Precio medio</p>
                  <p className="font-display text-xl font-semibold text-gold">{marketInfo.avgPrice}</p>
                </div>
              )}
              {marketInfo.rentalYield && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Rentabilidad</p>
                  <p className="font-display text-xl font-semibold text-gold">{marketInfo.rentalYield}</p>
                </div>
              )}
              {marketInfo.priceGrowth && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Crecimiento</p>
                  <p className="font-display text-xl font-semibold text-gold">{marketInfo.priceGrowth}</p>
                </div>
              )}
              {marketInfo.bestAreas && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Mejores zonas</p>
                  <p className="text-sm font-medium">
                    {Array.isArray(marketInfo.bestAreas)
                      ? (marketInfo.bestAreas as string[]).join(', ')
                      : marketInfo.bestAreas}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Filtros + Grid */}
      <section className="bg-background py-12">
        <div className="container-luxury">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start">
            <DestinationFilters
              slug={slug}
              cities={cities}
              types={types}
              currentFilters={currentFilters}
              totalCount={totalCount}
            />

            <div className="flex-1 min-w-0">
              {/* Mobile trigger lives inside DestinationFilters, pero el contador aquí */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{totalCount.toLocaleString('es-ES')}</span>{' '}
                  {totalCount === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
                  {ciudad ? ` en ${ciudad}` : ` en ${destination.country_name}`}
                </p>
              </div>

              {(properties ?? []).length > 0 ? (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    {(properties ?? []).map(p => (
                      <PropertyCard
                        key={p.id} id={p.id} title={p.title}
                        slug={p.slug ?? p.id}
                        location={p.location ?? p.province ?? countryName}
                        price={p.price} currency={p.currency}
                        area_sqm={p.area_sqm} bedrooms={p.bedrooms}
                        bathrooms={p.bathrooms} property_type={p.property_type}
                        image_url={p.image_url} featured={p.featured}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <PaginationBar
                      currentPage={page}
                      totalPages={totalPages}
                      basePath={`/destinos/${slug}`}
                      currentParams={pageParams}
                    />
                  )}
                </>
              ) : (
                <div className="py-24 text-center">
                  <p className="text-muted-foreground text-lg mb-4">
                    No se encontraron propiedades con estos filtros.
                  </p>
                  <Link href={`/destinos/${slug}`} className={buttonVariants({ variant: 'goldOutline' })}>
                    Ver todas las propiedades en {destination.country_name}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-navy py-16">
        <div className="container-luxury text-center">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-4">Asesoría gratuita</p>
          <h2 className="font-display text-2xl font-semibold text-white mb-4 md:text-3xl">
            ¿Le interesa invertir en {destination.country_name}?
          </h2>
          <p className="text-white/60 text-sm mb-8 max-w-md mx-auto leading-relaxed">
            Nuestros especialistas le asesorarán sobre las mejores oportunidades y aspectos legales para invertir en {destination.country_name}.
          </p>
          <Link href="/contacto" className={buttonVariants({ variant: 'gold', size: 'lg' })}>
            Solicitar información
          </Link>
        </div>
      </section>
    </>
  )
}
