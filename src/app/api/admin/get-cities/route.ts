import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { normalizeLocation } from '@/lib/utils/normalizeLocation'
import { requireAdmin } from '@/lib/auth/getUserRole'
import { checkRateLimit, readRateLimit, getIdentifier } from '@/lib/ratelimit'

export async function GET(request: NextRequest) {
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

  const country = request.nextUrl.searchParams.get('country')

  if (!country) return NextResponse.json({ cities: [] })

  const { data } = await supabaseAdmin
    .from('properties')
    .select('location')
    .ilike('country', `%${country}%`)
    .not('location', 'is', null)
    .not('location', 'eq', '')
    .limit(10000)

  const cities = [
    ...new Set(
      (data ?? [])
        .map((p) => normalizeLocation(p.location ?? ''))
        .filter(Boolean)
    ),
  ].sort()

  return NextResponse.json({ cities })
}
