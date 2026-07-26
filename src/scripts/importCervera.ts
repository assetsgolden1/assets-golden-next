/**
 * Importador de proyectos de Cervera Broker Portal → catálogo de Assets Golden.
 *
 * Fuente: WP REST API pública (https://cerverabrokerportal.com/wp-json/wp/v2/projects).
 * Son promociones de obra nueva (off-plan) en Florida → se cargan con is_development=true
 * y precio "desde" (price_range_from).
 *
 * Modos:
 *   extract  — baja API + direcciones (scrape puntual) + media. Cachea en outputs/.
 *   report   — normaliza y emite informe dry-run. NO toca la BD.
 *   load     — inserta en Supabase (requiere --confirm). Idempotente por external_id.
 *
 * Uso: npm run cervera -- extract | report | load [--limit N] [--confirm]
 *
 * Detalle del análisis y las trampas de la fuente: docs/plan-carga-cervera.md
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs'
import path0 from 'node:path'

const API = 'https://cerverabrokerportal.com/wp-json/wp/v2'
const OUT = 'outputs'
const RAW = `${OUT}/cervera-raw.json`
const ADDR_CACHE = `${OUT}/cervera-addresses.json`

// robots.txt del sitio declara Crawl-delay: 10 → lo respetamos en el scrape de direcciones.
const CRAWL_DELAY_MS = 10_000
const UA = 'AssetsGoldenBot/1.0 (+https://assetsgolden.com)'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// ─── Tipos ────────────────────────────────────────────────────────────────
interface WpProject {
  id: number
  slug: string
  link: string
  title: { rendered: string }
  content?: { rendered: string }
  excerpt?: { rendered: string }
  featured_media?: number
  meta?: Record<string, unknown>
}

export interface CerveraRaw {
  id: number
  slug: string
  link: string
  title: string
  contentHtml: string
  excerptHtml: string
  excerptEs: string
  mediaIds: number[]
  images: string[]
  address: { street: string; city: string; state: string; zip: string } | null
  /** "2 to 4 Beds" — visible en la ficha pero NO expuesto por la API (campo JetEngine). */
  bedroomsText: string
  meta: Record<string, unknown>
}

// ─── Helpers ──────────────────────────────────────────────────────────────
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

const stripTags = (s: string) => decodeEntities(String(s ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' '))

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json() as Promise<T>
}

/**
 * La dirección NO está en la API (solo se renderiza en la ficha). La extraemos del
 * HTML server-rendered: tras el encabezado "Site Address" vienen 3 campos JetEngine
 * (calle / "Ciudad, ST" / zip).
 */
const STATE_WORDS = 'FL|FLORIDA|NY|NEW YORK|TX|TEXAS|CA|CALIFORNIA|NJ'
// Sufijos de vía: lo que viene DESPUÉS del último es, casi siempre, la ciudad.
const STREET_SUFFIX = /\b(?:blvd|boulevard|ave|avenue|st|street|dr|drive|rd|road|way|ter|terrace|pl|place|ct|court|ln|lane|hwy|highway|cir|circle|pkwy|parkway|causeway|walk)\b\.?/gi

const titleCase = (s: string) =>
  s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase()).replace(/\s+/g, ' ').trim()

// Encabezados de la ficha que NO son ciudades ("About Seven Park", "Sales Gallery Address").
const NOT_A_CITY = /\b(about|sales|gallery|address|facts|team|contact|developer|architect|overview|residences?|condominium)\b/i

