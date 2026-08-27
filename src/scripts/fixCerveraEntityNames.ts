/**
 * fixCerveraEntityNames — backfill puntual (27/08/2026)
 *
 * Las descripciones de las 62 promociones de Cervera se publicaron con los
 * campos `developer`/`architect` en crudo, tal como vienen del feed:
 *   "Está promovida por pmg y con arquitectura de sieger_suarez_architects,carlos_ott."
 *
 * Este script corrige SOLO ese fragmento en las filas ya cargadas, sustituyendo
 * la cadena cruda por su versión legible (ver lib/utils/formatEntityNames).
 * El importador ya genera bien el texto desde este mismo commit, así que esto
 * es un one-off para lo que quedó en base.
 *
 * Uso:
 *   npx tsx --env-file=.env.local src/scripts/fixCerveraEntityNames.ts          → dry-run
 *   npx tsx --env-file=.env.local src/scripts/fixCerveraEntityNames.ts --apply  → escribe
 */
import { readFileSync } from 'node:fs'
import { formatEntityNames } from '../lib/utils/formatEntityNames'

const APPLY = process.argv.includes('--apply')

interface RawRec {
  id: number | string
  meta?: Record<string, unknown>
}

async function main() {
  const raw = JSON.parse(readFileSync('outputs/cervera-raw.json', 'utf8'))
  const recs: RawRec[] = Array.isArray(raw) ? raw : (raw.items ?? raw.data ?? [])

  // external_id (cv-<id>) → cadenas crudas de developer/architect
  const bySource = new Map<string, { developer: string; architect: string }>()
  for (const r of recs) {
    bySource.set(`cv-${r.id}`, {
      developer: String(r.meta?.developer ?? '').trim(),
      architect: String(r.meta?.architect ?? '').trim(),
    })
  }

  const { createClient } = await import('@supabase/supabase-js')
  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )

  const { data: rows, error } = await supa
    .from('properties')
    .select('id, slug, external_id, description, description_en')
    .eq('external_source', 'cervera')
  if (error) throw error

  let changed = 0
  let skipped = 0

  for (const row of rows ?? []) {
    const src = bySource.get(row.external_id as string)
    if (!src) {
      console.log(`  [sin raw] ${row.slug} (${row.external_id}) — no se toca`)
      skipped++
      continue
    }

    const patch: { description?: string; description_en?: string } = {}
    for (const [field, lang] of [
      ['description', 'es'],
      ['description_en', 'en'],
    ] as const) {
      const text = (row as Record<string, unknown>)[field] as string | null
      if (!text) continue
      let next = text
      for (const rawValue of [src.developer, src.architect]) {
        if (!rawValue) continue
        const pretty = formatEntityNames(rawValue, lang)
        // Reemplazo literal de la cadena cruda; si ya estaba bien, no hace nada.
        if (pretty !== rawValue) next = next.split(rawValue).join(pretty)
      }
      // Sin promotora la frase quedaba "Está con arquitectura de X".
      next = next
        .replace('Está con arquitectura de ', 'Cuenta con arquitectura de ')
        .replace('It is with architecture by ', 'It features architecture by ')
      if (next !== text) patch[field] = next
    }

    if (!Object.keys(patch).length) {
      skipped++
      continue
    }

    changed++
    const before = (row.description as string | null)?.slice(0, 150) ?? ''
    const after = (patch.description ?? row.description ?? '').slice(0, 150)
    console.log(`\n• ${row.slug}`)
    console.log(`   antes: ${before}`)
    console.log(`   ahora: ${after}`)

    if (APPLY) {
      const { error: upErr } = await supa.from('properties').update(patch).eq('id', row.id)
      if (upErr) throw new Error(`fallo al actualizar ${row.slug}: ${upErr.message}`)
    }
  }

  console.log(
    `\n${APPLY ? 'APLICADO' : 'DRY-RUN'} — ${changed} fichas a corregir, ${skipped} sin cambios (de ${rows?.length ?? 0}).`,
  )
  if (!APPLY && changed) console.log('Volvé a ejecutar con --apply para escribir.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
