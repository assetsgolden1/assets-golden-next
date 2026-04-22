import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { normalizeLocation } from '@/lib/utils/normalizeLocation'

export async function GET(request: NextRequest) {
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