/** Extrae "ciudad, estado" de una línea de dirección en cualquiera de los formatos de la fuente. */
function cityFromLine(line: string): { city: string; state: string } | null {
  if (!line || NOT_A_CITY.test(line)) return null
  // 1) Cortar tras el último sufijo de vía: "…Blvd, Fort Lauderdale, FL 33301" → "Fort Lauderdale, FL 33301"
  let tail = line
  const matches = [...line.matchAll(STREET_SUFFIX)]
  if (matches.length) {
    const last = matches[matches.length - 1]
    tail = line.slice((last.index ?? 0) + last[0].length)
  }
  tail = tail.replace(/^[\s,.\-]+/, '').trim()
  if (!tail) return null

  // 2) "Ciudad, ST [zip]" o "Ciudad ST zip" (sin comas)
  const m =
    tail.match(new RegExp(`^([A-Za-z][A-Za-z .'\\-]{2,40}?)\\s*,\\s*(${STATE_WORDS})\\b`, 'i')) ??
    tail.match(new RegExp(`^([A-Za-z][A-Za-z .'\\-]{2,40}?)\\s+(${STATE_WORDS})\\s+\\d{5}\\b`, 'i'))
  if (m) return { city: titleCase(m[1]), state: /^fl/i.test(m[2]) ? 'FL' : m[2].toUpperCase().slice(0, 2) }

  // 3) Solo ciudad, sin estado: "Bay Harbor Drive Bay Harbor Islands"
  const only = tail.replace(/\d{5}(-\d{4})?/g, '').replace(new RegExp(`\\b(${STATE_WORDS})\\b`, 'gi'), '').replace(/[,.]/g, ' ').trim()
  if (only && /^[A-Za-z][A-Za-z .'\-]{2,40}$/.test(only)) return { city: titleCase(only), state: '' }
  return null
}

/**
 * "Bedrooms Range: 2 to 4 Beds" del bloque "Facts About". Lo pinta un campo dinámico
 * de JetEngine que la REST API no expone, así que solo se puede leer de la ficha.
 */
function parseBedroomsRange(html: string): string {
  const i = html.indexOf('Bedrooms Range')
  if (i === -1) return ''
  const parts = html.slice(i, i + 800).replace(/<[^>]+>/g, '|').split('|')
    .map((s) => decodeEntities(s).replace(/\s+/g, ' ').trim())
    .filter((s) => s && !/^Bedrooms Range:?$/i.test(s))
  const v = parts[0] ?? ''
  return /bed|studio|\d/i.test(v) ? v : ''
}

function parseAddress(html: string): CerveraRaw['address'] {
  const i = html.indexOf('Site Address')
  if (i === -1) return null
  const chunk = html.slice(i, i + 3000).replace(/<script[\s\S]*?<\/script>/g, '')
  const parts = chunk
    .replace(/<[^>]+>/g, '|')
    .split('|')
    .map((s) => decodeEntities(s).replace(/\s+/g, ' ').trim())
    .filter((s) => s && s !== 'Site Address')

  const zip = parts.find((p) => /^\d{5}(-\d{4})?$/.test(p))
    ?? parts.map((p) => p.match(/\b(\d{5})(?:-\d{4})?\b/)?.[1]).find(Boolean) ?? ''
  const street = parts.find((p) => /^\d+\s+\S/.test(p)) ?? ''

  // Campo propio "Ciudad, ST" (formato limpio) — si no, se deduce de la línea de calle.
  const clean = parts.find((p) => new RegExp(`^[A-Za-z][A-Za-z .'\\-]+,\\s*(${STATE_WORDS})$`, 'i').test(p))
  // El fallback solo mira partes que PARECEN dirección (tienen número, estado o zip):
  // barrer todos los bloques colaba encabezados como "About Seven Park".
  // (RegExp nuevo por llamada: STREET_SUFFIX es /g y .test() sería stateful vía lastIndex)
  const hasStreetWord = (p: string) => new RegExp(STREET_SUFFIX.source, 'i').test(p)
  const addressLike = parts.filter((p) =>
    /\d/.test(p) && p.length > 8 && (new RegExp(`\\b(${STATE_WORDS})\\b`, 'i').test(p) || hasStreetWord(p)))
  const parsed = clean
    ? { city: titleCase(clean.split(',')[0]), state: clean.split(',')[1].trim().toUpperCase().slice(0, 2) }
    : (cityFromLine(street) ?? addressLike.map(cityFromLine).find(Boolean) ?? null)

  if (!parsed && !street) return null
  return { street, city: parsed?.city ?? '', state: parsed?.state || 'FL', zip }
}

// ─── F1 · EXTRACT ─────────────────────────────────────────────────────────
async function extract() {
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })

  console.log('· Bajando proyectos de la API…')
  const projects: WpProject[] = []
  for (let page = 1; page <= 2; page++) {
    const batch = await getJson<WpProject[]>(`${API}/projects?per_page=100&page=${page}`)
    projects.push(...batch)
    if (batch.length < 100) break
  }
  console.log(`  ${projects.length} proyectos`)

  // Media en lote (1 request por cada 100 ids) en vez de 1 por imagen.
  const idsOf = (p: WpProject): number[] => {
    const m = p.meta ?? {}
    return [p.featured_media, m['project-image'], m['project-hero-image']]
      .map(Number)
      .filter((n) => Number.isFinite(n) && n > 0)
  }
  const allIds = [...new Set(projects.flatMap(idsOf))]
  console.log(`· Resolviendo ${allIds.length} imágenes…`)
  const mediaUrl = new Map<number, string>()
  for (let i = 0; i < allIds.length; i += 100) {
    const slice = allIds.slice(i, i + 100)
    const media = await getJson<{ id: number; source_url: string; mime_type: string }[]>(
      `${API}/media?include=${slice.join(',')}&per_page=100`,
    )
    for (const m of media) if (m.mime_type?.startsWith('image/')) mediaUrl.set(m.id, m.source_url)
    await sleep(500)
  }
  console.log(`  ${mediaUrl.size} resueltas`)

  // Datos de la ficha (dirección + rango de dormitorios): no están en la API.
  // Cacheado y con crawl-delay; solo se piden los candidatos (con imagen o precio).
  type Facts = { address: CerveraRaw['address']; bedroomsText: string }
  const cache: Record<string, Facts> = existsSync(ADDR_CACHE)
    ? JSON.parse(readFileSync(ADDR_CACHE, 'utf8'))
    : {}
  const isCandidate = (p: WpProject) =>
    idsOf(p).length > 0 || Number(p.meta?.price_range_from) > 0
  // Refetch si falta la ciudad (pudo fallar el parser, no la fuente) o si el
  // registro es del formato viejo (sin bedroomsText).
  const needs = (s: string) => !cache[s] || !('bedroomsText' in cache[s]) || !cache[s].address?.city
  const pending = projects.filter((p) => isCandidate(p) && needs(p.slug))
  console.log(`· Fichas a leer: ${pending.length} (crawl-delay ${CRAWL_DELAY_MS / 1000}s, ~${Math.ceil((pending.length * CRAWL_DELAY_MS) / 60000)} min)…`)

  let failed = 0
  for (const [n, p] of pending.entries()) {
    // Reintento con backoff: un fallo puntual (429/red) no debe cachearse como
    // "esta ficha no tiene datos" — antes se guardaba el fallo y la propiedad
    // quedaba sin ciudad ni dormitorios para siempre.
    let html: string | null = null
    for (let attempt = 0; attempt < 3 && html === null; attempt++) {
      if (attempt) await sleep(CRAWL_DELAY_MS * (attempt + 1))
      try {
        const res = await fetch(p.link, { headers: { 'User-Agent': UA } })
        if (res.ok) html = await res.text()
      } catch { /* reintenta */ }
    }
    if (html === null) { failed++; console.error(`  ! sin respuesta: ${p.slug} (se reintenta en la próxima corrida)`) }
    else cache[p.slug] = { address: parseAddress(html), bedroomsText: parseBedroomsRange(html) }

    writeFileSync(ADDR_CACHE, JSON.stringify(cache, null, 1))
    if ((n + 1) % 10 === 0) console.log(`  ${n + 1}/${pending.length}`)
    if (n < pending.length - 1) await sleep(CRAWL_DELAY_MS)
  }
  if (failed) console.log(`· ${failed} fichas sin respuesta (no se cachearon: se reintentan)`)

  const raw: CerveraRaw[] = projects.map((p) => ({
    id: p.id,
    slug: p.slug,
    link: p.link,
    title: decodeEntities(p.title?.rendered ?? ''),
    contentHtml: p.content?.rendered ?? '',
    excerptHtml: p.excerpt?.rendered ?? '',
    excerptEs: String(p.meta?.excerpt_es ?? ''),
    mediaIds: idsOf(p),
    images: [...new Set(idsOf(p).map((id) => mediaUrl.get(id)).filter(Boolean) as string[])],
    address: cache[p.slug]?.address ?? null,
    bedroomsText: cache[p.slug]?.bedroomsText ?? '',
    meta: (p.meta ?? {}) as Record<string, unknown>,
  }))

  writeFileSync(RAW, JSON.stringify(raw, null, 1))
  console.log(`✔ ${RAW} (${raw.length} proyectos, ${raw.filter((r) => r.images.length).length} con imagen, ${raw.filter((r) => r.address?.city).length} con ciudad, ${raw.filter((r) => r.bedroomsText).length} con dormitorios)`)
}

