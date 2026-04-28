import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth/getUserRole'
import { createClient } from '@/lib/supabase/server'
import { XMLParser } from 'fast-xml-parser'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const FEED_URLS = [
  process.env.HABIHUB_FEED_BLANCA_CALIDA
    ?? 'https://medianewbuild.com/file/hh-media-bucket/agents/9e04488b-75ba-4831-b2c9-55e1ad47d4b9/feed_blanca_calida.xml',
  process.env.HABIHUB_FEED_SOL
    ?? 'https://medianewbuild.com/file/hh-media-bucket/agents/9e04488b-75ba-4831-b2c9-55e1ad47d4b9/feed_sol.xml',
]

const HABIHUB_TYPE_MAPPING: Record<string, string> = {
  apartment: 'apartment', penthouse: 'penthouse', villa: 'villa',
  house: 'house', building: 'building', hotel: 'hotel', rural: 'rural',
  land: 'land', 'ground-floor': 'apartment', ground_floor: 'apartment',
  groundfloor: 'apartment', terraced: 'townhouse', townhouse: 'townhouse',
  bungalow: 'villa', 'low-bungalow': 'villa', lowbungalow: 'villa',
  duplex: 'apartment', studio: 'apartment', loft: 'apartment',
  attic: 'penthouse', finca: 'rural', cortijo: 'rural',
  commercial: 'commercial', office: 'commercial', detached: 'villa',
  'semi-detached': 'townhouse', semidetached: 'townhouse',
  garage: 'other', storage: 'other',
}

const TYPE_LABEL_ES: Record<string, string> = {
  apartment: 'Apartamento', penthouse: 'Ático', villa: 'Villa',
  house: 'Casa', townhouse: 'Adosado', rural: 'Finca', land: 'Terreno',
  commercial: 'Local comercial', building: 'Edificio', other: 'Propiedad',
}

function mapType(raw: string): string {
  return HABIHUB_TYPE_MAPPING[raw?.toLowerCase().trim()] ?? 'other'
}

interface FeedProp {
  externalId: string
  title: string
  country: string
  location: string
  province: string
  property_type: string
  price: number
  bedrooms: number
  bathrooms: number
  area_sqm: number
  description: string | null
  description_en: string | null
  image_url: string | null
  gallery_urls: string[]
}

interface ExistingProp {
  id: string
  external_id: string | null
  price: number | null
  status: string | null
  location: string | null
  province: string | null
  property_type: string | null
  bedrooms: number | null
  bathrooms: number | null
  area_sqm: number | null
}

interface ConflictInfo {
  externalId: string
  title: string
  location: string
  candidates: number
}

function parseFeedProp(raw: Record<string, unknown>): FeedProp {
  const rawType = String(raw.type ?? '')
  const mappedType = mapType(rawType)
  const typeLabel = TYPE_LABEL_ES[mappedType] ?? 'Propiedad'
  const town = String(raw.town ?? raw.location_detail ?? '')

  const imageList = (raw.images as Record<string, unknown>)?.image
  const images: string[] = Array.isArray(imageList)
    ? (imageList as unknown[]).map((i) =>
        typeof i === 'string' ? i : typeof i === 'object' && i !== null ? String((i as Record<string, unknown>)._text ?? '') : ''
      ).filter(Boolean)
    : []

  const desc = raw.desc as Record<string, unknown> | undefined
  const descEs = desc?.es ? String(desc.es) : null
  const descEn = desc?.en ? String(desc.en) : null

  const surfaceArea = raw.surface_area as Record<string, unknown> | undefined

  return {
    externalId: String(raw.id ?? '').trim(),
    title: town ? `${typeLabel} en ${town}` : typeLabel,
    country: String(raw.country ?? 'España'),
    location: town,
    province: String(raw.province ?? ''),
    property_type: mappedType,
    price: parseFloat(String(raw.price ?? '0').replace(/[^0-9.]/g, '')) || 0,
    bedrooms: parseInt(String(raw.beds ?? '0')) || 0,
    bathrooms: parseInt(String(raw.baths ?? '0')) || 0,
    area_sqm: parseFloat(String(surfaceArea?.built ?? '0')) || 0,
    description: descEs,
    description_en: descEn,
    image_url: images[0] ?? null,
    gallery_urls: images,
  }
}

