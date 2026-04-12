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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex-1 relative flex items-center justify-center overflow-hidden min-h-[calc(100vh-80px)]">
      {/* Background images with crossfade */}
      <div className="absolute inset-0">
        {heroImages.map((img, index) => (
          <Image
            key={index}
            src={img.src}
            alt={img.alt}
            fill
            priority={index === 0}
            className={`object-cover transition-opacity duration-1000 ${index === current ? 'opacity-100' : 'opacity-0'}`}
            sizes="(max-width: 1024px) 100vw, calc(100vw - 288px)"
          />
        ))}
        {/* Double overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-primary/10" />
      </div>

      {/* Hero content */}
      <div className="relative z-10 px-8 md:px-16 lg:px-20 py-20 w-full">
        <div className="max-w-3xl">
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

      {/* Image indicators — right side */}
      <div className="absolute bottom-24 right-8 flex flex-col gap-2 z-20">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            aria-label={`Imagen ${index + 1}`}
            className={`w-2 rounded-full transition-all duration-300 ${
              index === current
                ? 'h-8 bg-gold'
                : 'h-2 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary-foreground/60 animate-bounce">
        <ChevronDown className="w-8 h-8" />
      </div>
    </div>
  )
}