// ─── F2 · NORMALIZACIÓN ───────────────────────────────────────────────────
const SQFT_TO_M2 = 10.7639
// Precio por debajo de este umbral NO es un precio de venta: la fuente mete el
// precio por pie cuadrado (PSF) en el mismo campo (ver docs/plan-carga-cervera.md).
const MIN_PRICE_USD = 10_000

const STATES: Record<string, string> = { FL: 'Florida', NY: 'Nueva York', TX: 'Texas', CA: 'California', NJ: 'Nueva Jersey' }

export interface Normalized {
  external_id: string
  external_source: 'cervera'
  title: string
  slug: string
  country: string
  province: string | null
  location: string | null
  property_type: string
  price: number | null
  currency: string
  area_sqm: number | null
  bedrooms: number | null
  bathrooms: number | null
  description: string
  description_en: string
  image_url: string | null
  gallery_urls: string[]
  features: string[]
  is_development: boolean
  skip: string | null
  warnings: string[]
  sourceUrl: string
}

const slugify = (t: string) =>
  t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80)

const num = (v: unknown): number => { const n = Number(String(v ?? '').replace(/[^0-9.]/g, '')); return Number.isFinite(n) ? n : 0 }

/** Dormitorios/baños salen del desglose de tipologías (unit_size_ranges). */
function bedsBaths(meta: Record<string, unknown>): { beds: number | null; baths: number | null } {
  const u = meta.unit_size_ranges
  if (!u || typeof u !== 'object') return { beds: null, baths: null }
  const rows = Object.values(u as Record<string, Record<string, string>>)
  const beds: number[] = []
  const baths: number[] = []
  for (const r of rows) {
    if (String(r.is_studio) === 'true') beds.push(0)
    const b = parseInt(r.unit_beds ?? '', 10)
    if (Number.isFinite(b) && b > 0) beds.push(b)
    const ba = parseFloat(String(r.unit_bth ?? '').replace(/[^0-9.]/g, ''))
    if (Number.isFinite(ba) && ba > 0) baths.push(ba)
  }
  return {
    beds: beds.length ? Math.min(...beds) : null,
    baths: baths.length ? Math.round(Math.min(...baths)) : null,
  }
}

/**
 * F3 · Copy bilingüe derivado SOLO de datos duros de la fuente (developer, arquitecto,
 * plantas, unidades, entrega, superficies). No inventa cifras ni afirmaciones.
 */
