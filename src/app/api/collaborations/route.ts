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
    const { name, email, phone, company, specialty, collaborationType, message } = body

    if (!name?.trim() || !email?.trim() || !collaborationType) {
      return NextResponse.json({ error: 'Nombre, email y tipo son obligatorios' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Mismo caso que /mi-demanda: esto insertaba en una tabla `collaborations`
    // que NUNCA existió en Supabase → cada envío devolvía 500 y la solicitud se
    // perdía sin llegar tampoco al Sheet (el insert falla antes). Ahora van a
    // `leads` con source='collaboration_form', centralizando todos los
    // contactos de la web en un único sitio.
    const detalle = [
      collaborationType && `Tipo: ${collaborationType}`,
      company?.trim() && `Empresa: ${company.trim()}`,
      specialty?.trim() && `Especialidad: ${specialty.trim()}`,
      message?.trim(),
    ].filter(Boolean).join(' · ')

    const { data: insertData, error: dbError } = await supabase.from('leads').insert({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || null,
      interest: collaborationType || null,
      message: detalle || null,
      source: 'collaboration_form',
      status: 'new',
    }).select('id').single()

    if (dbError) {
      console.error('[collaborations API] DB error:', dbError.message)
      return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
    }
    console.log('[collaborations] INSERT OK en leads, id:', insertData?.id)

    // Google Sheets — AWAITED, igual que en /api/leads y /api/demands. Estaba
    // como fire-and-forget: en Vercel la función puede terminar antes de que
    // resuelva una promesa suelta, y esas colaboraciones no llegaban nunca al
    // Sheet sin dejar rastro.
    try {
      await appendLeadToSheets({
        name: body.name,
        email: body.email,
        phone: body.phone,
        phone_prefix: typeof body.phone_prefix === 'string' ? body.phone_prefix : undefined,
        phone_country: typeof body.phone_country === 'string' ? body.phone_country : undefined,
        form_source: 'collaboration_form',
        property_type: typeof specialty === 'string' ? specialty : undefined,
        intention: 'Colaborar',
        type: 'colaboracion',
        message: detalle || body.message,
        source: 'collaboration_form',
      })
    } catch (e) {
      console.error('[collaborations API] Sheets error:', e)
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('[collaborations API] error:', msg)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
