import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth/getUserRole'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, syncRateLimit, getIdentifier } from '@/lib/ratelimit'
import { XMLParser } from 'fast-xml-parser'
import { randomUUID } from 'node:crypto'
import { logAdminAction } from '@/lib/audit'
import { revalidatePropertyPaths } from '@/lib/cache/revalidateProperties'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')                    // descompone acentos
    .replace(/[̀-ͯ]/g, '')      // remueve diacríticos
    .replace(/[^a-z0-9\s-]/g, '')         // solo alfanuméricos, espacios, guiones
    .trim()
    .replace(/\s+/g, '-')                 // espacios → guion
    .replace(/-+/g, '-')                  // colapsa guiones múltiples
    .slice(0, 80)                         // máximo 80 chars (deja margen para sufijo)
}

export const maxDuration = 300
export const dynamic = 'force-dynamic'

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

function normalizeCountry(raw: string | undefined | null): string {
  if (!raw) return 'España'
  const lower = raw.toString().trim().toLowerCase()
  const map: Record<string, string> = {
    'spain': 'España',
    'españa': 'España',
    'espana': 'España',
    'es': 'España',
  }
  return map[lower] ?? raw // si no matchea conocidos, deja el valor original
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
  habihub_dev_id: string | null
  habihub_unit: string | null
}

interface ExistingProp {
  id: string
  ref_code: string | null
  external_id: string | null
  price: number | null
  status: string | null
  location: string | null
  province: string | null
  property_type: string | null
  bedrooms: number | null
  bathrooms: number | null
  area_sqm: number | null
  country: string | null
  is_development: boolean | null
  external_source: string | null
  featured: boolean | null
}

interface ConflictInfo {
  externalId: string
  title: string
  location: string
  candidates: number
  resolution?: 'insert_new_drop_old'
}

interface DeletedSample {
  id: string
  ref_code: string | null
  location: string
  title: string
}

function dedupeImageUrls(urls: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const url of urls) {
    if (url && !seen.has(url)) {
      seen.add(url)
      result.push(url)
    }
  }
  return result
}

