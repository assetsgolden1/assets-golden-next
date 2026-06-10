/** FASE-4.N-P7.1 -- Reemplazar fotos PV924 (2 actuales -> 10 reales)
 * Uso: npx tsx --env-file=.env.local scripts/fixPV924Photos.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const EXTERNAL_ID = 'PV924'
const BUCKET      = 'property-images'
const PHOTOS_DIR  = path.join(
  __dirname, 'output', 'bali-fotos',
  'PV924_ubud-riverside-haven-2-bedroom-leasehold-villas'
)

// Extrae el storage path desde la publicUrl
// "https://.../storage/v1/object/public/property-images/properties/xxx.jpg"
// -> "properties/xxx.jpg"
function storagePathFromUrl(url: string): string | null {
  const marker = `/${BUCKET}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return url.slice(idx + marker.length)
}

function sanitizeExt(filename: string): string {
  const rawExt = filename.includes('.') ? (filename.split('.').pop() ?? '') : ''
  return /^[a-zA-Z0-9]{1,5}$/.test(rawExt) ? rawExt.toLowerCase() : 'jpg'
}

function contentTypeForExt(ext: string): string {
  if (ext === 'jpg')  return 'image/jpeg'
  if (ext === 'jpeg') return 'image/jpeg'
  if (ext === 'png')  return 'image/png'
  if (ext === 'webp') return 'image/webp'
  if (ext === 'heic') return 'image/heic'
  if (ext === 'heif') return 'image/heif'
  return `image/${ext}`
}

async function uploadPhoto(filePath: string): Promise<string> {
  const filename    = path.basename(filePath)
  const ext         = sanitizeExt(filename)
  const storagePath = `properties/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const buffer      = fs.readFileSync(filePath)

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: contentTypeForExt(ext), upsert: true })

  if (error) throw new Error(`Upload failed for ${filename}: ${error.message}`)

  const { data: u } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
  return u.publicUrl
}

async function main() {
  console.log('================================================')
  console.log('  FASE-4.N-P7.1 -- Fix fotos PV924')
  console.log('================================================')

  // 1. Leer fila actual
  console.log('\n[1/5] Leyendo fila PV924...')
  const { data: row, error: readErr } = await supabase
    .from('properties')
    .select('id, ref_code, slug, image_url, gallery_urls')
    .eq('external_id', EXTERNAL_ID)
    .single()

  if (readErr || !row) { console.error('ERROR lectura:', readErr?.message); process.exit(1) }

  const oldUrls: string[] = Array.isArray(row.gallery_urls) ? (row.gallery_urls as string[]) : []
  console.log(`  id:       ${row.id}`)
  console.log(`  ref_code: ${row.ref_code}`)
  console.log(`  URLs actuales (${oldUrls.length}):`)
  oldUrls.forEach(u => console.log(`    ${u}`))

  // 2. Borrar las 2 imágenes actuales de Storage
  console.log('\n[2/5] Borrando imagenes huerfanas de Storage...')
  const pathsToDelete = oldUrls.map(storagePathFromUrl).filter((p): p is string => p !== null)
  if (pathsToDelete.length > 0) {
    const { error: delErr } = await supabase.storage.from(BUCKET).remove(pathsToDelete)
    if (delErr) {
      console.warn(`  WARN borrado: ${delErr.message} (continua de todos modos)`)
    } else {
      console.log(`  OK borradas ${pathsToDelete.length} imagenes:`)
      pathsToDelete.forEach(p => console.log(`    ${p}`))
    }
  } else {
    console.log('  No se pudo extraer paths para borrar (continua)')
  }

  // 3. Subir las 10 fotos (incluyendo HEIC)
  console.log('\n[3/5] Subiendo fotos (orden alfabetico, incluye HEIC)...')
  const imgFiles = fs.readdirSync(PHOTOS_DIR)
    .filter(f => /\.(jpe?g|png|webp|heic|heif)$/i.test(f))
    .sort()

  console.log(`  ${imgFiles.length} archivos encontrados`)
  const newUrls: string[] = []

  for (let i = 0; i < imgFiles.length; i++) {
    const fp  = path.join(PHOTOS_DIR, imgFiles[i])
    const ext = imgFiles[i].split('.').pop()?.toLowerCase() ?? ''
    process.stdout.write(`  [${String(i + 1).padStart(2, '0')}/${imgFiles.length}] ${imgFiles[i]} (${ext}) ... `)
    const url = await uploadPhoto(fp)
    newUrls.push(url)
    console.log('OK')
  }
  console.log(`  TOTAL: ${newUrls.length} fotos subidas`)

  // 4. UPDATE properties
  console.log('\n[4/5] UPDATE properties...')
  const { error: updErr } = await supabase
    .from('properties')
    .update({
      image_url:    newUrls[0] ?? null,
      gallery_urls: newUrls,
    })
    .eq('external_id', EXTERNAL_ID)

  if (updErr) { console.error('ERROR UPDATE:', updErr.message); process.exit(1) }
  console.log('  OK')

  // 5. Verificar
  console.log('\n[5/5] Verificando...')
  const { data: after } = await supabase
    .from('properties')
    .select('ref_code, slug, image_url, gallery_urls')
    .eq('external_id', EXTERNAL_ID)
    .single()

  const gc = Array.isArray(after?.gallery_urls) ? (after.gallery_urls as string[]).length : 0
  console.log('\n============= RESULTADO =============')
  console.log(`  ref_code:      ${after?.ref_code}`)
  console.log(`  slug:          ${after?.slug}`)
  console.log(`  gallery_urls:  ${gc} URLs  (esperado: ${imgFiles.length})`)
  console.log(`  image_url:     ${after?.image_url}`)
  if (gc !== imgFiles.length) {
    console.warn(`  WARN: se esperaban ${imgFiles.length} pero hay ${gc}`)
  } else {
    console.log('  OK -- conteo correcto')
  }

  const heicCount = imgFiles.filter(f => /\.heic$/i.test(f)).length
  if (heicCount > 0) {
    console.log(`\n  NOTA: ${heicCount} de ${imgFiles.length} fotos son HEIC.`)
    console.log('  HEIC no se renderiza en Chrome/Firefox/Windows Edge.')
    console.log('  Convertir a JPEG si se ven en blanco en el sitio.')
  }
  console.log('=====================================')
}

main().catch(err => { console.error(err); process.exit(1) })
