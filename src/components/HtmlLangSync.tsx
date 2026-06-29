'use client'

import { useEffect } from 'react'

/**
 * El <html lang> lo fija el root layout estáticamente en "es" (para no forzar
 * render dinámico). En /en eso es incorrecto para a11y, así que acá corregimos
 * `document.documentElement.lang` al locale real tras montar. No afecta el SEO
 * principal (los hreflang alternates ya son correctos por página).
 */
export default function HtmlLangSync({ locale }: { locale: string }) {
  useEffect(() => {
    if (locale && document.documentElement.lang !== locale) {
      document.documentElement.lang = locale
    }
  }, [locale])
  return null
}
