import type { Metadata } from 'next'
import Link from 'next/link'
import { Globe, Users, Award, Target } from 'lucide-react'
import { getTeamMembers } from '@/lib/supabase/queries'
import { buttonVariants } from '@/components/ui/button'
import { optimizedImage } from '@/lib/utils/optimizedImage'
import { buildAlternates } from '@/lib/utils/seoAlternates'

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
): Promise<Metadata> {
  const { locale } = await params
  return {
  title: 'Sobre Nosotros',
  description:
    'Socios fundadores con más de 40 años de trayectoria conjunta en propiedades exclusivas a nivel internacional. Más de 1.500 operaciones acompañadas en 13 países. Conozca Assets Golden.',
  alternates: buildAlternates('/sobre-nosotros', locale),
  openGraph: { url: locale === 'en' ? '/en/sobre-nosotros' : '/sobre-nosotros' },
}
}

export const revalidate = 3600

const STATS = [
  { value: '40+', label: 'Años de trayectoria conjunta' },
  { value: '1.500+', label: 'Operaciones acompañadas' },
  { value: '11', label: 'Países de operación' },
  { value: '98%', label: 'Clientes satisfechos' },
]

const VALUES = [
  {
    icon: Globe,
    title: 'Alcance global',
    desc: 'Presencia activa en los principales mercados inmobiliarios internacionales, con red de partners en 13 países.',
  },
  {
    icon: Users,
    title: 'Servicio personalizado',
    desc: 'Cada cliente recibe atención dedicada y soluciones a medida adaptadas a sus objetivos e inversión.',
  },
  {
    icon: Award,
    title: 'Excelencia',
    desc: 'Comprometidos con los más altos estándares de calidad, transparencia y profesionalismo en cada operación.',
  },
  {
    icon: Target,
    title: 'Resultados',
    desc: 'Enfocados en alcanzar los objetivos de inversión de nuestros clientes de forma eficiente y segura.',
  },
]

export default async function SobreNosotrosPage() {
  const { data: team } = await getTeamMembers()
  const founders = team.filter((m) => m.member_type === 'founder' && m.active)

  return (
    <>
      {/* Hero */}
      <section className="gradient-navy py-24">
        <div className="container-luxury text-center">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">Sobre nosotros</p>
          <h1 className="font-display text-4xl font-semibold text-white md:text-5xl">
            Assets Golden International
          </h1>
          <p className="mt-4 text-white/60 max-w-2xl mx-auto text-base leading-relaxed">
            Somos una consultora inmobiliaria internacional especializada en la compraventa de propiedades en los mercados más atractivos del mundo.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-muted/30">
        <div className="container-luxury">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-4xl md:text-5xl text-gold mb-2">{s.value}</p>
                <p className="text-muted-foreground text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Misión */}
      <section className="section-padding bg-background">
        <div className="container-luxury max-w-3xl">
          <h2 className="font-display text-3xl font-semibold mb-6">Nuestra misión</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Detrás de Assets Golden hay un equipo con más de 40 años de trayectoria conjunta en el sector inmobiliario, acumulada por sus socios fundadores entre operaciones en España y mercados internacionales. A lo largo de esa trayectoria hemos acompañado más de 1.500 operaciones inmobiliarias, desde viviendas residenciales hasta activos comerciales y de inversión.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            En Assets Golden International conectamos a inversores, compradores y vendedores con las mejores oportunidades inmobiliarias del mercado global. Nuestra red de partners en 13 países nos permite ofrecer un servicio integral y adaptado a cada perfil de cliente.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Operamos en España, México, Indonesia, Emiratos Árabes Unidos, Argentina, Estados Unidos, Costa Rica, Reino Unido, Ecuador, Grecia y Paraguay. Permanentemente abrimos nuevos mercados en busca de mejores y más rentables oportunidades para nuestros clientes.
          </p>
        </div>
      </section>

      {/* Valores */}
      <section className="section-padding bg-muted/30">
        <div className="container-luxury">
          <h2 className="font-display text-3xl font-semibold mb-12 text-center">Nuestros valores</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10">
                  <Icon className="h-8 w-8 text-gold" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Red internacional */}
      <section className="section-padding bg-background">
        <div className="container-luxury">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl font-semibold mb-6">Red internacional</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Nuestra red de partners cubre los principales mercados inmobiliarios de Europa, América y Oriente Próximo. Esta presencia global nos permite ofrecer a nuestros clientes oportunidades únicas y acceso a propiedades exclusivas fuera del mercado convencional.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  'España: Barcelona, Madrid, Marbella, Ibiza',
                  'México: Tulum, Riviera Maya',
                  'Indonesia: Bali (Uluwatu, Canggu, Ubud)',
                  'Emiratos Árabes Unidos: Dubái',
                  'Argentina: Buenos Aires, Córdoba',
                  'Estados Unidos: Miami, Nueva York',
                  'Costa Rica',
                  'Reino Unido',
                  'Ecuador',
                  'Grecia',
                  'Paraguay: Asunción, Luque, Ciudad del Este',
                ].map((country) => (
                  <li key={country} className="flex items-start gap-2">
                    <span className="text-gold mt-0.5">›</span>
                    <span>{country}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-navy to-navy/70 p-8 text-white">
              <p className="text-xs tracking-widest text-gold uppercase mb-2">Presencia global</p>
              <h3 className="font-display text-2xl font-semibold mb-4">Red de partners independientes</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Contamos con una red consolidada de agentes y partners en 13 países, lo que nos permite ofrecer oportunidades exclusivas y acceso a compradores e inversores de alto perfil en cualquier parte del mundo.
              </p>
              <Link
                href="/partners"
                className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-gold hover:underline"
              >
                Ver red de partners →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Equipo (founders) */}
      {founders.length > 0 && (
        <section className="section-padding bg-muted/30">
          <div className="container-luxury">
            <h2 className="font-display text-3xl font-semibold mb-10 text-center">Nuestro equipo</h2>
            <div className="flex flex-wrap justify-center gap-8">
              {founders.map((m) => (
                <div key={m.id} className="text-center w-64">
                  {m.photo_url && (
                    <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border-2 border-gold/20">
                      <img
                        src={optimizedImage(m.photo_url, { width: 200, quality: 70 })}
                        alt={m.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <h3 className="font-display text-lg font-semibold">{m.name}</h3>
                  {m.role_es && (
                    <p className="text-sm text-gold mt-1">{m.role_es}</p>
                  )}
                  {m.bio_es && (
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-3">
                      {m.bio_es}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/equipo" className={buttonVariants({ variant: 'goldOutline' })}>
                Conocer a todo el equipo
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="gradient-navy py-16">
        <div className="container-luxury text-center">
          <h2 className="font-display text-2xl font-semibold text-white mb-4">
            ¿Hablamos de su próxima inversión?
          </h2>
          <p className="text-white/60 text-sm mb-8">
            Nuestro equipo está listo para asesorarle.
          </p>
          <Link href="/contacto" className={buttonVariants({ variant: 'gold' })}>
            Contactar ahora
          </Link>
        </div>
      </section>
    </>
  )
}
