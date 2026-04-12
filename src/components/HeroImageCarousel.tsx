'use client'

import { useState, useEffect } from 'react'

const images = [
  { src: '/hero/hero-villa.jpg',       alt: 'Villa de lujo con piscina' },
  { src: '/hero/hero-beach-villa.jpg', alt: 'Villa en primera línea de playa' },
  { src: '/hero/hero-penthouse.jpg',   alt: 'Ático de lujo en ciudad' },
  { src: '/hero/hero-mansion.jpg',     alt: 'Mansión exclusiva' },
  { src: '/hero/hero-modern.jpg',      alt: 'Propiedad moderna de diseño' },
]

const DURATION = 5 // segundos por imagen
const TOTAL = images.length * DURATION // 25s ciclo total

export default function HeroImageCarousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length)
    }, DURATION * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* CSS keyframes inyectado una sola vez */}
      <style>{`
        ${images.map((_, i) => {
          const start    = ((i * DURATION) / TOTAL * 100).toFixed(1)
          const fadeIn   = (((i * DURATION) + 0.5) / TOTAL * 100).toFixed(1)
          const fadeOut  = ((((i + 1) * DURATION) - 0.5) / TOTAL * 100).toFixed(1)
          const end      = (((i + 1) * DURATION) / TOTAL * 100).toFixed(1)
          return `
          @keyframes hero-fade-${i} {
            0%, ${start}% { opacity: 0; }
            ${fadeIn}%    { opacity: 1; }
            ${fadeOut}%   { opacity: 1; }
            ${end}%, 100% { opacity: 0; }
          }
          .hero-img-${i} {
            animation: hero-fade-${i} ${TOTAL}s linear infinite;
          }`
        }).join('')}
      `}</style>

      <div style={{ position: 'absolute', inset: 0 }}>

        {/* Imágenes con CSS animation — crossfade sin JS */}
        {images.map((img, index) => (
          <div
            key={index}
            className={`hero-img-${index}`}
            style={{
              position: 'absolute',
              inset: 0,
              willChange: 'opacity',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt={img.alt}
              loading={index === 0 ? 'eager' : 'lazy'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
              }}
            />
          </div>
        ))}

        {/* Overlay lateral */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          background: 'linear-gradient(to right, rgba(19,29,46,0.65), rgba(19,29,46,0.3), transparent)',
        }} />

        {/* Overlay inferior */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          background: 'linear-gradient(to top, rgba(19,29,46,0.75), transparent, rgba(19,29,46,0.1))',
        }} />

        {/* Contenido hero */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 3,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center',
          paddingTop: '80px',
          paddingLeft: '2rem', paddingRight: '2rem',
          maxWidth: '720px',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            backgroundColor: 'rgba(212,175,55,0.9)',
            color: '#131D2E', fontSize: '0.75rem',
            fontWeight: 600, letterSpacing: '0.15em',
            textTransform: 'uppercase', padding: '6px 14px',
            borderRadius: '4px', marginBottom: '1.5rem',
            width: 'fit-content',
          }}>
            Barcelona · International Real Estate
          </div>

          <h1 style={{
            fontFamily: '"Playfair Display", Georgia, serif',
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

          <p style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '1rem', marginBottom: '2rem',
            maxWidth: '480px',
          }}>
            Tasación gratuita y confidencial en 24 horas. Sin compromiso.
          </p>

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

        {/* Indicadores laterales — JS solo para visual activo */}
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
                backgroundColor: current === i
                  ? '#D4AF37'
                  : 'rgba(255,255,255,0.4)',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.3s ease', padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </>
  )
}
