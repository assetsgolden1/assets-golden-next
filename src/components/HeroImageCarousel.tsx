'use client'

import { useState, useEffect } from 'react'

// Imágenes verificadas en public/hero/
const images = [
  { src: '/hero/hero-villa.jpg',       alt: 'Villa de lujo con piscina' },
  { src: '/hero/hero-beach-villa.jpg', alt: 'Villa en primera línea de playa' },
  { src: '/hero/hero-penthouse.jpg',   alt: 'Ático de lujo en ciudad' },
  { src: '/hero/hero-mansion.jpg',     alt: 'Mansión exclusiva' },
  { src: '/hero/hero-modern.jpg',      alt: 'Propiedad moderna de diseño' },
]

export default function HeroImageCarousel() {
  // Opacidad controlada únicamente por current — sin mounted, sin condicionales
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0 }}>

      {/* ── Imágenes con <img> nativo ── sin problema de hidratación ── */}
      {images.map((img, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: current === index ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
            zIndex: current === index ? 1 : 0,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.src}
            alt={img.alt}
            loading="eager"
            fetchPriority={index <= 1 ? 'high' : 'auto'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center'
            }}
          />
        </div>
      ))}

      {/* ── Overlay lateral ─────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        background: 'linear-gradient(to right, rgba(19,29,46,0.65), rgba(19,29,46,0.3), transparent)',
      }} />

      {/* ── Overlay inferior ────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        background: 'linear-gradient(to top, rgba(19,29,46,0.75), transparent, rgba(19,29,46,0.1))',
      }} />

      {/* ── Contenido hero ──────────────────────────────────── */}
      {/*
        paddingTop:80px compensa el header fixed de 80px.
        El hero section empieza en y=0 (marginTop:-80px en page.tsx),
        así el contenido arranca en y=80 (justo bajo el header).
      */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        paddingTop: '80px',
        paddingLeft: '2rem', paddingRight: '2rem',
        maxWidth: '720px',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          backgroundColor: 'rgba(212,175,55,0.9)', color: '#131D2E',
          fontSize: '0.75rem', fontWeight: 600,
          letterSpacing: '0.15em', textTransform: 'uppercase',
          padding: '6px 14px', borderRadius: '4px',
          marginBottom: '1.5rem', width: 'fit-content',
        }}>
          Barcelona · International Real Estate
        </div>

        {/* Título */}
        <h1 style={{
          fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 600, color: '#ffffff',
          lineHeight: 1.15, marginBottom: '1rem',
        }}>
          Venda su piso en Barcelona{' '}
          <span style={{ color: '#D4AF37', fontStyle: 'italic' }}>
            con la discreción
          </span>
          {' '}que merece
        </h1>

        {/* Subtítulo */}
        <p style={{
          color: 'rgba(255,255,255,0.8)',
          fontSize: '1rem', marginBottom: '2rem', maxWidth: '480px',
        }}>
          Tasación gratuita y confidencial en 24 horas. Sin compromiso.
        </p>

        {/* Botones */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="/vender-tu-piso" style={{
            backgroundColor: '#D4AF37', color: '#131D2E',
            padding: '14px 28px', borderRadius: '4px',
            fontWeight: 600, fontSize: '0.95rem',
            textDecoration: 'none', display: 'inline-block',
          }}>
            Solicitar tasación gratuita
          </a>
          <a href="/propiedades" style={{
            backgroundColor: 'transparent', color: '#ffffff',
            padding: '14px 28px', borderRadius: '4px',
            fontWeight: 600, fontSize: '0.95rem',
            textDecoration: 'none', display: 'inline-block',
            border: '1px solid rgba(255,255,255,0.5)',
          }}>
            Ver propiedades
          </a>
        </div>
      </div>

      {/* ── Indicadores laterales ───────────────────────────── */}
      <div style={{
        position: 'absolute', right: '1.5rem',
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
              backgroundColor: current === i ? '#D4AF37' : 'rgba(255,255,255,0.4)',
              border: 'none', cursor: 'pointer',
              transition: 'all 0.3s ease', padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  )
}
