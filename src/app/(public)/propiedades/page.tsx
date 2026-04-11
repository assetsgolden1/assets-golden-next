import type { Metadata } from 'next'
import Link from 'next/link'
import { getProperties } from '@/lib/supabase/queries'
import PropertyCard from '@/components/properties/PropertyCard'
import { buttonVariants } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Propiedades de Lujo en Barcelona | Assets Golden',
  description:
    'Encuentre su propiedad ideal entre nuestra selección exclusiva de pisos, áticos, villas y casas de lujo en Barcelona y todo el mundo.',
}

export const revalidate = 3600

interface Props {
  searchParams: Promise<{
    tipo?: string
    precio?: string
    minPrecio?: string
    maxPrecio?: string
    ubicacion?: string
    habitaciones?: string
    pagina?: string
  }>
}

const PROPERTY_TYPES = [
  { value: '', label: 'Todos los tipos' },
  { value: 'apartment', label: 'Apartamento' },
  { value: 'penthouse', label: 'Ático' },
  { value: 'villa', label: 'Villa' },
  { value: 'house', label: 'Casa' },
  { value: 'townhouse', label: 'Adosado' },
  { value: 'land', label: 'Terreno' },
  { value: 'building', label: 'Edificio' },
  { value: 'rural', label: 'Finca rural' },
  { value: 'ground_floor', label: 'Planta baja' },
]

const PRICE_RANGES = [
  { value: '', label: 'Cualquier precio' },
  { value: '0-500000', label: 'Hasta 500.000€' },
  { value: '500000-1000000', label: '500.000€ - 1.000.000€' },
  { value: '1000000-3000000', label: '1.000.000€ - 3.000.000€' },
  { value: '3000000-', label: 'Más de 3.000.000€' },
]

const PAGE_SIZE = 12

export default async function PropiedadesPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.pagina ?? '1', 10))
  const offset = (page - 1) * PAGE_SIZE

  // Parse price range: "500000-1000000" or "3000000-" (no max)
  let minPrice: number | undefined
  let maxPrice: number | undefined
  if (params.precio) {
    const [minStr, maxStr] = params.precio.split('-')
    if (minStr) minPrice = parseInt(minStr, 10) || undefined
    if (maxStr) maxPrice = parseInt(maxStr, 10) || undefined
  } else {
    if (params.minPrecio) minPrice = parseInt(params.minPrecio, 10)
    if (params.maxPrecio) maxPrice = parseInt(params.maxPrecio, 10)
  }

  const { data: properties, count } = await getProperties({
    type: params.tipo || undefined,
    minPrice,
    maxPrice,
    location: params.ubicacion || undefined,
    bedrooms: params.habitaciones ? parseInt(params.habitaciones, 10) : undefined,
    limit: PAGE_SIZE,
    offset,
  })

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  function buildUrl(overrides: Record<string, string | undefined>) {
    const merged = {
      tipo: params.tipo,
      ubicacion: params.ubicacion,
      precio: params.precio,
      habitaciones: params.habitaciones,
      ...overrides,
    }
    const qs = Object.entries(merged)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join('&')
    return `/propiedades${qs ? `?${qs}` : ''}`
  }

  return (
    <>
      {/* Header */}
      <section className="gradient-navy py-20">
        <div className="container-luxury text-center">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">
            Selección exclusiva
          </p>
          <h1 className="font-display text-4xl font-semibold text-white md:text-5xl">
            Propiedades de lujo
          </h1>
          {count > 0 && (
            <p className="mt-4 text-white/50 text-sm">
              {count.toLocaleString('es-ES')} propiedades disponibles
            </p>
          )}
        </div>
      </section>

      {/* Filtros */}
      <section className="sticky top-20 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="container-luxury py-3">
          <form method="GET" action="/propiedades" className="flex flex-wrap gap-3 items-center">
            {/* Tipo */}
            <select
              name="tipo"
              defaultValue={params.tipo ?? ''}
              className="rounded-lg border border-border bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-gold/50 focus:border-gold"
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            {/* Precio */}
            <select
              name="precio"
              defaultValue={params.precio ?? ''}
              className="rounded-lg border border-border bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-gold/50 focus:border-gold"
            >
              {PRICE_RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>

            {/* Ubicación */}
            <input
              name="ubicacion"
              type="text"
              placeholder="Ciudad o zona"
              defaultValue={params.ubicacion ?? ''}
              className="w-36 rounded-lg border border-border bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-gold/50 focus:border-gold"
            />

            {/* Habitaciones */}
            <select
              name="habitaciones"
              defaultValue={params.habitaciones ?? ''}
              className="rounded-lg border border-border bg-background px-3 py-2 text-xs focus:ring-2 focus:ring-gold/50 focus:border-gold"
            >
              <option value="">Hab.</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}+
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="btn-gold rounded-lg px-4 py-2 text-xs font-medium"
            >
              Buscar
            </button>

            {(params.tipo || params.precio || params.minPrecio || params.maxPrecio || params.ubicacion || params.habitaciones) && (
              <Link
                href="/propiedades"
                className="text-xs text-muted-foreground hover:text-gold transition-colors"
              >
                Limpiar filtros
              </Link>
            )}
          </form>
        </div>
      </section>

      {/* Grid */}
      <section className="section-padding bg-background">
        <div className="container-luxury">
          {properties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    id={property.id}
                    title={property.title}
                    slug={property.slug ?? property.id}
                    location={property.location ?? property.province ?? 'España'}
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

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  {page > 1 && (
                    <Link
                      href={buildUrl({ pagina: String(page - 1) })}
                      className={buttonVariants({ variant: 'outline', size: 'sm' })}
                    >
                      ← Anterior
                    </Link>
                  )}
                  <span className="text-sm text-muted-foreground px-4">
                    Página {page} de {totalPages}
                  </span>
                  {page < totalPages && (
                    <Link
                      href={buildUrl({ pagina: String(page + 1) })}
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
              <Link href="/propiedades" className={buttonVariants({ variant: 'goldOutline' })}>
                Ver todas las propiedades
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
