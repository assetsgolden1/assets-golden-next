/**
 * enrichCerveraDescriptions — backfill puntual (27/08/2026)
 *
 * El importador usaba el copy editorial de la fuente (`excerptEs` / `excerptHtml`)
 * EN LUGAR de la ficha técnica generada, o al revés. Resultado: descripciones a
 * las que les faltaba o el relato o los datos duros (plantas, residencias,
 * superficies, entrega, amenidades).
 *
 * Desde este commit el importador los concatena. Este script aplica lo mismo a
 * las 62 promociones ya cargadas, SIN inventar nada: solo antepone el texto
 * editorial que la fuente ya publica cuando la descripción actual no lo incluye.
 *
 * Uso:
 *   npx tsx --env-file=.env.local src/scripts/enrichCerveraDescriptions.ts          → dry-run
 *   npx tsx --env-file=.env.local src/scripts/enrichCerveraDescriptions.ts --apply  → escribe
 */
import { readFileSync } from 'node:fs'
import { buildDescription, type CerveraRaw } from './importCervera'

const APPLY = process.argv.includes('--apply')

function decodeEntities(s: string): string {
  return s
    .replace(/&#8217;|&#039;|&apos;/g, "'")
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .trim()
}
const strip = (s: unknown) =>
  decodeEntities(String(s ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' '))

interface RawRec {
  id: number | string
  excerptHtml?: string
  excerptEs?: string
  contentHtml?: string
}

async function main() {
  const raw = JSON.parse(readFileSync('outputs/cervera-raw.json', 'utf8'))
  const recs: RawRec[] = Array.isArray(raw) ? raw : (raw.items ?? raw.data ?? [])
  const byId = new Map(recs.map((r) => [`cv-${r.id}`, r]))

  const { createClient } = await import('@supabase/supabase-js')
  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )

  const { data: rows, error } = await supa
    .from('properties')
    .select('id, slug, external_id, description, description_en, province, location')
    .eq('external_source', 'cervera')
  if (error) throw error

  let changed = 0
  let sinFuente = 0
  let ganancia = 0

  for (const row of rows ?? []) {
    const src = byId.get(row.external_id as string)
    if (!src) { sinFuente++; continue }

    const patch: { description?: string; description_en?: string } = {}
    const n = {
      province: (row.province as string | null) ?? null,
      location: (row.location as string | null) ?? null,
    }

    // Se reconstruye "editorial + ficha técnica" y se completa lo que falte.
    // Idempotente: si el bloque ya está, no se vuelve a añadir.
    for (const [field, lang, excerpt, marker] of [
      ['description', 'es', strip(src.excerptEs), 'es una promoción de obra nueva'],
      ['description_en', 'en', strip(src.excerptHtml) || strip(src.contentHtml), 'is a new development'],
    ] as const) {
      const cur = ((row as Record<string, unknown>)[field] as string | null) ?? ''
      let next = cur

      // 1. Falta el relato editorial de la fuente
      if (excerpt.length > 60 && !cur.includes(excerpt.slice(0, 60))) {
        next = `${excerpt}\n\n${next}`.trim()
      }
      // 2. Faltan los datos duros (plantas, residencias, superficies, entrega…)
      if (!cur.includes(marker)) {
        const gen = buildDescription(src as unknown as CerveraRaw, n, lang)
        if (gen && !next.includes(gen.slice(0, 50))) next = `${next}\n\n${gen}`.trim()
      }
      if (next !== cur) patch[field] = next
    }

    if (!Object.keys(patch).length) continue

    const prevEs = ((row.description as string | null) ?? '').length
    const prevEn = ((row.description_en as string | null) ?? '').length
    const nextEs = patch.description?.length ?? prevEs
    const nextEn = patch.description_en?.length ?? prevEn

    changed++
    ganancia += (nextEs - prevEs) + (nextEn - prevEn)
    console.log(`• ${row.slug}  ES ${prevEs}→${nextEs}  EN ${prevEn}→${nextEn}`)

    if (APPLY) {
      const { error: upErr } = await supa.from('properties').update(patch).eq('id', row.id)
      if (upErr) throw new Error(`fallo en ${row.slug}: ${upErr.message}`)
    }
  }

  console.log(
    `\n${APPLY ? 'APLICADO' : 'DRY-RUN'} — ${changed} fichas enriquecidas de ${rows?.length ?? 0}` +
    `${sinFuente ? ` (${sinFuente} sin registro en el raw)` : ''}.` +
    `\nGanancia en ES: ${ganancia} caracteres.`,
  )
  if (!APPLY && changed) console.log('Volvé a ejecutar con --apply para escribir.')
}

main().catch((e) => { console.error(e); process.exit(1) })
