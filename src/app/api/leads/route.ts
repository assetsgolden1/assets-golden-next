import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { appendLeadToSheets } from '@/lib/googleSheets'

const SOURCE_LABELS: Record<string, string> = {
  website: 'Formulario Web General',
  demand_form: 'Formulario Mi Demanda',
  asset_form: 'Formulario Tengo un Activo',
  collaboration_form: 'Formulario de Colaboración',
  'sell-property-form': 'Vender Propiedad',
  contacto: 'Página de Contacto',
}

const INTEREST_LABELS: Record<string, string> = {
  buy: 'Comprar',
  sell: 'Vender',
  invest: 'Invertir',
  other: 'Otro',
  demanda: 'Demanda específica',
}

function getSourceLabel(source?: string) {
  if (!source) return 'Desconocido'
  if (source.startsWith('property-')) return `Consulta de Propiedad (${source.replace('property-', '')})`
  return SOURCE_LABELS[source] ?? source
}

function getInterestLabel(interest?: string) {
  if (!interest) return 'No especificado'
  return INTEREST_LABELS[interest] ?? interest
}

function buildEmailHtml(data: {
  name: string
  email: string
  phone?: string
  interest?: string
  message?: string
  location?: string
  source?: string
}) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:0}
.wrap{padding:30px 20px}
.box{max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.1)}
.hd{background:#0f172a;padding:30px;text-align:center}
.hd h1{color:#d4af37;font-size:22px;font-weight:300;letter-spacing:3px;margin:0;text-transform:uppercase}
.hd p{color:rgba(212,175,55,.6);font-size:11px;letter-spacing:2px;margin:6px 0 0;text-transform:uppercase}
.alert{background:#d4af37;color:#0f172a;padding:12px 30px;text-align:center;font-weight:700;font-size:13px;letter-spacing:1px}
.body{padding:28px 30px}
.lbl{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#94a3b8;margin-bottom:5px}
.val{font-size:14px;color:#1e293b;padding:10px 14px;background:#f8fafc;border-radius:6px;border-left:3px solid #d4af37;margin-bottom:14px}
.val a{color:#d4af37;text-decoration:none}
.badge{display:inline-block;background:#d4af37;color:#0f172a;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase}
.msg{background:#f8fafc;padding:16px;border-radius:6px;border:1px solid #e2e8f0;font-size:13px;color:#334155;white-space:pre-wrap;line-height:1.6;margin-top:4px}
.ft{background:#0f172a;padding:20px;text-align:center;font-size:11px;color:#64748b}
.ft span{color:#d4af37}
</style></head>
<body><div class="wrap"><div class="box">
<div class="hd"><h1>Assets Golden</h1><p>International Real Estate</p></div>
<div class="alert">✦ NUEVO LEAD RECIBIDO ✦</div>
<div class="body">
<div class="lbl">Origen</div><div class="val"><span class="badge">${getSourceLabel(data.source)}</span></div>
<div class="lbl">Nombre</div><div class="val">${data.name}</div>
<div class="lbl">Email</div><div class="val"><a href="mailto:${data.email}">${data.email}</a></div>
${data.phone ? `<div class="lbl">Teléfono</div><div class="val"><a href="tel:${data.phone}">${data.phone}</a></div>` : ''}
${data.interest ? `<div class="lbl">Interés</div><div class="val">${getInterestLabel(data.interest)}</div>` : ''}
${data.location ? `<div class="lbl">Ubicación</div><div class="val">${data.location}</div>` : ''}
${data.message ? `<div class="lbl">Mensaje</div><div class="msg">${data.message}</div>` : ''}
</div>
<div class="ft"><span>Assets Golden International</span><br>Notificación automática · ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}</div>
</div></div></body></html>`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[leads] Body recibido:', body)
    const { name, email, phone, interest, message, location, source, property_id, property_title, property_url } = body

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Nombre y email son obligatorios' }, { status: 400 })
    }

    // 1. Guardar en Supabase (usando service role para evitar RLS en inserts de leads)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('[leads] Antes del INSERT Supabase')
    const { data: insertData, error: dbError } = await supabase.from('leads').insert({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      interest: interest || null,
      message: message?.trim() || null,
      location: location?.trim() || null,
      source: source || 'website',
      status: 'new',
      property_id: property_id || null,
      property_title: property_title || null,
      property_url: property_url || null,
    }).select('id').single()

    if (dbError) {
      console.error('[leads API] DB error:', dbError.message)
      return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
    }
    console.log('[leads] INSERT result OK, id:', insertData?.id)

    // 2. Google Sheets — awaited para que Vercel no mate la promesa antes de completar
    console.log('[leads] Antes de appendLeadToSheets')
    console.log('[leads] Datos enviados a sheets:', { name, email, phone, type: interest, message, property_title, property_url, source })
    try {
      await appendLeadToSheets({
        name,
        email,
        phone,
        type: interest,
        message,
        property_title,
        property_url,
        source,
      })
      console.log('[leads] Sheets append OK')
    } catch (e) {
      console.error('[leads] Sheets ERROR:', e)
    }

    const payload = { name, email, phone, interest, message, location, source, timestamp: new Date().toISOString() }

    // 4. n8n webhook — fire and forget
    const webhookUrl = process.env.N8N_WEBHOOK_URL
    if (webhookUrl && !webhookUrl.includes('your_')) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      }).catch((e) => console.error('[leads API] n8n error:', e.message))
    }

    // 5. Email via Resend — fire and forget
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey && !resendKey.includes('your_')) {
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: 'Assets Golden <noreply@assetsgolden.com>',
          to: ['hola@assetsgolden.com'],
          subject: `🏠 Nuevo lead: ${name.trim()} — ${getSourceLabel(source)}`,
          html: buildEmailHtml({ name: name.trim(), email: email.trim(), phone, interest, message, location, source }),
        }),
        signal: AbortSignal.timeout(10000),
      }).catch((e) => console.error('[leads API] Resend error:', e.message))
    }

    console.log('[leads] Response final')
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[leads API] error:', msg)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
