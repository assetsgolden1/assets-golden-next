import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/getUserRole'
import { checkRateLimit, readRateLimit, getIdentifier } from '@/lib/ratelimit'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sync_logs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(20)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ logs: data ?? [] })
}
