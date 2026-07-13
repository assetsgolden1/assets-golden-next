import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/utils/seoAlternates'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { redirect, notFound } from 'next/navigation'
import type { ElementType } from 'react'
import { MapPin, ArrowLeft, Sun, TrendingUp, Building2, Star, Globe, Shield, BarChart3 } from 'lucide-react'
import Breadcrumb from '@/components/seo/Breadcrumb'
import { buttonVariants } from '@/components/ui/button'
import { getTranslations, getLocale } from 'next-intl/server'
import { formatNumber } from '@/lib/utils/format'
import {
  getAllDestinationSlugs,
  getDestinationBySlug,
  getPropertiesForDestination,
  getCitiesForDestination,
  getPropertyTypesForDestination,
} from '@/lib/supabase/queries'
import { DestinationFilters } from '@/components/DestinationFilters'
import { PaginationBar } from '@/components/PaginationBar'
import PropertyCard from '@/components/properties/PropertyCard'
import { getDestinoEditorial } from '@/lib/editorial/destinoEditorial'
import { translateCountry, translateProvince } from '@/lib/utils/translateGeography'
import { optimizedImage } from '@/lib/utils/optimizedImage'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    ciudad?: string; tipo?: string; precio_min?: string
    precio_max?: string; habitaciones?: string; orden?: string; page?: string
  }>
}

export async function generateStaticParams() {
  const slugs = await getAllDestinationSlugs()
  return slugs.map((slug) => ({ slug }))
}

export const dynamicParams = true
export const revalidate = 43200

const ICON_MAP: Record<string, ElementType> = {
  Sun, TrendingUp, Building: Building2, Building2,
  Star, Globe, Shield, BarChart3, MapPin,
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const sp = await searchParams
  const { data } = await getDestinationBySlug(slug)
  const t = await getTranslations('DestinationDetail')
  const locale = await getLocale()

  if (!data) return { title: `${t('investment_label')} — Assets Golden` }

  const ciudad = sp.ciudad ?? null
  const countryName = translateCountry(data.country_name, locale)

  const title = ciudad
    ? t('meta_title_city', { city: ciudad, country: countryName })
    : t('meta_title', { country: countryName })

  const description = ciudad
    ? t('meta_description_city', { city: ciudad, country: countryName })
    : (locale === 'en' ? data.description_en : data.description)?.slice(0, 160) ?? t('meta_description', { country: countryName })

  return {
    title,
    description,
    alternates: buildAlternates(`/destinos/${slug}`, locale),
    openGraph: { images: data.hero_image_url ? [{ url: data.hero_image_url }] : [], url: `/destinos/${slug}` },
    twitter: { images: data.hero_image_url ? [data.hero_image_url] : undefined },
  }
}

const LIMIT = 24

