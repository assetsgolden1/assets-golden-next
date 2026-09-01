import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { buildAlternates } from '@/lib/utils/seoAlternates'
import Link from 'next/link'
import {
  getProperties,
  getPropertyCountsByCountry,
  getCitiesForDestination,
} from '@/lib/supabase/queries'
import PropertyCard from '@/components/properties/PropertyCard'
import { buttonVariants } from '@/components/ui/button'
import { PropiedadesFilters } from '@/components/PropiedadesFilters'
import { PaginationBar } from '@/components/PaginationBar'
import { TrendingUp, Globe, Shield, BarChart3 } from 'lucide-react'

// Con `metadata` estático, /en/inversiones declaraba canonical "/inversiones" y no
// emitía hreflang: Google la trataba como duplicada de la española. Mismo bug
// que se corrigió el 27/08 en otras 10 páginas; estas tres se habían quedado.
export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  return {
    title: 'Inversión Inmobiliaria Internacional',
    description:
      'Oportunidades de inversión inmobiliaria en los mercados más rentables de Europa y América. Análisis de mercado, rentabilidades y asesoramiento personalizado.',
    alternates: buildAlternates('/inversiones', locale),
    openGraph: { url: locale === 'en' ? '/en/inversiones' : '/inversiones' },
  }
}

export const revalidate = 43200

const WHY_INVEST = [
  {
    icon: TrendingUp,
    title: 'Rentabilidades atractivas',
    desc: 'Mercados con yields del 5–9% en zonas premium seleccionadas.',
  },
  {
    icon: Globe,
    title: 'Diversificación geográfica',
    desc: 'Acceso a 15 mercados internacionales con potencial de revalorización.',
  },
  {
    icon: Shield,
    title: 'Inversión segura',
    desc: 'Due diligence completo y asesoramiento legal en cada operación.',
  },
  {
    icon: BarChart3,
    title: 'Análisis de mercado',
    desc: 'Datos actualizados de precios, demanda y perspectivas por zona.',
  },
]

const PROPERTY_TYPES = [
  'apartment', 'penthouse', 'villa', 'townhouse', 'commercial', 'other',
]

interface Props {
  searchParams: Promise<{
    tipo?: string
    precio_min?: string
    precio_max?: string
    ciudad?: string
    habitaciones?: string
    pais?: string
    zona?: string
    orden?: string
    page?: string
  }>
}

const PAGE_SIZE = 24

