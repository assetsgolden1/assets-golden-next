import type { Metadata } from 'next'
import Link from 'next/link'
import { getProperties, getDestinations } from '@/lib/supabase/queries'
import PropertyCard from '@/components/properties/PropertyCard'
import { buttonVariants } from '@/components/ui/button'
import { TrendingUp, Globe, Shield, BarChart3 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Inversión Inmobiliaria Internacional | Assets Golden',
  description:
    'Oportunidades de inversión inmobiliaria en los mercados más rentables de Europa y América. Análisis de mercado, rentabilidades y asesoramiento personalizado.',
}

export const revalidate = 3600

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

interface Props {
  searchParams: Promise<{ pais?: string; pagina?: string }>
}

const PAGE_SIZE = 12

export default async function InversionesPage({ searchParams }: Props) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.pagina ?? '1', 10))
  const offset = (page - 1) * PAGE_SIZE

  const [{ data: destinations }, { data: properties, count }] = await Promise.all([
    getDestinations(),
    getProperties({
      country: params.pais || undefined,
      limit: PAGE_SIZE,
      offset,
    }),
  ])

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  const countries = destinations
    .map((d) => d.country_name)
    .filter(Boolean)
    .sort()

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
            Acceda a los mercados inmobiliarios más rentables del mundo con el respaldo de nuestro equipo de expertos.
          </p>
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

      {/* Filtro por país + propiedades */}
      <section className="section-padding bg-background">
        <div className="container-luxury">
          {/* Filtro países */}
          {countries.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2 items-center">
              <Link
                href="/inversiones"
                className={`rounded-full px-4 py-1.5 text-xs font-medium border transition-colors ${
                  !params.pais
                    ? 'bg-gold text-navy border-gold'
                    : 'border-border text-muted-foreground hover:border-gold hover:text-foreground'
                }`}
              >
                Todos los países
              </Link>
              {countries.map((c) => (
                <Link
                  key={c}
                  href={`/inversiones?pais=${encodeURIComponent(c)}`}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium border transition-colors ${
                    params.pais === c
                      ? 'bg-gold text-navy border-gold'
                      : 'border-border text-muted-foreground hover:border-gold hover:text-foreground'
                  }`}
                >
                  {c}
                </Link>
              ))}
            </div>
          )}

          {/* Grid propiedades */}
          {properties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((p) => (
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
                    featured={p.featured}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  {page > 1 && (
                    <Link
                      href={`/inversiones?${params.pais ? `pais=${params.pais}&` : ''}pagina=${page - 1}`}
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
                      href={`/inversiones?${params.pais ? `pais=${params.pais}&` : ''}pagina=${page + 1}`}
                      className={buttonVariants({ variant: 'outline', size: 'sm' })}
                    >
                      Siguiente →
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="py-24 text-center text-muted-foreground">
              No hay propiedades disponibles con los filtros seleccionados.
            </p>
          )}
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