function parseFeedProp(raw: Record<string, unknown>): FeedProp {
  const rawType = String(raw.type ?? '')
  const mappedType = mapType(rawType)
  const typeLabel = TYPE_LABEL_ES[mappedType] ?? 'Propiedad'
  const town = String(raw.town ?? raw.location_detail ?? '')

  // Estructura real del feed Kyero v3: <image id="N"><url>https://...</url></image>
  // Con attributeNamePrefix='_' y textNodeName='_text', fast-xml-parser produce:
  //   { _id: "N", url: "https://..." }
  // Lectura defensiva: aceptamos múltiples formas por si el feed cambia de nuevo.
  const imageList = (raw.images as Record<string, unknown>)?.image
  const images: string[] = Array.isArray(imageList)
    ? (imageList as unknown[])
        .map((i) => {
          if (typeof i === 'string') return i
          if (typeof i === 'object' && i !== null) {
            const obj = i as Record<string, unknown>
            // Orden de prioridad: url (Kyero v3) > _text (fallback histórico)
            if (typeof obj.url === 'string') return obj.url
            if (typeof obj._text === 'string') return obj._text
          }
          return ''
        })
        .filter((url) => url.length > 0 && url.startsWith('http'))
    : []

  const desc = raw.desc as Record<string, unknown> | undefined
  const descEs = desc?.es ? String(desc.es) : null
  const descEn = desc?.en ? String(desc.en) : null

  const surfaceArea = raw.surface_area as Record<string, unknown> | undefined
  const deduped = dedupeImageUrls(images)

  // Extraer dev_id y unit del tag <ref> (formato: "[dev_id]-[unit]")
  const rawRef = String(raw.ref ?? '').trim()
  let habihub_dev_id: string | null = null
  let habihub_unit: string | null = null
  if (rawRef.includes('-')) {
    const dashIdx = rawRef.indexOf('-')
    const dev = rawRef.substring(0, dashIdx)
    const unit = rawRef.substring(dashIdx + 1)
    if (/^\d+$/.test(dev)) {
      habihub_dev_id = dev
      habihub_unit = unit || null
    }
  }

  return {
    externalId: String(raw.id ?? '').trim(),
    title: town ? `${typeLabel} en ${town}` : typeLabel,
    country: normalizeCountry(raw.country as string | undefined | null),
    location: town,
    province: String(raw.province ?? ''),
    property_type: mappedType,
    price: parseFloat(String(raw.price ?? '0').replace(/[^0-9.]/g, '')) || 0,
    bedrooms: parseInt(String(raw.beds ?? '0')) || 0,
    bathrooms: parseInt(String(raw.baths ?? '0')) || 0,
    area_sqm: parseFloat(String(surfaceArea?.built ?? '0')) || 0,
    description: descEs,
    description_en: descEn,
    image_url: deduped[0] ?? null,
    gallery_urls: deduped,
    habihub_dev_id,
    habihub_unit,
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
  // Auth: Bearer token (cron) O sesión admin (UI manual)
  const authHeader = request.headers.get('authorization')
  const expectedToken = process.env.CRON_SECRET

  const isCronAuth = !!expectedToken
    && !!authHeader
    && authHeader === `Bearer ${expectedToken}`

  if (!isCronAuth) {
    // Si no es cron, validar sesión admin (comportamiento histórico)
    try {
      await requireAdmin()
    } catch {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
  }

  const rateLimitCheck = await checkRateLimit(
    syncRateLimit,
    getIdentifier(request)
  )
  if (!rateLimitCheck.ok) {
    return NextResponse.json(
      { error: 'Too many requests', retryAfter: rateLimitCheck.retryAfter },
      { status: 429, headers: { 'Retry-After': String(rateLimitCheck.retryAfter) } }
    )
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
    deleted_count: 0,
    updated_count: 0,
  }
  const conflictDetails: ConflictInfo[] = []
  const insertedSample: { externalId: string; title: string }[] = []
  // Detalle de errores por lote de INSERT (se persiste en sync_logs.details para debugging)
  const insertErrors: { batch: number; from: number; count: number; error: string }[] = []
  let deletedSample: DeletedSample[] = []
  let totalInScope = 0
  // Métricas internas persistidas para auditoría (se rellenan al final de Fase 4)
  let diagnostics: Record<string, unknown> = {}

  try {
    // Paginación manual: Supabase tiene cap server-side de 1000 filas que
    // .range() no override. Iteramos hasta agotar el resultado.
    const PAGE_SIZE = 1000
    const MAX_PAGES = 100 // safety: 100k filas máximo
    const allExisting: ExistingProp[] = []

    for (let page = 0; page < MAX_PAGES; page++) {
      const from = page * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const { data, error } = await supabaseAdmin
        .from('properties')
        .select('id,ref_code,external_id,price,status,location,province,property_type,bedrooms,bathrooms,area_sqm,country,is_development,external_source,featured')
        .eq('external_source', 'habihub')
        .range(from, to)

      if (error) {
        throw new Error(`Error cargando candidatos (página ${page}): ${error.message}`)
      }

      if (!data || data.length === 0) break

      allExisting.push(...(data as ExistingProp[]))

      if (data.length < PAGE_SIZE) break // última página
    }
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

    // Fase 1 — descargar y parsear todos los feeds
    const combinedFeed: FeedProp[] = []

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

      for (const raw of propsArray) {
        try {
          const fp = parseFeedProp(raw)
          if (!fp.externalId) { stats.errors++; continue }
          combinedFeed.push(fp)
        } catch {
          stats.errors++
        }
      }
    }

    // Fase 2 — deduplicar entre los 2 feeds (mismo external_id)
    const seenExternalIds = new Set<string>()
    const dedupedFeed = combinedFeed.filter((fp) => {
      if (!fp.externalId) return false
      if (seenExternalIds.has(fp.externalId)) return false
      seenExternalIds.add(fp.externalId)
      return true
    })
    console.log(`Feed combinado: ${combinedFeed.length}, deduplicado: ${dedupedFeed.length}`)
    stats.total_in_feed = dedupedFeed.length

    // Fase 3 — matching contra la DB
    const processedIds = new Set<string>()
    const toUpdateById: { id: string; data: Record<string, unknown> }[] = []
    const toUpdateByFp: { id: string; data: Record<string, unknown> }[] = []
    const toInsert: Record<string, unknown>[] = []

    for (const fp of dedupedFeed) {
      try {
        // 1 — Match exacto por external_id
        const exactMatch = byExternalId.get(fp.externalId)
        if (exactMatch) {
          stats.matched_by_external_id++
          processedIds.add(exactMatch.id)
          toUpdateById.push({
            id: exactMatch.id,
            data: {
              price: fp.price,
              description: fp.description,
              description_en: fp.description_en,
              hidden_by_sync: false, // reactivar si había sido ocultada en un sync previo
              // Defensiva: solo actualizar imágenes si el feed parseó valores válidos.
              // Evita destruir fotos existentes si un futuro cambio del feed rompe el extractor.
              ...(fp.image_url ? { image_url: fp.image_url } : {}),
              ...(fp.gallery_urls && fp.gallery_urls.length > 0 ? { gallery_urls: fp.gallery_urls } : {}),
              last_synced_at: new Date().toISOString(),
            },
          })
          continue
        }

        // 2 — Filtrar candidatos por huella digital
        const fpCandidates = allExisting.filter((e) => e.external_source === 'habihub' && fingerprintMatch(e, fp))

        // 2.b — Huella ambigua: el feed es la fuente de verdad. Logueamos
        // el conflict y caemos al flujo de INSERT que sigue. Los candidatos
        // viejos NO se borran: quedan fuera de processedIds y la Fase 4 los
        // OCULTA (hidden_by_sync=true, reversible) si están dentro del scope.
        if (fpCandidates.length > 1) {
          stats.conflicts++
          if (conflictDetails.length < 100) {
            conflictDetails.push({
              externalId: fp.externalId,
              title: fp.title,
              location: fp.location,
              candidates: fpCandidates.length,
              resolution: 'insert_new_drop_old',
            })
          }
        }

        // 3 — Si hay exactamente 1 match: UPDATE por huella.
        //     Si no (0 candidatos o >1 ya logueado arriba): INSERT.
        if (fpCandidates.length !== 1) {
          // INSERT — cubre tanto length === 0 como length > 1 (conflict resuelto).
          // NO incrementamos inserted_new acá: el contador real se calcula en la
          // Fase 5 contando solo las filas que Supabase confirma como insertadas.
          const newId = randomUUID()
          processedIds.add(newId)
          if (insertedSample.length < 50) insertedSample.push({ externalId: fp.externalId, title: fp.title })
          toInsert.push({
            id: newId,
            external_id: fp.externalId,
            external_source: 'habihub',
            title: fp.title,
            slug: `${slugify(fp.title)}-${fp.externalId}`,
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
            is_development: true,
            habihub_dev_id: fp.habihub_dev_id,
            habihub_unit: fp.habihub_unit,
            last_synced_at: new Date().toISOString(),
          })
        } else {
          // UPDATE por huella (length === 1)
          stats.matched_by_fingerprint++
          processedIds.add(fpCandidates[0].id)
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
              habihub_dev_id: fp.habihub_dev_id,
              habihub_unit: fp.habihub_unit,
              // Defensiva: solo actualizar imágenes si el feed parseó valores válidos.
              // Evita destruir fotos existentes si un futuro cambio del feed rompe el extractor.
              ...(fp.image_url ? { image_url: fp.image_url } : {}),
              ...(fp.gallery_urls && fp.gallery_urls.length > 0 ? { gallery_urls: fp.gallery_urls } : {}),
              last_synced_at: new Date().toISOString(),
            },
          })
          byExternalId.set(fp.externalId, { ...fpCandidates[0], external_id: fp.externalId })
        }
      } catch {
        stats.errors++
      }
    }

    // Fase 4 — ocultado reversible (hidden_by_sync=true) en lugar de borrado físico.
    // Scope: external_source='habihub' + external_id numérico (único discriminador fiable
    // de que la propiedad vino del feed). No filtra por country ni is_development —
    // esos filtros son frágiles. Excluye destacadas.
    const NUMERIC_ID = /^\d+$/
    const hideScopeAll = allExisting.filter((p) =>
      p.external_source === 'habihub' &&
      NUMERIC_ID.test(p.external_id ?? '') &&
      p.featured !== true
    )
    totalInScope = hideScopeAll.length

    const toHide = hideScopeAll.filter((p) => !processedIds.has(p.id))
    const hiddenCount = toHide.length
    stats.deleted_count = hiddenCount // reutilizado para compatibilidad con UI y sync_logs

    if (hiddenCount > 0) {
      const hidePct = (hiddenCount / Math.max(hideScopeAll.length, 1)) * 100

      deletedSample = toHide.slice(0, 50).map((p) => ({
        id: p.id,
        ref_code: p.ref_code ?? null,
        location: p.location ?? '',
        title: `${p.property_type ?? '?'} en ${p.location ?? '?'}`,
      }))

      // El dry-run muestra cuántas se ocultarían sin escribir nada.
      // La salvaguarda solo bloquea el ocultado real.
      if (!dryRun) {
        if (hidePct > 80 && hideScopeAll.length > 100) {
          throw new Error(
            `Salvaguarda activada: ocultaría ${hiddenCount} de ${hideScopeAll.length} ` +
            `(${hidePct.toFixed(1)}%). Posible feed corrupto. Sync abortado.`
          )
        }

        // Ocultado selectivo en lotes de 50 (reversible: hidden_by_sync=false al reaparecer)
        for (let i = 0; i < toHide.length; i += 50) {
          const batchIds = toHide.slice(i, i + 50).map((p) => p.id)
          const { error } = await supabaseAdmin
            .from('properties')
            .update({ hidden_by_sync: true })
            .in('id', batchIds)
          if (error) throw error
        }
      }
    }

    stats.updated_count = stats.matched_by_external_id + stats.matched_by_fingerprint

    diagnostics = {
      code_version: 'v6-hide',
      all_existing_count: allExisting.length,
      deduped_feed_count: dedupedFeed.length,
      hide_scope_all_count: hideScopeAll.length,
      processed_ids_size: processedIds.size,
      to_hide_count: toHide.length,
      to_update_by_id_size: toUpdateById.length,
      to_update_by_fp_size: toUpdateByFp.length,
      to_insert_size: toInsert.length,
    }

    // Fase 5 — aplicar cambios si no es dry-run
    if (dryRun) {
      // Proyección: no se escribe nada, pero reportamos cuántas se insertarían.
      stats.inserted_new = toInsert.length
    } else {
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

      // Inserts en lotes de 50 (NO en un único batch atómico: una fila inválida
      // tiraba las 298). Cada lote es independiente: si uno falla, capturamos el
      // error de Supabase, lo logueamos y seguimos con los demás lotes.
      // inserted_new cuenta solo las filas que Supabase confirma (.select('id')).
      for (let i = 0; i < toInsert.length; i += 50) {
        const batch = toInsert.slice(i, i + 50)
        const batchNum = Math.floor(i / 50) + 1
        try {
          const { data: insertedRows, error: insertErr } = await supabaseAdmin
            .from('properties')
            .insert(batch)
            .select('id')

          if (insertErr) {
            const detail = [insertErr.message, insertErr.details, insertErr.hint]
              .filter(Boolean)
              .join(' | ')
            console.error(
              `INSERT lote ${batchNum} (filas ${i}–${i + batch.length - 1}) falló: ${detail}`
            )
            insertErrors.push({ batch: batchNum, from: i, count: batch.length, error: detail })
            stats.errors += batch.length
            continue
          }

          const confirmed = insertedRows?.length ?? 0
          stats.inserted_new += confirmed
          // Si Supabase confirmó menos filas que las enviadas, el resto se considera error.
          if (confirmed < batch.length) {
            const missing = batch.length - confirmed
            stats.errors += missing
            const detail = `Supabase confirmó ${confirmed}/${batch.length} filas (faltan ${missing})`
            console.error(`INSERT lote ${batchNum}: ${detail}`)
            insertErrors.push({ batch: batchNum, from: i, count: missing, error: detail })
          }
        } catch (e) {
          const detail = e instanceof Error ? e.message : String(e)
          console.error(
            `INSERT lote ${batchNum} (filas ${i}–${i + batch.length - 1}) excepción: ${detail}`
          )
          insertErrors.push({ batch: batchNum, from: i, count: batch.length, error: detail })
          stats.errors += batch.length
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
        deleted_sample: deletedSample,
        insert_errors: insertErrors,
        diagnostics,
      },
    })
    .eq('id', logEntry?.id)

  if (!isCronAuth) {
    await logAdminAction({
      action: 'sync_habihub_manual',
      entity_type: 'sync',
      entity_id: logEntry?.id ?? null,
      entity_label: `sync habihub — ${dryRun ? 'dry run' : 'real'}`,
      metadata: { dry_run: dryRun, ...stats },
      actor: user ? { id: user.id, email: user.email ?? null } : undefined,
    })
  }

  if (!dryRun) revalidatePropertyPaths()

  return NextResponse.json({
    success: true,
    dryRun,
    stats,
    logId: logEntry?.id,
    deletedCount: stats.deleted_count,
    totalInScope,
  })
}
