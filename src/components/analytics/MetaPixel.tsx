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
    // El panel /admin y el /portal son uso interno: sus navegaciones no deben
    // contar como PageView de campaña (este tracker vive en el layout RAÍZ).
    if (/^\/(admin|portal)(\/|$)/.test(pathname)) return
    if (typeof window.fbq !== 'undefined') {
      window.fbq('track', 'PageView')
    }
  }, [pathname])

  return null
}
