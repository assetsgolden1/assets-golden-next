import { createClient } from './server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Property, TeamMember, BlogPost, CountryDestination, LeadData } from '@/types'

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
}

export async function getProperties(filters?: GetPropertiesFilters) {
  const supabase = await createClient()

  let query = supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .in('status', ['active', 'available'])

  if (filters?.type) query = query.eq('property_type', filters.type)
  if (filters?.minPrice) query = query.gte('price', filters.minPrice)
  if (filters?.maxPrice) query = query.lte('price', filters.maxPrice)
  if (filters?.location) query = query.ilike('location', `%${filters.location}%`)
  if (filters?.bedrooms) query = query.eq('bedrooms', filters.bedrooms)
  if (filters?.isDevelopment !== undefined) query = query.eq('is_development', filters.isDevelopment)
  if (filters?.country) query = query.ilike('country', `%${filters.country}%`)

  const limit = filters?.limit ?? 12
  const offset = filters?.offset ?? 0

  const { data, error, count } = await query
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })

  return {
    data: (data ?? []) as Property[],
    error,
    count: count ?? 0,
  }
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

export async function getPropertiesByCountry(country: string) {
  const supabase = createStaticClient()
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .in('status', ['active', 'available'])
    .eq('country', country)
    .order('province', { ascending: true, nullsFirst: false })
    .order('location', { ascending: true })
  return { data: (data ?? []) as Property[], error }
}

// ─── Property counts by country ────────────────────────────────

export async function getPropertyCountsByCountry(): Promise<Record<string, number>> {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('properties')
    .select('country')
    .in('status', ['active', 'available'])
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
