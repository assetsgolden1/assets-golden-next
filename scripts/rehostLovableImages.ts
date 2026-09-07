/**
 * Re-host de imágenes del proyecto Supabase legacy de Lovable (wloneprkibfjioxwypaw)
 * al proyecto principal (mromkwpqrxpxbbxhdofs). Fase 0 de la migración de cuentas.
 *
 * Uso:
 *   npx tsx --env-file=.env.local scripts/rehostLovableImages.ts            # dry-run
 *   npx tsx --env-file=.env.local scripts/rehostLovableImages.ts --apply    # sube + actualiza BD
 *
 * Reglas:
 * - Mismo bucket, prefijo `migrated-lovable/`, mismo nombre de archivo (mapping determinista).
 * - Archivos > MAX_RAW_BYTES o > 2560 px se recomprimen a JPEG q82 (mismo criterio que el 03/07),
 *   el resto se sube byte a byte con su content-type original.
 * - Idempotente: si el destino ya existe (HEAD 200) no se vuelve a subir.
 * - Solo se reemplazan las URLs que apuntan al host legacy; el orden de galerías se preserva.
 * - No se borra nada del proyecto legacy.
 */
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import fs from 'node:fs'

const LEGACY_HOST = 'wloneprkibfjioxwypaw.supabase.co'
const PREFIX = 'migrated-lovable/'
const MAX_RAW_BYTES = 8 * 1024 * 1024
const MAX_DIM = 2560
const APPLY = process.argv.includes('--apply')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!url || !key) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
const sb = createClient(url, key, { auth: { persistSession: false } })
const MAIN_HOST = new URL(url).host

type Mapping = Map<string, string> // legacy url -> new url
const mapping: Mapping = new Map()
const log: Record<string, unknown>[] = []

function isLegacy(u: unknown): u is string {
  return typeof u === 'string' && u.includes(LEGACY_HOST)
}

function parseLegacy(u: string): { bucket: string; path: string } {
  const m = u.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/)
  if (!m) throw new Error('URL legacy no reconocida: ' + u)
  return { bucket: m[1], path: decodeURIComponent(m[2].split('?')[0]) }
}

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function fetchWithRetry(u: string, tries = 4): Promise<Response> {
  for (let i = 0; i < tries; i++) {
    const r = await fetch(u)
    if (r.status === 429 || r.status >= 500) { await sleep(1500 * (i + 1)); continue }
    return r
  }
  return fetch(u)
}

async function exists(publicUrl: string): Promise<boolean> {
  const r = await fetch(publicUrl, { method: 'HEAD' })
  return r.ok
}