export default async function DestinoPage({ params, searchParams }: Props) {
  const { slug } = await params
  if (slug === 'espana') redirect('/destinos/espana')

  const t = await getTranslations('DestinationDetail')
  const locale = await getLocale()

  const { data: destination } = await getDestinationBySlug(slug)
  if (!destination) notFound()

  const sp = await searchParams
  const ciudad       = sp.ciudad ?? ''
  const tipo         = sp.tipo ?? ''
  const precioMin    = sp.precio_min   ? parseInt(sp.precio_min)   : null
  const precioMax    = sp.precio_max   ? parseInt(sp.precio_max)   : null
  const habitaciones = sp.habitaciones ? parseInt(sp.habitaciones) : null
  const orden        = (sp.orden as 'reciente' | 'precio_asc' | 'precio_desc') ?? 'reciente'
  const page         = Math.max(1, parseInt(sp.page ?? '1'))
  const offset       = (page - 1) * LIMIT

  const countryName = destination.country_name
  const countryLabel = translateCountry(countryName, locale)

  const [{ data: properties, count }, cities, types] = await Promise.all([
    getPropertiesForDestination(countryName, { ciudad: ciudad || undefined, tipo: tipo || undefined, precioMin, precioMax, habitaciones, orden, limit: LIMIT, offset }),
    getCitiesForDestination(countryName),
    getPropertyTypesForDestination(countryName),
  ])

  const totalCount = count ?? 0
  const totalPages = Math.ceil(totalCount / LIMIT)

  // Use locale-aware DB fields
  const tagline = locale === 'en' ? (destination.tagline_en ?? destination.tagline) : destination.tagline
  const description = locale === 'en' ? (destination.description_en ?? destination.description) : destination.description
  const highlights = (locale === 'en' ? (destination.highlights_en ?? destination.highlights) : destination.highlights) as Array<{ icon?: string; title?: string; value?: string }>
  const marketInfo = (locale === 'en' ? (destination.market_info_en ?? destination.market_info) : destination.market_info) as { avgPrice?: string; rentalYield?: string; priceGrowth?: string; bestAreas?: string }
  const hasMarketInfo = Object.values(marketInfo ?? {}).some(Boolean)

  const currentFilters = { ciudad, tipo, precioMin, precioMax, habitaciones, orden }
  const editorialContent = locale === 'es' ? getDestinoEditorial(slug) : null
  const pageParams: Record<string, string | undefined> = {
    ciudad: ciudad || undefined, tipo: tipo || undefined,
    precio_min: precioMin ? String(precioMin) : undefined,
    precio_max: precioMax ? String(precioMax) : undefined,
    habitaciones: habitaciones ? String(habitaciones) : undefined,
    orden: orden !== 'reciente' ? orden : undefined,
  }

  // Result label
  const resultLabel = `${formatNumber(totalCount, locale)} ${totalCount === 1 ? t('results_singular') : t('results_plural')} ${ciudad ? t('results_in_city', { city: ciudad }) : t('results_in_country', { country: countryLabel })}`

  // Primer párrafo como intro corta; el resto va al pie (SEO text)
  const descParagraphs = description ? description.split(/\n\n+/).filter(Boolean) : []
  const descIntro = descParagraphs[0] ?? null
  const descRest = descParagraphs.slice(1)

  // FAQ (schema + sección visible). Solo preguntas con datos reales del destino;
  // nada inventado. Bilingüe vía locale. La sección solo se muestra con ≥2 preguntas.
  const en = locale === 'en'
  const noFilters = !ciudad && !tipo && precioMin == null && precioMax == null && habitaciones == null
  const faqs: { q: string; a: string }[] = []
  // El conteo varía con los filtros → solo en la vista canónica (sin filtros).
  if (noFilters) {
    faqs.push({
      q: en ? `How many properties does Assets Golden have in ${countryLabel}?`
            : `¿Cuántas propiedades tiene Assets Golden en ${countryLabel}?`,
      a: en ? `We currently list ${formatNumber(totalCount, locale)} properties in ${countryLabel} through our network, with the catalogue updated continuously.`
            : `Actualmente ofrecemos ${formatNumber(totalCount, locale)} propiedades en ${countryLabel} a través de nuestra red, con el catálogo actualizándose de forma permanente.`,
    })
  }
  if (descIntro) {
    faqs.push({
      q: en ? `Why invest in ${countryLabel}?` : `¿Por qué invertir en ${countryLabel}?`,
      a: descIntro,
    })
  }
  if (marketInfo?.avgPrice) {
    faqs.push({
      q: en ? `What is the average property price in ${countryLabel}?`
            : `¿Cuál es el precio medio de la vivienda en ${countryLabel}?`,
      a: en ? `The indicative average price is ${marketInfo.avgPrice}.`
            : `El precio medio orientativo es ${marketInfo.avgPrice}.`,
    })
  }
  if (marketInfo?.rentalYield) {
    faqs.push({
      q: en ? `What rental yield can you expect in ${countryLabel}?`
            : `¿Qué rentabilidad por alquiler ofrece ${countryLabel}?`,
      a: en ? `Gross rental yield is around ${marketInfo.rentalYield}.`
            : `La rentabilidad bruta por alquiler ronda ${marketInfo.rentalYield}.`,
    })
  }
  if (marketInfo?.priceGrowth) {
    faqs.push({
      q: en ? `How have property prices evolved in ${countryLabel}?`
            : `¿Cómo evolucionan los precios en ${countryLabel}?`,
      a: en ? `Recent price growth is around ${marketInfo.priceGrowth}.`
            : `La revalorización reciente ronda ${marketInfo.priceGrowth}.`,
    })
  }
  const faqJsonLd = faqs.length >= 2 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  } : null

  return (
    <>
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}
      <Breadcrumb
        variant="secondary"
        items={[
          { name: locale === 'en' ? 'Home' : 'Inicio', url: '/' },
          { name: locale === 'en' ? 'Destinations' : 'Destinos', url: '/destinos' },
          { name: countryLabel, url: `/destinos/${slug}` },
          ...(ciudad ? [{ name: ciudad, url: `/destinos/${slug}?ciudad=${encodeURIComponent(ciudad)}` }] : []),
        ]}
      />

      {/* Hero */}
      <section className="relative h-80 md:h-[420px] overflow-hidden">
        {(destination.hero_image_url ?? destination.card_image_url) ? (
          <Image src={optimizedImage((destination.hero_image_url ?? destination.card_image_url)!, { width: 1280, quality: 70 })} alt={countryLabel} fill unoptimized className="object-cover" priority sizes="100vw" />
        ) : (
          <div className="absolute inset-0 gradient-navy" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-primary/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-transparent" />

        <div className="relative container-luxury h-full flex flex-col justify-end pb-12">
          <Link href="/destinos" className="mb-6 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-gold transition-colors w-fit">
            <ArrowLeft className="h-3.5 w-3.5" /> {t('back')}
          </Link>
          <div className="flex items-center gap-2 text-gold text-xs tracking-widest uppercase mb-3">
            <MapPin className="h-4 w-4" />
            <span>{t('investment_label')}</span>
          </div>
          <h1 className="font-display text-4xl font-semibold text-white md:text-5xl lg:text-6xl leading-tight">{countryLabel}</h1>
          {tagline && (
            <p className="mt-3 text-white/70 text-base max-w-xl leading-relaxed">{tagline}</p>
          )}
          <p className="mt-4 inline-flex items-center gap-2 text-gold text-sm font-medium">
            <span className="h-px w-8 bg-gold" />
            {formatNumber(totalCount, locale)}{' '}
            {totalCount === 1 ? t('properties_singular') : t('properties_plural')}
          </p>
        </div>
      </section>

      {/* Market stats */}
      {(marketInfo?.avgPrice || marketInfo?.rentalYield || marketInfo?.priceGrowth) && (
        <section className="bg-gold py-6">
          <div className="container-luxury">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              {marketInfo.avgPrice && (
                <div>
                  <span className="font-display text-2xl font-bold text-navy">{marketInfo.avgPrice}</span>
                  <p className="text-xs text-navy/70 mt-1 uppercase tracking-wide">{t('avg_price')}</p>
                </div>
              )}
              {marketInfo.rentalYield && (
                <div>
                  <span className="font-display text-2xl font-bold text-navy">{marketInfo.rentalYield}</span>
                  <p className="text-xs text-navy/70 mt-1 uppercase tracking-wide">{t('rental_yield')}</p>
                </div>
              )}
              {marketInfo.priceGrowth && (
                <div>
                  <span className="font-display text-2xl font-bold text-navy">{marketInfo.priceGrowth}</span>
                  <p className="text-xs text-navy/70 mt-1 uppercase tracking-wide">{t('price_growth')}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Intro: primer párrafo de la descripción */}
      {descIntro && (
        <section className="py-12 bg-background">
          <div className="container-luxury max-w-3xl">
            <p className="text-muted-foreground leading-relaxed text-base">{descIntro}</p>
          </div>
        </section>
      )}

      {/* Filters + grid — propiedades primero */}
      <section className="bg-background py-12">
        <div className="container-luxury">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start">
            <DestinationFilters slug={slug} cities={cities} types={types} currentFilters={currentFilters} totalCount={totalCount} />

            <div className="flex-1 min-w-0">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{resultLabel}</p>
              </div>

              {(properties ?? []).length > 0 ? (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    {(properties ?? []).map(p => (
                      <PropertyCard
                        key={p.id} id={p.id} title={p.title}
                        slug={p.slug ?? p.id}
                        location={p.location ?? (p.province ? translateProvince(p.province, locale) : countryLabel)}
                        price={p.price} currency={p.currency}
                        area_sqm={p.area_sqm} bedrooms={p.bedrooms}
                        bathrooms={p.bathrooms} property_type={p.property_type}
                        image_url={p.image_url} images={p.gallery_urls} featured={p.featured}
                      />
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <PaginationBar currentPage={page} totalPages={totalPages} basePath={`/destinos/${slug}`} currentParams={pageParams} />
                  )}
                </>
              ) : (
                <div className="py-24 text-center">
                  <p className="text-muted-foreground text-lg mb-4">{t('no_results')}</p>
                  <Link href={`/destinos/${slug}`} className={buttonVariants({ variant: 'goldOutline' })}>
                    {t('view_all', { country: countryLabel })}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Highlights — al pie, tras las propiedades */}
      {highlights && highlights.length > 0 && (
        <section className="py-12 bg-secondary">
          <div className="container-luxury">
            <div className="mb-8 text-center">
              <h2 className="font-display text-2xl font-semibold">{t('why_title', { country: countryLabel })}</h2>
              <div className="divider-gold mx-auto mt-4" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {highlights.map((h, i) => (
                <div key={i} className="card-premium rounded-xl p-6 text-center">
                  {h.icon && (() => {
                    const Icon = ICON_MAP[h.icon!]
                    return Icon
                      ? <Icon className="w-8 h-8 text-gold mx-auto mb-3" />
                      : <div className="text-3xl mb-3">{h.icon}</div>
                  })()}
                  {h.value && <p className="font-display text-2xl font-semibold text-gold">{h.value}</p>}
                  {h.title && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{h.title}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Market info — al pie, tras las propiedades */}
      {hasMarketInfo && (
        <section className="py-12 bg-background">
          <div className="container-luxury">
            <div className="mb-8">
              <p className="text-xs tracking-[0.25em] text-gold uppercase mb-2">{t('market_eyebrow')}</p>
              <h2 className="font-display text-2xl font-semibold">{t('market_title')}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {marketInfo?.avgPrice && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{t('avg_price')}</p>
                  <p className="font-display text-xl font-semibold text-gold">{marketInfo.avgPrice}</p>
                </div>
              )}
              {marketInfo?.rentalYield && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{t('rental_yield')}</p>
                  <p className="font-display text-xl font-semibold text-gold">{marketInfo.rentalYield}</p>
                </div>
              )}
              {marketInfo?.priceGrowth && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{t('price_growth')}</p>
                  <p className="font-display text-xl font-semibold text-gold">{marketInfo.priceGrowth}</p>
                </div>
              )}
              {marketInfo?.bestAreas && (
                <div className="rounded-xl border border-border bg-card p-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{t('best_areas')}</p>
                  <p className="text-sm font-medium">
                    {Array.isArray(marketInfo.bestAreas) ? (marketInfo.bestAreas as string[]).join(', ') : marketInfo.bestAreas}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Editorial content — al pie, ES only */}
      {!ciudad && editorialContent && (
        <section className="section-padding bg-muted/30">
          <div className="container-luxury">
            <article className="max-w-3xl mx-auto">{editorialContent}</article>
          </div>
        </section>
      )}

      {/* Texto SEO: párrafos restantes de la descripción */}
      {descRest.length > 0 && (
        <section className="py-12 bg-background">
          <div className="container-luxury max-w-3xl space-y-4">
            {descRest.map((p, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed text-base">{p}</p>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length >= 2 && (
        <section className="py-12 bg-background">
          <div className="container-luxury max-w-3xl">
            <div className="mb-8 text-center">
              <h2 className="font-display text-2xl font-semibold">
                {en ? 'Frequently asked questions' : 'Preguntas frecuentes'}
              </h2>
              <div className="divider-gold mx-auto mt-4" />
            </div>
            <div className="space-y-3">
              {faqs.map(({ q, a }) => (
                <details key={q} className="group rounded-xl border border-border bg-card px-5 py-4">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium text-foreground list-none">
                    {q}
                    <span className="text-gold text-xl leading-none transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="gradient-navy py-16">
        <div className="container-luxury text-center">
          <p className="text-xs tracking-[0.25em] text-gold uppercase mb-4">{t('cta_eyebrow')}</p>
          <h2 className="font-display text-2xl font-semibold text-white mb-4 md:text-3xl">
            {t('cta_title', { country: countryLabel })}
          </h2>
          <p className="text-white/60 text-sm mb-8 max-w-md mx-auto leading-relaxed">
            {t('cta_subtitle', { country: countryLabel })}
          </p>
          <Link href="/contacto" className={buttonVariants({ variant: 'gold', size: 'lg' })}>
            {t('cta_button')}
          </Link>
        </div>
      </section>
    </>
  )
}
