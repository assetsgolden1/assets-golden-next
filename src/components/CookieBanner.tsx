'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'ag_cookie_consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'all')
    setVisible(false)
  }

  function necessary() {
    localStorage.setItem(STORAGE_KEY, 'necessary')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] border-t border-border bg-background/98 shadow-xl backdrop-blur-sm">
      <div className="container-luxury flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          Utilizamos cookies propias y de terceros para mejorar su experiencia y analizar el tráfico.{' '}
          <Link href="/politica-de-privacidad" className="text-gold hover:underline">
            Más información
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={necessary}
            className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-gold hover:text-foreground"
          >
            Solo necesarias
          </button>
          <button
            onClick={accept}
            className="btn-gold rounded-lg px-5 py-2 text-xs font-semibold"
          >
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  )
}
