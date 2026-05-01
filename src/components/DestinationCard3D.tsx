'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { CountryDestination } from '@/types'

interface Props {
  dest: CountryDestination
  count: number
}

export default function DestinationCard3D({ dest, count }: Props) {
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
          src={dest.card_image_url ?? dest.hero_image_url!}
          alt={dest.country_name}
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

      <div className="overlay-dark" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
        <span className="font-display text-lg font-semibold text-white group-hover:text-gold transition-colors">
          {dest.country_name}
        </span>
        {count > 0 && (
          <span className="mt-1 text-xs text-white/60">
            {count} {count === 1 ? 'propiedad' : 'propiedades'}
          </span>
        )}
        {dest.tagline && (
          <span className="mt-1 text-xs text-white/70 line-clamp-2">{dest.tagline}</span>
        )}
      </div>
    </Link>
  )
}
