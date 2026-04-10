import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, company, specialty, collaborationType, message } = body

    if (!name?.trim() || !email?.trim() || !collaborationType) {
      return NextResponse.json({ error: 'Nombre, email y tipo son obligatorios' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: dbError } = await supabase.from('collaborations').insert({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      company: company?.trim() || null,
      specialty: specialty?.trim() || null,
      collaboration_type: collaborationType,
      message: message?.trim() || null,
      status: 'new',
    })

    if (dbError) {
      console.error('[collaborations API] DB error:', dbError.message)
      return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
    }

    // n8n webhook — fire and forget
    const webhookUrl = process.env.N8N_WEBHOOK_URL
    if (webhookUrl && !webhookUrl.includes('your_')) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, source: 'collaboration_form', timestamp: new Date().toISOString() }),
        signal: AbortSignal.timeout(8000),
      }).catch((e) => console.error('[collaborations API] n8n error:', e.message))
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[collaborations API] error:', msg)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
