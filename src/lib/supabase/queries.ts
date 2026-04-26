import { createClient } from './server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Property, TeamMember, BlogPost, CountryDestination, LeadData } from '@/types'
import { supabaseAdmin } from './admin'
import { getCitiesInZone, ZONE_SLUGS } from '@/lib/constants/spainZones'
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
  country?: string
  zona?: string
  orden?: 'reciente' | 'precio_asc' | 'precio_desc'
  excludeTypes?: string[]
}

export async function getProperties(filters?: GetPropertiesFilters) {
  const supabase = await createClient()

  let query = supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .in('status', ['active', 'available'])
    .not('hidden', 'eq', true)
    .not('sold', 'eq', true)

  if (filters?.excludeTypes && filters.excludeTypes.length > 0)
    query = query.not('property_type', 'in', `(${filters.excludeTypes.join(',')})`)
  if (filters?.type) query = query.eq('property_type', filters.type)
  if (filters?.minPrice) query = query.gte('price', filters.minPrice)
  if (filters?.maxPrice) query = query.lte('price', filters.maxPrice)
  if (filters?.location) query = query.ilike('location', `%${filters.location}%`)
  if (filters?.bedrooms) query = query.eq('bedrooms', filters.bedrooms)
  if (filters?.isDevelopment !== undefined) query = query.eq('is_development', filters.isDevelopment)
  if (filters?.country) query = query.ilike('country', `%${filters.country}%`)
  if (filters?.zona && filters?.country?.toLowerCase().includes('espa')) {
    const zoneName = ZONE_SLUGS[filters.zona]
    if (zoneName) {
      const citiesInZone = getCitiesInZone(zoneName)
      if (citiesInZone.length > 0) query = query.in('location', citiesInZone)
    }
  }

  const limit = filters?.limit ?? 12
  const offset = filters?.offset ?? 0

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
  let query = supabaseAdmin
    .from('properties')
    .select('*', { count: 'exact' })
    .or('country.ilike.%España%,country.ilike.%Spain%,country.ilike.%espana%')
    .not('hidden', 'eq', true)
    .not('sold', 'eq', true)

  if (filters.zona) {
    const cities = getCitiesInZone(filters.zona)
    if (cities.length > 0) query = query.in('location', cities)
  }
  if (filters.ciudad) query = query.ilike('location', `%${filters.ciudad}%`)
  if (filters.tipo)   query = query.eq('property_type', filters.tipo)
  if (filters.precioMin) query = query.gte('price', filters.precioMin)
  if (filters.precioMax) query = query.lte('price', filters.precioMax)
  if (filters.habitaciones) query = query.gte('bedrooms', filters.habitaciones)

  const limit  = filters.limit  ?? 24
  const offset = filters.offset ?? 0

  if (filters.orden === 'precio_asc')       query = query.order('price', { ascending: true })
  else if (filters.orden === 'precio_desc') query = query.order('price', { ascending: false })
  else                                      query = query.order('created_at', { ascending: false })

  const { data, error, count } = await query.range(offset, offset + limit - 1)
  return { data: (data ?? []) as Property[], error, count: count ?? 0 }
}

export async function getPropertyTypesForSpain(): Promise<string[]> {
  const { data } = await supabaseAdmin
    .from('properties')
    .select('property_type')
    .or('country.ilike.%España%,country.ilike.%Spain%')
    .not('hidden', 'eq', true)
    .not('sold', 'eq', true)
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
    .not('sold', 'eq', true)

  if (filters.ciudad)      query = query.ilike('location', `%${filters.ciudad}%`)
  if (filters.tipo)        query = query.eq('property_type', filters.tipo)
  if (filters.precioMin)   query = query.gte('price', filters.precioMin)
  if (filters.precioMax)   query = query.lte('price', filters.precioMax)
  if (filters.habitaciones) query = query.gte('bedrooms', filters.habitaciones)

  const limit  = filters.limit  ?? 24
  const offset = filters.offset ?? 0

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
    .not('sold', 'eq', true)
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
    .not('sold', 'eq', true)
    .not('property_type', 'is', null)
  const types = [
    ...new Set((data ?? []).map((d: { property_type: string | null }) => d.property_type).filter(Boolean)),
  ] as string[]
  return types.sort()
}

export async function getPropertyBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('slug', slug)
    .single()
  return { data: data as Property | null, error }
}

export async function getFeaturedProperties(limit = 6) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('featured', true)
    .in('status', ['active', 'available'])
    .not('hidden', 'eq', true)
    .not('sold', 'eq', true)
    .limit(limit)
    .order('created_at', { ascending: false })
  return { data: (data ?? []) as Property[], error }
}

export async function getAllPropertySlugs() {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('properties')
    .select('slug')
    .in('status', ['active', 'available'])
    .not('hidden', 'eq', true)
    .not('sold', 'eq', true)
    .not('slug', 'is', null)
  return (data ?? []).map((p) => p.slug as string)
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

export async function getTeamMembers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('active', true)
    .order('order_index', { ascending: true })
  return { data: (data ?? []) as TeamMember[], error }
}

// ─── Blog ──────────────────────────────────────────────────────

export async function getBlogPosts(limit = 12) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(limit)
  return { data: (data ?? []) as BlogPost[], error }
}

export async function getBlogPostsByCategory(category: string, limit = 20) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .eq('category', category)
    .order('published_at', { ascending: false })
    .limit(limit)
  return { data: (data ?? []) as BlogPost[], error }
}

export async function getBlogPostBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  return { data: data as BlogPost | null, error }
}

export async function getAllBlogSlugs() {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('published', true)
    .not('slug', 'is', null)
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
  const supabase = await createClient()
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
      .not('sold', 'eq', true)
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
    .not('sold', 'eq', true)
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
