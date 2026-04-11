'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie } from 'lucide-react'

const STORAGE_KEY = 'ag_cookie_consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 1000)
      return () => clearTimeout(timer)
    }
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
    <div className="fixed bottom-20 left-4 z-50 max-w-sm bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-xl p-4">
      <div className="flex gap-3 mb-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
          <Cookie className="h-4 w-4 text-gold" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Utilizamos cookies para mejorar su experiencia.{' '}
          <Link href="/politica-de-privacidad" className="text-gold hover:underline">
            Más información
          </Link>
          .
        </p>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={necessary}
          className="h-8 px-3 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Rechazar
        </button>
        <button
          onClick={accept}
          className="h-8 px-4 rounded-lg bg-gold text-navy text-xs font-semibold hover:bg-gold/90 transition-colors"
        >
          Aceptar
        </button>
      </div>
    </div>
  )
}
