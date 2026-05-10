'use server'

import { createLead } from '@/lib/supabase/queries'
import type { LeadData } from '@/types'
import { checkBotId } from 'botid/server'

export interface ActionState {
  success?: boolean
  error?: string
}

export async function submitLeadAction(
  _prev: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const verification = await checkBotId()
  if (verification.isBot) {
    return {
      success: false,
      error: 'Detección de bot. Recargá la página e intentá de nuevo.'
    } as ActionState
  }
  const name = (formData.get('name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()
  const is_owner_raw = formData.get('is_owner') as string
  const neighborhood = (formData.get('neighborhood') as string) ?? ''
  const property_value_range = (formData.get('property_value_range') as string) ?? ''
  const sale_timeline = (formData.get('sale_timeline') as string) ?? ''
  const gdpr = formData.get('gdpr')

  if (!name || !email || !phone) {
    return { error: 'Por favor complete los campos obligatorios.' }
  }
  if (!gdpr) {
    return { error: 'Debe aceptar la política de privacidad.' }
  }

  const is_owner = is_owner_raw === 'true'

  const lead: LeadData = {
    name,
    email,
    phone,
    is_owner,
    neighborhood,
    property_value_range,
    sale_timeline,
    source: 'website',
  }

  const result = await createLead(lead)

  if (!result.success) {
    return { error: 'No se pudo enviar la solicitud. Inténtelo de nuevo.' }
  }

  // Notificación email + n8n — fire and forget
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  fetch(`${siteUrl}/api/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      email,
      phone,
      interest: 'sell',
      message: `Barrio: ${neighborhood || 'N/A'}. Valor: ${property_value_range || 'N/A'}. Plazo: ${sale_timeline || 'N/A'}. Propietario: ${is_owner ? 'Sí' : 'No'}.`,
      source: 'sell-property-form',
    }),
  }).catch(() => {})

  return { success: true }
}
