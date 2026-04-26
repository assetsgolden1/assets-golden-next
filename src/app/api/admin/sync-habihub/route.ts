import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { XMLParser } from 'fast-xml-parser'

const FEEDS = [
  'https://medianewbuild.com/file/hh-media-bucket/agents/9e04488b-75ba-4831-b2c9-55e1ad47d4b9/feed_blanca_calida.xml',
  'https://medianewbuild.com/file/hh-media-bucket/agents/9e04488b-75ba-4831-b2c9-55e1ad47d4b9/feed_sol.xml',
]

interface HabiHubProperty {
  id?: string | number
  name?: string
  title?: string
  description?: string
  price?: string | number
  propertyType?: string
  property_type?: string
  bedrooms?: string | number
  bathrooms?: string | number
  area?: string | number
  mainImage?: string
  status?: string
  location?: {
    city?: string
    province?: string
    country?: string
  }
  images?: { image?: string | string[] } | string[]
}

const HABIHUB_TYPE_MAPPING: Record<string, string> = {
  'apartment': 'apartment',
  'penthouse': 'penthouse',
  'villa': 'villa',
  'house': 'house',
  'building': 'building',
  'hotel': 'hotel',
  'rural': 'rural',
  'land': 'land',
  'ground-floor': 'apartment',
  'ground_floor': 'apartment',
  'groundfloor': 'apartment',
  'terraced': 'townhouse',
  'townhouse': 'townhouse',
  'bungalow': 'villa',
  'low-bungalow': 'villa',
  'lowbungalow': 'villa',
  'duplex': 'apartment',
  'studio': 'apartment',
  'loft': 'apartment',
  'attic': 'penthouse',
  'finca': 'rural',
  'cortijo': 'rural',
  'commercial': 'commercial',
  'office': 'commercial',
  'detached': 'villa',
  'semi-detached': 'townhouse',
  'semidetached': 'townhouse',
  'garage': 'other',
  'storage': 'other',
}

function mapHabihubType(habihubType: string): string {
  if (!habihubType) return 'other'
  const normalized = habihubType.toLowerCase().trim()
  return HABIHUB_TYPE_MAPPING[normalized] ?? 'other'
}

function extractProperties(parsed: Record<string, unknown>): HabiHubProperty[] {
  // Intentar distintas rutas comunes de HabiHub
  const tryPaths = [
    () => {
      const pl = parsed['propertyList'] as Record<string, unknown>
      if (pl && pl['property']) {
        const p = pl['property']
        return Array.isArray(p) ? p : [p]
      }
      return null
    },
    () => {
      const pl = parsed['properties'] as Record<string, unknown>
      if (pl && pl['property']) {
        const p = pl['property']
        return Array.isArray(p) ? p : [p]
      }
      return null
    },
    () => {
      const p = parsed['property']
      if (p) return Array.isArray(p) ? p : [p]
      return null
    },
  ]

  for (const tryPath of tryPaths) {
    const result = tryPath()
    if (result && result.length > 0) return result as HabiHubProperty[]
  }
  return []
}

function getFirstImage(prop: HabiHubProperty): string | null {
  if (prop.mainImage) return prop.mainImage

  const images = prop.images
  if (!images) return null

  if (Array.isArray(images)) {
    return typeof images[0] === 'string' ? images[0] : null
  }

  if (typeof images === 'object' && images.image) {
    const img = images.image
    return Array.isArray(img) ? img[0] : img
  }
  return null
}

function mapStatus(status?: string): string {
  if (!status) return 'active'
  const s = status.toLowerCase()
  if (s.includes('sold') || s.includes('vendido')) return 'sold'
  if (s.includes('reserv')) return 'reserved'
  if (s.includes('available') || s.includes('disponible')) return 'available'
  return 'active'
}

export async function POST() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '_',
    textNodeName: '_text',
    isArray: (name) => ['property', 'image'].includes(name),
  })

  let totalInserted = 0
  let totalUpdated = 0
  let totalErrors = 0
  let totalProcessed = 0
  const feedErrors: string[] = []

  for (const feedUrl of FEEDS) {
    try {
      const res = await fetch(feedUrl, {
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(30000),
      })

      if (!res.ok) {
        feedErrors.push(`Feed ${feedUrl}: HTTP ${res.status}`)
        continue
      }

      const xmlText = await res.text()

      let parsed: Record<string, unknown>
      try {
        parsed = parser.parse(xmlText) as Record<string, unknown>
      } catch (parseErr) {
        feedErrors.push(`Feed ${feedUrl}: Error parsing XML - ${parseErr}`)
        continue
      }

      const properties = extractProperties(parsed)

      if (properties.length === 0) {
        console.warn(`Feed ${feedUrl}: No properties found. Keys:`, Object.keys(parsed))
        feedErrors.push(`Feed ${feedUrl}: No properties found in XML`)
        continue
      }

      for (const prop of properties) {
        totalProcessed++
        try {
          const externalId = String(prop.id ?? '')
          if (!externalId) {
            totalErrors++
            continue
          }

          const mapped = {
            external_id: externalId,
            external_source: 'habihub',
            title: String(prop.name ?? prop.title ?? 'Sin título'),
            description: prop.description ? String(prop.description) : null,
            price: prop.price ? parseFloat(String(prop.price).replace(/[^0-9.]/g, '')) : null,
            property_type: mapHabihubType(String(prop.propertyType ?? prop.property_type ?? '')),
            location: prop.location?.city ? String(prop.location.city) : null,
            province: prop.location?.province ? String(prop.location.province) : null,
            country: prop.location?.country ? String(prop.location.country) : null,
            bedrooms: prop.bedrooms ? parseInt(String(prop.bedrooms)) : null,
            bathrooms: prop.bathrooms ? parseInt(String(prop.bathrooms)) : null,
            area_sqm: prop.area ? parseFloat(String(prop.area)) : null,
            image_url: getFirstImage(prop),
            status: mapStatus(prop.status) as 'active' | 'inactive' | 'sold' | 'available' | 'reserved',
            last_synced_at: new Date().toISOString(),
          }

          // Buscar por external_id
          const { data: existing } = await supabase
            .from('properties')
            .select('id, price, status')
            .eq('external_id', externalId)
            .maybeSingle()

          if (!existing) {
            const { error: insertErr } = await supabase
              .from('properties')
              .insert({ ...mapped, currency: 'EUR', featured: false })

            if (insertErr) {
              console.error('Insert error:', insertErr.message)
              totalErrors++
            } else {
              totalInserted++
            }
          } else {
            // Solo actualizar si cambió precio o status
            const priceChanged = mapped.price !== existing.price
            const statusChanged = mapped.status !== existing.status

            if (priceChanged || statusChanged) {
              const { error: updateErr } = await supabase
                .from('properties')
                .update({
                  price: mapped.price,
                  status: mapped.status,
                  last_synced_at: mapped.last_synced_at,
                })
                .eq('id', existing.id)

              if (updateErr) {
                console.error('Update error:', updateErr.message)
                totalErrors++
              } else {
                totalUpdated++
              }
            }
          }
        } catch (propErr) {
          console.error('Property processing error:', propErr)
          totalErrors++
        }
      }
    } catch (feedErr) {
      feedErrors.push(`Feed ${feedUrl}: ${feedErr instanceof Error ? feedErr.message : String(feedErr)}`)
    }
  }

  return NextResponse.json({
    success: feedErrors.length < FEEDS.length,
    results: {
      total: totalProcessed,
      inserted: totalInserted,
      updated: totalUpdated,
      errors: totalErrors,
    },
    feedErrors: feedErrors.length > 0 ? feedErrors : undefined,
  })
}
