import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/getUserRole'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await request.json()
  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  }

  // Verificar rol del target antes de borrar: si es admin u otro rol distinto a
  // 'agent', rechazar. Sin este guard, borrar al admin desde /admin/agentes
  // destruiria su user_role + cuenta auth y dejaria al sistema sin admin.
  const { data: targetRole, error: roleError } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', id)
    .maybeSingle()

  if (roleError) {
    return NextResponse.json(
      { error: 'Error al verificar rol del usuario' },
      { status: 500 },
    )
  }

  if (targetRole && targetRole.role !== 'agent') {
    return NextResponse.json(
      { error: `No se puede eliminar: el usuario tiene rol '${targetRole.role}', no 'agent'` },
      { status: 400 },
    )
  }

  const { error: agentsError } = await supabaseAdmin
    .from('agents')
    .delete()
    .eq('id', id)

  if (agentsError) {
    return NextResponse.json(
      { error: 'Error al borrar agente: ' + agentsError.message },
      { status: 500 },
    )
  }

  await supabaseAdmin.from('user_roles').delete().eq('user_id', id)

  const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
