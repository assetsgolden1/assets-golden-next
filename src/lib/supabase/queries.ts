import { createClient } from './server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Property, TeamMember, BlogPost, CountryDestination, LeadData } from '@/types'
import { supabaseAdmin } from './admin'
import { getCitiesInZone, getProvincesInZone, ZONE_SLUGS } from '@/lib/constants/spainZones'
import { normalizeLocation } from '@/lib/utils/normalizeLocation'

// Client without cookies — only for generateStaticParams (build time)
export function createStaticClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ─── Properties ───────────────────────────────────────────────

export interface GetPropertiesFilters {
  type?: string
  minPrice?: number
  maxPrice?: number
  location?: string
  bedrooms?: number
  limit?: number
  offset?: number
  isDevelopment?: boolean
  featured?: boolean
  country?: string
  zona?: string
  orden?: 'reciente' | 'precio_asc' | 'precio_desc'
  excludeTypes?: string[]
  classification?: string
  q?: string
}

export async function getProperties(filters?: GetPropertiesFilters) {
  const supabase = await createClient()

  let query = supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .in('status', ['active', 'available'])
    .not('hidden', 'eq', true)
    .not('hidden_by_sync', 'eq', true)

  if (filters?.excludeTypes && filters.excludeTypes.length > 0)
    query = query.not('property_type', 'in', `(${filters.excludeTypes.join(',')})`)
  if (filters?.type) query = query.eq('property_type', filters.type)
  if (filters?.minPrice) query = query.gte('price', filters.minPrice)
  if (filters?.maxPrice) query = query.lte('price', filters.maxPrice)
  if (filters?.location) query = query.ilike('location', `%${filters.location}%`)
  if (filters?.bedrooms) query = query.eq('bedrooms', filters.bedrooms)
  if (filters?.isDevelopment !== undefined) query = query.eq('is_development', filters.isDevelopment)
  if (filters?.featured !== undefined) query = query.eq('featured', filters.featured)
  if (filters?.country) query = query.ilike('country', `%${filters.country}%`)
  if (filters?.zona && filters?.country?.toLowerCase().includes('espa')) {
    const zoneName = ZONE_SLUGS[filters.zona]
    if (zoneName) {
      const citiesInZone = getCitiesInZone(zoneName)
      if (citiesInZone.length > 0) query = query.in('location', citiesInZone)
    }
  }

  if (filters?.classification) query = query.eq('classification', filters.classification)

  if (filters?.q) {
    const raw = filters.q.trim()
    const safe = raw.replace(/[%,()]/g, '')
    if (safe) {
      if (/^\d+$/.test(safe)) {
        const padded = safe.padStart(5, '0')
        query = query.or(`ref_code.ilike.%AG-${padded}%`)
      } else if (/^ag-/i.test(safe)) {
        query = query.ilike('ref_code', `%${safe.toUpperCase()}%`)
      } else {
        query = query.or(`title.ilike.%${safe}%,location.ilike.%${safe}%,province.ilike.%${safe}%,country.ilike.%${safe}%`)
      }
    }
  }

  const limit = filters?.limit ?? 12
  const offset = filters?.offset ?? 0

  // Propiedades vendidas siempre al final
  query = query.order('sold', { ascending: true, nullsFirst: true })
  if (filters?.orden === 'precio_asc') query = query.order('price', { ascending: true })
  else if (filters?.orden === 'precio_desc') query = query.order('price', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  const { data, error, count } = await query.range(offset, offset + limit - 1)

  return {
    data: (data ?? []) as Property[],
    error,
    count: count ?? 0,
  }
}

// ─── Spain-specific queries ────────────────────────────────────

export interface GetSpainPropertiesFilters {
  zona?: string
  ciudad?: string
  tipo?: string
  precioMin?: number | null
  precioMax?: number | null
  habitaciones?: number | null
  orden?: 'reciente' | 'precio_asc' | 'precio_desc'
  limit?: number
  offset?: number
}

export async function getPropertiesForSpain(filters: GetSpainPropertiesFilters = {}) {
  const limit  = filters.limit  ?? 24
  const offset = filters.offset ?? 0

  // Helper: aplica todos los filtros NO-zona y los modificadores comunes
  const applyCommonFilters = (q: any) => {
    let qq = q
      .or('country.ilike.%España%,country.ilike.%Spain%,country.ilike.%espana%')
      .not('hidden', 'eq', true)
      .not('hidden_by_sync', 'eq', true)
    if (filters.ciudad) qq = qq.ilike('location', `%${filters.ciudad}%`)
    if (filters.tipo)   qq = qq.eq('property_type', filters.tipo)
    if (filters.precioMin) qq = qq.gte('price', filters.precioMin)
    if (filters.precioMax) qq = qq.lte('price', filters.precioMax)
    if (filters.habitaciones) qq = qq.gte('bedrooms', filters.habitaciones)
    return qq
  }

  // Caso 1: SIN filtro de zona — single query con paginación nativa
  if (!filters.zona) {
    let query = applyCommonFilters(
      supabaseAdmin.from('properties').select('*', { count: 'exact' })
    )
    query = query.order('sold', { ascending: true, nullsFirst: true })
    if (filters.orden === 'precio_asc')       query = query.order('price', { ascending: true })
    else if (filters.orden === 'precio_desc') query = query.order('price', { ascending: false })
    else                                      query = query.order('created_at', { ascending: false })

    const { data, error, count } = await query.range(offset, offset + limit - 1)
    return { data: (data ?? []) as Property[], error, count: count ?? 0 }
  }

  // Caso 2: CON filtro de zona — N queries paralelas + dedupe
  const cities = getCitiesInZone(filters.zona)
  const provinces = getProvincesInZone(filters.zona)

  // Build N queries
  const queries: Promise<any>[] = []

  // 1 query por province (.in es seguro con array nativo)
  if (provinces.length > 0) {
    queries.push(
      applyCommonFilters(
        supabaseAdmin.from('properties').select('*')
      ).in('province', provinces)
    )
  }

  // 1 query por cada ciudad (.ilike por ciudad, paralelas)
  for (const city of cities) {
    queries.push(
      applyCommonFilters(
        supabaseAdmin.from('properties').select('*')
      ).ilike('location', city)
    )
  }

  if (queries.length === 0) {
    return { data: [], error: null, count: 0 }
  }

  const results = await Promise.all(queries)

  // Recolectar errores (no abortar — devolvemos lo que se pudo)
  const firstError = results.find(r => r.error)?.error ?? null
  if (firstError) {
    console.error('[getPropertiesForSpain] Error en alguna query:', firstError)
  }

  // Dedupe por id
  const map = new Map<string, Property>()
  for (const r of results) {
    for (const p of (r.data ?? []) as Property[]) {
      map.set(p.id, p)
    }
  }

  const properties = Array.from(map.values())

  // Ordenar: vendidas siempre al final, luego criterio secundario
  properties.sort((a, b) => {
    const soldA = (a.sold ? 1 : 0)
    const soldB = (b.sold ? 1 : 0)
    if (soldA !== soldB) return soldA - soldB
    if (filters.orden === 'precio_asc') return (a.price ?? 0) - (b.price ?? 0)
    if (filters.orden === 'precio_desc') return (b.price ?? 0) - (a.price ?? 0)
    return String(b.created_at ?? '').localeCompare(String(a.created_at ?? ''))
  })

  const total = properties.length
  const paginated = properties.slice(offset, offset + limit)

  return { data: paginated, error: firstError, count: total }
}

export async function getPropertyTypesForSpain(): Promise<string[]> {
  const { data } = await supabaseAdmin
    .from('properties')
    .select('property_type')
    .or('country.ilike.%España%,country.ilike.%Spain%')
    .not('hidden', 'eq', true)
    .not('hidden_by_sync', 'eq', true)
  const types = [
    ...new Set((data ?? []).map((d: { property_type: string | null }) => d.property_type).filter(Boolean)),
  ] as string[]
  return types.sort()
}

// ─── Generic destination queries ──────────────────────────────

export interface GetDestinationPropertiesFilters {
  ciudad?: string
  tipo?: string
  precioMin?: number | null
  precioMax?: number | null
  habitaciones?: number | null
  orden?: 'reciente' | 'precio_asc' | 'precio_desc'
  limit?: number
  offset?: number
}

export async function getPropertiesForDestination(
  countryName: string,
  filters: GetDestinationPropertiesFilters = {}
) {
  let query = supabaseAdmin
    .from('properties')
    .select('*', { count: 'exact' })
    .ilike('country', `%${countryName}%`)
    .not('hidden', 'eq', true)
    .not('hidden_by_sync', 'eq', true)

  if (filters.ciudad)      query = query.ilike('location', `%${filters.ciudad}%`)
  if (filters.tipo)        query = query.eq('property_type', filters.tipo)
  if (filters.precioMin)   query = query.gte('price', filters.precioMin)
  if (filters.precioMax)   query = query.lte('price', filters.precioMax)
  if (filters.habitaciones) query = query.gte('bedrooms', filters.habitaciones)

  const limit  = filters.limit  ?? 24
  const offset = filters.offset ?? 0

  query = query.order('sold', { ascending: true, nullsFirst: true })
  if (filters.orden === 'precio_asc')       query = query.order('price', { ascending: true })
  else if (filters.orden === 'precio_desc') query = query.order('price', { ascending: false })
  else                                      query = query.order('created_at', { ascending: false })

  const { data, error, count } = await query.range(offset, offset + limit - 1)
  return { data: (data ?? []) as Property[], error, count: count ?? 0 }
}

export async function getCitiesForDestination(countryName: string): Promise<string[]> {
  const { data } = await supabaseAdmin
    .from('properties')
    .select('location')
    .ilike('country', `%${countryName}%`)
    .not('hidden', 'eq', true)
    .not('hidden_by_sync', 'eq', true)
    .not('location', 'is', null)
  const cities = [
    ...new Set(
      (data ?? [])
        .map((d: { location: string | null }) => d.location)
        .filter(Boolean)
        .map((city) => normalizeLocation(city as string))
    ),
  ] as string[]
  return cities.sort()
}

export async function getPropertyTypesForDestination(countryName: string): Promise<string[]> {
  const { data } = await supabaseAdmin
    .from('properties')
    .select('property_type')
    .ilike('country', `%${countryName}%`)
    .not('hidden', 'eq', true)
    .not('hidden_by_sync', 'eq', true)
    .not('property_type', 'is', null)
  const types = [
    ...new Set((data ?? []).map((d: { property_type: string | null }) => d.property_type).filter(Boolean)),
  ] as string[]
  return types.sort()
}

export async function getPropertyBySlug(slug: string) {
  // Cliente estático (sin cookies): ficha pública → permite SSG/ISR del detalle.
  const supabase = createStaticClient()
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('slug', slug)
    .single()
  return { data: data as Property | null, error }
}

export async function getFeaturedProperties() {
  // Cliente estático (sin cookies): datos públicos. Permite que las páginas que
  // la consumen (home, etc.) cacheen con ISR en vez de renderizar dinámico.
  const supabase = createStaticClient()
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('featured', true)
    .in('status', ['active', 'available'])
    .not('hidden', 'eq', true)
    .not('hidden_by_sync', 'eq', true)
    .not('sold', 'eq', true)
    .order('featured_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
  return { data: (data ?? []) as Property[], error }
}

export async function getAllPropertySlugs() {
  const supabase = createStaticClient()
  // Supabase limita cada SELECT a 1000 filas. Paginamos con .range() en
  // lotes de 1000 para traer TODAS las propiedades visibles (el sitemap
  // listaba solo 1000 de ~2400 por este límite).
  const PAGE_SIZE = 1000
  const slugs: string[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('properties')
      .select('slug')
      .in('status', ['active', 'available'])
      .not('hidden', 'eq', true)
      .not('hidden_by_sync', 'eq', true)
      .not('slug', 'is', null)
      .order('slug', { ascending: true })
      .range(from, from + PAGE_SIZE - 1)
    if (error || !data || data.length === 0) break
    slugs.push(...data.map((p) => p.slug as string))
    if (data.length < PAGE_SIZE) break
  }
  return slugs
}

// ─── Team / Partners ───────────────────────────────────────────

export async function getPartners() {
  const supabase = createStaticClient()
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('active', true)
    .eq('member_type', 'partner')
    .order('order_index', { ascending: true })
  return { data: (data ?? []) as TeamMember[], error }
}

export async function getPartnerById(id: string) {
  const supabase = createStaticClient()
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('id', id)
    .eq('member_type', 'partner')
    .single()
  return { data: data as TeamMember | null, error }
}

export async function getRelatedPartners(currentId: string, country: string | null, limit = 3) {
  const supabase = createStaticClient()
  const results: TeamMember[] = []

  if (country) {
    const { data: sameCountry } = await supabase
      .from('team_members')
      .select('id, name, country, role_es, photo_url')
      .eq('member_type', 'partner')
      .eq('active', true)
      .eq('country', country)
      .neq('id', currentId)
      .limit(limit)
    results.push(...((sameCountry ?? []) as TeamMember[]))
  }

  if (results.length < limit) {
    const excludeIds = [currentId, ...results.map((p) => p.id)]
    const { data: others } = await supabase
      .from('team_members')
      .select('id, name, country, role_es, photo_url')
      .eq('member_type', 'partner')
      .eq('active', true)
      .not('id', 'in', `(${excludeIds.join(',')})`)
      .limit(limit - results.length)
    results.push(...((others ?? []) as TeamMember[]))
  }

  return { data: results }
}

export async function getTeamMembers() {
  // Cliente estático (sin cookies): equipo público → permite ISR.
  const supabase = createStaticClient()
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('active', true)
    .order('order_index', { ascending: true })
  return { data: (data ?? []) as TeamMember[], error }
}

// ─── Blog ──────────────────────────────────────────────────────

export async function getBlogPosts(limit = 12, locale?: string) {
  // Cliente estático (sin cookies): blog público → permite ISR.
  const supabase = createStaticClient()
  let query = supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
  if (locale) query = query.eq('language', locale)
  const { data, error } = await query
    .order('published_at', { ascending: false })
    .limit(limit)
  return { data: (data ?? []) as BlogPost[], error }
}

export async function getBlogPostsByCategory(category: string, locale?: string, limit = 20) {
  // Cliente estático (sin cookies): blog público → permite ISR.
  const supabase = createStaticClient()
  let query = supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .eq('category', category)
  if (locale) query = query.eq('language', locale)
  const { data, error } = await query
    .order('published_at', { ascending: false })
    .limit(limit)
  return { data: (data ?? []) as BlogPost[], error }
}

export async function getBlogPostBySlug(slug: string) {
  // Cliente estático (sin cookies): post público → permite SSG/ISR.
  const supabase = createStaticClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  return { data: data as BlogPost | null, error }
}

export async function getAllBlogSlugs(locale?: string) {
  const supabase = createStaticClient()
  let query = supabase
    .from('blog_posts')
    .select('slug')
    .eq('published', true)
    .not('slug', 'is', null)
  if (locale) query = query.eq('language', locale)
  const { data } = await query
  return (data ?? []).map((p) => p.slug as string)
}

// ─── Destinations ──────────────────────────────────────────────

export async function getAllDestinationSlugs() {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('country_destinations')
    .select('slug')
    .not('slug', 'is', null)
  return (data ?? []).map((d) => d.slug as string)
}

export async function getDestinationBySlug(slug: string) {
  const supabase = createStaticClient()
  const { data, error } = await supabase
    .from('country_destinations')
    .select('*')
    .eq('slug', slug)
    .single()
  return { data: data as CountryDestination | null, error }
}

export async function getDestinations() {
  // Cliente estático (sin cookies): destinos públicos → permite ISR.
  const supabase = createStaticClient()
  const { data, error } = await supabase
    .from('country_destinations')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })
  return { data: (data ?? []) as CountryDestination[], error }
}

