import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/utils/seoAlternates'
import { Link } from '@/i18n/navigation'
import { getTranslations, getLocale } from 'next-intl/server'
import { formatNumber } from '@/lib/utils/format'
import {
  getProperties,
  getPropertyCountsByCountry,
  getCitiesForDestination,
} from '@/lib/supabase/queries'
import PropertyCard from '@/components/properties/PropertyCard'
import { buttonVariants } from '@/components/ui/button'
import { translateCountry, translateProvince } from '@/lib/utils/translateGeography'
import { PropiedadesFilters } from '@/components/PropiedadesFilters'
import { PaginationBar } from '@/components/PaginationBar'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Properties')
  return {
    title: t('meta_title'),
    description: t('meta_description'),
    alternates: buildAlternates('/propiedades'),
    openGraph: { url: '/propiedades' },
  }
}

export const revalidate = 3600

const PROPERTY_TYPES = [
  'apartment', 'penthouse', 'villa', 'house',
  'townhouse', 'land', 'building', 'rural', 'ground_floor',
]

interface Props {
  searchParams: Promise<{
    tipo?: string; precio_min?: string; precio_max?: string
    ciudad?: string; habitaciones?: string; pais?: string
    zona?: string; orden?: string; page?: string
    destacadas?: string; q?: string
  }>
}

const PAGE_SIZE = 24

export default async function PropiedadesPage({ searchParams }: Props) {
  const params = await searchParams
  const t = await getTranslations('Properties')
  const locale = await getLocale()

  const page   = Math.max(1, parseInt(params.page ?? '1', 10))
  const offset = (page - 1) * PAGE_SIZE
  const precioMin = params.precio_min ? parseInt(params.precio_min, 10) : undefined
  const precioMax = params.precio_max ? parseInt(params.precio_max, 10) : undefined
  const habitaciones = params.habitaciones ? parseInt(params.habitaciones, 10) : undefined
  const orden = params.orden as 'reciente' | 'precio_asc' | 'precio_desc' | undefined
  const soloDestacadas = params.destacadas === 'true'
  const q = params.q?.trim() || undefined

  const [{ data: properties, count }, propertyCounts, cities] = await Promise.all([
    getProperties({
      type: params.tipo || undefined, minPrice: precioMin, maxPrice: precioMax,
      location: params.ciudad || undefined, bedrooms: habitaciones,
      country: params.pais || undefined, zona: params.zona || undefined,
      featured: soloDestacadas || undefined, orden, q, limit: PAGE_SIZE, offset,
    }),
    getPropertyCountsByCountry(),
    params.pais ? getCitiesForDestination(params.pais) : Promise.resolve([] as string[]),
  ])

  const countries = Object.keys(propertyCounts).filter((c) => propertyCounts[c] > 0).sort()
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  const pageParams: Record<string, string | undefined> = {
    tipo: params.tipo || undefined, precio_min: params.precio_min || undefined,
    precio_max: params.precio_max || undefined, ciudad: params.ciudad || undefined,
    habitaciones: params.habitaciones || undefined, pais: params.pais || undefined,
    zona: params.zona || undefined, orden: params.orden || undefined,
    destacadas: params.destacadas || undefined, q: params.q || undefined,
  }

  const currentFilters = {
    pais: params.pais || undefined, zona: params.zona || undefined,
    ciudad: params.ciudad || undefined, tipo: params.tipo || undefined,
    precioMin: precioMin ?? null, precioMax: precioMax ?? null,
    habitaciones: habitaciones ?? null, orden: params.orden || undefined,
    destacadas: params.destacadas || undefined, q: params.q || undefined,
  }

  // Result count label
  const countNum = count ?? 0
  let resultLabel = ''
  if (q) {
    const matchKey = countNum === 1 ? 'results_match_singular' : 'results_match_plural'
    resultLabel = `${formatNumber(countNum, locale)} ${t(matchKey)} "${q}"`
  } else {
    const foundKey = countNum === 1 ? 'results_found_singular' : 'results_found_plural'
    resultLabel = `${formatNumber(countNum, locale)} ${t(foundKey)}`
    if (params.pais) resultLabel += ` ${t('results_in_country', { country: translateCountry(params.pais, locale) })}`
    if (params.ciudad) resultLabel += `${t('results_in_city', { city: params.ciudad })}`
  }

  return (
    <>
      <section className="gradient-navy py-20">
        <div className="container-luxury text-center">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">{t('hero_eyebrow')}</p>
          <h1 className="font-display text-4xl font-semibold text-white md:text-5xl">{t('hero_title')}</h1>
          {countNum > 0 && (
            <p className="mt-4 text-white/50 text-sm">
              {formatNumber(countNum, locale)} {countNum === 1 ? t('results_found_singular') : t('results_found_plural')}
            </p>
          )}
        </div>
      </section>

      <section className="bg-background py-12">
        <div className="container-luxury">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start">
            <PropiedadesFilters
              countries={countries}
              cities={cities}
              types={PROPERTY_TYPES}
              currentFilters={currentFilters}
              totalCount={count ?? 0}
              basePath="/propiedades"
            />

            <div className="flex-1 min-w-0">
              {soloDestacadas && (
                <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-lg border border-gold/30 bg-gold/5">
                  <span className="text-sm font-medium text-foreground">{t('featured_badge')}</span>
                  <Link href="/propiedades" className="text-xs text-muted-foreground hover:text-gold transition-colors ml-auto">
                    {t('remove_featured')}
                  </Link>
                </div>
              )}

              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{resultLabel}</p>
              </div>

              {(properties ?? []).length > 0 ? (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    {(properties ?? []).map((property) => (
                      <PropertyCard
                        key={property.id}
                        id={property.id}
                        title={property.title}
                        slug={property.slug ?? property.id}
                        location={property.location ?? (property.province ? translateProvince(property.province, locale) : '')}
                        price={property.price}
                        currency={property.currency}
                        area_sqm={property.area_sqm}
                        bedrooms={property.bedrooms}
                        bathrooms={property.bathrooms}
                        property_type={property.property_type}
                        image_url={property.image_url}
                        featured={property.featured}
                        sold={property.sold}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <PaginationBar currentPage={page} totalPages={totalPages} basePath="/propiedades" currentParams={pageParams} />
                  )}
                </>
              ) : (
                <div className="py-24 text-center">
                  <p className="text-muted-foreground text-lg mb-4">
                    {q ? t('no_results_query', { q }) : t('no_results_filters')}
                  </p>
                  <Link href="/propiedades" className={buttonVariants({ variant: 'goldOutline' })}>
                    {t('view_all')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
