'use client'

declare global {
  interface Window {
    fbq?: (method: string, eventName: string, params?: Record<string, unknown>, options?: { eventID?: string }) => void
  }
}

// Dispara un evento client-side vía fbq
export function fbqTrack(
  eventName: string,
  params?: Record<string, unknown>,
  eventID?: string
) {
  if (typeof window === 'undefined' || !window.fbq) return
  if (eventID) {
    window.fbq('track', eventName, params ?? {}, { eventID })
  } else {
    window.fbq('track', eventName, params ?? {})
  }
}

// Envía un evento al CAPI server-side vía API route
export async function sendServerEvent(payload: {
  eventName: 'Lead' | 'Contact' | 'ViewContent' | 'PageView'
  eventId?: string
  userData?: {
    email?: string
    phone?: string
    firstName?: string
    lastName?: string
  }
  customData?: {
    currency?: string
    value?: number
    contentName?: string
    contentIds?: string[]
  }
}) {
  try {
    await fetch('/api/meta/conversion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    // No bloquear la UX si el tracking falla
  }
}
