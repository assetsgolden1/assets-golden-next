'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { optimizedImage } from '@/lib/utils/optimizedImage'

interface Props {
  images: string[]
  alt: string
  sold?: boolean | null
}

/**
 * Mini-carrusel para la tarjeta de propiedad. Renderiza SOLO la imagen actual
 * (la `src` cambia al navegar) → el browser solo descarga las fotos que el
 * usuario realmente mira, sin precargar toda la galería (egress acotado).
 * Las flechas hacen stopPropagation/preventDefault para no disparar el link
 * de la tarjeta.
 */
export default function PropertyCardCarousel({ images, alt, sold }: Props) {
  const [index, setIndex] = useState(0)
  const total = images.length
  const multi = total > 1

  function step(e: React.MouseEvent, dir: 1 | -1) {
    e.preventDefault()
    e.stopPropagation()
    setIndex((p) => (p + dir + total) % total)
  }

  return (
    <>
      <Image
        src={optimizedImage(images[index], { width: 640, quality: 65 })}
        alt={alt}
        fill
        unoptimized
        className={`object-cover transition-transform duration-700 group-hover:scale-110 ${sold ? 'opacity-60' : ''}`}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />

      {multi && (
        <>
          <button
            type="button"
            onClick={(e) => step(e, -1)}
            aria-label="Imagen anterior"
            className="absolute left-2 top-1/2 z-20 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white opacity-0 transition-opacity duration-200 hover:bg-black/65 group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => step(e, 1)}
            aria-label="Imagen siguiente"
            className="absolute right-2 top-1/2 z-20 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white opacity-0 transition-opacity duration-200 hover:bg-black/65 group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Indicador: puntitos si son pocas fotos, contador si son muchas */}
          {total <= 6 ? (
            <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1">
              {images.map((_, d) => (
                <span
                  key={d}
                  className={`h-1.5 rounded-full transition-all ${d === index ? 'w-4 bg-white' : 'w-1.5 bg-white/55'}`}
                />
              ))}
            </div>
          ) : (
            <div className="absolute bottom-2 right-2 z-20 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white">
              {index + 1}/{total}
            </div>
          )}
        </>
      )}
    </>
  )
}
