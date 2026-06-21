import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/utils/seoAlternates'
import { MapPin } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import HomeSidebar from '@/components/HomeSidebar'
import HeroImageCarousel from '@/components/HeroImageCarousel'
import HomePropertiesCarousel from '@/components/HomePropertiesCarousel'
import HomeTeamSection from '@/components/HomeTeamSection'
import DestinationsCarousel from '@/components/home/DestinationsCarousel'
import { Link } from '@/i18n/navigation'
import { getTranslations, getLocale } from 'next-intl/server'
import {
  getFeaturedProperties,
  getTeamMembers,
  getDestinations,
  getPropertyCountsByCountry,
  getPartners,
} from '@/lib/supabase/queries'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Home')
  const locale = await getLocale()
  return {
    title: { absolute: t('meta_title') },
    description: t('meta_description'),
    alternates: buildAlternates('/', locale),
    openGraph: {
      url: 'https://assetsgolden.com',
      title: t('meta_title'),
      description: t('meta_description'),
    },
    twitter: {
      title: t('meta_title'),
      description: t('meta_description'),
    },
  }
}

export const revalidate = 3600

export default async function HomePage() {
  const t = await getTranslations('Home')
  const locale = await getLocale()

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

  const filteredDestinations = destinations
    .slice()
    .sort((a, b) => {
      const aIsSpain = a.country_name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes('espana')
      const bIsSpain = b.country_name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes('espana')
      if (aIsSpain) return -1
      if (bIsSpain) return 1
      return countFor(b.country_name) - countFor(a.country_name)
    })

  const destinationsWithCount = filteredDestinations.map((d) => ({
    dest: d,
    count: countFor(d.country_name),
  }))

  return (
    <>
      {/* ─── 1. HERO ─────────────────────────────────────────── */}
      <section
        className="hero-section"
        style={{ height: '100vh', minHeight: '600px', display: 'flex', position: 'relative', overflow: 'hidden', marginTop: '-80px', width: '100%' }}
      >
        <HomeSidebar destinations={destinations} propertyCounts={propertyCounts} partners={partners ?? []} locale={locale} />
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
          <HeroImageCarousel />
        </div>
      </section>

      {/* ─── 2. PROPIEDADES DESTACADAS ───────────────────────── */}
      <section className="section-padding bg-background overflow-hidden">
        <div className="container-luxury">
          <div className="mb-12 text-center">
            <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">{t('featured_eyebrow')}</p>
            <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl">{t('featured_title')}</h2>
            <div className="divider-gold mx-auto mt-4" />
          </div>

          {featured.length > 0 ? (
            <>
              <HomePropertiesCarousel properties={featured} locale={locale} />
              <div className="mt-12 text-center">
                <Link href="/propiedades?destacadas=true" className={buttonVariants({ variant: 'goldOutline', size: 'lg' })}>
                  {t('cta_view_all_featured')}
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">{t('no_properties_text')}</p>
              <Link href="/vender-tu-piso" className={buttonVariants({ variant: 'gold', size: 'lg', className: 'mt-4' })}>
                {t('register_property')}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── 4. POR QUÉ ASSETS GOLDEN ────────────────────────── */}
      <section className="section-padding bg-secondary">
        <div className="container-luxury">
          <div className="mb-12 text-center">
            <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">{t('why_eyebrow')}</p>
            <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl">{t('why_title')}</h2>
            <div className="divider-gold mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🔒', title: t('trust1_title'), description: t('trust1_desc') },
              { icon: '🌍', title: t('trust2_title'), description: t('trust2_desc') },
              { icon: '⭐', title: t('trust3_title'), description: t('trust3_desc') },
            ].map((item) => (
              <div key={item.title} className="card-premium rounded-xl p-8 text-center">
                <div className="mb-4 text-4xl">{item.icon}</div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. DESTINOS ─────────────────────────────────────── */}
      {filteredDestinations.length > 0 && (
        <section className="section-padding bg-background">
          <div className="container-luxury">
            <div className="mb-12 text-center">
              <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">{t('destinations_eyebrow')}</p>
              <h2 className="font-display text-3xl font-semibold text-foreground md:text-4xl">{t('destinations_title')}</h2>
              <div className="divider-gold mx-auto mt-4" />
            </div>

            <DestinationsCarousel items={destinationsWithCount} locale={locale} />

            <div className="mt-10 text-center">
              <Link href="/destinos" className={buttonVariants({ variant: 'goldOutline', size: 'lg' })}>
                {t('cta_view_all_destinations')}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── 6. EQUIPO ───────────────────────────────────────── */}
      <HomeTeamSection team={team} />

      {/* ─── 7. CTA FINAL ────────────────────────────────────── */}
      <section className="section-padding gradient-navy">
        <div className="container-luxury text-center">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-4">{t('cta_valuation_eyebrow')}</p>
          <h2 className="font-display text-3xl font-semibold text-white md:text-4xl lg:text-5xl max-w-2xl mx-auto leading-tight">
            {t('cta_valuation_title')}
          </h2>
          <p className="mt-6 text-white/60 text-lg max-w-lg mx-auto">{t('cta_valuation_subtitle')}</p>
          <div className="mt-10">
            <Link href="/vender-tu-piso" className={buttonVariants({ variant: 'hero', size: 'xl' })}>
              {t('cta_valuation_button')}
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-white/40 text-xs">
            <MapPin className="h-3.5 w-3.5 text-gold" />
            <span>{t('cta_valuation_location')}</span>
          </div>
        </div>
      </section>
    </>
  )
}
