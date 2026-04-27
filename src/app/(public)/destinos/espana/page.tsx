import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, ChevronRight, ArrowLeft } from 'lucide-react'
import {
  getDestinationBySlug,
  getPropertiesForSpain,
  getPropertyTypesForSpain,
} from '@/lib/supabase/queries'
import {
  ZONE_SLUGS,
  getCitiesInZone,
} from '@/lib/constants/spainZones'
import { SpainFilters } from '@/components/SpainFilters'
import { SpainPropertiesGrid } from '@/components/SpainPropertiesGrid'

export const revalidate = 3600

interface Props {
  searchParams: Promise<{
    zona?: string
    ciudad?: string
    tipo?: string
    precio_min?: string
    precio_max?: string
    habitaciones?: string
    orden?: string
    page?: string
  }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const zoneName = params.zona ? ZONE_SLUGS[params.zona] : null
  const ciudad = params.ciudad ?? null

  let title = 'Propiedades en España | Assets Golden'
  let description = 'Descubre las mejores propiedades de lujo en España. Villas, apartamentos y áticos frente al mar.'

  if (zoneName && ciudad) {
    title = `Propiedades en ${ciudad}, ${zoneName} | Assets Golden`
    description = `Apartamentos, villas y áticos de lujo en ${ciudad}. Expertos en ${zoneName}.`
  } else if (zoneName) {
    title = `Propiedades en ${zoneName} | Assets Golden`
    description = `Las mejores propiedades de lujo en ${zoneName}. Villas, apartamentos y áticos.`
  }

  return {
    title,
    description,
    openGraph: { title, description },
  }
}

export default async function EspanaPage({ searchParams }: Props) {
  const params = await searchParams

  const zona         = params.zona ?? ''
  const ciudad       = params.ciudad ?? ''
  const tipo         = params.tipo ?? ''
  const precioMin    = params.precio_min ? parseInt(params.precio_min) : null
  const precioMax    = params.precio_max ? parseInt(params.precio_max) : null
  const habitaciones = params.habitaciones ? parseInt(params.habitaciones) : null
  const orden        = (params.orden as 'reciente' | 'precio_asc' | 'precio_desc') ?? 'reciente'
  const page         = Math.max(1, parseInt(params.page ?? '1'))
  const limit        = 24
  const offset       = (page - 1) * limit

  const zoneName = zona ? ZONE_SLUGS[zona] : undefined

  const [{ data: destination }, { data: properties, count }, types] = await Promise.all([
    getDestinationBySlug('espana'),
    getPropertiesForSpain({
      zona: zoneName,
      ciudad: ciudad || undefined,
      tipo: tipo || undefined,
      precioMin,
      precioMax,
      habitaciones,
      orden,
      limit,
      offset,
    }),
    getPropertyTypesForSpain(),
  ])

  const totalCount = count ?? 0
  const totalPages = Math.ceil(totalCount / limit)

  const citiesForFilter = zona && zoneName
    ? getCitiesInZone(zoneName).sort()
    : []

  const marketInfo = (destination?.market_info ?? {}) as {
    avgPrice?: string
    rentalYield?: string
    priceGrowth?: string
  }

  const currentFilters = { zona, ciudad, tipo, precioMin, precioMax, habitaciones, orden }

  return (
    <>
      {/* Breadcrumb */}
      <section className="bg-secondary border-b border-border">
        <div className="container-luxury py-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-gold transition-colors">Inicio</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/destinos" className="hover:text-gold transition-colors">Destinos</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">España</span>
          {zona && zoneName && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium">{zoneName}</span>
            </>
          )}
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
        {destination?.hero_image_url ? (
          <Image
            src={destination.hero_image_url}
            alt="España"
            fill
            className="object-cover"
            priority
            sizes="100vw"
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
            {zoneName && ciudad
              ? `${ciudad}, ${zoneName}`
              : zoneName
              ? `España — ${zoneName}`
              : 'España'}
          </h1>
          {destination?.tagline && !zona && (
            <p className="mt-3 text-white/70 text-base max-w-xl leading-relaxed">
              {destination.tagline}
            </p>
          )}
          <p className="mt-4 inline-flex items-center gap-2 text-gold text-sm font-medium">
            <span className="h-px w-8 bg-gold" />
            {totalCount.toLocaleString('es-ES')} {totalCount === 1 ? 'propiedad disponible' : 'propiedades disponibles'}
          </p>
        </div>
      </section>

      {/* Stats mercado */}
      {!zona && (marketInfo.avgPrice || marketInfo.rentalYield || marketInfo.priceGrowth) && (
        <section className="bg-gold py-6 w-full overflow-hidden">
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

      {/* Layout filtros + grid */}
      <section className="container-luxury py-12">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start">
          <SpainFilters
            zones={Object.entries(ZONE_SLUGS)}
            cities={citiesForFilter}
            types={types}
            currentFilters={currentFilters}
          />

          <SpainPropertiesGrid
            properties={properties ?? []}
            totalCount={totalCount}
            currentPage={page}
            totalPages={totalPages}
            currentFilters={currentFilters}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-navy py-16">
        <div className="container-luxury text-center">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-4">Asesoría gratuita</p>
          <h2 className="font-display text-2xl font-semibold text-white mb-4 md:text-3xl">
            ¿Le interesa invertir en España?
          </h2>
          <p className="text-white/60 text-sm mb-8 max-w-md mx-auto leading-relaxed">
            Nuestros especialistas le asesorarán sobre las mejores oportunidades y aspectos legales.
          </p>
          <Link href="/contacto" className="btn-gold rounded-lg px-6 py-3 text-sm font-medium">
            Solicitar información
          </Link>
        </div>
      </section>
    </>
  )
}
