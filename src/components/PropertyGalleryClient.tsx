'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface Props {
  images: string[]
  title: string
}

export default function PropertyGalleryClient({ images, title }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  if (images.length === 0) return null

  const heroImage = images[0]
  const thumbnails = images.slice(1)

  function openLightbox(index: number) {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  function prev() {
    setLightboxIndex((i) => (i - 1 + images.length) % images.length)
  }

  function next() {
    setLightboxIndex((i) => (i + 1) % images.length)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'ArrowRight') next()
    if (e.key === 'Escape') setLightboxOpen(false)
  }

  return (
    <>
      {/* Hero image */}
      <section className="bg-muted">
        <div
          className="relative aspect-[16/9] md:aspect-[21/9] cursor-pointer"
          onClick={() => openLightbox(0)}
        >
          <Image
            src={heroImage}
            alt={title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>

        {/* Thumbnails */}
        {thumbnails.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
            {thumbnails.map((img, i) => (
              <div
                key={i}
                className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                onClick={() => openLightbox(i + 1)}
              >
                <Image
                  src={img}
                  alt={`${title} — imagen ${i + 2}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-primary/95 flex flex-col items-center justify-center"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gold transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gold transition-colors"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>
              <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gold transition-colors"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            </>
          )}

          {/* Image */}
          <div className="relative w-full max-w-5xl max-h-[80vh] px-16">
            <Image
              src={images[lightboxIndex]}
              alt={`${title} — imagen ${lightboxIndex + 1}`}
              width={1200}
              height={800}
              className="object-contain w-full h-full max-h-[80vh]"
              sizes="90vw"
            />
          </div>

          {/* Counter */}
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {lightboxIndex + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  )
}
