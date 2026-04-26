import { supabaseAdmin } from '@/lib/supabase/admin'
import { POST_ZONE_MAPPING } from '@/lib/constants/blogPostZones'
import { getCitiesInZone, ZONE_SLUGS } from '@/lib/constants/spainZones'

export interface RelatedProperty {
  id: string
  title: string
  slug: string
  location: string | null
  country: string | null
  price: number | null
  currency: string | null
  image_url: string | null
  property_type: string | null
  bedrooms: number | null
  area_sqm: number | null
}

type RawBannerRow = {
  title: string
  image_url: string | null
  gallery_urls: string[] | null
}

function applyLocationFilter<T extends object>(
  query: T,
  mapping: { country?: string; zone?: string; city?: string },
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = query as any
  if (mapping.country) q = q.ilike('country', `%${mapping.country}%`)
  if (mapping.city) {
    q = q.ilike('location', `%${mapping.city}%`)
  } else if (mapping.zone) {
    const zoneName = ZONE_SLUGS[mapping.zone]
    if (zoneName) {
      const cities = getCitiesInZone(zoneName)
      if (cities.length > 0) q = q.in('location', cities)
    }
  }
  return q
}

export async function getRelatedProperties(postSlug: string, limit = 3): Promise<RelatedProperty[]> {
  const mapping = POST_ZONE_MAPPING.find(m => m.slug === postSlug)
  if (!mapping) return []

  const baseQuery = supabaseAdmin
    .from('properties')
    .select('id, title, slug, location, country, price, currency, image_url, property_type, bedrooms, area_sqm')
    .in('status', ['active', 'available'])
    .not('hidden', 'eq', true)
    .not('sold', 'eq', true)
    .not('image_url', 'is', null)
    .order('price', { ascending: false })
    .limit(limit)

  const query = applyLocationFilter(baseQuery, mapping)
  const { data } = await query
  return (data ?? []) as RelatedProperty[]
}

export async function getBannerProperty(postSlug: string): Promise<{ title: string; imageUrl: string } | null> {
  const mapping = POST_ZONE_MAPPING.find(m => m.slug === postSlug)
  if (!mapping) return null

  const baseQuery = supabaseAdmin
    .from('properties')
    .select('title, image_url, gallery_urls')
    .in('status', ['active', 'available'])
    .not('hidden', 'eq', true)
    .not('sold', 'eq', true)
    .order('price', { ascending: false })
    .limit(1)

  const query = applyLocationFilter(baseQuery, mapping)
  const { data } = await query
  if (!data || data.length === 0) return null

  const prop = data[0] as RawBannerRow
  const imageUrl = prop.image_url ?? prop.gallery_urls?.[0] ?? null
  if (!imageUrl) return null
  return { title: prop.title, imageUrl }
}
