import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/getUserRole'

const URGENT_MS = 24 * 60 * 60 * 1000

function computeUrgent(createdAt: string, status: string | null): boolean {
  if (status !== 'new') return false
  return Date.now() - new Date(createdAt).getTime() > URGENT_MS
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') ?? ''
  const source = searchParams.get('source') ?? ''
  const search = searchParams.get('q') ?? searchParams.get('search') ?? ''
  const urgentOnly = searchParams.get('urgent_only') === 'true'
  const excludeTest = searchParams.get('exclude_test') !== 'false'

  let query = supabaseAdmin
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (excludeTest) {
    query = query.neq('source', 'migration_test')
  }
  if (status) {
    query = query.eq('status', status)
  }
  if (source) {
    query = query.eq('source', source)
  }
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,message.ilike.%${search}%`
    )
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const leads = (data ?? []).map((lead) => ({
    ...lead,
    is_urgent: computeUrgent(lead.created_at, lead.status),
  }))

  const result = urgentOnly ? leads.filter((l) => l.is_urgent) : leads

  return NextResponse.json(result)
}
