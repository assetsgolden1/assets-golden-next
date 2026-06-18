'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Maximize2, Building2 } from 'lucide-react'
import Autoplay from 'embla-carousel-autoplay'
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel'
import type { Property } from '@/types'
import { translateCountry, translateProvince } from '@/lib/utils/translateGeography'
import { translatePropertyTitle } from '@/lib/propertyTypes'
import { toSentenceCase } from '@/lib/utils/normalizeText'

const typeLabels: Record<string, string> = {
  villa: 'Villa',
  apartment: 'Apartamento',
  house: 'Casa',
  penthouse: 'Ático',
  land: 'Terreno',
  building: 'Edificio',
  hotel: 'Hotel',
  rural: 'Finca rural',
  townhouse: 'Adosado',
  warehouse: 'Local / Nave',
  business: 'Traspaso',
}

function formatPrice(price: number | null, currency: string | null): string {
  if (!price) return 'Precio a consultar'
  const symbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : ''
  const suffix = (!currency || currency === 'EUR') ? ' €' : ''
  return `${symbol}${price.toLocaleString('es-ES')}${suffix}`
}

interface Props {
  properties: Property[]
  locale: string
}

export default function HomePropertiesCarousel({ properties, locale }: Props) {
  const autoplay = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })
  )

  if (properties.length === 0) return null

  return (
    <div className="relative px-6 md:px-14">
      <Carousel
        opts={{ align: 'start', loop: true }}
        plugins={[autoplay.current]}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {properties.map((property) => (
            <CarouselItem key={property.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
              <Link
                href={`/propiedades/${property.slug ?? property.id}`}
                className="group block card-premium rounded-xl overflow-hidden"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {property.image_url ? (
                    <Image
                      src={property.image_url}
                      alt={translatePropertyTitle(property.title, locale)}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center gradient-navy">
                      <Building2 className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                  {/* Type badge */}
                  {property.property_type && (
                    <span className="absolute top-4 left-4 bg-gold text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
                      {typeLabels[property.property_type] ?? property.property_type}
                    </span>
                  )}

                  {/* Price overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-primary-foreground font-display text-2xl font-medium drop-shadow-lg">
                      {formatPrice(property.price, property.currency)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-display text-lg text-foreground mb-2 group-hover:text-gold transition-colors line-clamp-1">
                    {toSentenceCase(translatePropertyTitle(property.title, locale))}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <MapPin className="h-4 w-4 text-gold shrink-0" />
                      <span className="line-clamp-1">{property.location ?? (property.province ? translateProvince(property.province, locale) : null) ?? translateCountry('España', locale)}</span>
                    </div>
                    {property.area_sqm && (
                      <div className="flex items-center gap-1 text-muted-foreground text-sm shrink-0">
                        <Maximize2 className="h-4 w-4" />
                        <span>{property.area_sqm} m²</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="-left-5 md:-left-7 h-12 w-12" />
        <CarouselNext className="-right-5 md:-right-7 h-12 w-12" />
      </Carousel>
    </div>
  )
}
