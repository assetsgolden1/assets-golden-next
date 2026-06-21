'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CountryDestination } from '@/types'
import DestinationCard3D from '@/components/DestinationCard3D'

interface CarouselItem {
  dest: CountryDestination
  count: number
}

interface Props {
  items: CarouselItem[]
  locale: string
}

export default function DestinationsCarousel({ items, locale }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const updateArrows = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    // 1px de tolerancia para redondeos
    setCanPrev(scrollLeft > 1)
    setCanNext(scrollLeft < scrollWidth - clientWidth - 1)
  }, [])

  useEffect(() => {
    updateArrows()
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', updateArrows, { passive: true })
    window.addEventListener('resize', updateArrows)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
    }
  }, [updateArrows, items.length])

  function scrollByPage(dir: 1 | -1) {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' })
  }

  if (items.length === 0) return null

  return (
    <div className="relative">
      {/* Track scrolleable: overflow-x para swipe nativo + scroll-snap.
          Padding vertical para que el tilt 3D y el glow dorado de las
          tarjetas no queden recortados por el overflow del scroll. */}
      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-6 -my-6 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map(({ dest, count }) => (
          <div
            key={dest.id}
            className="snap-start shrink-0 grow-0 basis-[calc(50%-0.5rem)] sm:basis-[calc(33.333%-0.667rem)] lg:basis-[calc(25%-0.75rem)] xl:basis-[calc(20%-0.8rem)]"
          >
            <DestinationCard3D dest={dest} count={count} locale={locale} />
          </div>
        ))}
      </div>

      {/* Flecha anterior */}
      <button
        type="button"
        aria-label="Destinos anteriores"
        onClick={() => scrollByPage(-1)}
        disabled={!canPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 hidden h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-background/90 text-gold shadow-lg backdrop-blur transition-all hover:bg-gold hover:text-background disabled:pointer-events-none disabled:opacity-0 md:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Flecha siguiente */}
      <button
        type="button"
        aria-label="Destinos siguientes"
        onClick={() => scrollByPage(1)}
        disabled={!canNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 hidden h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-background/90 text-gold shadow-lg backdrop-blur transition-all hover:bg-gold hover:text-background disabled:pointer-events-none disabled:opacity-0 md:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