async function rehost(legacyUrl: string): Promise<string> {
  if (mapping.has(legacyUrl)) return mapping.get(legacyUrl)!
  const { bucket, path } = parseLegacy(legacyUrl)
  const base = path.split('/').pop()!
  let destPath = PREFIX + base
  let destUrl = `${url}/storage/v1/object/public/${bucket}/${destPath}`
  const destJpg = destPath.replace(/\.[^.]+$/, '') + '.jpg'
  const destJpgUrl = `${url}/storage/v1/object/public/${bucket}/${destJpg}`

  // Idempotencia: si ya existe (raw o recomprimido) no volver a subir
  if (await exists(destUrl)) { mapping.set(legacyUrl, destUrl); log.push({ legacyUrl, destUrl, action: 'exists' }); return destUrl }
  if (await exists(destJpgUrl)) { mapping.set(legacyUrl, destJpgUrl); log.push({ legacyUrl, destUrl: destJpgUrl, action: 'exists-jpg' }); return destJpgUrl }

  const r = await fetchWithRetry(legacyUrl)
  if (!r.ok) { log.push({ legacyUrl, action: 'SOURCE-ERROR', status: r.status }); throw new Error(`origen ${r.status}: ${legacyUrl}`) }
  const contentType = r.headers.get('content-type') ?? 'application/octet-stream'
  let buf: Buffer<ArrayBufferLike> = Buffer.from(await r.arrayBuffer())
  let action = 'copy'
  let ct = contentType

  let meta: sharp.Metadata | null = null
  try { meta = await sharp(buf).metadata() } catch { meta = null }
  const tooBig = buf.length > MAX_RAW_BYTES || (meta?.width ?? 0) > MAX_DIM || (meta?.height ?? 0) > MAX_DIM
  if (meta && tooBig) {
    buf = await sharp(buf).rotate().resize({ width: MAX_DIM, height: MAX_DIM, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toBuffer()
    destPath = destJpg; destUrl = destJpgUrl; ct = 'image/jpeg'; action = 'recompress'
  }

  if (!APPLY) { mapping.set(legacyUrl, destUrl); log.push({ legacyUrl, destUrl, action: 'dry-' + action, bytes: buf.length, w: meta?.width, h: meta?.height }); return destUrl }

  const { error } = await sb.storage.from(bucket).upload(destPath, buf, { contentType: ct, upsert: true })
  if (error) { log.push({ legacyUrl, action: 'UPLOAD-ERROR', error: error.message }); throw new Error(`upload ${destPath}: ${error.message}`) }
  const check = await fetch(destUrl, { method: 'HEAD' })
  if (!check.ok) throw new Error(`verificación ${check.status}: ${destUrl}`)
  mapping.set(legacyUrl, destUrl)
  log.push({ legacyUrl, destUrl, action, bytes: buf.length })
  return destUrl
}

async function main() {
  console.log(APPLY ? '>>> MODO APPLY (sube y actualiza BD)' : '>>> DRY-RUN (no sube ni escribe)')
  console.log('Origen:', LEGACY_HOST, '→ destino:', MAIN_HOST)

  // ── 1. Recolectar filas afectadas ─────────────────────────────
  const all = async (table: string, cols: string) => {
    const rows: Record<string, unknown>[] = []
    for (let from = 0; ; from += 1000) {
      const { data, error } = await sb.from(table).select(cols).range(from, from + 999)
      if (error) throw error
      rows.push(...(data as unknown as Record<string, unknown>[]))
      if (!data || data.length < 1000) break
    }
    return rows
  }
  const props = (await all('properties', 'id,ref_code,image_url,gallery_urls')).filter(p => isLegacy(p.image_url) || JSON.stringify(p.gallery_urls ?? []).includes(LEGACY_HOST))
  const blog = (await all('blog_posts', 'id,slug,cover_image,banner_image_url')).filter(b => isLegacy(b.cover_image) || isLegacy(b.banner_image_url))
  const team = (await all('team_members', 'id,name,photo_url')).filter(t => isLegacy(t.photo_url))
  const dest = (await all('country_destinations', 'id,slug,hero_image_url,card_image_url,city_images')).filter(d => isLegacy(d.hero_image_url) || isLegacy(d.card_image_url) || JSON.stringify(d.city_images ?? {}).includes(LEGACY_HOST))
  console.log(`Filas afectadas: properties=${props.length} blog_posts=${blog.length} team_members=${team.length} country_destinations=${dest.length}`)

  // ── 2. Conjunto de URLs únicas ─────────────────────────────────
  const urls = new Set<string>()
  for (const p of props) { if (isLegacy(p.image_url)) urls.add(p.image_url); for (const g of (p.gallery_urls as unknown[]) ?? []) if (isLegacy(g)) urls.add(g) }
  for (const b of blog) { if (isLegacy(b.cover_image)) urls.add(b.cover_image); if (isLegacy(b.banner_image_url)) urls.add(b.banner_image_url) }
  for (const t of team) if (isLegacy(t.photo_url)) urls.add(t.photo_url)
  for (const d of dest) { if (isLegacy(d.hero_image_url)) urls.add(d.hero_image_url); if (isLegacy(d.card_image_url)) urls.add(d.card_image_url); for (const v of Object.values((d.city_images as Record<string, unknown>) ?? {})) if (isLegacy(v)) urls.add(v) }
  console.log(`URLs legacy únicas: ${urls.size}`)

  // ── 3. Re-host con concurrencia limitada ───────────────────────
  const list = [...urls]
  let done = 0, failed = 0
  const CONC = 6
  await Promise.all(Array.from({ length: CONC }, async () => {
    while (list.length) {
      const u = list.shift()!
      try { await rehost(u) } catch (e) { failed++; console.error('FALLO', (e as Error).message) }
      done++
      if (done % 50 === 0) console.log(`  ${done}/${urls.size} (fallos ${failed})`)
    }
  }))
  console.log(`Re-host terminado: ${done} procesadas, ${failed} fallos, ${mapping.size} mapeadas`)
  if (failed > 0 && APPLY) { console.error('Hay fallos: NO se actualiza la BD. Revisar rehost-lovable-log.json'); fs.writeFileSync('scripts/output/rehost-lovable-log.json', JSON.stringify(log, null, 2)); process.exit(1) }

  // ── 4. Actualizar BD ───────────────────────────────────────────
  const sw = (u: unknown) => (isLegacy(u) && mapping.has(u) ? mapping.get(u)! : u)
  let updated = 0
  if (APPLY) {
    for (const p of props) {
      const gallery = ((p.gallery_urls as unknown[]) ?? []).map(sw)
      const { error } = await sb.from('properties').update({ image_url: sw(p.image_url), gallery_urls: gallery }).eq('id', p.id)
      if (error) throw error; updated++
    }
    for (const b of blog) {
      const { error } = await sb.from('blog_posts').update({ cover_image: sw(b.cover_image), banner_image_url: sw(b.banner_image_url) }).eq('id', b.id)
      if (error) throw error; updated++
    }
    for (const t of team) {
      const { error } = await sb.from('team_members').update({ photo_url: sw(t.photo_url) }).eq('id', t.id)
      if (error) throw error; updated++
    }
    for (const d of dest) {
      const city = Object.fromEntries(Object.entries((d.city_images as Record<string, unknown>) ?? {}).map(([k, v]) => [k, sw(v)]))
      const { error } = await sb.from('country_destinations').update({ hero_image_url: sw(d.hero_image_url), card_image_url: sw(d.card_image_url), city_images: city }).eq('id', d.id)
      if (error) throw error; updated++
    }
    console.log(`BD actualizada: ${updated} filas`)
  }

  fs.mkdirSync('scripts/output', { recursive: true })
  fs.writeFileSync('scripts/output/rehost-lovable-log.json', JSON.stringify({ apply: APPLY, urls: urls.size, mapped: mapping.size, failed, updated, log }, null, 2))
  const recompress = log.filter(l => String(l.action).includes('recompress')).length
  const bytes = log.reduce((a, l) => a + (Number(l.bytes) || 0), 0)
  console.log(`Resumen: ${recompress} recomprimidas, ${(bytes / 1024 / 1024).toFixed(1)} MB subidos/a subir. Log en scripts/output/rehost-lovable-log.json`)
}

main().catch(e => { console.error(e); process.exit(1) })
