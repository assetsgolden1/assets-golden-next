import type { Metadata } from 'next'
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

export const metadata: Metadata = {
  title: 'Propiedades de Lujo | Assets Golden',
  description:
    'Encuentre su propiedad ideal entre nuestra selección exclusiva de pisos, áticos, villas y casas de lujo en todo el mundo.',
}

export const revalidate = 3600

const PROPERTY_TYPES = [
  'apartment', 'penthouse', 'villa', 'house',
  'townhouse', 'land', 'building', 'rural', 'ground_floor',
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
    pagina?: string
    destacadas?: string
  }>
}

const PAGE_SIZE = 24

export default async function PropiedadesPage({ searchParams }: Props) {
  const params = await searchParams
  const page   = Math.max(1, parseInt(params.pagina ?? '1', 10))
  const offset = (page - 1) * PAGE_SIZE

  const precioMin = params.precio_min ? parseInt(params.precio_min, 10) : undefined
  const precioMax = params.precio_max ? parseInt(params.precio_max, 10) : undefined
  const habitaciones = params.habitaciones ? parseInt(params.habitaciones, 10) : undefined
  const orden = params.orden as 'reciente' | 'precio_asc' | 'precio_desc' | undefined

  const soloDestacadas = params.destacadas === 'true'

  const [{ data: properties, count }, propertyCounts, cities] = await Promise.all([
    getProperties({
      type:     params.tipo    || undefined,
      minPrice: precioMin,
      maxPrice: precioMax,
      location: params.ciudad  || undefined,
      bedrooms: habitaciones,
      country:  params.pais    || undefined,
      zona:     params.zona    || undefined,
      featured: soloDestacadas || undefined,
      orden,
      limit:  PAGE_SIZE,
      offset,
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
    destacadas:   params.destacadas   || undefined,
  }

  const currentFilters = {
    pais:          params.pais        || undefined,
    zona:          params.zona        || undefined,
    ciudad:        params.ciudad      || undefined,
    tipo:          params.tipo        || undefined,
    precioMin:     precioMin ?? null,
    precioMax:     precioMax ?? null,
    habitaciones:  habitaciones ?? null,
    orden:         params.orden       || undefined,
    destacadas:    params.destacadas  || undefined,
  }

  return (
    <>
      {/* Header */}
      <section className="gradient-navy py-20">
        <div className="container-luxury text-center">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">Selección exclusiva</p>
          <h1 className="font-display text-4xl font-semibold text-white md:text-5xl">
            Propiedades de lujo
          </h1>
          {(count ?? 0) > 0 && (
            <p className="mt-4 text-white/50 text-sm">
              {(count ?? 0).toLocaleString('es-ES')} propiedades disponibles
            </p>
          )}
        </div>
      </section>

      {/* Layout filtros + grid */}
      <section className="bg-background py-12">
        <div className="container-luxury">
          <div className="flex gap-8 items-start">
            <PropiedadesFilters
              countries={countries}
              cities={cities}
              types={PROPERTY_TYPES}
              currentFilters={currentFilters}
              totalCount={count ?? 0}
              basePath="/propiedades"
            />

            <div className="flex-1 min-w-0">
              {/* Badge destacadas activo */}
              {soloDestacadas && (
                <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-lg border border-gold/30 bg-gold/5">
                  <span className="text-sm font-medium text-foreground">
                    ⭐ Mostrando solo propiedades destacadas
                  </span>
                  <Link
                    href="/propiedades"
                    className="text-xs text-muted-foreground hover:text-gold transition-colors ml-auto"
                  >
                    ✕ Quitar filtro
                  </Link>
                </div>
              )}

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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(properties ?? []).map((property) => (
                      <PropertyCard
                        key={property.id}
                        id={property.id}
                        title={property.title}
                        slug={property.slug ?? property.id}
                        location={property.location ?? property.province ?? ''}
                        price={property.price}
                        currency={property.currency}
                        area_sqm={property.area_sqm}
                        bedrooms={property.bedrooms}
                        bathrooms={property.bathrooms}
                        property_type={property.property_type}
                        image_url={property.image_url}
                        featured={property.featured}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <PaginationBar
                      currentPage={page}
                      totalPages={totalPages}
                      basePath="/propiedades"
                      currentParams={{ ...pageParams, pagina: undefined }}
                    />
                  )}
                </>
              ) : (
                <div className="py-24 text-center">
                  <p className="text-muted-foreground text-lg mb-4">
                    No se encontraron propiedades con estos filtros.
                  </p>
                  <Link href="/propiedades" className={buttonVariants({ variant: 'goldOutline' })}>
                    Ver todas las propiedades
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