function fingerprintMatch(existing: ExistingProp, feed: FeedProp): boolean {
  if (!existing.location || !feed.location) return false
  if (existing.location.toLowerCase().trim() !== feed.location.toLowerCase().trim()) return false
  if (existing.property_type !== feed.property_type) return false
  if (existing.bedrooms !== feed.bedrooms) return false
  if (existing.bathrooms !== feed.bathrooms) return false

  if (existing.price && feed.price) {
    const diff = Math.abs(existing.price - feed.price) / feed.price
    if (diff > 0.05) return false
  }

  if (existing.area_sqm && feed.area_sqm) {
    const diff = Math.abs(existing.area_sqm - feed.area_sqm) / feed.area_sqm
    if (diff > 0.05) return false
  }

  return true
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const dryRun = url.searchParams.get('dry') === 'true'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: logEntry } = await supabaseAdmin
    .from('sync_logs')
    .insert({ feed_source: 'habihub_combined', dry_run: dryRun, triggered_by: user?.id ?? null })
    .select()
    .single()

  const stats = {
    total_in_feed: 0,
    matched_by_external_id: 0,
    matched_by_fingerprint: 0,
    inserted_new: 0,
    conflicts: 0,
    errors: 0,
  }
  const conflictDetails: ConflictInfo[] = []
  const insertedSample: { externalId: string; title: string }[] = []

  try {
    // Cargar todas las propiedades existentes una sola vez
    const { data: existing } = await supabaseAdmin
      .from('properties')
      .select('id,external_id,price,status,location,province,property_type,bedrooms,bathrooms,area_sqm')

    const allExisting: ExistingProp[] = existing ?? []
    const byExternalId = new Map<string, ExistingProp>()
    for (const p of allExisting) {
      if (p.external_id) byExternalId.set(p.external_id, p)
    }

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '_',
      textNodeName: '_text',
      isArray: (name) => ['property', 'image'].includes(name),
    })

    const toUpdateById: { id: string; data: Record<string, unknown> }[] = []
    const toUpdateByFp: { id: string; data: Record<string, unknown> }[] = []
    const toInsert: Record<string, unknown>[] = []

    for (const feedUrl of FEED_URLS) {
      let xmlText: string
      try {
        const res = await fetch(feedUrl, { signal: AbortSignal.timeout(30000) })
        if (!res.ok) {
          stats.errors++
          continue
        }
        xmlText = await res.text()
      } catch {
        stats.errors++
        continue
      }

      let parsed: Record<string, unknown>
      try {
        parsed = parser.parse(xmlText) as Record<string, unknown>
      } catch {
        stats.errors++
        continue
      }

      const root = parsed['root'] as Record<string, unknown> | undefined
      const rawProps = root?.['property']
      const propsArray: Record<string, unknown>[] = Array.isArray(rawProps)
        ? rawProps
        : rawProps ? [rawProps as Record<string, unknown>] : []

      stats.total_in_feed += propsArray.length

      for (const raw of propsArray) {
        try {
          const fp = parseFeedProp(raw)
          if (!fp.externalId) { stats.errors++; continue }

          // 1 — Match exacto por external_id
          const exactMatch = byExternalId.get(fp.externalId)
          if (exactMatch) {
            stats.matched_by_external_id++
            toUpdateById.push({
              id: exactMatch.id,
              data: {
                price: fp.price,
                description: fp.description,
                description_en: fp.description_en,
                image_url: fp.image_url,
                gallery_urls: fp.gallery_urls,
                last_synced_at: new Date().toISOString(),
              },
            })
            continue
          }

          // 2 — Match por huella digital
          const fpCandidates = allExisting.filter((e) => fingerprintMatch(e, fp))

          if (fpCandidates.length === 1) {
            stats.matched_by_fingerprint++
            toUpdateByFp.push({
              id: fpCandidates[0].id,
              data: {
                external_id: fp.externalId,
                external_source: 'habihub',
                title: fp.title,
                price: fp.price,
                province: fp.province,
                description: fp.description,
                description_en: fp.description_en,
                image_url: fp.image_url,
                gallery_urls: fp.gallery_urls,
                last_synced_at: new Date().toISOString(),
              },
            })
            // Actualizar mapa para evitar doble match en el mismo run
            byExternalId.set(fp.externalId, { ...fpCandidates[0], external_id: fp.externalId })
            continue
          }

          if (fpCandidates.length > 1) {
            stats.conflicts++
            conflictDetails.push({
              externalId: fp.externalId,
              title: fp.title,
              location: fp.location,
              candidates: fpCandidates.length,
            })
            continue
          }

          // 3 — Nueva propiedad
          stats.inserted_new++
          if (insertedSample.length < 50) insertedSample.push({ externalId: fp.externalId, title: fp.title })
          toInsert.push({
            external_id: fp.externalId,
            external_source: 'habihub',
            title: fp.title,
            country: fp.country,
            location: fp.location,
            province: fp.province,
            property_type: fp.property_type,
            price: fp.price,
            currency: 'EUR',
            bedrooms: fp.bedrooms,
            bathrooms: fp.bathrooms,
            area_sqm: fp.area_sqm,
            description: fp.description,
            description_en: fp.description_en,
            image_url: fp.image_url,
            gallery_urls: fp.gallery_urls,
            status: 'active',
            featured: false,
            last_synced_at: new Date().toISOString(),
          })
        } catch {
          stats.errors++
        }
      }
    }

    // Aplicar cambios si no es dry-run
    if (!dryRun) {
      // Updates por external_id — lotes de 50 en paralelo
      for (let i = 0; i < toUpdateById.length; i += 50) {
        const batch = toUpdateById.slice(i, i + 50)
        await Promise.all(
          batch.map(({ id, data }) =>
            supabaseAdmin.from('properties').update(data).eq('id', id)
          )
        )
      }

      // Updates por fingerprint — lotes de 50 en paralelo
      for (let i = 0; i < toUpdateByFp.length; i += 50) {
        const batch = toUpdateByFp.slice(i, i + 50)
        await Promise.all(
          batch.map(({ id, data }) =>
            supabaseAdmin.from('properties').update(data).eq('id', id)
          )
        )
      }

      // Inserts en un solo batch
      if (toInsert.length > 0) {
        const { error: insertErr } = await supabaseAdmin
          .from('properties')
          .insert(toInsert)
        if (insertErr) {
          console.error('Batch insert error:', insertErr.message)
          stats.errors++
        }
      }
    }
  } catch (err) {
    console.error('Sync general error:', err)
    stats.errors++
  }

  await supabaseAdmin
    .from('sync_logs')
    .update({
      finished_at: new Date().toISOString(),
      ...stats,
      details: {
        conflict_details: conflictDetails.slice(0, 100),
        inserted_sample: insertedSample,
      },
    })
    .eq('id', logEntry?.id)

  return NextResponse.json({
    success: true,
    dryRun,
    stats,
    logId: logEntry?.id,
  })
}
