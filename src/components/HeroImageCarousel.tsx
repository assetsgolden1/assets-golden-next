'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'

import heroVilla from '@/assets/hero-villa.jpg'
import heroBeach from '@/assets/hero-beach-villa.jpg'
import heroPenthouse from '@/assets/hero-penthouse.jpg'
import heroMansion from '@/assets/hero-mansion.jpg'
import heroModern from '@/assets/hero-modern.jpg'

const images = [
  { src: heroVilla,     alt: 'Villa exclusiva con piscina' },
  { src: heroBeach,     alt: 'Villa en primera línea de playa' },
  { src: heroPenthouse, alt: 'Ático exclusivo en ciudad' },
  { src: heroMansion,   alt: 'Mansión exclusiva' },
  { src: heroModern,    alt: 'Propiedad moderna de diseño' },
]

interface HeroImageCarouselProps {
  tagline?: string
  title: string
  subtitle: string
  ctaValuation: string
  ctaProperties: string
}

export default function HeroImageCarousel({
  tagline,
  title,
  subtitle,
  ctaValuation,
  ctaProperties,
}: HeroImageCarouselProps) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0 }}>

      {/* Imágenes con static import — disponibles en build time */}
      {images.map((img, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            inset: 0,
            transition: 'opacity 1000ms ease-in-out',
            opacity: index === current ? 1 : 0,
            zIndex: index === current ? 1 : 0,
          }}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            priority={index === 0}
            sizes="(max-width: 1024px) 100vw, calc(100vw - 288px)"
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
        </div>
      ))}

      {/* Overlay lateral */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        background: 'linear-gradient(to right, rgba(19,29,46,0.75), rgba(19,29,46,0.4) 40%, transparent 70%)',
      }} />

      {/* Overlay inferior */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        background: 'linear-gradient(to top, rgba(19,29,46,0.8), transparent 50%)',
      }} />

      {/* Contenido */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        paddingTop: '80px',
        paddingLeft: '2rem', paddingRight: '2rem',
        maxWidth: '680px',
      }}>
        {tagline && (
          <p style={{
            color: 'rgba(255,255,255,0.65)',
            fontSize: 'clamp(0.7rem, 1.2vw, 0.85rem)',
            marginBottom: '12px',
            textTransform: 'uppercase', letterSpacing: '0.18em',
            fontWeight: 600,
          }}>
            {tagline}
          </p>
        )}

        <h1 style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: 'clamp(1.8rem, 4vw, 3.2rem)',
          fontWeight: 700, color: '#D4AF37',
          lineHeight: 1.1, marginBottom: '20px',
          textTransform: 'uppercase', letterSpacing: '0.04em',
        }}>
          {title}
        </h1>

        <p style={{
          color: 'rgba(255,255,255,0.85)',
          fontSize: 'clamp(0.85rem, 1.5vw, 1.1rem)',
          lineHeight: 1.5,
          marginBottom: '36px', maxWidth: '480px',
          textTransform: 'uppercase', letterSpacing: '0.1em',
          fontWeight: 500,
        }}>
          {subtitle}
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link href="/vender-tu-piso" style={{
            background: '#D4AF37', color: '#131D2E',
            padding: '15px 32px', borderRadius: '4px',
            fontWeight: 700, fontSize: '0.95rem',
            textDecoration: 'none', display: 'inline-block',
          }}>
            {ctaValuation}
          </Link>
          <Link href="/propiedades" style={{
            background: 'transparent', color: '#ffffff',
            padding: '15px 32px', borderRadius: '4px',
            fontWeight: 600, fontSize: '0.95rem',
            textDecoration: 'none', display: 'inline-block',
            border: '1.5px solid rgba(255,255,255,0.5)',
          }}>
            {ctaProperties}
          </Link>
        </div>
      </div>

      {/* Indicadores */}
      <div style={{
        position: 'absolute', right: '24px',
        top: '50%', transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column',
        gap: '8px', zIndex: 4,
      }}>
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Imagen ${i + 1}`}
            style={{
              width: '8px',
              height: current === i ? '32px' : '8px',
              borderRadius: '999px',
              background: current === i ? '#D4AF37' : 'rgba(255,255,255,0.4)',
              border: 'none', cursor: 'pointer',
              transition: 'all 0.3s ease', padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  )
}
