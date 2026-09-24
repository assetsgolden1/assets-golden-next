/**
 * Sincronización del CRM Inmoges (Expertos de Gestión) → catálogo de Assets Golden.
 *
 * Fuente: pasarela "Exportar fichero en formato Kyero" del CRM, publicada en
 * https://expertosgestion.com/XMLky/3440.xml (3440 = nº de experto de AG).
 * El XML se regenera cuando Atilio pulsa "Publicar inmuebles" en Pasarelas.
 * Solo salen los inmuebles con la casilla "Kyero" marcada en su pestaña Publicidad.
 *
 * Modos:
 *   report  — dry-run: qué se crearía, vincularía y actualizaría. NO toca la BD.
 *   load    — aplica los cambios (requiere --confirm).
 *
 * Uso: npm run inmoges -- report | load [--confirm] [--limit N]
 *
 * Decisiones de diseño:
 * - `external_source='inmoges'`, `external_id='im-<ref>'` (el prefijo evita choques con
 *   los ids numéricos de HabiHub en la columna UNIQUE `external_id`, igual que 'cv-' en Cervera).
 * - Las propiedades que YA existen en la web cargadas a mano se VINCULAN, no se duplican:
 *   el vínculo inicial vive en src/scripts/inmoges-match.json (versionado: el workflow lo necesita) (revisado a mano).
 * - Sobre una propiedad vinculada el sync SOLO actualiza precio y estado. No pisa
 *   título, descripción ni fotos: ese contenido fue editado a mano en la web y es mejor.
 * - Las fotos se re-hostean a Supabase (el CDN del CRM no entra en nuestro backup).
 * - El feed no trae descripción en inglés: las fichas nuevas quedan con `description_en`
 *   vacío hasta que se traduzcan (ver src/scripts/translateCerveraExcerpts.ts como patrón).
 */
import { XMLParser } from 'fast-xml-parser'
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'node:fs'

const FEED = process.env.INMOGES_FEED_URL ?? 'https://expertosgestion.com/XMLky/3440.xml'
const MATCH_FILE = 'src/scripts/inmoges-match.json'
const MAX_IMAGES = 40

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL!
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!URL_ || !KEY) throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
const sb = createClient(URL_, KEY, { auth: { persistSession: false } })

const mode = process.argv[2] ?? 'report'
const CONFIRM = process.argv.includes('--confirm')
const LIMIT = Number(process.argv.find(a => a.startsWith('--limit='))?.split('=')[1] ?? 0)
const WITH_PHOTOS = process.argv.includes('--fotos')

/** Kyero manda el tipo en español (es el literal del CRM). */
const TYPE_MAP: Record<string, string> = {
  apartamento: 'apartment', piso: 'apartment', loft: 'apartment', triplex: 'apartment',
  duplex: 'apartment', estudio: 'apartment', 'planta baja': 'apartment', bajo: 'apartment', atico: 'penthouse', 'ático': 'penthouse',
  adosado: 'townhouse', pareado: 'townhouse',
  chalet: 'villa', villa: 'villa', torre: 'house', 'casa con terreno': 'house', casa: 'house',
  masia: 'rural', finca: 'rural', 'casa rural': 'rural',
  local: 'business', 'local comercial': 'business', bar: 'business', oficina: 'business',
  restaurante: 'business', nave: 'building', edificio: 'building', hotel: 'hotel',
  garaje: 'other', parking: 'other', solar: 'other', terreno: 'other', merendero: 'other',
}
const mapType = (raw: string) => TYPE_MAP[String(raw ?? '').toLowerCase().trim()] ?? 'other'

function slugify(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80)
}

/** Título legible: el feed no trae <title>, hay que componerlo con tipo + zona. */
function buildTitle(k: KyeroProp): string {
  const tipo = String(k.type ?? 'Inmueble').trim()
  const town = String(k.town ?? '').trim()
  const beds = Number(k.beds) || 0
  const parts = [tipo]
  if (beds > 0) parts.push(`de ${beds} ${beds === 1 ? 'dormitorio' : 'dormitorios'}`)
  if (town) parts.push(`en ${town}`)
  return parts.join(' ')
}