function buildDescription(r: CerveraRaw, n: Partial<Normalized>, lang: 'es' | 'en'): string {
  const m = r.meta
  const dev = String(m.developer ?? '').trim()
  const arch = String(m.architect ?? '').trim()
  const floors = num(m.floors)
  const units = num(m.units)
  const year = num(m.completion_year)
  const q = String(m.completion_quarter ?? '').toUpperCase()
  const sFrom = num(m.size_range_from), sTo = num(m.size_range_to)
  const city = n.location ?? '', prov = n.province ?? ''
  const es = lang === 'es'
  const s: string[] = []

  s.push(es
    ? `${r.title} es una promoción de obra nueva${city ? ` en ${city}` : ''}${prov ? `, ${prov}` : ''} (Estados Unidos).`
    : `${r.title} is a new development${city ? ` in ${city}` : ''}${prov ? `, ${prov}` : ''} (United States).`)

  const team: string[] = []
  if (dev) team.push(es ? `promovida por ${dev}` : `developed by ${dev}`)
  if (arch) team.push(es ? `con arquitectura de ${arch}` : `with architecture by ${arch}`)
  if (team.length) s.push((es ? 'Está ' : 'It is ') + team.join(es ? ' y ' : ' and ') + '.')

  const bldg: string[] = []
  if (floors) bldg.push(es ? `${floors} plantas` : `${floors} floors`)
  if (units) bldg.push(es ? `${units} residencias` : `${units} residences`)
  if (bldg.length) s.push((es ? 'El edificio cuenta con ' : 'The building has ') + bldg.join(es ? ' y ' : ' and ') + '.')

  if (sFrom) {
    const a = Math.round(sFrom / SQFT_TO_M2)
    const b = sTo ? Math.round(sTo / SQFT_TO_M2) : 0
    s.push(es
      ? `Las viviendas parten de ${a} m²${b && b > a ? ` y llegan hasta ${b} m²` : ''}.`
      : `Homes start at ${a} sqm${b && b > a ? ` and go up to ${b} sqm` : ''}.`)
  }
  if (year) s.push(es ? `Entrega prevista: ${q ? q + ' ' : ''}${year}.` : `Estimated delivery: ${q ? q + ' ' : ''}${year}.`)

  const am = stripTags(String(m.amenities ?? ''))
  if (am.length > 3) {
    // Cortar en frontera de palabra: el campo es una lista corrida y un slice duro
    // partía palabras a la mitad ("EV-ready parking P.").
    const cut = am.length <= 240 ? am : am.slice(0, am.lastIndexOf(' ', 240)) + '…'
    s.push((es ? 'Amenidades: ' : 'Amenities: ') + cut + (cut.endsWith('…') ? '' : '.'))
  }

  return s.join(' ')
}

function normalize(r: CerveraRaw): Normalized {
  const m = r.meta
  const warnings: string[] = []

  const rawPrice = num(m.price_range_from)
  let price: number | null = null
  if (rawPrice >= MIN_PRICE_USD) price = Math.round(rawPrice)
  else if (rawPrice > 0) warnings.push(`precio sospechoso (${rawPrice} = PSF, no total) → sin precio`)

  const sqft = num(m.size_range_from)
  const area_sqm = sqft ? Math.round(sqft / SQFT_TO_M2) : null
  let { beds } = bedsBaths(m)
  const { baths } = bedsBaths(m)
  // Fallback: "2 to 4 Beds" / "Studio to 3 Beds" de la ficha (la API no lo expone).
  if (beds === null && r.bedroomsText) {
    const t = r.bedroomsText.toLowerCase()
    if (/studio/.test(t.split(/to|–|-/)[0] ?? '')) beds = 0
    else {
      const first = t.match(/\d+/)
      if (first) beds = parseInt(first[0], 10)
    }
  }

  const province = r.address?.state ? (STATES[r.address.state] ?? r.address.state) : null
  const location = r.address?.city || null
  if (!location) warnings.push('sin ciudad (no se pudo extraer la dirección)')

  const n: Partial<Normalized> = { province, location }
  const descEs = r.excerptEs.trim() || buildDescription(r, n, 'es')
  const descEnSrc = stripTags(r.excerptHtml) || stripTags(r.contentHtml)
  const descEn = descEnSrc.length > 60 ? descEnSrc : buildDescription(r, n, 'en')

  const features = [
    r.bedroomsText && `Dormitorios: ${r.bedroomsText.replace(/\bto\b/i, 'a').replace(/\bbeds?\b/i, '').trim()}`,
    String(m.developer ?? '').trim() && `Promotora: ${m.developer}`,
    String(m.architect ?? '').trim() && `Arquitectura: ${m.architect}`,
    String(m['interior-designer'] ?? '').trim() && `Interiorismo: ${m['interior-designer']}`,
    num(m.floors) && `${num(m.floors)} plantas`,
    num(m.units) && `${num(m.units)} residencias`,
    num(m.completion_year) && `Entrega ${num(m.completion_year)}`,
    String(m.views ?? '').trim() && `Vistas: ${stripTags(String(m.views)).slice(0, 80)}`,
  ].filter(Boolean) as string[]

  let skip: string | null = null
  if (!r.images.length && price === null) skip = 'sin imagen ni precio'
  else if (!r.images.length) skip = 'sin imagen'
  else if (price === null) skip = 'sin precio válido'

  return {
    // Prefijo obligatorio: `properties.external_id` es ÚNICO GLOBAL y los IDs de
    // WordPress (87-4107) caen dentro del rango de los del feed HabiHub (435-43955).
    // Sin prefijo, una propiedad de Cervera "ocupa" el id de una de HabiHub y el
    // sync falla al insertarla (unique violation) perdiendo esa ficha del feed.
    external_id: `cv-${r.id}`,
    external_source: 'cervera',
    title: r.title,
    slug: `${slugify(r.title)}-${r.id}`,
    country: 'Estados Unidos',
    province,
    location,
    property_type: 'apartment',
    price,
    currency: 'USD',
    area_sqm,
    bedrooms: beds,
    bathrooms: baths,
    description: descEs,
    description_en: descEn,
    image_url: r.images[0] ?? null,
    gallery_urls: r.images,
    features,
    is_development: true,
    skip,
    warnings,
    sourceUrl: r.link,
  }
}

