import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { XMLParser } from 'fast-xml-parser'

const FEEDS = [
  'https://medianewbuild.com/file/hh-media-bucket/agents/9e04488b-75ba-4831-b2c9-55e1ad47d4b9/feed_blanca_calida.xml',
  'https://medianewbuild.com/file/hh-media-bucket/agents/9e04488b-75ba-4831-b2c9-55e1ad47d4b9/feed_sol.xml',
]

// Actual field names from HabiHub XML (Kyero format)
interface HabiHubProperty {
  id?: string | number
  ref?: string
  price?: string | number
  currency?: string
  type?: string
  town?: string
  province?: string
  country?: string
  location?: {
    latitude?: string | number
    longitude?: string | number
    zipcode?: string
    address?: string
  }
  location_detail?: string
  beds?: string | number
  baths?: string | number
  surface_area?: {
    built?: string | number
    plot?: string | number
  }
  desc?: Record<string, unknown>
  images?: {
    image?: Array<{ _text?: string; _id?: string } | string>
  }
  status?: string
  new_build?: string | number
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

const TYPE_LABEL_ES: Record<string, string> = {
  'apartment': 'Apartamento',
  'penthouse': 'Ático',
  'villa': 'Villa',
  'house': 'Casa',
  'townhouse': 'Adosado',
  'rural': 'Finca',
  'land': 'Terreno',
  'commercial': 'Local comercial',
  'building': 'Edificio',
  'other': 'Propiedad',
}

function mapHabihubType(habihubType: string): string {
  if (!habihubType) return 'other'
  const normalized = habihubType.toLowerCase().trim()
  return HABIHUB_TYPE_MAPPING[normalized] ?? 'other'
}

function buildTitle(prop: HabiHubProperty): string {
  const mappedType = mapHabihubType(String(prop.type ?? ''))
  const typeLabel = TYPE_LABEL_ES[mappedType] ?? 'Propiedad'
  const city = prop.town ?? prop.location_detail ?? ''
  if (city) return `${typeLabel} en ${city}`
  if (prop.ref) return `${typeLabel} ref. ${prop.ref}`
  return typeLabel
}

function extractProperties(parsed: Record<string, unknown>): HabiHubProperty[] {
  const tryPaths = [
    // Actual HabiHub Kyero format: <root><property>
    () => {
      const root = parsed['root'] as Record<string, unknown>
      if (root && root['property']) {
        const p = root['property']
        return Array.isArray(p) ? p : [p]
      }
      return null
    },
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
  const imageList = prop.images?.image
  if (!imageList || !Array.isArray(imageList) || imageList.length === 0) return null

  const first = imageList[0]
  if (typeof first === 'string') return first
  if (first && typeof first === 'object' && '_text' in first) {
    return typeof first._text === 'string' ? first._text : null
  }
  return null
}

function getDescriptionEs(prop: HabiHubProperty): string | null {
  if (!prop.desc) return null
  const desc = prop.desc as Record<string, unknown>
  const es = desc['es']
  if (typeof es === 'string') return es || null
  return null
}

function getDescriptionEn(prop: HabiHubProperty): string | null {
  if (!prop.desc) return null
  const desc = prop.desc as Record<string, unknown>
  const en = desc['en']
  if (typeof en === 'string') return en || null
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
        console.warn(`Feed ${feedUrl}: No properties found. Top-level keys:`, Object.keys(parsed))
        feedErrors.push(`Feed ${feedUrl}: No properties found in XML`)
        continue
      }

      for (const prop of properties) {
        totalProcessed++
        try {
          const externalId = String(prop.id ?? '').trim()
          if (!externalId) {
            totalErrors++
            continue
          }

          const mapped = {
            external_id: externalId,
            external_source: 'habihub',
            title: buildTitle(prop),
            description: getDescriptionEs(prop),
            description_en: getDescriptionEn(prop),
            price: prop.price ? parseFloat(String(prop.price).replace(/[^0-9.]/g, '')) : null,
            property_type: mapHabihubType(String(prop.type ?? '')),
            location: prop.town ? String(prop.town) : null,
            province: prop.province ? String(prop.province) : null,
            country: prop.country ? String(prop.country) : null,
            bedrooms: prop.beds ? parseInt(String(prop.beds)) : null,
            bathrooms: prop.baths ? parseInt(String(prop.baths)) : null,
            area_sqm: prop.surface_area?.built ? parseFloat(String(prop.surface_area.built)) : null,
            image_url: getFirstImage(prop),
            status: mapStatus(prop.status) as 'active' | 'inactive' | 'sold' | 'available' | 'reserved',
            last_synced_at: new Date().toISOString(),
          }

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
