import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { appendLeadToSheets } from '@/lib/googleSheets'
import { checkBotId } from 'botid/server'

export async function POST(req: NextRequest) {
  try {
    const verification = await checkBotId()
    if (verification.isBot) {
      return NextResponse.json({ error: 'Detección de bot' }, { status: 403 })
    }
    const body = await req.json()
    const { name, email, phone, propertyType, country, budget, features, timeline, attribution } = body

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
      phone: phone?.trim() || null,
      // Campos propios del formulario mapeados a las columnas equivalentes:
      interest: propertyType || null,        // qué tipo de propiedad busca
      location: country || null,             // dónde la busca
      property_value_range: budget || null,  // presupuesto
      sale_timeline: timeline || null,       // plazo
      message: features?.trim() || null,     // características deseadas
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
      await appendLeadToSheets({
        name: body.name,
        email: body.email,
        phone: body.phone,
        type: 'demanda',
        message: body.features,
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
