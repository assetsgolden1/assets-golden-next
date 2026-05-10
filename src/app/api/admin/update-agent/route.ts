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

  const { id, full_name, phone, agency_name } = await request.json()

  if (!id || !full_name?.trim()) {
    return NextResponse.json({ error: 'ID y nombre son requeridos' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('agents')
    .update({
      full_name: full_name.trim(),
      phone: phone?.trim() || null,
      agency_name: agency_name?.trim() || null,
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await logAdminAction({
    action: 'update_agent',
    entity_type: 'agent',
    entity_id: id,
    entity_label: full_name.trim(),
    metadata: { fields_updated: ['full_name', 'phone', 'agency_name'] },
  })

  return NextResponse.json({ success: true })
}
