import type { Metadata } from 'next'
import Link from 'next/link'
import { getProperties } from '@/lib/supabase/queries'
import PropertyCard from '@/components/properties/PropertyCard'
import { buttonVariants } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Obra Nueva y Promociones Inmobiliarias',
  description:
    'Descubra nuestras promociones de obra nueva y desarrollos inmobiliarios exclusivos en España y los principales mercados internacionales.',
  alternates: {
    canonical: '/promociones',
  },
  openGraph: {
    url: '/promociones',
  },
}

export const revalidate = 43200

interface Props {
  searchParams: Promise<{
    tipo?: string
    pagina?: string
  }>
}

const PAGE_SIZE = 12

export default async function PromocionesPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.pagina ?? '1', 10))
  const offset = (page - 1) * PAGE_SIZE

  const { data: properties, count } = await getProperties({
    isDevelopment: true,
    type: params.tipo || undefined,
    limit: PAGE_SIZE,
    offset,
  })

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <>
      {/* Hero */}
      <section className="gradient-navy py-20">
        <div className="container-luxury text-center">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">Desarrollos exclusivos</p>
          <h1 className="font-display text-4xl font-semibold text-white md:text-5xl">
            Obra Nueva y Promociones
          </h1>
          {count > 0 && (
            <p className="mt-4 text-white/50 text-sm">
              {count.toLocaleString('es-ES')} promociones disponibles
            </p>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="section-padding bg-background">
        <div className="container-luxury">
          {properties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((p) => (
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
                    images={p.gallery_urls}
                    featured={p.featured}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  {page > 1 && (
                    <Link
                      href={`/promociones?pagina=${page - 1}`}
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
                      href={`/promociones?pagina=${page + 1}`}
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
              <p className="text-muted-foreground text-lg mb-6">
                No hay promociones disponibles en este momento.
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
