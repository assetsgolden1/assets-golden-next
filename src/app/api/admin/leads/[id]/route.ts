import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/getUserRole'
import { revalidatePath } from 'next/cache'
import { logAdminAction } from '@/lib/audit'

const VALID_STATUSES = ['new', 'contacted', 'in_progress', 'closed', 'discarded']

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { status, notes, score } = body

  const updates: Record<string, unknown> = {}

  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Status inválido: ${status}` }, { status: 400 })
    }
    updates.status = status
  }
  if (notes !== undefined) updates.notes = notes
  if (score !== undefined) updates.score = typeof score === 'number' ? score : null

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[PATCH /api/admin/leads]', error.message, { id, updates })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await logAdminAction({
    action: 'update_lead',
    entity_type: 'lead',
    entity_id: id,
    entity_label: data?.name ?? null,
    metadata: { fields_updated: Object.keys(updates) },
  })

  revalidatePath('/admin/leads')
  return NextResponse.json(data)
}
