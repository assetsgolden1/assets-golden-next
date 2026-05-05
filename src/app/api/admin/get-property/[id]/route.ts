import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/getUserRole'
import { checkRateLimit, readRateLimit, getIdentifier } from '@/lib/ratelimit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const rateLimitCheck = await checkRateLimit(
    readRateLimit,
    getIdentifier(request)
  )
  if (!rateLimitCheck.ok) {
    return NextResponse.json(
      { error: 'Too many requests', retryAfter: rateLimitCheck.retryAfter },
      { status: 429, headers: { 'Retry-After': String(rateLimitCheck.retryAfter) } }
    )
  }

  const { id } = await params
  const { data } = await supabaseAdmin
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  return NextResponse.json({ property: data })
}
