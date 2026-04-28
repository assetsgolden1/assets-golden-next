import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/auth/getUserRole'

const PAGE_SIZE = 24

// UUID v4 completo
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Elimina caracteres que rompen la sintaxis PostgREST or()
function sanitize(s: string): string {
  return s.replace(/[,()\[\]]/g, ' ').replace(/\s+/g, ' ').trim()
}

export async function GET(request: NextRequest) {
  const role = await getUserRole()
  if (role !== 'agent' && role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const q        = searchParams.get('q')?.trim()       ?? ''
  const country  = searchParams.get('country')?.trim() ?? ''
  const city     = searchParams.get('city')?.trim()    ?? ''
  const type     = searchParams.get('type')?.trim()    ?? ''
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const bedrooms = searchParams.get('bedrooms')
  const sort     = searchParams.get('sort') ?? 'recent'
  const page     = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))

  const supabase = await createClient()

  // ── Caso especial: UUID completo → lookup directo por id ──────────
  // La columna `id` es tipo UUID en Postgres, no se puede ilike sobre ella.
  // Hacemos .eq() ignorando los demás filtros de texto.
  if (UUID_REGEX.test(q)) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', q)
      .not('hidden', 'eq', true)
      .not('sold', 'eq', true)
      .limit(1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      properties: data ?? [],
      total:      data?.length ?? 0,
      page:       1,
      totalPages: 1,
    })
  }

  // ── Búsqueda normal ───────────────────────────────────────────────
  let query = supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .not('hidden', 'eq', true)
    .not('sold', 'eq', true)

  // Filtros de dimensión (AND entre sí)
  if (country)  query = query.ilike('country',  `%${country}%`)
  if (city)     query = query.ilike('location', `%${city}%`)
  if (type)     query = query.eq('property_type', type)
  if (minPrice) query = query.gte('price',    parseInt(minPrice, 10))
  if (maxPrice) query = query.lte('price',    parseInt(maxPrice, 10))
  if (bedrooms) query = query.gte('bedrooms', parseInt(bedrooms, 10))

  // Búsqueda de texto libre: se aplica al final para que el or() se
  // combine correctamente (AND) con los filtros anteriores.
  // Buscamos en title, location y external_id (código de referencia).
  // Excluimos description: es texto muy largo y provoca timeouts.
  if (q.length >= 2) {
    const safe = sanitize(q)
    if (safe.length >= 2) {
      query = query.or(
        `title.ilike.%${safe}%,location.ilike.%${safe}%,external_id.ilike.%${safe}%`,
      )
    }
  }

  // Orden
  if (sort === 'price-asc') {
    query = query.order('price', { ascending: true,  nullsFirst: false })
  } else if (sort === 'price-desc') {
    query = query.order('price', { ascending: false, nullsFirst: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const from = (page - 1) * PAGE_SIZE
  const { data, count, error } = await query.range(from, from + PAGE_SIZE - 1)

  if (error) {
    console.error('[search-properties]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    properties: data ?? [],
    total:      count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
  })
}
