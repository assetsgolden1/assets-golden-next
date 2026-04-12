'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

const heroImages = [
  { src: '/hero/hero-villa.jpg', alt: 'Villa de lujo' },
  { src: '/hero/hero-beach-villa.jpg', alt: 'Villa en la playa' },
  { src: '/hero/hero-penthouse.jpg', alt: 'Ático de lujo' },
  { src: '/hero/hero-mansion.jpg', alt: 'Mansión exclusiva' },
  { src: '/hero/hero-modern.jpg', alt: 'Propiedad moderna' },
]

export default function HeroImageCarousel() {
  const [current, setCurrent] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    /*
     * TODOS los estilos de la cadena de altura son inline → aplican ANTES
     * de que el navegador procese el stylesheet de Tailwind.
     * position:absolute + inset:0 + w:100% + h:100% = ocupa todo el padre
     */
    <div
      className="hero-carousel"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      {/* ── Imágenes en crossfade ───────────────────────────── */}
      {heroImages.map((img, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            // Primera imagen: opacity 1 desde el primer render (sin JS, sin CSS)
            // Resto: opacity 0 inicialmente
            // Después de montar: controlled por current con transición
            opacity: mounted ? (i === current ? 1 : 0) : (i === 0 ? 1 : 0),
            transition: mounted ? 'opacity 1s ease-in-out' : 'none',
          }}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            priority={i === 0}
            sizes="(max-width: 1024px) 100vw, calc(100vw - 288px)"
            className="object-cover object-center"
          />
        </div>
      ))}

      {/* ── Overlays de gradiente ───────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-primary/10" />

      {/* ── Contenido: texto y botones ─────────────────────── */}
      {/* paddingTop:80px (h-20) compensa el header fixed — inline para SSR */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingTop: '80px',
          paddingLeft: '2rem',
          paddingRight: '2rem',
        }}
        className="md:px-12 lg:px-16"
      >
        <div className="max-w-2xl">
          <p className="inline-block bg-gold text-primary px-5 py-2 text-xs sm:text-sm mb-8 font-semibold tracking-wider">
            Barcelona · International Real Estate
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-primary-foreground mb-8 leading-[1.1]">
            Venda su piso en Barcelona
            <br />
            <span className="text-gradient-gold">con la discreción</span>
            <br />
            que merece
          </h1>
          <p className="text-lg text-white/70 leading-relaxed mb-8 max-w-lg">
            Tasación gratuita y confidencial en 24 horas. Sin compromiso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/vender-tu-piso" className={buttonVariants({ variant: 'hero', size: 'xl' })}>
              Solicitar tasación gratuita
            </Link>
            <Link href="/propiedades" className={buttonVariants({ variant: 'heroOutline', size: 'xl' })}>
              Ver propiedades
            </Link>
          </div>
        </div>
      </div>

      {/* ── Indicadores laterales ───────────────────────────── */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
        {heroImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Imagen ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current ? 'w-2 h-8 bg-gold' : 'w-2 h-2 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* ── Scroll indicator ────────────────────────────────── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary-foreground/60 animate-bounce z-20">
        <ChevronDown className="w-8 h-8" />
      </div>
    </div>
  )
}
