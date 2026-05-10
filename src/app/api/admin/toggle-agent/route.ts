import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/getUserRole'
import { checkRateLimit, mutationRateLimit, getIdentifier } from '@/lib/ratelimit'
import { logAdminAction } from '@/lib/audit'

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

  const { id, active } = await request.json()

  if (!id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
  }

  const { data: agentInfo } = await supabaseAdmin
    .from('agents')
    .select('full_name')
    .eq('id', id)
    .maybeSingle()

  const { error } = await supabaseAdmin
    .from('agents')
    .update({ active: Boolean(active) })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await logAdminAction({
    action: 'toggle_agent',
    entity_type: 'agent',
    entity_id: id,
    entity_label: agentInfo?.full_name ?? null,
    metadata: { active: Boolean(active) },
  })

  return NextResponse.json({ success: true })
}