// ─── F4 · INFORME (dry-run, no toca la BD) ────────────────────────────────
/**
 * Rescata la ciudad de los proyectos cuya dirección no la incluye, cruzando datos
 * DENTRO del propio dataset (no se inventa geografía):
 *  1. código postal → ciudad, tomado de otros proyectos ya resueltos.
 *  2. el título nombra la ciudad ("Natiivo Fort Lauderdale") — se prueba el nombre
 *     más largo primero para que "West Palm Beach" gane a "Palm Beach".
 * Después se rehace el mapa de zips, porque (2) puede desbloquear (1).
 */
function backfillCities(raw: CerveraRaw[]): number {
  let fixed = 0
  for (let pass = 0; pass < 2; pass++) {
    const zipCity = new Map<string, string>()
    const vocab = new Set<string>()
    for (const r of raw) {
      if (r.address?.city) {
        vocab.add(r.address.city)
        if (r.address.zip) zipCity.set(r.address.zip, r.address.city)
      }
    }
    const byLen = [...vocab].sort((a, b) => b.length - a.length)
    for (const r of raw) {
      if (!r.address || r.address.city) continue
      const byZip = r.address.zip ? zipCity.get(r.address.zip) : undefined
      // La fuente nombra la ciudad tras la coma: "Mandarin Oriental Residences, West Palm Beach".
      const afterComma = r.title.match(/,\s*([A-Z][A-Za-z .'\-]{3,40})\s*$/)?.[1]?.trim()
      const byTitle = byLen.find((c) => r.title.toLowerCase().includes(c.toLowerCase()))
      const city = byZip ?? (afterComma && !NOT_A_CITY.test(afterComma) ? afterComma : undefined) ?? byTitle
      if (city) { r.address.city = city; fixed++ }
    }
  }
  return fixed
}

async function report() {
  const raw: CerveraRaw[] = JSON.parse(readFileSync(RAW, 'utf8'))
  const rescued = backfillCities(raw)
  if (rescued) console.log(`· ciudades recuperadas por zip/título: ${rescued}`)
  const all = raw.map(normalize)
  const ok = all.filter((n) => !n.skip)
  const out = all.filter((n) => n.skip)

  // Dedupe contra el catálogo vivo
  const { createClient } = await import('@supabase/supabase-js')
  const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
  const { data: existing } = await supa.from('properties').select('ref_code,title,external_id,external_source').or('country.ilike.%Estados Unidos%,location.ilike.%miami%')

  /**
   * Dedupe por TOKENS DISTINTIVOS, no por prefijo: los títulos de la misma torre difieren
   * mucho entre fuentes ("The Rider Residences" vs "THE RIDER MIAMI 1, 2 y 3 D"). Se ignoran
   * palabras genéricas de producto/geografía y se cruza lo que queda ("rider", "domus").
   */
  const GENERIC = new Set(['the', 'la', 'el', 'los', 'las', 'de', 'del', 'en', 'y', 'and', 'by', 'at', 'on',
    'residences', 'residence', 'condos', 'condo', 'hotel', 'tower', 'towers', 'apartamento', 'apartamentos',
    'miami', 'beach', 'brickell', 'coral', 'gables', 'bay', 'harbor', 'islands', 'island', 'aventura',
    'surfside', 'north', 'south', 'west', 'east', 'park', 'center', 'centre', 'club', 'house', 'new', 'york',
    // Geográficos que provocaban falsos positivos ("Alba Palm Beach" vs "…West Palm Beach").
    'palm', 'lauderdale', 'fort', 'hollywood', 'grove', 'coconut', 'village', 'ocean', 'sunny', 'isles'])
  const tokens = (s: string) => new Set(
    slugify(s).split('-').filter((t) => t.length >= 4 && !GENERIC.has(t) && !/^\d+$/.test(t)))

  // Ya importadas por este script: no son "duplicados a revisar", son trabajo hecho.
  const already = new Set((existing ?? [])
    .filter((e) => e.external_source === 'cervera')
    .map((e) => e.external_id))

  const dupes: { nuevo: string; existente: string; motivo: string }[] = []
  for (const n of ok) {
    if (already.has(n.external_id)) continue
    const tn = tokens(n.title)
    const hit = (existing ?? []).find((e) => {
      if (e.external_source === 'cervera') return false   // se compara solo contra el catálogo previo
      const te = tokens(e.title ?? '')
      return [...tn].some((t) => te.has(t))
    })
    if (hit) dupes.push({
      nuevo: n.title,
      existente: `${hit.ref_code} — ${hit.title}`,
      motivo: [...tokens(n.title)].filter((t) => tokens(hit.title ?? '').has(t)).join(', '),
    })
  }
  const dupeTitles = new Set(dupes.map((d) => d.nuevo))

  const by = (r: string) => out.filter((n) => n.skip === r).length
  const L: string[] = []
  L.push('# Informe dry-run — carga Cervera', '', `> Generado por \`npm run cervera -- report\`. **No se escribió nada en la BD.**`, '')
  L.push('## Resumen', '', `| | |`, `|---|---|`)
  L.push(`| Proyectos en la fuente | ${all.length} |`)
  L.push(`| **Listos para cargar** | **${ok.length - dupes.length}** |`)
  L.push(`| Duplicados detectados (no se cargan) | ${dupes.length} |`)
  L.push(`| Excluidos por datos insuficientes | ${out.length} |`, '')
  L.push('## Exclusiones', '', `| Motivo | N |`, `|---|---|`)
  for (const r of ['sin imagen ni precio', 'sin imagen', 'sin precio válido']) L.push(`| ${r} | ${by(r)} |`)
  L.push('')
  if (dupes.length) {
    L.push('## ⚠️ Posibles duplicados — NO se cargan', '',
      'Detectados por token distintivo compartido. Revisar y decidir a mano (puede ser la misma torre cargada antes, o una fase distinta del mismo complejo).', '',
      `| Cervera | Ya en el catálogo | Coincide en |`, `|---|---|---|`)
    for (const d of dupes) L.push(`| ${d.nuevo} | ${d.existente} | \`${d.motivo}\` |`)
    L.push('')
  }
  const psf = all.filter((n) => n.warnings.some((w) => w.includes('PSF')))
  if (psf.length) {
    L.push('## ⚠️ Precios PSF descartados (revisión manual)', '', `La fuente trae el precio por pie cuadrado en el campo de precio. Se cargan SIN precio o se excluyen.`, '', `| Proyecto | Valor en la fuente |`, `|---|---|`)
    for (const n of psf) L.push(`| ${n.title} | ${n.warnings.find((w) => w.includes('PSF'))?.match(/\((\d+)/)?.[1] ?? '?'} |`)
    L.push('')
  }
  const noCity = ok.filter((n) => !n.location && !dupeTitles.has(n.title))
  if (noCity.length) {
    L.push(`## Sin ciudad (${noCity.length}) — decisión tuya`, '',
      'La dirección no se pudo extraer de la ficha. Se cargarían con país (Estados Unidos) pero **sin ciudad**: no aparecerían en filtros por ciudad y la ficha queda más pobre. Opciones: cargarlas igual, o dejarlas para completar a mano.', '')
    L.push(noCity.map((n) => `- ${n.title} — ${n.sourceUrl}`).join('\n'), '')
  }
  L.push('## Muestra de 5 fichas normalizadas', '')
  for (const n of ok.filter((x) => !dupeTitles.has(x.title)).slice(0, 5)) {
    L.push(`### ${n.title}`, '', '```', JSON.stringify({ ...n, description: n.description.slice(0, 220) + '…', description_en: n.description_en.slice(0, 120) + '…' }, null, 1), '```', '')
  }
  L.push('## Excluidos — detalle para carga manual', '', `| Proyecto | Motivo | Ficha |`, `|---|---|---|`)
  for (const n of out) L.push(`| ${n.title} | ${n.skip} | ${n.sourceUrl} |`)

  const path = 'docs/informe-carga-cervera.md'
  writeFileSync(path, L.join('\n'))
  // Se persiste la marca para que `load` NUNCA cargue un posible duplicado.
  const marked = all.map((n) => (dupeTitles.has(n.title)
    ? { ...n, skip: n.skip ?? 'posible duplicado', dupeOf: dupes.find((d) => d.nuevo === n.title)?.existente }
    : n))
  writeFileSync(`${OUT}/cervera-normalized.json`, JSON.stringify(marked, null, 1))
  console.log(`✔ ${path}`)
  console.log(`  listos: ${ok.length - dupes.length} · duplicados: ${dupes.length} · excluidos: ${out.length}`)
}

// ─── F5 · CARGA ───────────────────────────────────────────────────────────
/**
 * Inserta en Supabase. Idempotente: salta lo que ya existe por (external_source, external_id).
 * Las imágenes se recomprimen y se suben a NUESTRO bucket — así no dependemos del hosting de
 * Cervera y evitamos el problema de fuentes >25 MB que rompen el transform (ver DAILY_LOG 03/07).
 */
async function load() {
  const limit = Number(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? 0)
  const confirm = process.argv.includes('--confirm')

  const all: Normalized[] = JSON.parse(readFileSync(`${OUT}/cervera-normalized.json`, 'utf8'))
  const { createClient } = await import('@supabase/supabase-js')
  const sharp = (await import('sharp')).default
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supa = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })

  const { data: already } = await supa.from('properties').select('external_id').eq('external_source', 'cervera')
  const done = new Set((already ?? []).map((r) => r.external_id))

  // Sin ciudad no se cargan por defecto: la ficha queda fuera de los filtros por
  // ciudad y es una decisión de negocio, no técnica. Forzar con --allow-no-city.
  const allowNoCity = process.argv.includes('--allow-no-city')
  let queue = all.filter((n) => !n.skip && !done.has(n.external_id) && (allowNoCity || n.location))
  const held = all.filter((n) => !n.skip && !done.has(n.external_id) && !n.location).length
  if (held && !allowNoCity) console.log(`· ${held} en espera por no tener ciudad (--allow-no-city para incluirlas)`)
  if (limit > 0) queue = queue.slice(0, limit)

  console.log(`· ${queue.length} a cargar${limit ? ` (limit ${limit})` : ''}${confirm ? '' : ' — DRY-RUN, usá --confirm para escribir'}`)
  if (!confirm) { queue.forEach((n) => console.log(`  [dry] ${n.title} — ${n.location ?? '?'} — ${n.price ? '$' + n.price.toLocaleString() : 's/precio'}`)); return }

  let okCount = 0
  for (const n of queue) {
    try {
      // Imágenes → bucket propio
      const uploaded: string[] = []
      for (const [i, url] of n.gallery_urls.entries()) {
        try {
          const res = await fetch(url, { headers: { 'User-Agent': UA } })
          if (!res.ok) continue
          const buf = Buffer.from(await res.arrayBuffer())
          const jpg = await sharp(buf).rotate()
            .resize({ width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 82, mozjpeg: true }).toBuffer()
          const path = `cervera/${n.external_id}/${i}.jpg`
          const up = await supa.storage.from('property-images')
            .upload(path, jpg, { contentType: 'image/jpeg', upsert: true, cacheControl: '31536000' })
          if (!up.error) uploaded.push(`${SUPABASE_URL}/storage/v1/object/public/property-images/${path}`)
        } catch { /* imagen suelta que falla no aborta la propiedad */ }
      }
      if (!uploaded.length) { console.error(`  ✗ ${n.title}: ninguna imagen se pudo subir`); continue }

      const { error } = await supa.from('properties').insert({
        title: n.title, slug: n.slug,
        country: n.country, province: n.province, location: n.location,
        property_type: n.property_type, price: n.price, currency: n.currency,
        area_sqm: n.area_sqm, bedrooms: n.bedrooms, bathrooms: n.bathrooms,
        description: n.description, description_en: n.description_en,
        image_url: uploaded[0], gallery_urls: uploaded,
        features: n.features, is_development: n.is_development,
        external_id: n.external_id, external_source: n.external_source,
        status: 'active', hidden: false, featured: false,
      })
      if (error) { console.error(`  ✗ ${n.title}: ${error.message}`); continue }
      okCount++
      console.log(`  ✔ ${n.title} (${uploaded.length} img)`)
    } catch (e) { console.error(`  ✗ ${n.title}: ${(e as Error).message}`) }
  }
  console.log(`\nCargadas: ${okCount}/${queue.length}`)
}

// ─── F6 · RENDERS DE DROPBOX ──────────────────────────────────────────────
/**
 * Las carpetas de Dropbox del portal ("Unbranded Marketing Tools") traen los renders
 * profesionales del proyecto — la API solo da 1-3 imágenes. Se bajan como ZIP (`&dl=1`),
 * se extraen SOLO las imágenes, se recomprimen (~4 MB → ~480 KB, -89%) y se suben a
 * nuestro bucket. El ZIP es temporal y se descarta: no se almacena el original.
 *
 * Requiere `unzip` en el PATH (viene con Git Bash en Windows).
 */
const GRAPHIC_FIELDS = ['renderings-link', 'non-cervera-db-link', 'floor-plans-link', 'brochure-link', 'fact-sheet-link']
/** Tope de descarga por carpeta. Ajustable con --max-gb=N. */
const DEFAULT_MAX_GB = 2
/** Con esta cantidad de fotos la galería ya está enriquecida: no se vuelve a bajar. */
const ENRICHED_AT = 8

async function renders() {
  const limit = Number(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? 0)
  const confirm = process.argv.includes('--confirm')
  const maxGb = Number(process.argv.find((a) => a.startsWith('--max-gb='))?.split('=')[1] ?? DEFAULT_MAX_GB)
  const MAX_ZIP_BYTES = maxGb * 1073741824
  const { execFileSync } = await import('node:child_process')
  const os = await import('node:os')
  const { rmSync, mkdtempSync, readdirSync, statSync } = await import('node:fs')

  const raw: CerveraRaw[] = JSON.parse(readFileSync(RAW, 'utf8'))

  const { createClient } = await import('@supabase/supabase-js')
  const sharp = (await import('sharp')).default
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supa = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })

  // Solo propiedades YA cargadas (se les enriquece la galería).
  const { data: loaded } = await supa.from('properties')
    .select('id,external_id,title,gallery_urls').eq('external_source', 'cervera')
  const byExt = new Map((loaded ?? []).map((p) => [p.external_id, p]))

  const folderOf = (r: CerveraRaw): string | null => {
    for (const f of GRAPHIC_FIELDS) {
      const v = String(r.meta[f] ?? '').replace(/&amp;/g, '&').trim()
      if (v.includes('dropbox.com')) return v
    }
    return null
  }

  // Idempotente: si ya tiene galería rica no se vuelve a bajar (--force para rehacer).
  const force = process.argv.includes('--force')
  const enriched = (id: string) => {
    const g = byExt.get(id)?.gallery_urls
    return Array.isArray(g) && g.length >= ENRICHED_AT
  }
  let queue = raw.filter((r) => byExt.has(`cv-${r.id}`) && folderOf(r) && (force || !enriched(`cv-${r.id}`)))
  if (limit > 0) queue = queue.slice(0, limit)
  console.log(`· ${queue.length} propiedades a enriquecer${force ? ' (--force)' : ''}${confirm ? '' : ' — DRY-RUN (--confirm para escribir)'}`)
  if (!confirm) { queue.forEach((r) => console.log(`  [dry] ${r.title}`)); return }

  for (const r of queue) {
    const tmp = mkdtempSync(path0.join(os.tmpdir(), 'cvz-'))
    try {
      const url = folderOf(r)!
      const zipPath = path0.join(tmp, 'f.zip')
      const res = await fetch(url.includes('dl=1') ? url : `${url}&dl=1`, { headers: { 'User-Agent': UA } })
      if (!res.ok) { console.error(`  ✗ ${r.title}: descarga ${res.status}`); continue }

      // Carpetas desproporcionadas (una llegó a 7,4 GB de vídeos y masters): no
      // compensa bajarlas para sacar 20 fotos.
      const declared = Number(res.headers.get('content-length') ?? 0)
      if (declared > MAX_ZIP_BYTES) {
        console.error(`  ✗ ${r.title}: carpeta de ${(declared / 1073741824).toFixed(1)} GB — omitida (tope ${MAX_ZIP_BYTES / 1073741824} GB)`)
        continue
      }

      // Streaming a disco: `Buffer.from(arrayBuffer())` rompe con ZIPs > 2 GB
      // ("The value of length is out of range") además de cargar todo en memoria.
      const { createWriteStream } = await import('node:fs')
      const { pipeline } = await import('node:stream/promises')
      const { Readable } = await import('node:stream')
      await pipeline(Readable.fromWeb(res.body as Parameters<typeof Readable.fromWeb>[0]), createWriteStream(zipPath))
      const zipMb = statSync(zipPath).size / 1048576

      try { execFileSync('unzip', ['-o', '-j', '-qq', zipPath, '-d', tmp], { stdio: 'ignore' }) }
      catch { /* unzip devuelve !=0 con warnings pero igual extrae */ }

      const imgs = readdirSync(tmp).filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
        .map((f) => path0.join(tmp, f))
        .filter((f) => statSync(f).size > 40_000)          // descarta logos/iconos
        .sort()
      if (!imgs.length) { console.error(`  ✗ ${r.title}: el ZIP (${zipMb.toFixed(0)} MB) no traía imágenes`); continue }

      const prop = byExt.get(`cv-${r.id}`)!
      const existing: string[] = Array.isArray(prop.gallery_urls) ? prop.gallery_urls : []
      const uploaded: string[] = []
      let mb = 0
      for (const [i, f] of imgs.entries()) {
        try {
          const out = await sharp(readFileSync(f)).rotate()
            .resize({ width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 82, mozjpeg: true }).toBuffer()
          const key = `cervera/${r.id}/r${String(i).padStart(2, '0')}.jpg`
          const up = await supa.storage.from('property-images')
            .upload(key, out, { contentType: 'image/jpeg', upsert: true, cacheControl: '31536000' })
          if (up.error) continue
          uploaded.push(`${SUPABASE_URL}/storage/v1/object/public/property-images/${key}`)
          mb += out.length / 1048576
        } catch { /* una imagen mala no aborta el proyecto */ }
      }
      if (!uploaded.length) { console.error(`  ✗ ${r.title}: no se pudo subir ninguna`); continue }

      // Los renders van primero (son mejores que el screenshot de la API), sin duplicar.
      const gallery = [...new Set([...uploaded, ...existing])]
      const { error } = await supa.from('properties')
        .update({ image_url: gallery[0], gallery_urls: gallery, updated_at: new Date().toISOString() })
        .eq('id', prop.id)
      if (error) { console.error(`  ✗ ${r.title}: BD ${error.message}`); continue }
      console.log(`  ✔ ${r.title}: ${uploaded.length} renders (ZIP ${zipMb.toFixed(0)} MB → ${mb.toFixed(1)} MB) · galería ${gallery.length}`)
    } catch (e) {
      console.error(`  ✗ ${r.title}: ${(e as Error).message}`)
    } finally {
      rmSync(tmp, { recursive: true, force: true })   // el ZIP no se conserva
    }
  }
}

// ─── main ─────────────────────────────────────────────────────────────────
const mode = process.argv[2] ?? 'report'
const run = mode === 'extract' ? extract : mode === 'report' ? report
  : mode === 'load' ? load : mode === 'renders' ? renders : null
if (!run) { console.log('Usá: extract | report | load [--limit=N] [--confirm] | renders [--limit=N] [--confirm]'); process.exit(1) }
run().catch((e) => { console.error('FALLÓ:', e.message); process.exit(1) })
