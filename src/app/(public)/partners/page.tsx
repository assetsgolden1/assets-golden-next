import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'
import { getPartners } from '@/lib/supabase/queries'
import { buttonVariants } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Red Internacional de Partners | Assets Golden',
  description:
    'Nuestra red global de colaboradores y agencias inmobiliarias en más de 15 países. Partner oficial de Nest Seekers International.',
}

export const revalidate = 3600

export default async function PartnersPage() {
  const { data: partners } = await getPartners()

  // Agrupar por país
  const byCountry: Record<string, typeof partners> = {}
  for (const p of partners) {
    const country = p.country ?? 'Internacional'
    if (!byCountry[country]) byCountry[country] = []
    byCountry[country].push(p)
  }
  const countries = Object.keys(byCountry).sort((a, b) => {
    if (a === 'Internacional') return 1
    if (b === 'Internacional') return -1
    return a.localeCompare(b, 'es')
  })

  return (
    <>
      {/* Hero */}
      <section className="gradient-navy py-20">
        <div className="container-luxury text-center">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">Colaboradores</p>
          <h1 className="font-display text-4xl font-semibold text-white md:text-5xl">
            Red Global de Partners
          </h1>
          <p className="mt-4 text-white/60 max-w-2xl mx-auto text-sm">
            Trabajamos con profesionales de primer nivel en todo el mundo para ofrecer las mejores oportunidades inmobiliarias.
          </p>
        </div>
      </section>

      {/* Nest Seekers banner */}
      <section className="py-10 bg-muted/30 border-b border-border">
        <div className="container-luxury">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-2xl bg-primary p-8">
            <div>
              <p className="text-xs tracking-widest text-gold uppercase mb-1">Partner oficial</p>
              <h2 className="font-display text-2xl font-semibold text-white">Nest Seekers International</h2>
              <p className="text-white/60 text-sm mt-2 max-w-xl">
                Alianza estratégica con una de las agencias inmobiliarias de lujo más reconocidas del mundo. Acceso a portafolio exclusivo en más de 30 países.
              </p>
            </div>
            <Link href="/sobre-nosotros" className={buttonVariants({ variant: 'gold', size: 'sm' })}>
              Saber más
            </Link>
          </div>
        </div>
      </section>

      {/* Partners por país */}
      <section className="section-padding bg-background">
        <div className="container-luxury">
          {partners.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-muted-foreground mb-6">Nuestra red de partners está en continua expansión.</p>
              <Link href="/contacto" className={buttonVariants({ variant: 'gold' })}>
                Unirse a la red
              </Link>
            </div>
          ) : (
            <div className="space-y-14">
              {countries.map((country) => (
                <div key={country}>
                  {/* Cabecera de país */}
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="h-5 w-5 text-gold shrink-0" />
                    <h2 className="font-display text-2xl font-semibold">{country}</h2>
                    <div className="flex-1 h-px bg-border ml-2" />
                    <span className="text-xs text-muted-foreground shrink-0">
                      {byCountry[country].length} {byCountry[country].length === 1 ? 'partner' : 'partners'}
                    </span>
                  </div>

                  {/* Grid partners */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {byCountry[country].map((partner) => (
                      <div
                        key={partner.id}
                        className="group flex items-start gap-5 rounded-xl border border-border bg-card p-6 transition-all hover:border-gold/30 hover:shadow-lg"
                      >
                        {partner.photo_url && (
                          <img
                            src={partner.photo_url}
                            alt={partner.name}
                            className="h-28 w-20 shrink-0 rounded-lg border-2 border-gold/20 object-cover object-top transition-colors group-hover:border-gold/50"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          {partner.role_es && (
                            <span className="mb-2 inline-block rounded-full bg-gold/10 px-3 py-0.5 text-xs font-medium uppercase tracking-wider text-gold">
                              {partner.role_es}
                            </span>
                          )}
                          <h3 className="font-display text-lg font-semibold">{partner.name}</h3>
                          {partner.bio_es && (
                            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                              {partner.bio_es}
                            </p>
                          )}
                          <Link
                            href={`/partners/${partner.id}`}
                            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-gold hover:underline"
                          >
                            Más información <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA colaborar */}
      <section className="gradient-navy py-16">
        <div className="container-luxury text-center">
          <h2 className="font-display text-2xl font-semibold text-white mb-4">
            ¿Quiere colaborar con nosotros?
          </h2>
          <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">
            Si es profesional del sector inmobiliario y desea formar parte de nuestra red global, contáctenos.
          </p>
          <Link href="/contacto" className={buttonVariants({ variant: 'gold' })}>
            Contactar
          </Link>
        </div>
      </section>
    </>
  )
}
