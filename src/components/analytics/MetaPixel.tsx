'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

// Dispara PageView en cada navegación SPA (el init script va en RootLayout)
export default function MetaPixelPageViewTracker() {
  const pathname = usePathname()
  const mounted = useRef(false)

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    if (typeof window.fbq !== 'undefined') {
      window.fbq('track', 'PageView')
    }
  }, [pathname])

  return null
}
