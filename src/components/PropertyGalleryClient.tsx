'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'

interface Props {
  images: string[]
  title: string
}

export default function PropertyGalleryClient({ images, title }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Embla para thumbnails
  const [emblaRef] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  })

  // Embla para imagen principal en mobile (swipe)
  const [mainEmblaRef, mainEmblaApi] = useEmblaCarousel({ loop: true })

  const onMainSelect = useCallback(() => {
    if (!mainEmblaApi) return
    setSelectedIndex(mainEmblaApi.selectedScrollSnap())
  }, [mainEmblaApi])

  // Registrar listener de Embla para sincronizar índice en mobile
  useState(() => {
    if (!mainEmblaApi) return
    mainEmblaApi.on('select', onMainSelect)
    return () => { mainEmblaApi.off('select', onMainSelect) }
  })

  if (images.length === 0) return null

  function prev() {
    setSelectedIndex((i) => (i - 1 + images.length) % images.length)
  }

  function next() {
    setSelectedIndex((i) => (i + 1) % images.length)
  }

  function openLightbox(index: number) {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  function lightboxPrev() {
    setLightboxIndex((i) => (i - 1 + images.length) % images.length)
  }

  function lightboxNext() {
    setLightboxIndex((i) => (i + 1) % images.length)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') lightboxPrev()
    if (e.key === 'ArrowRight') lightboxNext()
    if (e.key === 'Escape') setLightboxOpen(false)
  }

  return (
    <>
      {/* ── Imagen principal ──────────────────────────────── */}
      <section className="bg-muted">
        {/* Desktop: imagen fija con navegación */}
        <div className="relative hidden md:block">
          <div
            className="relative aspect-[21/9] cursor-pointer"
            onClick={() => openLightbox(selectedIndex)}
          >
            <Image
              src={images[selectedIndex]}
              alt={`${title} — imagen ${selectedIndex + 1}`}
              fill
              unoptimized
              className="object-cover transition-opacity duration-300"
              sizes="100vw"
              priority={selectedIndex === 0}
            />
          </div>

          {/* Flechas prev/next */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition-colors"
                aria-label="Imagen siguiente"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Contador */}
          <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>

        {/* Mobile: swipe con Embla */}
        <div className="relative md:hidden overflow-hidden" ref={mainEmblaRef}>
          <div className="flex">
            {images.map((img, i) => (
              <div
                key={i}
                className="relative aspect-[16/9] flex-[0_0_100%] cursor-pointer"
                onClick={() => openLightbox(i)}
              >
                <Image
                  src={img}
                  alt={`${title} — imagen ${i + 1}`}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="100vw"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
          {/* Contador mobile */}
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-0.5 rounded-full">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>

        {/* ── Carrusel horizontal de thumbnails ─────────────── */}
        {images.length > 1 && (
          <div className="overflow-hidden p-3" ref={emblaRef}>
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedIndex(i)}
                  className={`relative flex-[0_0_auto] w-24 h-16 md:w-32 md:h-20 rounded-lg overflow-hidden shrink-0 transition-all duration-200 ${
                    i === selectedIndex
                      ? 'ring-2 ring-gold ring-offset-2 opacity-100'
                      : 'opacity-60 hover:opacity-90'
                  }`}
                  aria-label={`Ver imagen ${i + 1}`}
                >
                  <Image
                    src={img}
                    alt={`${title} — miniatura ${i + 1}`}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="128px"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Lightbox ──────────────────────────────────────── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-primary/95 flex flex-col items-center justify-center"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Cerrar */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gold transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navegación */}
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

          {/* Imagen */}
          <div className="relative w-full max-w-5xl max-h-[80vh] px-16">
            <Image
              src={images[lightboxIndex]}
              alt={`${title} — imagen ${lightboxIndex + 1}`}
              width={1200}
              height={800}
              unoptimized
              className="object-contain w-full h-full max-h-[80vh]"
              sizes="90vw"
            />
          </div>

          {/* Contador */}
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {lightboxIndex + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  )
}
