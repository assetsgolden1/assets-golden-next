'use client'

import { useEffect } from 'react'
import { captureAttribution } from '@/lib/attribution'

/**
 * Captura los UTMs / fbclid de la URL de aterrizaje y los guarda en sessionStorage
 * (first-touch de la sesión). Se monta en el layout público, así cubre toda la web
 * pública y no solo una ficha.
 *
 * No renderiza nada y no toca SSR/ISR: el efecto corre solo en el cliente. Tampoco
 * depende del consentimiento de cookies porque no es tracking de terceros — es el
 * propio origen del lead que el usuario va a enviarnos en el formulario.
 */
export default function AttributionCapture() {
  useEffect(() => {
    captureAttribution()
  }, [])

  return null
}
