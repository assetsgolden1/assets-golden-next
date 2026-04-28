import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import { getDestinations, getPropertyCountsByCountry } from '@/lib/supabase/queries'
import { buttonVariants } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Destinos de Inversión Inmobiliaria | Assets Golden',
  description:
    'Explore propiedades en España, México, Emiratos Árabes Unidos, Argentina, Estados Unidos y más. Inversión inmobiliaria internacional con Assets Golden.',
}

export const revalidate = 3600

// Misma whitelist que la home para mantener paridad
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
  const lower = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  return VALID_COUNTRIES.some((kw) => {
    const kwNorm = kw.normalize('NFD').replace(/[̀-ͯ]/g, '')
    return lower.includes(kwNorm)
  })
}

export default async function DestinosPage() {
  const [{ data: destinations }, propertyCounts] = await Promise.all([
    getDestinations(),
    getPropertyCountsByCountry(),
  ])

  // Helper to find count by country_name (case-insensitive)
  function countFor(countryName: string): number {
    const key = Object.keys(propertyCounts).find(
      (k) => k.toLowerCase().trim() === countryName.toLowerCase().trim()
    )
    return key ? propertyCounts[key] : 0
  }

  // Misma lógica que la home: whitelist de 11 países, España primero + alfabético
  const visibleDestinations = destinations
    .filter((d) => isValidCountry(d.country_name))
    .sort((a, b) => {
      const aSpain = a.country_name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes('espana')
      const bSpain = b.country_name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes('espana')
      if (aSpain) return -1
      if (bSpain) return 1
      return a.country_name.localeCompare(b.country_name, 'es')
    })

  return (
    <>
      {/* Hero */}
      <section className="gradient-navy py-20">
        <div className="container-luxury text-center">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">Inversión global</p>
          <h1 className="font-display text-4xl font-semibold text-white md:text-5xl">Destinos</h1>
          <div className="mt-6 h-px w-12 bg-gold mx-auto" />
          <p className="mt-6 text-white/60 max-w-xl mx-auto text-sm leading-relaxed">
            Seleccione un destino para explorar las propiedades disponibles y conocer el mercado inmobiliario local.
          </p>
        </div>
      </section>

      {/* Grid de países */}
      <section className="section-padding bg-background">
        <div className="container-luxury">
          {visibleDestinations.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-muted-foreground text-sm">Los destinos se cargarán en breve.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleDestinations.map((dest) => {
                const count = countFor(dest.country_name)
                return (
                  <Link
                    key={dest.id}
                    href={`/destinos/${dest.slug ?? dest.id}`}
                    className="group relative overflow-hidden rounded-xl bg-muted block"
                    style={{ aspectRatio: '16/9' }}
                  >
                    {dest.card_image_url ? (
                      <Image
                        src={dest.card_image_url}
                        alt={dest.country_name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 gradient-navy" />
                    )}
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <div className="flex items-center gap-1.5 text-gold/80 text-xs tracking-widest uppercase mb-2">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>
                          {count > 0
                            ? `${count} ${count === 1 ? 'propiedad' : 'propiedades'}`
                            : 'Próximamente'}
                        </span>
                      </div>
                      <h2 className="font-display text-2xl font-semibold text-white group-hover:text-gold transition-colors">
                        {dest.country_name}
                      </h2>
                      {dest.tagline && (
                        <p className="mt-1 text-white/60 text-sm line-clamp-1">{dest.tagline}</p>
                      )}
                      <span className="mt-4 inline-flex items-center gap-1 text-xs text-gold font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver propiedades →
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-navy py-16">
        <div className="container-luxury text-center">
          <h2 className="font-display text-2xl font-semibold text-white mb-4">
            ¿Busca propiedades en un mercado específico?
          </h2>
          <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">
            Nuestro equipo de especialistas le orientará sobre las mejores oportunidades en cada mercado.
          </p>
          <Link href="/contacto" className={buttonVariants({ variant: 'gold' })}>
            Solicitar asesoría
          </Link>
        </div>
      </section>
    </>
  )
}
