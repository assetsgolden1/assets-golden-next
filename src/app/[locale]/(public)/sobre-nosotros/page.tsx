import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import { Globe, Users, Award, Target } from 'lucide-react'
import { getTeamMembers } from '@/lib/supabase/queries'
import { buttonVariants } from '@/components/ui/button'
import { memberProfileHref } from '@/components/team/TeamMemberProfile'
import { optimizedImage } from '@/lib/utils/optimizedImage'
import { buildAlternates } from '@/lib/utils/seoAlternates'
import { getTranslations , setRequestLocale } from 'next-intl/server'

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'About' })
  return {
  title: t('meta_title'),
  description: 'Socios fundadores con más de 40 años de trayectoria conjunta en propiedades exclusivas a nivel internacional. Más de 1.500 operaciones acompañadas en 13 países. Conozca Assets Golden.',
  alternates: buildAlternates('/sobre-nosotros', locale),
  openGraph: { url: locale === 'en' ? '/en/sobre-nosotros' : '/sobre-nosotros' },
}
}

export const revalidate = 3600

const buildStats = (t: (k: string) => string) => [
  { value: '40+', label: t('stat1') },
  { value: '1.500+', label: t('stat2') },
  { value: '13', label: t('stat3') },
  { value: '98%', label: t('stat4') },
]

const buildValues = (t: (k: string) => string) => [
  {
    icon: Globe,
    title: t('v1_title'),
    desc: t('v1_desc'),
  },
  {
    icon: Users,
    title: t('v2_title'),
    desc: t('v2_desc'),
  },
  {
    icon: Award,
    title: t('v3_title'),
    desc: t('v3_desc'),
  },
  {
    icon: Target,
    title: t('v4_title'),
    desc: t('v4_desc'),
  },
]

export default async function SobreNosotrosPage(
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('About')
  const STATS = buildStats(t)
  const VALUES = buildValues(t)
  const { data: team } = await getTeamMembers()
  const founders = team.filter((m) => m.member_type === 'founder' && m.active)

  return (
    <>
      {/* Hero */}
      <section className="gradient-navy py-24">
        <div className="container-luxury text-center">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">{t('eyebrow')}</p>
          <h1 className="font-display text-4xl font-semibold text-white md:text-5xl">
            Assets Golden International
          </h1>
          <p className="mt-4 text-white/60 max-w-2xl mx-auto text-base leading-relaxed">
            {t('intro')}
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
          <h2 className="font-display text-3xl font-semibold mb-6">{t('mission_title')}</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {t('mission_p1')}
            </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            {t('mission_p2')}
            </p>
          <p className="text-muted-foreground leading-relaxed">
            {t('mission_p3')}
            </p>
        </div>
      </section>

      {/* Valores */}
      <section className="section-padding bg-muted/30">
        <div className="container-luxury">
          <h2 className="font-display text-3xl font-semibold mb-12 text-center">{t('values_title')}</h2>
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
              <h2 className="font-display text-3xl font-semibold mb-6">{t('network_title')}</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {t('network_p')}
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  'España: Barcelona, Madrid, Marbella, Ibiza',
                  'México: Tulum, Riviera Maya',
                  'Indonesia: Bali (Uluwatu, Canggu, Ubud)',
                  'Emiratos Árabes Unidos: Dubái',
                  'Argentina: Buenos Aires, Córdoba',
                  'Brasil: Gramado',
              'Estados Unidos: Miami, Nueva York',
              'República Dominicana: Samaná',
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
              <p className="text-xs tracking-widest text-gold uppercase mb-2">{t('global_eyebrow')}</p>
              <h3 className="font-display text-2xl font-semibold mb-4">{t('partners_title')}</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                {t('partners_p')}
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
            <h2 className="font-display text-3xl font-semibold mb-10 text-center">{t('team_title')}</h2>
            <div className="flex flex-wrap justify-center gap-8">
              {founders.map((m) => (
                <Link
                  key={m.id}
                  href={memberProfileHref(m)}
                  className="group block w-64 text-center no-underline"
                >
                  {m.photo_url && (
                    <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full border-2 border-gold/20">
                      <img
                        src={optimizedImage(m.photo_url, { width: 200, quality: 70 })}
                        alt={m.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <h3 className="font-display text-lg font-semibold group-hover:text-gold transition-colors">{m.name}</h3>
                  {(locale === 'en' ? m.role_en ?? m.role_es : m.role_es) && (
                    <p className="text-sm text-gold mt-1">{locale === 'en' ? m.role_en ?? m.role_es : m.role_es}</p>
                  )}
                  {(locale === 'en' ? m.bio_en ?? m.bio_es : m.bio_es) && (
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-3">
                      {locale === 'en' ? m.bio_en ?? m.bio_es : m.bio_es}
                    </p>
                  )}
                </Link>
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
