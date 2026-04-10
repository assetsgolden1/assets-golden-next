import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import PropertyCard from '@/components/properties/PropertyCard'
import {
  getFeaturedProperties,
  getTeamMembers,
  getDestinations,
} from '@/lib/supabase/queries'

export const metadata: Metadata = {
  title: 'Assets Golden — Inmobiliaria de Lujo en Barcelona',
  description:
    'Tasación gratuita y confidencial en 24 horas. Especialistas en venta de propiedades de lujo en Barcelona con red offmarket exclusiva e internacional.',
}

export const revalidate = 3600

export default async function HomePage() {
  const [{ data: featured }, { data: team }, { data: destinations }] =
    await Promise.all([
      getFeaturedProperties(6),
      getTeamMembers(),
      getDestinations(),
    ])

  return (
    <>
      {/* ─── 1. HERO ───────────────────────────────────────────── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* Background gradient luxury */}
        <div className="absolute inset-0 gradient-elegant" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, var(--gold) 0%, transparent 50%), radial-gradient(circle at 80% 20%, var(--gold-light) 0%, transparent 40%)',
          }}
        />
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'linear-gradient(var(--gold) 1px, transparent 1px), linear-gradient(90deg, var(--gold) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />

        <div className="container-luxury relative z-10 py-32 text-center">
          <p className="mb-6 text-xs tracking-[0.3em] text-gold uppercase animate-[fade-in_0.6s_ease-out_both]">
            Barcelona · International Real Estate
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight text-white md:text-5xl lg:text-6xl xl:text-7xl animate-[fade-in-up_0.7s_ease-out_both] animation-delay-200">
            Vende tu piso en Barcelona
            <br />
            <span className="text-gradient-gold">con la discreción</span>
            <br />
            que merece
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/70 leading-relaxed animate-[fade-in-up_0.7s_ease-out_both] animation-delay-400">
            Tasación gratuita y confidencial en 24 horas.
            <br className="hidden sm:block" />
            Sin compromiso.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-[fade-in-up_0.7s_ease-out_both] animation-delay-600">
            <Link
              href="/vender-tu-piso"
              className={buttonVariants({ variant: 'hero', size: 'xl' })}
            >
              Solicitar tasación gratuita
            </Link>
            <Link
              href="/propiedades"
              className={buttonVariants({ variant: 'heroOutline', size: 'xl' })}
            >
              Ver propiedades
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-[float_3s_ease-in-out_infinite]">
          <div className="flex h-8 w-5 items-start justify-center rounded-full border-2 border-white/30 p-1">
            <div className="h-1.5 w-1 rounded-full bg-gold animate-[fade-in-up_1s_ease-in-out_infinite]" />
          </div>
        </div>
      </section>

      {/* ─── 2. STATS BAR ─────────────────────────────────────── */}
      <section className="bg-gold">
        <div className="container-luxury py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { stat: '-15%', label: 'Stock disponible en Barcelona' },
              { stat: '+9,4%', label: 'Precio medio anual en BCN' },
              { stat: 'Máx. histórico', label: 'Septiembre 2024 — 18 años' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center">
                <span className="font-display text-3xl font-bold text-navy">
                  {item.stat}
                </span>
                <span className="mt-1 text-xs tracking-wide text-navy/70 uppercase">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. PROPIEDADES DESTACADAS ────────────────────────── */}
      <section className="section-padding bg-background">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map((property) => (
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
              <div className="mt-12 text-center">
                <Link
                  href="/propiedades"
                  className={buttonVariants({ variant: 'goldOutline', size: 'lg' })}
                >
                  Ver todas las propiedades
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">
                Propiedades disponibles próximamente.
              </p>
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
                title: 'Expertise local',
                description:
                  'Especialistas en lujo barcelonés con 18 años de experiencia. Conocemos cada barrio, cada precio, cada oportunidad.',
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
      {destinations.length > 0 && (
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

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {destinations.map((dest) => (
                <Link
                  key={dest.id}
                  href={`/destinos/${dest.slug ?? dest.id}`}
                  className="group relative overflow-hidden rounded-xl aspect-[4/3] bg-muted"
                >
                  {dest.card_image_url ? (
                    <Image
                      src={dest.card_image_url}
                      alt={dest.country_name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 gradient-navy" />
                  )}
                  <div className="overlay-dark" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <span className="font-display text-lg font-semibold text-white group-hover:text-gold transition-colors">
                      {dest.country_name}
                    </span>
                    {dest.tagline && (
                      <span className="mt-1 text-xs text-white/70 line-clamp-2">
                        {dest.tagline}
                      </span>
                    )}
                  </div>
                </Link>
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
      {team.length > 0 && (
        <section className="section-padding bg-secondary">
          <div className="container-luxury">
            <div className="mb-12 text-center">
              <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">
                Nuestros especialistas
              </p>
              <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl">
                El equipo
              </h2>
              <div className="divider-gold mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {team.slice(0, 8).map((member) => (
                <div key={member.id} className="group text-center">
                  <div className="relative mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border-2 border-gold/20 bg-muted">
                    {member.photo_url ? (
                      <Image
                        src={member.photo_url}
                        alt={member.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="96px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center gradient-navy">
                        <span className="font-display text-2xl text-gold">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-display text-sm font-semibold text-foreground group-hover:text-gold transition-colors">
                    {member.name}
                  </h3>
                  {member.role_es && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {member.role_es}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {team.length > 0 && (
              <div className="mt-10 text-center">
                <Link
                  href="/equipo"
                  className={buttonVariants({ variant: 'goldOutline', size: 'lg' })}
                >
                  Conocer al equipo completo
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

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
