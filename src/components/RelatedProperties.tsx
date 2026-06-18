import Image from 'next/image'
import Link from 'next/link'
import type { RelatedProperty } from '@/lib/blogProperties'
import { translatePropertyTitle } from '@/lib/propertyTypes'

interface Props {
  properties: RelatedProperty[]
  language?: 'es' | 'en'
}

const LABELS = {
  es: {
    title: 'Propiedades destacadas',
    subtitle: 'Inversiones disponibles relacionadas con este artículo',
    seeAll: 'Ver todas las propiedades →',
  },
  en: {
    title: 'Featured properties',
    subtitle: 'Available investments related to this article',
    seeAll: 'See all properties →',
  },
}

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: '$',
  EUR: '€',
  AED: 'AED ',
}

export function RelatedProperties({ properties, language = 'es' }: Props) {
  if (properties.length === 0) return null

  const t = LABELS[language]

  return (
    <section className="mt-16 pt-10 border-t border-border">
      <div className="mb-8">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-2">{t.title}</h2>
        <p className="text-muted-foreground text-sm">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {properties.map((prop) => (
          <Link
            key={prop.id}
            href={`/propiedades/${prop.slug}`}
            className="group block rounded-xl border border-border overflow-hidden hover:border-gold/50 hover:shadow-md transition-all duration-200 no-underline"
          >
            <div className="relative h-48 w-full bg-muted overflow-hidden">
              <Image
                src={prop.image_url!}
                alt={translatePropertyTitle(prop.title, language)}
                fill
                unoptimized
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-1 group-hover:text-gold transition-colors">
                {translatePropertyTitle(prop.title, language)}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                {[prop.location, prop.country].filter(Boolean).join(' · ')}
              </p>
              {prop.price && (
                <p className="text-base font-bold text-gold">
                  {CURRENCY_SYMBOL[prop.currency ?? 'EUR'] ?? '€'}
                  {prop.price.toLocaleString('es-ES')}
                </p>
              )}
              {(prop.bedrooms || prop.area_sqm) && (
                <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                  {prop.bedrooms && <span>{prop.bedrooms} hab.</span>}
                  {prop.area_sqm && <span>{prop.area_sqm} m²</span>}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/propiedades"
          className="inline-block px-8 py-3 bg-foreground text-background rounded-md text-sm font-semibold hover:bg-foreground/90 transition-colors no-underline"
        >
          {t.seeAll}
        </Link>
      </div>
    </section>
  )
}
