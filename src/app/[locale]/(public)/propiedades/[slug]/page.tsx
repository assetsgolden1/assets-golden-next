import type { Metadata } from 'next'
import { buildAlternates } from '@/lib/utils/seoAlternates'
import { Link } from '@/i18n/navigation'
import { notFound, redirect } from 'next/navigation'
import { permanentRedirect } from '@/i18n/navigation'
import { ArrowLeft, Maximize, BedDouble, Bath, MapPin, ExternalLink } from 'lucide-react'
import Breadcrumb from '@/components/seo/Breadcrumb'
import { buttonVariants } from '@/components/ui/button'
import { getPropertyBySlug, getAllPropertySlugs, getPropertyByLegacySlug } from '@/lib/supabase/queries'
import PropertyGalleryClient from '@/components/PropertyGalleryClient'
import PropertyDescriptionExpand from '@/components/properties/PropertyDescriptionExpand'
import { translatePropertyType, translatePropertyTitle } from '@/lib/propertyTypes'
import { translateProvince, countryToISO } from '@/lib/utils/translateGeography'
import { formatPrice } from '@/lib/utils/format'
import { toSentenceCase } from '@/lib/utils/normalizeText'
import PropertyContactModal from '@/components/PropertyContactModal'
import { ZONE_SLUGS } from '@/lib/constants/spainZones'
import ViewContentTracker from '@/components/analytics/ViewContentTracker'
import { getTranslations, getLocale } from 'next-intl/server'

interface Props {
  params: Promise<{ slug: string; locale: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllPropertySlugs()
  return slugs.map((slug) => ({ slug }))
}

export const dynamicParams = true
export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { data } = await getPropertyBySlug(slug)
  const t = await getTranslations('PropertyDetail')
  const locale = await getLocale()

  if (!data) return { title: t('not_found') }

  const description =
    (locale === 'en' ? data.description_en : data.description)?.slice(0, 160) ??
    `${translatePropertyType(data.property_type, locale) || t('meta_fallback_type')} in ${data.location ?? (data.province ? translateProvince(data.province, locale) : null) ?? t('meta_fallback_country')}${data.bedrooms ? `, ${data.bedrooms} ${locale === 'en' ? 'bedrooms' : 'habitaciones'}` : ''}${data.area_sqm ? `, ${data.area_sqm} m²` : ''}`.slice(0, 160)

  const localizedTitle = translatePropertyTitle(data.title, locale)

  // Título SEO enriquecido para el <title>: añade provincia (si no está ya en
  // el título), nº de habitaciones y precio "desde". Mejora el long-tail y el
  // CTR en las ~2.600 fichas. OG/Twitter usan el título limpio (mejor para social).
  const provinceLabel = data.province
    ? (locale === 'en' ? translateProvince(data.province, locale) : data.province)
    : null
  const seoBase = provinceLabel && !localizedTitle.toLowerCase().includes(provinceLabel.toLowerCase())
    ? `${localizedTitle}, ${provinceLabel}`
    : localizedTitle
  const seoSegments = [seoBase]
  if (data.bedrooms != null && data.bedrooms > 0) {
    const bedLabel = locale === 'en' ? (data.bedrooms === 1 ? 'bed' : 'beds') : 'hab'
    seoSegments.push(`${data.bedrooms} ${bedLabel}`)
  }
  if (data.price != null && data.price > 0) {
    seoSegments.push(`${locale === 'en' ? 'from' : 'desde'} ${formatPrice(data.price, data.currency, locale)}`)
  }
  const seoTitle = seoSegments.join(' · ')

  return {
    title: seoTitle,
    description,
    alternates: buildAlternates(`/propiedades/${slug}`, locale),
    openGraph: {
      title: localizedTitle,
      images: data.image_url ? [{ url: data.image_url }] : [],
      url: `/propiedades/${slug}`,
    },
    twitter: { title: localizedTitle, images: data.image_url ? [data.image_url] : undefined },
  }
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params
  const t = await getTranslations('PropertyDetail')
  const locale = await getLocale()

  if (slug in ZONE_SLUGS) redirect(`/destinos/espana?zona=${slug}`)

  const { data: property } = await getPropertyBySlug(slug)
  if (!property) {
    // Slug legacy ya indexado → 308 permanente al canónico (preserva locale).
    const canonical = await getPropertyByLegacySlug(slug)
    if (canonical?.slug) permanentRedirect({ href: `/propiedades/${canonical.slug}`, locale })
    notFound()
  }

  const gallery = Array.isArray(property.gallery_urls) ? property.gallery_urls : []
  // image_url suele ser idéntica a gallery_urls[0] → deduplicar por URL exacta
  // preservando el orden de aparición (solo render, la base no se toca).
  const allImages = Array.from(
    new Set([...(property.image_url ? [property.image_url] : []), ...gallery].filter(Boolean))
  )

  const description = locale === 'en'
    ? (property.description_en ?? property.description)
    : property.description