export default async function InversionesPage({ searchParams }: Props) {
  const params = await searchParams
  // `page` debe coincidir con el parámetro que emite PaginationBar.
  const page   = Math.max(1, parseInt(params.page ?? '1', 10))
  const offset = (page - 1) * PAGE_SIZE

  const precioMin     = params.precio_min   ? parseInt(params.precio_min, 10)   : undefined
  const precioMax     = params.precio_max   ? parseInt(params.precio_max, 10)   : undefined
  const habitaciones  = params.habitaciones ? parseInt(params.habitaciones, 10) : undefined
  const orden         = params.orden as 'reciente' | 'precio_asc' | 'precio_desc' | undefined

  const [{ data: properties, count }, propertyCounts, cities] = await Promise.all([
    getProperties({
      type:         params.tipo    || undefined,
      minPrice:     precioMin,
      maxPrice:     precioMax,
      location:     params.ciudad  || undefined,
      bedrooms:     habitaciones,
      country:      params.pais    || undefined,
      zona:         params.zona    || undefined,
      orden,
      limit:        PAGE_SIZE,
      offset,
      classification: 'investment',
    }),
    getPropertyCountsByCountry(),
    params.pais ? getCitiesForDestination(params.pais) : Promise.resolve([] as string[]),
  ])

  const countries = Object.keys(propertyCounts)
    .filter((c) => propertyCounts[c] > 0)
    .sort()

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  const pageParams: Record<string, string | undefined> = {
    tipo:         params.tipo         || undefined,
    precio_min:   params.precio_min   || undefined,
    precio_max:   params.precio_max   || undefined,
    ciudad:       params.ciudad       || undefined,
    habitaciones: params.habitaciones || undefined,
    pais:         params.pais         || undefined,
    zona:         params.zona         || undefined,
    orden:        params.orden        || undefined,
  }

  const currentFilters = {
    pais:         params.pais         || undefined,
    zona:         params.zona         || undefined,
    ciudad:       params.ciudad       || undefined,
    tipo:         params.tipo         || undefined,
    precioMin:    precioMin ?? null,
    precioMax:    precioMax ?? null,
    habitaciones: habitaciones ?? null,
    orden:        params.orden        || undefined,
  }

  return (
    <>
      {/* Hero */}
      <section className="gradient-navy py-20">
        <div className="container-luxury text-center">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">Inversión inmobiliaria</p>
          <h1 className="font-display text-4xl font-semibold text-white md:text-5xl">
            Oportunidades de Inversión
          </h1>
          <p className="mt-4 text-white/60 max-w-xl mx-auto text-sm">
            Apartamentos, áticos, villas y locales comerciales en los mercados más rentables del mundo, con el respaldo de nuestro equipo de expertos.
          </p>
          {(count ?? 0) > 0 && (
            <p className="mt-3 text-white/40 text-sm">
              {(count ?? 0).toLocaleString('es-ES')} propiedades disponibles
            </p>
          )}
        </div>
      </section>

      {/* Por qué invertir */}
      <section className="py-14 bg-muted/30">
        <div className="container-luxury">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {WHY_INVEST.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/10">
                  <Icon className="h-7 w-7 text-gold" />
                </div>
                <h3 className="font-display text-base font-semibold mb-2">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Layout filtros + grid */}
      <section className="bg-background py-12">
        <div className="container-luxury">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start">
            <PropiedadesFilters
              countries={countries}
              cities={cities}
              types={PROPERTY_TYPES}
              currentFilters={currentFilters}
              totalCount={count ?? 0}
              basePath="/inversiones"
            />

            <div className="flex-1 min-w-0">
              {/* Contador */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {(count ?? 0).toLocaleString('es-ES')}
                  </span>{' '}
                  {(count ?? 0) === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
                  {params.pais && ` en ${params.pais}`}
                  {params.ciudad && `, ${params.ciudad}`}
                </p>
              </div>

              {(properties ?? []).length > 0 ? (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    {(properties ?? []).map((p) => (
                      <PropertyCard
                        key={p.id}
                        id={p.id}
                        title={p.title}
                        slug={p.slug ?? p.id}
                        location={p.location ?? p.country ?? 'Internacional'}
                        price={p.price}
                        currency={p.currency}
                        area_sqm={p.area_sqm}
                        bedrooms={p.bedrooms}
                        bathrooms={p.bathrooms}
                        property_type={p.property_type}
                        image_url={p.image_url}
                        images={p.gallery_urls}
                        featured={p.featured}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <PaginationBar
                      currentPage={page}
                      totalPages={totalPages}
                      basePath="/inversiones"
                      currentParams={pageParams}
                    />
                  )}
                </>
              ) : (
                <div className="py-24 text-center">
                  <p className="text-muted-foreground text-lg mb-4">
                    No hay propiedades disponibles con los filtros seleccionados.
                  </p>
                  <Link href="/inversiones" className={buttonVariants({ variant: 'goldOutline' })}>
                    Ver todas las oportunidades
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA análisis inversión */}
      <section className="gradient-navy py-16">
        <div className="container-luxury text-center">
          <h2 className="font-display text-2xl font-semibold text-white mb-4">
            ¿Quiere un análisis personalizado?
          </h2>
          <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">
            Nuestro equipo le preparará un informe detallado con las mejores oportunidades según su perfil inversor.
          </p>
          <Link href="/contacto" className={buttonVariants({ variant: 'gold' })}>
            Solicitar análisis de inversión
          </Link>
        </div>
      </section>
    </>
  )
}
