/** FASE-4.N-P7.2 -- Re-subida PV924: borrar HEIC, subir JPG
 * Uso: npx tsx --env-file=.env.local scripts/reuploadPV924.ts
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

function storagePathFromUrl(url: string): string | null {
  const marker = `/${BUCKET}/`
  const idx = url.indexOf(marker)
  return idx === -1 ? null : url.slice(idx + marker.length)
}

function sanitizeExt(filename: string): string {
  const rawExt = filename.includes('.') ? (filename.split('.').pop() ?? '') : ''
  return /^[a-zA-Z0-9]{1,5}$/.test(rawExt) ? rawExt.toLowerCase() : 'jpg'
}

function contentTypeForExt(ext: string): string {
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  if (ext === 'png')  return 'image/png'
  if (ext === 'webp') return 'image/webp'
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
  console.log('  FASE-4.N-P7.2 -- Re-subida PV924 (HEIC->JPG)')
  console.log('================================================')

  // 1. Leer URLs actuales (10 HEIC + PNG)
  console.log('\n[1/5] Leyendo gallery_urls actuales...')
  const { data: row, error: readErr } = await supabase
    .from('properties')
    .select('id, ref_code, slug, image_url, gallery_urls')
    .eq('external_id', EXTERNAL_ID)
    .single()

  if (readErr || !row) { console.error('ERROR:', readErr?.message); process.exit(1) }

  const oldUrls: string[] = Array.isArray(row.gallery_urls) ? (row.gallery_urls as string[]) : []
  console.log(`  ref_code: ${row.ref_code}  gallery_urls actuales: ${oldUrls.length}`)
  const heicCount = oldUrls.filter(u => u.endsWith('.heic')).length
  console.log(`  De esas, ${heicCount} terminan en .heic`)

  // 2. Borrar todas las URLs actuales de Storage
  console.log('\n[2/5] Borrando URLs actuales de Storage...')
  const pathsToDelete = oldUrls.map(storagePathFromUrl).filter((p): p is string => p !== null)

  if (pathsToDelete.length > 0) {
    const { error: delErr } = await supabase.storage.from(BUCKET).remove(pathsToDelete)
    if (delErr) {
      console.warn(`  WARN: ${delErr.message} (continua)`)
    } else {
      console.log(`  OK borradas ${pathsToDelete.length} de Storage`)
    }
  }

  // 3. Subir las 10 fotos JPG/PNG (sin HEIC)
  console.log('\n[3/5] Subiendo fotos JPG/PNG...')
  const imgFiles = fs.readdirSync(PHOTOS_DIR)
    .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
    .sort()

  console.log(`  ${imgFiles.length} archivos encontrados`)
  if (imgFiles.length === 0) { console.error('ERROR: no hay fotos JPG/PNG en la carpeta'); process.exit(1) }

  const newUrls: string[] = []
  for (let i = 0; i < imgFiles.length; i++) {
    const fp = path.join(PHOTOS_DIR, imgFiles[i])
    process.stdout.write(`  [${String(i + 1).padStart(2, '0')}/${imgFiles.length}] ${imgFiles[i]} ... `)
    const url = await uploadPhoto(fp)
    newUrls.push(url)
    console.log('OK')
  }
  console.log(`  TOTAL: ${newUrls.length} URLs en orden`)

  // 4. UPDATE
  console.log('\n[4/5] UPDATE properties...')
  const { error: updErr } = await supabase
    .from('properties')
    .update({ image_url: newUrls[0] ?? null, gallery_urls: newUrls })
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

  const finalUrls: string[] = Array.isArray(after?.gallery_urls) ? (after.gallery_urls as string[]) : []
  const heicRemaining = finalUrls.filter(u => u.toLowerCase().endsWith('.heic')).length

  console.log('\n============= RESULTADO =============')
  console.log(`  ref_code:      ${after?.ref_code}  (sin cambios)`)
  console.log(`  slug:          ${after?.slug}`)
  console.log(`  gallery_urls:  ${finalUrls.length} URLs`)
  console.log(`  URLs .heic:    ${heicRemaining}  (debe ser 0)`)
  console.log(`  image_url:     ${after?.image_url}`)
  finalUrls.forEach((u, i) => {
    const ext = u.split('.').pop()
    console.log(`    [${String(i + 1).padStart(2, '0')}] .${ext}  ${u.split('/').pop()}`)
  })

  const ok = finalUrls.length === imgFiles.length && heicRemaining === 0
  console.log(`\n  ${ok ? 'OK -- todo correcto' : 'WARN -- revisar conteo o extensiones'}`)
  console.log('=====================================')
}

main().catch(err => { console.error(err); process.exit(1) })
