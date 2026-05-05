import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/getUserRole'
import { checkRateLimit, mutationRateLimit, getIdentifier } from '@/lib/ratelimit'

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let pass = ''
  for (let i = 0; i < 12; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return pass
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rateLimitCheck = await checkRateLimit(
    mutationRateLimit,
    getIdentifier(request)
  )
  if (!rateLimitCheck.ok) {
    return NextResponse.json(
      { error: 'Too many requests', retryAfter: rateLimitCheck.retryAfter },
      { status: 429, headers: { 'Retry-After': String(rateLimitCheck.retryAfter) } }
    )
  }

  const body = await request.json()
  const { email, full_name, phone, agency_name } = body

  if (!email?.trim() || !full_name?.trim()) {
    return NextResponse.json({ error: 'Email y nombre son requeridos' }, { status: 400 })
  }

  const tempPassword = generateTempPassword()

  // 1. Crear usuario en Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email.trim(),
    password: tempPassword,
    email_confirm: true,
  })

  if (authError || !authData.user) {
    return NextResponse.json(
      { error: authError?.message ?? 'Error creando usuario' },
      { status: 500 },
    )
  }

  const userId = authData.user.id

  // 2. Asignar rol agent
  const { error: roleError } = await supabaseAdmin
    .from('user_roles')
    .insert({ user_id: userId, role: 'agent' })

  if (roleError) {
    await supabaseAdmin.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: 'Error asignando rol' }, { status: 500 })
  }

  // 3. Crear perfil en agents
  const { error: agentError } = await supabaseAdmin.from('agents').insert({
    id: userId,
    email: email.trim(),
    full_name: full_name.trim(),
    phone: phone?.trim() || null,
    agency_name: agency_name?.trim() || null,
    active: true,
  })

  if (agentError) {
    await supabaseAdmin.from('user_roles').delete().eq('user_id', userId)
    await supabaseAdmin.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: 'Error creando perfil de agente' }, { status: 500 })
  }

  return NextResponse.json({ success: true, tempPassword, userId })
}
