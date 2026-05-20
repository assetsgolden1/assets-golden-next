import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import HomeSidebar from '@/components/HomeSidebar'
import HeroImageCarousel from '@/components/HeroImageCarousel'
import HomePropertiesCarousel from '@/components/HomePropertiesCarousel'
import HomeTeamSection from '@/components/HomeTeamSection'
import DestinationCard3D from '@/components/DestinationCard3D'

import {
  getFeaturedProperties,
  getTeamMembers,
  getDestinations,
  getPropertyCountsByCountry,
  getPartners,
} from '@/lib/supabase/queries'

export const metadata: Metadata = {
  title: { absolute: 'Assets Golden — Inmobiliaria de Lujo en Barcelona' },
  description:
    'Tasación gratuita y confidencial en 24 horas. Especialistas en venta de propiedades de lujo en Barcelona con red offmarket exclusiva e internacional.',
  alternates: {
    canonical: 'https://assetsgolden.com',
  },
  openGraph: {
    url: 'https://assetsgolden.com',
  },
}

export const revalidate = 3600
export const dynamic = 'force-dynamic'

// 11 países reales de Assets Golden
const VALID_COUNTRIES = [
  'españa', 'spain',
  'méxico', 'mexico',
  'emiratos', 'eau', 'dubai', 'united arab',
  'argentina',
  'estados unidos', 'eeuu', 'usa', 'united states',
  'costa rica',
  'reino unido', 'uk', 'united kingdom',
  'ecuador',
  'grecia', 'greece',
  'indonesia',
  'paraguay',
]

function isValidCountry(name: string): boolean {
  const lower = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return VALID_COUNTRIES.some((kw) => {
    const kwNorm = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return lower.includes(kwNorm)
  })
}

export default async function HomePage() {
  const [{ data: featured }, { data: team }, { data: destinations }, propertyCounts, { data: partners }] =
    await Promise.all([
      getFeaturedProperties(),
      getTeamMembers(),
      getDestinations(),
      getPropertyCountsByCountry(),
      getPartners(),
    ])

  function countFor(countryName: string): number {
    const key = Object.keys(propertyCounts).find(
      (k) => k.toLowerCase().trim() === countryName.toLowerCase().trim()
    )
    return key ? propertyCounts[key] : 0
  }

  // Filtrar a 9 países reales y ordenar: España primero, luego por cantidad descendente
  const filteredDestinations = destinations
    .filter((d) => isValidCountry(d.country_name))
    .sort((a, b) => {
      const aIsSpain = a.country_name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes('espana')
      const bIsSpain = b.country_name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes('espana')
      if (aIsSpain) return -1
      if (bIsSpain) return 1
      return countFor(b.country_name) - countFor(a.country_name)
    })

  return (
    <>
      {/* ─── 1. HERO: Sidebar + Crossfade images ──────────────── */}
      {/* Todos los estilos críticos de altura en inline style — independientes del CSS */}
      {/*
        marginTop:-80px contrarresta el pt-20 del <main> del layout,
        así el hero empieza en y=0 (detrás del header fixed).
        height:100vh cubre exactamente la viewport completa.
      */}
      <section
        className="hero-section"
        style={{ height: '100vh', minHeight: '600px', display: 'flex', position: 'relative', overflow: 'hidden', marginTop: '-80px', width: '100%' }}
      >
        <HomeSidebar
          destinations={destinations}
          propertyCounts={propertyCounts}
          partners={partners ?? []}
        />
        {/* flex-1 inline para que no dependa de Tailwind */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
          <HeroImageCarousel />
        </div>
      </section>

      {/* ─── 2. PROPIEDADES DESTACADAS ────────────────────────── */}
      <section className="section-padding bg-background overflow-hidden">
        <div className="container-luxury">
          <div className="mb-12 text-center">
            <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">
              Selección exclusiva
            </p>
            <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
              Propiedades destacadas
            </h2>
            <div className="divider-gold mx-auto mt-4" />
          </div>

          {featured.length > 0 ? (
            <>
              <HomePropertiesCarousel properties={featured} />
              <div className="mt-12 text-center">
                <Link
                  href="/propiedades?destacadas=true"
                  className={buttonVariants({ variant: 'goldOutline', size: 'lg' })}
                >
                  Ver todas las destacadas
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">Propiedades disponibles próximamente.</p>
              <Link
                href="/vender-tu-piso"
                className={buttonVariants({ variant: 'gold', size: 'lg', className: 'mt-4' })}
              >
                Registre su propiedad
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── 4. POR QUÉ ASSETS GOLDEN ─────────────────────────── */}
      <section className="section-padding bg-secondary">
        <div className="container-luxury">
          <div className="mb-12 text-center">
            <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">
              Nuestra propuesta
            </p>
            <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
              Por qué Assets Golden
            </h2>
            <div className="divider-gold mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🔒',
                title: 'Discreción total',
                description:
                  'Red offmarket exclusiva. Sus datos y los de su propiedad permanecen completamente confidenciales en todo momento.',
              },
              {
                icon: '🌍',
                title: 'Red internacional',
                description:
                  'Compradores cualificados de más de 15 países. Conectamos su propiedad con el inversor correcto, sin importar su origen.',
              },
              {
                icon: '⭐',
                title: 'Expertos en cada destino',
                description:
                  'Conocimiento profundo de cada mercado donde operamos: del Mediterráneo español a Indonesia, pasando por Latinoamérica y Medio Oriente.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="card-premium rounded-xl p-8 text-center"
              >
                <div className="mb-4 text-4xl">{item.icon}</div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. DESTINOS ──────────────────────────────────────── */}
      {filteredDestinations.length > 0 && (
        <section className="section-padding bg-background">
          <div className="container-luxury">
            <div className="mb-12 text-center">
              <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">
                Inversión global
              </p>
              <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
                Destinos de inversión
              </h2>
              <div className="divider-gold mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredDestinations.map((dest) => (
                <DestinationCard3D
                  key={dest.id}
                  dest={dest}
                  count={countFor(dest.country_name)}
                />
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/destinos"
                className={buttonVariants({ variant: 'goldOutline', size: 'lg' })}
              >
                Explorar todos los destinos
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── 6. EQUIPO ────────────────────────────────────────── */}
      <HomeTeamSection team={team} />

      {/* ─── 7. CTA FINAL ─────────────────────────────────────── */}
      <section className="section-padding gradient-navy">
        <div className="container-luxury text-center">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-4">
            Tasación gratuita
          </p>
          <h2 className="font-display text-3xl font-semibold text-white md:text-4xl lg:text-5xl max-w-2xl mx-auto leading-tight">
            ¿Listo para conocer el valor real de su propiedad?
          </h2>
          <p className="mt-6 text-white/60 text-lg max-w-lg mx-auto">
            Respuesta en menos de 24 horas. Sin compromiso, sin coste.
          </p>
          <div className="mt-10">
            <Link
              href="/vender-tu-piso"
              className={buttonVariants({ variant: 'hero', size: 'xl' })}
            >
              Solicitar tasación gratuita
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-white/40 text-xs">
            <MapPin className="h-3.5 w-3.5 text-gold" />
            <span>Barcelona · España · Red internacional</span>
          </div>
        </div>
      </section>
    </>
  )
}