interface KyeroProp {
  id: number; ref: string; price: number; type: string; town: string; province: string
  beds: number; baths: number; pool: string
  surface_area?: { built?: number; plot?: number }
  desc?: { es?: string; en?: string }
  features?: { feature?: string | string[] }
  images?: { image?: { url: string } | { url: string }[] }
}

const imagesOf = (k: KyeroProp): string[] => {
  const i = k.images?.image
  if (!i) return []
  return (Array.isArray(i) ? i : [i]).map(x => String(x.url)).filter(Boolean).slice(0, MAX_IMAGES)
}
const featuresOf = (k: KyeroProp): string[] => {
  const f = k.features?.feature
  if (!f) return []
  return (Array.isArray(f) ? f : [f]).map(String).map(s => s.trim()).filter(s => s && !/^\d+$/.test(s))
}

/** Sube una foto del CRM a Supabase Storage. Idempotente por nombre de archivo. */
async function rehost(url: string, ref: string, idx: number): Promise<string | null> {
  const key = `inmoges/${ref}/${String(idx).padStart(2, '0')}.jpg`
  const dest = `${URL_}/storage/v1/object/public/property-images/${key}`
  if ((await fetch(dest, { method: 'HEAD' })).ok) return dest
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!r.ok) return null
    const sharp = (await import('sharp')).default
    const buf = await sharp(Buffer.from(await r.arrayBuffer())).rotate()
      .resize({ width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true }).toBuffer()
    const up = await sb.storage.from('property-images').upload(key, buf, { contentType: 'image/jpeg', upsert: true, cacheControl: '31536000' })
    if (up.error) return null
    return dest
  } catch { return null }
}

