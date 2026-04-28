import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await request.json() as {
    full_name: string
    phone: string | null
    agency_name: string | null
    logo_url: string | null
  }

  const { full_name, phone, agency_name, logo_url } = body

  if (!full_name?.trim()) {
    return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('agents')
    .upsert({
      id: user.id,
      email: user.email ?? '',
      full_name: full_name.trim(),
      phone: phone ?? null,
      agency_name: agency_name ?? null,
      logo_url: logo_url ?? null,
      active: true,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    console.error('[update-profile]', error)
    return NextResponse.json({ error: 'Error al guardar perfil' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
