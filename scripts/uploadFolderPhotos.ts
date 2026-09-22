/**
 * Resube las fotos de una propiedad desde una carpeta local al bucket property-images
 * y reemplaza image_url/gallery_urls. Reconstrucción tras el borrado del 22/09/2026.
 *
 * Uso:
 *   npx tsx --env-file=.env.local scripts/uploadFolderPhotos.ts <ref_code|external_id> <carpeta> [--confirm] [--append]
 *   npx tsx --env-file=.env.local scripts/uploadFolderPhotos.ts --bali [--confirm]      # las 27 de Prestige Bali
 *
 * - Ordena las imágenes por nombre (natural). Recomprime a JPEG q82 máx 2560px.
 * - Sube a property-images/restore/<ref_code>/NN.jpg (upsert). Sin --confirm es dry-run.
 * - Por defecto REEMPLAZA la galería (las URLs viejas apuntan a archivos que ya no existen).
 *   Con --append conserva las URLs existentes que respondan 200.
 */
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const sb = createClient(URL_, KEY, { auth: { persistSession: false } })
const CONFIRM = process.argv.includes('--confirm')
const APPEND = process.argv.includes('--append')
const IMG = /\.(jpe?g|png|webp|tiff?|heic)$/i
const natural = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })

function listImages(dir: string): string[] {
  // Prefiere subcarpeta "optimizadas" si existe (ya recomprimidas por Iván)
  const opt = path.join(dir, 'optimizadas')
  const base = fs.existsSync(opt) && fs.readdirSync(opt).some(f => IMG.test(f)) ? opt : dir
  return fs.readdirSync(base).filter(f => IMG.test(f)).sort(natural).map(f => path.join(base, f))
}

async function alive(u: string) { try { return (await fetch(u, { method: 'HEAD' })).ok } catch { return false } }

export async function uploadFolder(key: string, dir: string) {
  const { data: rows, error } = await sb.from('properties').select('id,ref_code,external_id,title,gallery_urls').or(`ref_code.eq.${key},external_id.eq.${key}`)
  if (error) throw new Error(error.message)
  const prop = rows?.[0]
  if (!prop) { console.error(`  ✗ ${key}: no existe en la BD`); return { key, uploaded: 0, status: 'no-db' } }
  const files = listImages(dir)
  if (!files.length) { console.error(`  ✗ ${key}: sin imágenes en ${dir}`); return { key, uploaded: 0, status: 'no-files' } }
  const prefix = `restore/${prop.ref_code}`
  const urls: string[] = []
  let bytes = 0
  for (const [i, f] of files.entries()) {
    const name = `${String(i + 1).padStart(2, '0')}.jpg`
    const url = `${URL_}/storage/v1/object/public/property-images/${prefix}/${name}`
    if (!CONFIRM) { urls.push(url); continue }
    try {
      const out = await sharp(fs.readFileSync(f)).rotate().resize({ width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toBuffer()
      const up = await sb.storage.from('property-images').upload(`${prefix}/${name}`, out, { contentType: 'image/jpeg', upsert: true, cacheControl: '31536000' })
      if (up.error) { console.error(`    ✗ ${path.basename(f)}: ${up.error.message}`); continue }
      urls.push(url); bytes += out.length
    } catch (e) { console.error(`    ✗ ${path.basename(f)}: ${(e as Error).message}`) }
  }
  if (!urls.length) return { key, uploaded: 0, status: 'upload-failed' }
  let gallery = urls
  if (APPEND) {
    const keep: string[] = []
    for (const u of (prop.gallery_urls as string[]) ?? []) if (!urls.includes(u) && await alive(u)) keep.push(u)
    gallery = [...keep, ...urls]
  }
  if (CONFIRM) {
    const { error: e } = await sb.from('properties').update({ image_url: gallery[0], gallery_urls: gallery, updated_at: new Date().toISOString() }).eq('id', prop.id)
    if (e) throw new Error(`${key} BD: ${e.message}`)
  }
  console.log(`  ${CONFIRM ? '✔' : '·'} ${prop.ref_code} ${prop.title.slice(0, 50)} — ${urls.length} fotos${CONFIRM ? ` (${(bytes / 1048576).toFixed(1)} MB)` : ' (dry-run)'}`)
  return { key, uploaded: urls.length, status: 'ok' }
}

async function main() {
  console.log(CONFIRM ? '>>> MODO CONFIRM' : '>>> DRY-RUN', '· proyecto', new globalThis.URL(URL_).host)
  if (process.argv.includes('--bali')) {
    const roots = ['scripts/output/bali-fotos', 'scripts/output/bali-fotos-pendientes']
    const byRef = new Map<string, string>()
    for (const r of roots) for (const d of fs.readdirSync(r)) {
      const full = path.join(r, d); if (!fs.statSync(full).isDirectory()) continue
      const ref = d.split('_')[0]
      const n = listImages(full).length
      // Preferir la carpeta con más imágenes por ref
      if (n && (!byRef.has(ref) || listImages(byRef.get(ref)!).length < n)) byRef.set(ref, full)
    }
    console.log(`Bali: ${byRef.size} refs con carpeta`)
    const results = []
    for (const [ref, dir] of [...byRef.entries()].sort()) results.push(await uploadFolder(ref, dir))
    console.log(`\nResumen: ${results.filter(r => r.status === 'ok').length} OK, ${results.filter(r => r.status !== 'ok').length} con problema, ${results.reduce((a, r) => a + r.uploaded, 0)} fotos`)
    return
  }
  const [key, dir] = process.argv.slice(2).filter(a => !a.startsWith('--'))
  if (!key || !dir) throw new Error('Uso: <ref_code|external_id> <carpeta> [--confirm] | --bali [--confirm]')
  await uploadFolder(key, dir)
}
main().catch(e => { console.error('FALLO:', e.message); process.exit(1) })
