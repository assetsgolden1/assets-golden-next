/**
 * Repobla habihub_dev_id y habihub_unit en propiedades existentes
 * extrayendo el tag <ref> de los feeds HabiHub.
 *
 * Uso:
 *   npx ts-node --skip-project scripts/repopulateHabihubDevIds.ts          (dry-run por defecto)
 *   npx ts-node --skip-project scripts/repopulateHabihubDevIds.ts --real   (aplica cambios)
 */

import { createClient } from '@supabase/supabase-js'
import * as https from 'https'
import * as http from 'http'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const FEED_URLS = [
  process.env.HABIHUB_FEED_BLANCA_CALIDA
    ?? 'https://medianewbuild.com/file/hh-media-bucket/agents/9e04488b-75ba-4831-b2c9-55e1ad47d4b9/feed_blanca_calida.xml',
  process.env.HABIHUB_FEED_SOL
    ?? 'https://medianewbuild.com/file/hh-media-bucket/agents/9e04488b-75ba-4831-b2c9-55e1ad47d4b9/feed_sol.xml',
]

function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http
    let data = ''
    const req = client.get(url, (res) => {
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => resolve(data))
    })
    req.on('error', reject)
    req.setTimeout(60000, () => {
      req.destroy()
      reject(new Error(`Timeout fetching ${url}`))
    })
  })
}

function buildFeedMap(xml: string): Map<string, { habihub_dev_id: string; habihub_unit: string | null }> {
  const map = new Map<string, { habihub_dev_id: string; habihub_unit: string | null }>()
  const propRx = /<property>([\s\S]*?)<\/property>/g
  let m: RegExpExecArray | null

  while ((m = propRx.exec(xml)) !== null) {
    const content = m[1]
    const id = content.match(/<id>(\d+)<\/id>/)?.[1]
    const ref = content.match(/<ref>([^<]+)<\/ref>/)?.[1]?.trim()

    if (!id || !ref || !ref.includes('-')) continue

    const dashIdx = ref.indexOf('-')
    const dev = ref.substring(0, dashIdx)
    const unit = ref.substring(dashIdx + 1)
    if (!/^\d+$/.test(dev)) continue

    map.set(id, { habihub_dev_id: dev, habihub_unit: unit || null })
  }

  return map
}

async function main() {
  const isDryRun = !process.argv.includes('--real')
  console.log(`\n🔧 repopulateHabihubDevIds — modo: ${isDryRun ? 'DRY-RUN (sin cambios)' : 'REAL'}\n`)

  // 1. Descargar feeds y construir mapa external_id → { dev_id, unit }
  console.log('📥 Descargando feeds...')
  const combinedMap = new Map<string, { habihub_dev_id: string; habihub_unit: string | null }>()

  for (const url of FEED_URLS) {
    console.log(`  → ${url}`)
    const xml = await fetchUrl(url)
    const feedMap = buildFeedMap(xml)
    for (const [id, data] of feedMap) {
      if (!combinedMap.has(id)) combinedMap.set(id, data)
    }
  }
  console.log(`  ✓ ${combinedMap.size} propiedades en feeds combinados\n`)

  // 2. Cargar propiedades HabiHub de la DB
  console.log('📖 Cargando propiedades HabiHub desde DB...')
  const PAGE_SIZE = 1000
  const allProps: { id: string; external_id: string | null; ref_code: string | null }[] = []

  for (let page = 0; page < 100; page++) {
    const { data, error } = await supabase
      .from('properties')
      .select('id,external_id,ref_code')
      .eq('external_source', 'habihub')
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (error) throw new Error(`DB error: ${error.message}`)
    if (!data || data.length === 0) break
    allProps.push(...(data as typeof allProps))
    if (data.length < PAGE_SIZE) break
  }
  console.log(`  ✓ ${allProps.length} propiedades HabiHub en DB\n`)

  // 3. Matching y clasificación
  const toUpdate: { id: string; habihub_dev_id: string; habihub_unit: string | null }[] = []
  const noMatch: { id: string; ref_code: string | null; external_id: string | null }[] = []

  for (const prop of allProps) {
    const extId = prop.external_id ?? ''
    const match = combinedMap.get(extId)
    if (match) {
      toUpdate.push({ id: prop.id, ...match })
    } else {
      noMatch.push({ id: prop.id, ref_code: prop.ref_code, external_id: prop.external_id })
    }
  }

  console.log('📊 Resultados matching:')
  console.log(`  Con match (feed → DB):  ${toUpdate.length}`)
  console.log(`  Sin match (ya no en feed): ${noMatch.length}`)
  if (noMatch.length > 0 && noMatch.length <= 20) {
    console.log('  Propiedades sin match:')
    for (const p of noMatch) {
      console.log(`    ref_code=${p.ref_code ?? '?'} external_id=${p.external_id ?? '?'}`)
    }
  } else if (noMatch.length > 20) {
    console.log(`  (primeras 20 sin match):`)
    for (const p of noMatch.slice(0, 20)) {
      console.log(`    ref_code=${p.ref_code ?? '?'} external_id=${p.external_id ?? '?'}`)
    }
  }

  if (isDryRun) {
    console.log('\n✅ Dry-run completo. Ejecutar con --real para aplicar cambios.')
    console.log(`   Actualizaría ${toUpdate.length} filas en la tabla properties.`)
    return
  }

  // 4. Aplicar updates en lotes de 50
  console.log(`\n💾 Aplicando ${toUpdate.length} UPDATEs...`)
  let updated = 0
  let errors = 0

  for (let i = 0; i < toUpdate.length; i += 50) {
    const batch = toUpdate.slice(i, i + 50)
    await Promise.all(
      batch.map(async ({ id, habihub_dev_id, habihub_unit }) => {
        const { error } = await supabase
          .from('properties')
          .update({ habihub_dev_id, habihub_unit })
          .eq('id', id)
        if (error) { errors++; console.error(`  ✗ ${id}: ${error.message}`) }
        else updated++
      })
    )
    if (i % 500 === 0 && i > 0) console.log(`  ... ${updated} actualizadas`)
  }

  console.log(`\n✅ Repoblamiento completado:`)
  console.log(`   Actualizadas: ${updated}`)
  console.log(`   Errores:      ${errors}`)
  console.log(`   Sin match:    ${noMatch.length}`)
}

main().catch((err) => {
  console.error('\n❌ Error fatal:', err)
  process.exit(1)
})