async function main() {
  console.log(`Feed: ${FEED}`)
  const res = await fetch(FEED, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error(`El feed devolvió ${res.status}. ¿Se pulsó "Publicar inmuebles" en Pasarelas?`)
  const parsed = new XMLParser({ ignoreAttributes: false }).parse(await res.text())
  let props: KyeroProp[] = [].concat(parsed?.root?.property ?? [])
  if (LIMIT > 0) props = props.slice(0, LIMIT)
  console.log(`${props.length} inmuebles en el feed\n`)

  // Vínculos con fichas ya cargadas a mano (revisados a mano, ver cabecera)
  // Sin este archivo, las 12 fichas cargadas a mano antes de conectar el CRM se crearían
  // de nuevo como duplicadas. Mejor no escribir nada que duplicar.
  if (!existsSync(MATCH_FILE)) {
    if (CONFIRM && mode === 'load') throw new Error(`Falta ${MATCH_FILE}: se duplicarían fichas existentes. Abortado sin tocar nada.`)
    console.warn(`⚠ Falta ${MATCH_FILE}: el informe tratará como nuevas fichas que ya existen.`)
  }
  const links: Record<string, string> = existsSync(MATCH_FILE) ? JSON.parse(readFileSync(MATCH_FILE, 'utf8')) : {}

  const { data: existing, error: exErr } = await sb.from('properties')
    .select('id,ref_code,external_id,external_source,price,title,gallery_urls,image_url')
    .neq('external_source', 'habihub')
  if (exErr) throw new Error(`No se pudo leer el catálogo: ${exErr.message}`)
  const byExternalId = new Map((existing ?? []).filter(p => p.external_id).map(p => [p.external_id as string, p]))
  const byRefCode = new Map((existing ?? []).map(p => [p.ref_code, p]))

  const plan = { link: [] as string[], create: [] as string[], price: [] as string[], photos: [] as string[], skip: [] as string[] }

  for (const k of props) {
    const ref = String(k.ref)
    const extId = `im-${ref}`
    const imgs = imagesOf(k)
    const linked = byExternalId.get(extId) ?? (links[ref] ? byRefCode.get(links[ref]) : undefined)

    if (linked) {
      const priceChanged = Number(linked.price) !== Number(k.price)
      const webPhotos = (linked.gallery_urls ?? []).length
      const patch: Record<string, unknown> = { price: k.price, last_synced_at: new Date().toISOString() }
      const isNewLink = !linked.external_id || linked.external_id !== extId
      if (isNewLink) Object.assign(patch, { external_id: extId, external_source: 'inmoges' })

      // El CRM suele tener más fotos que la web (varias galerías se perdieron y se
      // reconstruyeron parciales). Solo se completan con --fotos y nunca se pisa lo que ya hay:
      // las de la web están ordenadas a mano y son la portada que ve el usuario.
      if (imgs.length > webPhotos) {
        plan.photos.push(`${ref} → ${linked.ref_code}: web ${webPhotos} · CRM ${imgs.length} (+${imgs.length - webPhotos})`)
        if (WITH_PHOTOS && CONFIRM && mode === 'load') {
          const extra: string[] = []
          for (const [i, u] of imgs.entries()) { const nu = await rehost(u, ref, i); if (nu && !(linked.gallery_urls ?? []).includes(nu)) extra.push(nu) }
          if (extra.length) patch.gallery_urls = [...(linked.gallery_urls ?? []), ...extra]
        }
      }

      if (isNewLink) plan.link.push(`${ref} → ${linked.ref_code} (${String(linked.title).slice(0, 40)})${priceChanged ? ` · precio ${linked.price}→${k.price}` : ''}`)
      else if (priceChanged) plan.price.push(`${ref} → ${linked.ref_code}: ${linked.price} → ${k.price}`)
      else if (!patch.gallery_urls) { plan.skip.push(ref); continue }

      if (CONFIRM && mode === 'load') {
        const { error } = await sb.from('properties').update(patch).eq('id', linked.id)
        if (error) console.error(`  ✗ ${ref}: ${error.message}`)
      }
      continue
    }

    // Alta nueva
    const title = buildTitle(k)
    plan.create.push(`${ref} · ${title} · ${k.price}€ · ${imgs.length} fotos · ${mapType(k.type)}`)
    if (CONFIRM && mode === 'load') {
      const gallery: string[] = []
      for (const [i, u] of imgs.entries()) { const nu = await rehost(u, ref, i); if (nu) gallery.push(nu) }
      const { error } = await sb.from('properties').insert({
        title, slug: `${slugify(title)}-${slugify(ref)}`,
        external_id: extId, external_source: 'inmoges',
        description: String(k.desc?.es ?? '').trim() || null,
        price: k.price, currency: 'EUR',
        location: String(k.town ?? '').trim() || null,
        province: String(k.province ?? '').trim() || null,
        country: 'España',
        bedrooms: Number(k.beds) || null, bathrooms: Number(k.baths) || null,
        area_sqm: Number(k.surface_area?.built) || null,
        property_type: mapType(k.type),
        features: featuresOf(k),
        image_url: gallery[0] ?? null, gallery_urls: gallery,
        status: 'active', last_synced_at: new Date().toISOString(),
      })
      if (error) console.error(`  ✗ ${ref}: ${error.message}`)
      else console.log(`  ✔ ${ref}: creada con ${gallery.length} fotos`)
    }
  }

  const show = (label: string, arr: string[]) => { if (!arr.length) return; console.log(`\n${label} (${arr.length})`); arr.forEach(l => console.log('  ' + l)) }
  show('VINCULAR con ficha existente', plan.link)
  show('CREAR nuevas', plan.create)
  show('ACTUALIZAR precio', plan.price)
  show(WITH_PHOTOS ? 'COMPLETAR fotos' : 'El CRM tiene MAS fotos (usar --fotos para completar)', plan.photos)
  console.log(`\nSin cambios: ${plan.skip.length}`)
  if (mode === 'report' || !CONFIRM) console.log('\n(dry-run — usar: npm run inmoges -- load --confirm)')
}
main().catch(e => { console.error('FALLO:', e.message); process.exit(1) })