  const localizedTitle = translatePropertyTitle(property.title, locale)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    '@id': `https://assetsgolden.com/propiedades/${slug}`,
    name: localizedTitle,
    description: description ?? undefined,
    url: `https://assetsgolden.com/propiedades/${slug}`,
    image: allImages.length > 0 ? allImages : undefined,
    ...(property.location && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: property.location,
        ...(property.province && { addressRegion: property.province }),
        addressCountry: property.country ? countryToISO(property.country) : 'ES',
      },
    }),
    ...(property.price && {
      offers: {
        '@type': 'Offer',
        price: property.price,
        priceCurrency: property.currency ?? 'EUR',
        availability: 'https://schema.org/InStock',
      },
    }),
    ...(property.bedrooms != null && { numberOfRooms: property.bedrooms }),
    ...(property.bathrooms != null && { numberOfBathroomsTotal: property.bathrooms }),
    ...(property.area_sqm != null && { floorSize: { '@type': 'QuantitativeValue', value: property.area_sqm, unitCode: 'MTK' } }),
    seller: { '@id': 'https://assetsgolden.com/#organization' },
  }

  return (
    <>
      <ViewContentTracker
        propertyId={property.id}
        propertyTitle={property.title}
        price={property.price}
        currency={property.currency}
        refCode={property.ref_code}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Breadcrumb items={[
        { name: t('breadcrumb_home'), url: '/' },
        { name: t('breadcrumb_properties'), url: '/propiedades' },
        { name: localizedTitle, url: `/propiedades/${slug}` },
      ]} />

      <div className="container-luxury pb-2">
        <Link href="/propiedades" className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t('back')}
        </Link>
      </div>

      <div className="relative">
        {allImages.length > 0 ? (
          <PropertyGalleryClient images={allImages} title={localizedTitle} />
        ) : (
          <section className="bg-muted">
            <div className="h-64 gradient-navy flex items-center justify-center">
              <span className="font-display text-2xl text-gold/40">Assets Golden</span>
            </div>
          </section>
        )}
        {property.sold && (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div style={{ position: 'absolute', top: 32, right: -36, width: 200, backgroundColor: '#dc2626', color: 'white', fontSize: 13, fontWeight: 800, letterSpacing: '0.15em', textAlign: 'center', transform: 'rotate(45deg)', padding: '8px 0', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
              {t('sold_band')}
            </div>
          </div>
        )}
      </div>

      <section className="section-padding bg-background">
        <div className="container-luxury">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {property.sold && (
                <div className="mb-4">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 text-white text-sm font-bold tracking-wider uppercase">
                    {t('sold_badge')}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 mb-4">
                {property.property_type && (
                  <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
                    {translatePropertyType(property.property_type, locale)}
                  </span>
                )}
                {(property.location || property.province) && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-gold" />
                    {[property.location, property.province ? translateProvince(property.province, locale) : null].filter(Boolean).join(', ')}
                  </span>
                )}
              </div>

              <h1 className="font-display text-3xl font-semibold text-foreground md:text-4xl leading-tight">
                {toSentenceCase(translatePropertyTitle(property.title, locale))}
              </h1>
              {property.ref_code && (
                <p className="text-sm text-muted-foreground mt-1">
                  {t('ref_label')} <span className="font-mono">{property.ref_code}</span>
                </p>
              )}

              <div className="mt-4 font-display text-2xl font-medium text-gold">
                {formatPrice(property.price, property.currency, locale)}
              </div>

              <div className="grid grid-cols-3 gap-4 py-6 border-y border-border mt-6">
                <div className="flex flex-col items-center gap-2 text-center">
                  <BedDouble className="h-6 w-6 text-gold" />
                  <span className="text-2xl font-display font-semibold text-foreground">{property.bedrooms ?? '—'}</span>
                  <span className="text-xs text-muted-foreground">
                    {property.bedrooms === 1 ? t('beds_singular') : t('beds_plural')}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <Bath className="h-6 w-6 text-gold" />
                  <span className="text-2xl font-display font-semibold text-foreground">{property.bathrooms ?? '—'}</span>
                  <span className="text-xs text-muted-foreground">
                    {property.bathrooms === 1 ? t('baths_singular') : t('baths_plural')}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <Maximize className="h-6 w-6 text-gold" />
                  <span className="text-2xl font-display font-semibold text-foreground">{property.area_sqm ?? '—'}</span>
                  <span className="text-xs text-muted-foreground">m²</span>
                </div>
              </div>

              {description && (
                <div className="mt-8">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">{t('description')}</h2>
                  <PropertyDescriptionExpand description={description} />
                </div>
              )}

              {Array.isArray(property.features) && property.features.length > 0 && (
                <div className="mt-8">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">{t('features')}</h2>
                  <ul className="grid grid-cols-2 gap-2">
                    {(property.features as string[]).map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="text-gold">·</span>{feat}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {property.idealista_url && (
                <div className="mt-8">
                  <a href={property.idealista_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors">
                    <ExternalLink className="h-4 w-4" />
                    {t('view_idealista')}
                  </a>
                </div>
              )}
            </div>

            <aside>
              <div className="sticky top-28 card-premium rounded-xl p-6">
                <h3 className="font-display text-xl font-semibold text-foreground mb-1">{t('interested_title')}</h3>
                <p className="text-sm text-muted-foreground mb-6">{t('interested_subtitle')}</p>

                {property.sold ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{t('sold_message')}</p>
                    <Link
                      href={`/propiedades?${property.location ? `ciudad=${encodeURIComponent(property.location)}` : property.country ? `pais=${encodeURIComponent(property.country)}` : ''}`}
                      className={buttonVariants({ variant: 'gold', size: 'lg', className: 'w-full' })}
                    >
                      {t('similar_properties')}
                    </Link>
                    <a href="tel:+34611853001" className={buttonVariants({ variant: 'navyOutline', size: 'lg', className: 'w-full' })}>
                      {t('check_availability')}
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <PropertyContactModal propertyId={property.id} propertyTitle={property.title} propertySlug={property.slug ?? ''} />
                    <a href="tel:+34611853001" className={buttonVariants({ variant: 'navyOutline', size: 'lg', className: 'w-full' })}>
                      {t('call_now')}
                    </a>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    {t('ref_label')} {property.ref_code ?? property.external_id ?? 'AG-' + property.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
