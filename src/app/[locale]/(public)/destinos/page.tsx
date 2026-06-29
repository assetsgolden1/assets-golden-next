import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/utils/seoAlternates'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { buttonVariants } from '@/components/ui/button'
import { getDestinations, getPropertyCountsByCountry } from '@/lib/supabase/queries'
import { translateCountry } from '@/lib/utils/translateGeography'
import { optimizedImage } from '@/lib/utils/optimizedImage'

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> }
): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('Destinations')
  return {
    title: t('meta_title'),
    description: t('meta_description'),
    alternates: buildAlternates('/destinos', locale),
    openGraph: { url: '/destinos' },
  }
}

export const revalidate = 3600

export default async function DestinosPage(
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('Destinations')
  const [{ data: destinations }, propertyCounts] = await Promise.all([
    getDestinations(),
    getPropertyCountsByCountry(),
  ])

  function countFor(countryName: string): number {
    const key = Object.keys(propertyCounts).find(
      (k) => k.toLowerCase().trim() === countryName.toLowerCase().trim()
    )
    return key ? propertyCounts[key] : 0
  }

  return (
    <>
      <section className="gradient-navy py-20">
        <div className="container-luxury text-center">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">{t('eyebrow')}</p>
          <h1 className="font-display text-4xl font-semibold text-white md:text-5xl">{t('title')}</h1>
          <p className="mt-4 text-white/60 max-w-2xl mx-auto text-sm">{t('subtitle')}</p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-luxury">
          {destinations.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">{t('no_destinations')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {destinations.map((dest) => {
                const count = countFor(dest.country_name)
                return (
                  <Link
                    key={dest.id}
                    href={`/destinos/${dest.slug ?? dest.id}`}
                    className="group relative overflow-hidden rounded-2xl border border-border hover:border-gold/30 transition-colors"
                  >
                    <div className="relative h-52 overflow-hidden bg-muted">
                      {(dest.card_image_url ?? dest.hero_image_url) ? (
                        <Image
                          src={optimizedImage((dest.card_image_url ?? dest.hero_image_url)!, { width: 640, quality: 70 })}
                          alt={translateCountry(dest.country_name, locale)}
                          fill unoptimized
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="absolute inset-0 gradient-navy" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h2 className="font-display text-xl font-semibold text-white group-hover:text-gold transition-colors">
                          {translateCountry(dest.country_name, locale)}
                        </h2>
                        {count > 0 && (
                          <p className="text-xs text-white/60 mt-1">
                            {count} {count === 1 ? t('property_singular') : t('property_plural')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      {dest.tagline && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{dest.tagline}</p>
                      )}
                      <p className="mt-3 text-xs text-gold font-medium">{t('view_properties')}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section className="section-padding gradient-navy">
        <div className="container-luxury text-center">
          <h2 className="font-display text-2xl font-semibold text-white mb-4 md:text-3xl">{t('cta_title')}</h2>
          <p className="text-white/60 text-sm mb-8 max-w-md mx-auto">{t('cta_subtitle')}</p>
          <Link href="/contacto" className={buttonVariants({ variant: 'gold', size: 'lg' })}>
            {t('cta_button')}
          </Link>
        </div>
      </section>
    </>
  )
}
