/**
 * FASE-4.N-P6 — Carga de prueba: propiedad PV821 (Bali)
 *
 * Uso:
 *   npx tsx --env-file=.env.local scripts/loadBaliPV821.ts
 *
 * Seguridad: idempotente. Si external_id='PV821' ya existe → SKIP.
 * Al terminar escribe scripts/output/bali-carga-log.json con el resultado.
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// ──────────────────────────────────────────────────────────────────────────────
// Cliente Supabase (service role — bypasa RLS)
// ──────────────────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ──────────────────────────────────────────────────────────────────────────────
// Datos PV821 del CSV (bali-carga-final.csv, fila 1)
// ──────────────────────────────────────────────────────────────────────────────
const EXTERNAL_ID = 'PV821'
const PROPERTY_DATA = {
  title:          'Espectacular Villa Freehold en Uluwatu',
  property_type:  'villa',
  price:          449000,
  currency:       'USD',
  location:       'Uluwatu',
  province:       null as null,
  country:        'Indonesia',
  bedrooms:       3,
  bathrooms:      3,
  area_sqm:       131,
  description:    `Villa de 3 dormitorios recién construida y luminosa, ubicada en el exuberante área del New Kuta Golf Club, en Uluwatu, perfecta para 6 huéspedes. Enclavada en un oasis verde con seguridad las 24 horas, amplias vías de acceso y estacionamiento privado para 2 coches, esta villa ofrece comodidad y practicidad en cada detalle.

Con 170 m² de terreno y 131 m² de construcción, la propiedad cuenta con piscina privada de 10 m² y terraza en la azotea con impresionantes vistas a Dreamland Beach. Cada uno de los tres dormitorios dispone de cama king, y los cuatro baños incluyen bañera y ducha. El salón cuenta con un sofá cama, ideal para relajarse o alojar a huéspedes adicionales.

A solo 5 minutos de Dreamland Beach, 15 de Melasti Beach y 10 de los beach clubs Savaya, El Kabron y White Rock, esta villa combina tranquilidad con fácil acceso a los mejores puntos de ocio de la zona.`,
  external_source: 'prestige-bali',
  external_id:    EXTERNAL_ID,
  status:         'active' as const,
  hidden:         false,
  sold:           false,
  featured:       false,
  classification: null as null,
  is_development: false,
}

const PHOTOS_DIR = path.resolve(
  __dirname,
  'output/bali-fotos/PV821_stunning-freehold-villa-in-uluwatu'
)

const LOG_PATH = path.resolve(__dirname, 'output/bali-carga-log.json')

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
  return `${base}-${Date.now().toString(36)}`
}

function sanitizeExt(filename: string): string {
  const rawExt = filename.includes('.')
    ? (filename.split('.').pop() ?? '')
    : ''
  return /^[a-zA-Z0-9]{1,5}$/.test(rawExt) ? rawExt.toLowerCase() : 'jpg'
}

async function uploadPhoto(filePath: string): Promise<string> {
  const filename  = path.basename(filePath)
  const ext       = sanitizeExt(filename)
  const storagePath = `properties/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const buffer = fs.readFileSync(filePath)

  const { error } = await supabase.storage
    .from('property-images')
    .upload(storagePath, buffer, {
      contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      upsert: true,
    })

  if (error) throw new Error(`Upload failed for ${filename}: ${error.message}`)

  const { data: urlData } = supabase.storage
    .from('property-images')
    .getPublicUrl(storagePath)

  return urlData.publicUrl
}

// ──────────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════')
  console.log('  FASE-4.N-P6 — Carga PV821 (prueba)')
  console.log('═══════════════════════════════════════════════')

  // ── 1. Idempotencia ────────────────────────────────────────────────────────
  console.log('\n[1/5] Verificando idempotencia…')
  const { data: existing } = await supabase
    .from('properties')
    .select('id, ref_code, slug')
    .eq('external_id', EXTERNAL_ID)
    .maybeSingle()

  if (existing) {
    console.log(`⚠  PV821 ya existe — SKIP`)
    console.log(`   id: ${existing.id}`)
    console.log(`   ref_code: ${existing.ref_code}`)
    console.log(`   slug: ${existing.slug}`)
    const log = { skipped: true, reason: 'external_id PV821 ya existe', existing }
    fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2))
    console.log(`\n📄 Log guardado en ${LOG_PATH}`)
    return
  }
  console.log('   ✓ No existe — procediendo con la carga')

  // ── 2. Subir fotos ──────────────────────────────────────────────────────────
  console.log('\n[2/5] Subiendo fotos…')
  const files = fs.readdirSync(PHOTOS_DIR)
    .filter(f => /\.(jpe?g|png|webp|gif)$/i.test(f))
    .sort()

  console.log(`   ${files.length} archivos encontrados (orden alfabético)`)

  const uploadedUrls: string[] = []
  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(PHOTOS_DIR, files[i])
    process.stdout.write(`   [${String(i + 1).padStart(2, '0')}/${files.length}] ${files[i]} … `)
    const url = await uploadPhoto(filePath)
    uploadedUrls.push(url)
    console.log('✓')
  }
  console.log(`   ✓ ${uploadedUrls.length} fotos subidas`)

  // ── 3. Generar slug ────────────────────────────────────────────────────────
  console.log('\n[3/5] Generando slug…')
  const slug = generateSlug(PROPERTY_DATA.title)
  console.log(`   slug: ${slug}`)

  // ── 4. INSERT ──────────────────────────────────────────────────────────────
  console.log('\n[4/5] Insertando en properties…')
  const { error: insertError } = await supabase
    .from('properties')
    .insert({
      ...PROPERTY_DATA,
      slug,
      image_url:    uploadedUrls[0] ?? null,
      gallery_urls: uploadedUrls,
    })

  if (insertError) {
    console.error('✗ INSERT failed:', insertError.message)
    const log = { error: insertError.message, slug, uploadedUrls }
    fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2))
    process.exit(1)
  }
  console.log('   ✓ INSERT OK')

  // ── 5. Releer y reportar ───────────────────────────────────────────────────
  console.log('\n[5/5] Releyendo fila insertada…')
  const { data: row, error: readError } = await supabase
    .from('properties')
    .select('id, ref_code, slug, property_type, price, currency, location, country, image_url, gallery_urls, external_id, external_source, status, hidden, sold, featured')
    .eq('external_id', EXTERNAL_ID)
    .single()

  if (readError || !row) {
    console.error('✗ Re-lectura fallida:', readError?.message)
    process.exit(1)
  }

  const galleryCount = Array.isArray(row.gallery_urls) ? row.gallery_urls.length : 0

  console.log('\n══════════════════ RESULTADO ══════════════════')
  console.log(`  id:            ${row.id}`)
  console.log(`  ref_code:      ${row.ref_code ?? '(null — trigger no disparó)'}`)
  console.log(`  slug:          ${row.slug}`)
  console.log(`  property_type: ${row.property_type}`)
  console.log(`  price:         ${row.price} ${row.currency}`)
  console.log(`  location:      ${row.location}`)
  console.log(`  country:       ${row.country}`)
  console.log(`  gallery_urls:  ${galleryCount} URLs`)
  console.log(`  image_url:     ${row.image_url}`)
  console.log('═══════════════════════════════════════════════')

  const log = {
    timestamp: new Date().toISOString(),
    result: 'ok',
    id: row.id,
    ref_code: row.ref_code,
    slug: row.slug,
    property_type: row.property_type,
    price: row.price,
    currency: row.currency,
    location: row.location,
    country: row.country,
    gallery_urls_count: galleryCount,
    image_url: row.image_url,
    external_id: row.external_id,
    external_source: row.external_source,
    status: row.status,
    hidden: row.hidden,
    sold: row.sold,
    featured: row.featured,
  }

  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2))
  console.log(`\n📄 Log guardado en ${LOG_PATH}`)
  console.log('\n✅ PRUEBA COMPLETADA — frenando (no se cargan las otras 22 propiedades)')
}

main().catch((err) => {
  console.error('Error inesperado:', err)
  process.exit(1)
})
