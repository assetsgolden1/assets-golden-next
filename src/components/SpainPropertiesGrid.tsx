import Link from 'next/link'
import type { Property } from '@/types'
import PropertyCard from '@/components/properties/PropertyCard'
import { buttonVariants } from '@/components/ui/button'

interface CurrentFilters {
  zona?: string
  ciudad?: string
  tipo?: string
  precioMin?: number | null
  precioMax?: number | null
  habitaciones?: number | null
  orden?: string
}

interface SpainPropertiesGridProps {
  properties: Property[]
  totalCount: number
  currentPage: number
  totalPages: number
  currentFilters: CurrentFilters
}

export function SpainPropertiesGrid({
  properties,
  totalCount,
  currentPage,
  totalPages,
  currentFilters,
}: SpainPropertiesGridProps) {
  function buildPageUrl(page: number) {
    const params = new URLSearchParams()
    if (currentFilters.zona)       params.set('zona', currentFilters.zona)
    if (currentFilters.ciudad)     params.set('ciudad', currentFilters.ciudad)
    if (currentFilters.tipo)       params.set('tipo', currentFilters.tipo)
    if (currentFilters.precioMin)  params.set('precio_min', String(currentFilters.precioMin))
    if (currentFilters.precioMax)  params.set('precio_max', String(currentFilters.precioMax))
    if (currentFilters.habitaciones) params.set('habitaciones', String(currentFilters.habitaciones))
    if (currentFilters.orden)      params.set('orden', currentFilters.orden)
    if (page > 1)                  params.set('page', String(page))
    const qs = params.toString()
    return `/destinos/espana${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="flex-1 min-w-0">
      {/* Contador */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{totalCount.toLocaleString('es-ES')}</span>{' '}
          {totalCount === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
        </p>
      </div>

      {properties.length > 0 ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {properties.map(p => (
              <PropertyCard
                key={p.id}
                id={p.id}
                title={p.title}
                slug={p.slug ?? p.id}
                location={p.location ?? p.province ?? 'España'}
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

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={buildPageUrl(currentPage - 1)}
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  ← Anterior
                </Link>
              )}
              <span className="text-sm text-muted-foreground px-4">
                Página {currentPage} de {totalPages}
              </span>
              {currentPage < totalPages && (
                <Link
                  href={buildPageUrl(currentPage + 1)}
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  Siguiente →
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="py-24 text-center">
          <p className="text-muted-foreground text-lg mb-4">
            No se encontraron propiedades con estos filtros.
          </p>
          <Link href="/destinos/espana" className={buttonVariants({ variant: 'goldOutline' })}>
            Ver todas las propiedades en España
          </Link>
        </div>
      )}
    </div>
  )
}
