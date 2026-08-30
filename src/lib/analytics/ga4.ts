'use client'

declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'js' | 'consent',
      eventNameOrId: string | Date,
      params?: Record<string, unknown>
    ) => void
  }
}

/**
 * Fuente del formulario. Mismos valores que la columna `form_source` de la BD
 * y del Sheet de contactos, para poder cruzar GA4 contra los leads reales.
 */
export type LeadSource =
  | 'contacto'
  | 'demand_form'
  | 'asset_form'
  | 'collaboration_form'
  | 'property_contact'

/**
 * Dispara `generate_lead`, el evento recomendado de GA4 para captación de
 * leads. Se llama solo tras un envío con respuesta OK del endpoint, así que
 * cuenta leads reales y no intentos.
 *
 * `window.gtag` solo existe si el usuario aceptó la categoría "analytics" en
 * el banner de cookies (ver CookieConsentInit): sin consentimiento esto es un
 * no-op y no hay que añadir ninguna comprobación extra de RGPD.
 */
export function trackLead(source: LeadSource, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !window.gtag) return
  window.gtag('event', 'generate_lead', {
    form_source: source,
    ...params,
  })
}
