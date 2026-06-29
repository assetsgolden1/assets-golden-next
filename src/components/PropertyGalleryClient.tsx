'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, Images } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import { optimizedImage } from '@/lib/utils/optimizedImage'

interface Props {
  images: string[]
  title: string
}

// Spans del mosaico según la cantidad total de imágenes — siempre llenan
// la grilla 4×2 de forma balanceada (1 → full; 2 → 1+1; 3 → 1 grande + 2
// apiladas; 4 → 1 grande + 1 ancha + 2; ≥5 → 1 grande + 4 en 2×2).
function bigClass(n: number) {
  return n === 1 ? 'col-span-4 row-span-2' : 'col-span-2 row-span-2'
}
function smallClass(n: number, i: number) {
  if (n === 2) return 'col-span-2 row-span-2'
  if (n === 3) return 'col-span-2 row-span-1'
  if (n === 4) return i === 0 ? 'col-span-2 row-span-1' : 'col-span-1 row-span-1'
  return 'col-span-1 row-span-1'
}

export default function PropertyGalleryClient({ images, title }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [mobileIndex, setMobileIndex] = useState(0)

  // Embla para la imagen principal en mobile (swipe)
  const [mainEmblaRef, mainEmblaApi] = useEmblaCarousel({ loop: true })

  const onMobileSelect = useCallback(() => {
    if (mainEmblaApi) setMobileIndex(mainEmblaApi.selectedScrollSnap())
  }, [mainEmblaApi])

  useEffect(() => {
    if (!mainEmblaApi) return
    mainEmblaApi.on('select', onMobileSelect)
    return () => { mainEmblaApi.off('select', onMobileSelect) }
  }, [mainEmblaApi, onMobileSelect])

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }, [])

  const lightboxPrev = useCallback(() => {
    setLightboxIndex((i) => (i - 1 + images.length) % images.length)
  }, [images.length])

  const lightboxNext = useCallback(() => {
    setLightboxIndex((i) => (i + 1) % images.length)
  }, [images.length])

  // Teclado en el lightbox (global mientras está abierto)
  useEffect(() => {
    if (!lightboxOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') lightboxPrev()
      if (e.key === 'ArrowRight') lightboxNext()
      if (e.key === 'Escape') setLightboxOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, lightboxPrev, lightboxNext])

  if (images.length === 0) return null

  const mosaicBig = images[0]
  const mosaicSmalls = images.slice(1, 5)
  const extra = images.length - 5 // fotos no mostradas en el mosaico

  return (
    <>
      {/* ── Desktop: mosaico hero ─────────────────────────── */}
      <section className="hidden md:block">
        <div className="container-luxury pt-4">
         <div className="relative">
          <div className="grid grid-cols-4 grid-rows-2 gap-2 aspect-[16/9] rounded-xl overflow-hidden">
            {/* Imagen grande */}
            <button
              onClick={() => openLightbox(0)}
              className={`group relative ${bigClass(images.length)} bg-muted overflow-hidden`}
              aria-label="Ver imagen 1 en pantalla completa"
            >
              <Image
                src={optimizedImage(mosaicBig, { width: 1280, quality: 72 })}
                alt={`${title} — imagen 1`}
                fill
                unoptimized
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 1024px) 60vw, 640px"
              />
            </button>

            {/* Imágenes pequeñas */}
            {mosaicSmalls.map((img, i) => {
              const isLast = i === mosaicSmalls.length - 1
              return (
                <button
                  key={i}
                  onClick={() => openLightbox(i + 1)}
                  className={`group relative ${smallClass(images.length, i)} bg-muted overflow-hidden`}
                  aria-label={`Ver imagen ${i + 2} en pantalla completa`}
                >
                  <Image
                    src={optimizedImage(img, { width: 640, quality: 65 })}
                    alt={`${title} — imagen ${i + 2}`}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="320px"
                  />
                  {/* Overlay "+N" en la última celda si hay más fotos */}
                  {isLast && extra > 0 && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-white font-display text-2xl font-semibold">
                      +{extra}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Botón "ver todas las fotos" */}
          {images.length > 1 && (
            <button
              onClick={() => openLightbox(0)}
              className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-lg bg-white/95 text-navy px-4 py-2 text-sm font-medium shadow-lg hover:bg-white transition-colors"
            >
              <Images className="h-4 w-4" />
              Ver las {images.length} fotos
            </button>
          )}
         </div>
        </div>
      </section>

      {/* ── Mobile: swipe con Embla ───────────────────────── */}
      <section className="md:hidden bg-muted">
        <div className="relative overflow-hidden" ref={mainEmblaRef}>
          <div className="flex">
            {images.map((img, i) => (
              <div
                key={i}
                className="relative aspect-[4/3] flex-[0_0_100%] cursor-pointer"
                onClick={() => openLightbox(i)}
              >
                <Image
                  src={optimizedImage(img, { width: 900, quality: 70 })}
                  alt={`${title} — imagen ${i + 1}`}
                  fill
                  unoptimized
                  priority={i === 0}
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
            ))}
          </div>
          {/* Contador */}
          <div className="absolute bottom-3 left-3 bg-black/55 text-white text-xs px-2.5 py-1 rounded-full">
            {mobileIndex + 1} / {images.length}
          </div>
          {/* Ver todas */}
          {images.length > 1 && (
            <button
              onClick={() => openLightbox(mobileIndex)}
              className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-white/95 text-navy px-3 py-1.5 text-xs font-medium shadow-md"
            >
              <Images className="h-3.5 w-3.5" />
              Ver las {images.length}
            </button>
          )}
        </div>
      </section>

      {/* ── Lightbox ──────────────────────────────────────── */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-primary/95 flex flex-col items-center justify-center">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gold transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-8 h-8" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={lightboxPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gold transition-colors"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
              <button
                onClick={lightboxNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gold transition-colors"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            </>
          )}

          <div className="relative w-full max-w-6xl max-h-[82vh] px-12 md:px-16">
            <Image
              src={optimizedImage(images[lightboxIndex], { width: 2000, quality: 80 })}
              alt={`${title} — imagen ${lightboxIndex + 1}`}
              width={1600}
              height={1067}
              unoptimized
              className="object-contain w-full h-full max-h-[82vh]"
              sizes="90vw"
            />
          </div>

          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {lightboxIndex + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  )
}
