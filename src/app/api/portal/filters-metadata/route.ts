import { NextRequest, NextResponse } from 'next/server'
import { getUserRole } from '@/lib/auth/getUserRole'
import { getPropertyCountsByCountry, getCitiesForDestination } from '@/lib/supabase/queries'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const role = await getUserRole()
  if (role !== 'agent' && role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const countryParam = searchParams.get('country')?.trim() ?? ''

  // Countries with counts
  const countryMap = await getPropertyCountsByCountry()
  const countries = Object.entries(countryMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // Property types (distinct)
  const { data: typesRaw } = await supabaseAdmin
    .from('properties')
    .select('property_type')
    .not('hidden', 'eq', true)
    .not('sold', 'eq', true)
    .not('property_type', 'is', null)

  const typeMap: Record<string, number> = {}
  for (const row of typesRaw ?? []) {
    const t = row.property_type as string
    typeMap[t] = (typeMap[t] ?? 0) + 1
  }
  const types = Object.entries(typeMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // Cities for a specific country (only when requested)
  let cities: string[] = []
  if (countryParam) {
    cities = await getCitiesForDestination(countryParam)
  }

  return NextResponse.json({ countries, types, cities })
}