// ─── Properties by country (for drill-down LocationBrowser) ────

const countryBySlug: Record<string, string> = {
  'espana': 'España',
  'mexico': 'México',
  'emiratos-arabes-unidos': 'Emiratos Árabes Unidos',
  'argentina': 'Argentina',
  'estados-unidos': 'Estados Unidos',
  'costa-rica': 'Costa Rica',
  'ecuador': 'Ecuador',
  'grecia': 'Grecia',
  'reino-unido': 'Reino Unido',
}

export async function getPropertiesByCountry(slug: string) {
  const countryName = countryBySlug[slug] ?? slug
  const supabase = createStaticClient()

  // Supabase PostgREST caps at 1000 rows — fetch in pages
  const PAGE = 1000
  const all: Property[] = []
  let offset = 0

  while (true) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .in('status', ['active', 'available'])
      .not('hidden', 'eq', true)
      .not('hidden_by_sync', 'eq', true)
      .ilike('country', countryName)
      .order('province', { ascending: true, nullsFirst: false })
      .order('location', { ascending: true })
      .range(offset, offset + PAGE - 1)

    if (error || !data || data.length === 0) break
    all.push(...(data as Property[]))
    if (data.length < PAGE) break
    offset += PAGE
  }

  return { data: all, error: null }
}

