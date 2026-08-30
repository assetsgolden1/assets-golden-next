import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { appendLeadToSheets } from '@/lib/googleSheets'
import { checkBotId } from 'botid/server'

/**
 * Los desplegables del formulario envían el VALOR interno (`menos_300k`), no la
 * etiqueta. Guardar el valor crudo dejaba el panel y el Sheet ilegibles.
 * Se traduce siempre al español —etiqueta canónica— para que un envío desde /en
 * no guarde datos en otro idioma. Si aparece un valor nuevo, se guarda tal cual.
 */
const ETIQUETAS: Record<string, Record<string, string>> = {
  propertyType: {
    piso: 'Piso / Apartamento',
    villa: 'Villa',
    atico: 'Ático',
    local: 'Local comercial',
    otro: 'Otro',
  },
  budget: {
    menos_300k: 'Menos de 300.000 €',
    '300k_600k': '300.000 € – 600.000 €',
    '600k_1m': '600.000 € – 1.000.000 €',
    '1m_3m': '1.000.000 € – 3.000.000 €',
    mas_3m: 'Más de 3.000.000 €',
  },
  timeline: {
    inmediato: 'Inmediato',
    '3_6_meses': '3–6 meses',
    '6_12_meses': '6–12 meses',
    sin_prisa: 'Sin prisa',
  },
}

const etiqueta = (campo: keyof typeof ETIQUETAS, valor: unknown): string | null => {
  if (typeof valor !== 'string' || !valor.trim()) return null
  const v = valor.trim()
  return ETIQUETAS[campo][v] ?? v
}

export async function POST(req: NextRequest) {
  try {
    const verification = await checkBotId()
    if (verification.isBot) {
      return NextResponse.json({ error: 'Detección de bot' }, { status: 403 })
    }
    const body = await req.json()
    const { name, email, phone, propertyType, country, budget, features, timeline, attribution } = body
    // El formulario manda el prefijo aparte (`phone_prefix`) y antes se descartaba:
    // el teléfono quedaba sin código de país y no se podía llamar desde fuera.
    const prefijo = typeof body.phone_prefix === 'string' ? body.phone_prefix.trim() : ''
    const telefono = phone?.trim()
      ? (prefijo && !phone.trim().startsWith('+') ? `${prefijo} ${phone.trim()}` : phone.trim())
      : null

    // Atribución de campaña (WEB-ATRIB-1). Input de usuario → se sanea.
    const attr = (attribution ?? {}) as Record<string, unknown>
    const attrField = (k: string): string | null => {
      const v = attr[k]
      if (typeof v !== 'string') return null
      const t = v.trim().slice(0, 200)
      return t.length ? t : null
    }
    const utm = {
      utm_source: attrField('utm_source'),
      utm_medium: attrField('utm_medium'),
      utm_campaign: attrField('utm_campaign'),
      utm_content: attrField('utm_content'),
      fbclid: attrField('fbclid'),
      landing_page: attrField('landing_page'),
      referrer: attrField('referrer'),
    }
    const campaignParts = [utm.utm_source, utm.utm_campaign, utm.utm_content].filter(Boolean)
    const sheetSource = campaignParts.length
      ? campaignParts.join('/')
      : (utm.fbclid ? 'meta/fbclid' : 'demand_form')

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Nombre y email son obligatorios' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Estas solicitudes van a `leads` con source='demand_form' (decisión de
    // producto, 27/08). Antes se insertaban en una tabla `demands` que nunca
    // existió en Supabase: cada envío devolvía 500 y el lead se perdía sin
    // llegar siquiera al Sheet. Al ir a `leads` entran al circuito que ya
    // funciona: panel de admin, Google Sheets y atribución UTM.
    const { data: insertData, error: dbError } = await supabase.from('leads').insert({
      name: name.trim(),
      email: email.trim(),
      phone: telefono,
      // Campos propios del formulario mapeados a las columnas equivalentes,
      // con la etiqueta legible en vez del valor interno del desplegable:
      interest: etiqueta('propertyType', propertyType),        // qué tipo busca
      location: typeof country === 'string' ? country.trim() || null : null,
      property_value_range: etiqueta('budget', budget),        // presupuesto
      sale_timeline: etiqueta('timeline', timeline),           // plazo
      message: features?.trim() || null,                       // características
      source: 'demand_form',
      status: 'new',
      ...utm,
    }).select('id').single()

    if (dbError) {
      console.error('[demands API] DB error:', dbError.message)
      return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
    }
    console.log('[demands] INSERT OK en leads, id:', insertData?.id)

    // Google Sheets — AWAITED: en Vercel la función puede terminar antes de que
    // resuelva una promesa suelta y el lead no llegaría nunca al Sheet.
    try {
      // El Sheet tiene columnas propias para prefijo, país del teléfono y
      // presupuesto (A:L). No se enviaban: las filas de /mi-demanda llegaban
      // con esas tres vacías, a diferencia de las del diálogo de la home.
      await appendLeadToSheets({
        name: body.name,
        email: body.email,
        phone: phone?.trim() || undefined,
        phone_prefix: prefijo || undefined,
        phone_country: typeof body.phone_country === 'string' ? body.phone_country : undefined,
        budget: etiqueta('budget', budget) ?? undefined,
        type: 'demanda',
        // Además de las columnas propias, el mensaje resume la solicitud para
        // que se lea de un vistazo en el Sheet.
        message: [
          etiqueta('propertyType', propertyType) && `Busca: ${etiqueta('propertyType', propertyType)}`,
          country && `Zona: ${country}`,
          etiqueta('budget', budget) && `Presupuesto: ${etiqueta('budget', budget)}`,
          etiqueta('timeline', timeline) && `Plazo: ${etiqueta('timeline', timeline)}`,
          body.features?.trim(),
        ].filter(Boolean).join(' · '),
        source: sheetSource,
      })
    } catch (e) {
      console.error('[demands API] Sheets error:', e)
    }

    // n8n webhook — fire and forget
    const webhookUrl = process.env.N8N_WEBHOOK_URL
    if (webhookUrl && !webhookUrl.includes('your_')) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, source: 'demand_form', timestamp: new Date().toISOString() }),
        signal: AbortSignal.timeout(8000),
      }).catch((e) => console.error('[demands API] n8n error:', e.message))
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[demands API] error:', msg)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
