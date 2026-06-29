'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import type { CountryDestination } from '@/types'
import { translateCountry } from '@/lib/utils/translateGeography'
import { optimizedImage } from '@/lib/utils/optimizedImage'

interface Props {
  dest: CountryDestination
  count: number
  locale: string
}

export default function DestinationCard3D({ dest, count, locale }: Props) {
  const [transform, setTransform] = useState('')
  const [glow, setGlow] = useState({ x: 50, y: 50 })
  const [hovered, setHovered] = useState(false)

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const rotateY = (x - 0.5) * 9
    const rotateX = (0.5 - y) * 9
    setTransform(`perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`)
    setGlow({ x: x * 100, y: y * 100 })
  }

  function handleMouseLeave() {
    setTransform('')
    setHovered(false)
  }

  function handleMouseEnter() {
    setHovered(true)
  }

  return (
    <Link
      href={`/destinos/${dest.slug ?? dest.id}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        transform,
        transition: transform ? 'none' : 'transform 0.5s ease',
      }}
      className="group relative overflow-hidden rounded-xl aspect-[3/4] bg-muted block"
    >
      {(dest.card_image_url ?? dest.hero_image_url) ? (
        <Image
          src={optimizedImage(dest.card_image_url ?? dest.hero_image_url!, { width: 640, quality: 70 })}
          alt={translateCountry(dest.country_name, locale)}
          fill
          unoptimized
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
      ) : (
        <div className="absolute inset-0 gradient-navy" />
      )}

      {/* Radial gold glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(212,175,55,0.4) 0%, transparent 60%)`,
        }}
      />

      {/* Gradiente: fuerte abajo (donde va el texto) → legibilidad garantizada */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

      {/* Contenido anclado abajo, alineado a la izquierda */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-start p-4">
        {count > 0 && (
          <span className="mb-1 text-[11px] font-medium uppercase tracking-[0.12em] text-gold">
            {count} {count === 1 ? 'propiedad' : 'propiedades'}
          </span>
        )}
        <h3 className="font-display text-xl font-semibold leading-tight text-white">
          {translateCountry(dest.country_name, locale)}
        </h3>
        {dest.tagline && (
          <span className="mt-1 text-xs leading-snug text-white/75 line-clamp-2">
            {dest.tagline}
          </span>
        )}
        <span className="mt-2 inline-flex translate-y-1 items-center gap-1 text-xs font-medium text-gold opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {locale === 'en' ? 'View destination' : 'Ver destino'}
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  )
}