// ─── Property counts by country ────────────────────────────────

export async function getPropertyCountsByCountry(): Promise<Record<string, number>> {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('properties')
    .select('country')
    .in('status', ['active', 'available'])
    .not('hidden', 'eq', true)
    .not('hidden_by_sync', 'eq', true)
    .not('country', 'is', null)

  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    const c = (row.country as string).trim()
    counts[c] = (counts[c] ?? 0) + 1
  }
  return counts
}

// ─── Leads ────────────────────────────────────────────────────

export async function createLead(leadData: LeadData) {
  // Intentar n8n primero
  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (webhookUrl && webhookUrl !== 'your_n8n_webhook_url') {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...leadData, source: leadData.source ?? 'website' }),
        signal: AbortSignal.timeout(8000),
      })
      if (res.ok) return { success: true, via: 'n8n' as const }
    } catch {
      // fallback a Supabase
    }
  }

  // Fallback: guardar en Supabase
  const supabase = await createClient()
  const { error } = await supabase.from('leads').insert({
    name: leadData.name,
    email: leadData.email,
    phone: leadData.phone,
    is_owner: leadData.is_owner,
    neighborhood: leadData.neighborhood,
    property_value_range: leadData.property_value_range,
    sale_timeline: leadData.sale_timeline,
    source: leadData.source ?? 'website',
    status: 'new',
  })

  if (error) return { success: false, error: error.message }
  return { success: true, via: 'supabase' as const }
}
