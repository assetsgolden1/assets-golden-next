/**
 * Regiones para el filtro del panel de propiedades.
 *
 * La BD no guarda la comunidad autónoma, solo la provincia (`province`): "Barcelona",
 * "Alicante", "Málaga"... Para poder filtrar por "Cataluña" o "Andalucía" se deriva
 * la región a partir de la provincia. Fuera de España la región es la propia provincia
 * o estado (Florida, Samaná...).
 *
 * Los nombres llegan con variantes de escritura ("Malaga" / "Málaga", "Baleares" /
 * "Islas Baleares"), por eso todo se compara normalizado sin tildes ni mayúsculas.
 */

export const normalizeKey = (s: string) =>
  s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()

const SPAIN_REGIONS: Record<string, string[]> = {
  'Andalucía': ['almeria', 'cadiz', 'cordoba', 'granada', 'huelva', 'jaen', 'malaga', 'sevilla', 'andalucia'],
  'Aragón': ['huesca', 'teruel', 'zaragoza', 'aragon'],
  'Asturias': ['asturias', 'oviedo'],
  'Islas Baleares': ['baleares', 'islas baleares', 'illes balears', 'mallorca', 'ibiza', 'menorca'],
  'Canarias': ['las palmas', 'santa cruz de tenerife', 'tenerife', 'gran canaria', 'canarias', 'islas canarias'],
  'Cantabria': ['cantabria', 'santander'],
  'Castilla-La Mancha': ['albacete', 'ciudad real', 'cuenca', 'guadalajara', 'toledo', 'castilla-la mancha'],
  'Castilla y León': ['avila', 'burgos', 'leon', 'palencia', 'salamanca', 'segovia', 'soria', 'valladolid', 'zamora', 'castilla y leon'],
  'Cataluña': ['barcelona', 'girona', 'gerona', 'lleida', 'lerida', 'tarragona', 'cataluna', 'catalunya'],
  'Comunidad Valenciana': ['alicante', 'alacant', 'castellon', 'castello', 'valencia', 'comunidad valenciana'],
  'Extremadura': ['badajoz', 'caceres', 'extremadura'],
  'Galicia': ['a coruna', 'la coruna', 'lugo', 'ourense', 'orense', 'pontevedra', 'galicia'],
  'Madrid': ['madrid', 'comunidad de madrid'],
  'Región de Murcia': ['murcia', 'region de murcia'],
  'Navarra': ['navarra'],
  'País Vasco': ['alava', 'araba', 'guipuzcoa', 'gipuzkoa', 'vizcaya', 'bizkaia', 'pais vasco', 'euskadi'],
  'La Rioja': ['la rioja', 'rioja'],
  'Ceuta': ['ceuta'],
  'Melilla': ['melilla'],
}

const PROVINCE_TO_REGION = new Map<string, string>(
  Object.entries(SPAIN_REGIONS).flatMap(([region, provs]) => provs.map((p) => [p, region] as const)),
)

const isSpain = (country: string | null) => !!country && normalizeKey(country) === 'espana'
const hasAccent = (s: string) => normalizeKey(s) !== s.toLowerCase().trim()

/**
 * Clave de región de una fila. En España, la comunidad autónoma; fuera, la provincia
 * normalizada (el nombre visible se resuelve aparte para quedarse con la variante con tildes).
 */
export function regionKeyOf(country: string | null, province: string | null): string | null {
  if (!province?.trim()) return null
  const key = normalizeKey(province)
  if (isSpain(country)) return PROVINCE_TO_REGION.get(key) ?? province.trim()
  return key
}

/** Si un texto libre nombra una comunidad ("cataluña"), devuelve su nombre oficial. */
export function spainRegionFromText(text: string): string | null {
  const key = normalizeKey(text)
  return Object.keys(SPAIN_REGIONS).find((r) => normalizeKey(r) === key) ?? null
}

export interface LocationEntry {
  country: string
  /** Nombre visible de la región, o null si la fila no tiene provincia. */
  region: string | null
  city: string
  count: number
}

export interface LocationIndex {
  entries: LocationEntry[]
  /** Valores crudos de `province` en BD que componen cada región, por país. */
  provincesByRegion: Record<string, Record<string, string[]>>
}

/**
 * Agrupa las filas (país, provincia, ciudad) en entradas únicas con su recuento y el
 * mapa región → provincias crudas que necesita la consulta para filtrar con `.in()`.
 */
export function buildLocationIndex(
  rows: { country: string | null; province: string | null; location: string | null }[],
): LocationIndex {
  // Nombre visible por (país, clave de región): gana la variante con tildes.
  const display = new Map<string, string>()
  const provincesByRegion: Record<string, Record<string, string[]>> = {}
  const counts = new Map<string, LocationEntry>()

  for (const r of rows) {
    if (!r.country) continue
    const rk = regionKeyOf(r.country, r.province)
    if (rk && r.province) {
      const dk = `${r.country}|${rk}`
      const raw = r.province.trim()
      const current = display.get(dk)
      const name = isSpain(r.country) ? rk : raw
      if (!current || (hasAccent(name) && !hasAccent(current))) display.set(dk, name)
    }
  }

  for (const r of rows) {
    if (!r.country) continue
    const rk = regionKeyOf(r.country, r.province)
    const region = rk ? display.get(`${r.country}|${rk}`) ?? null : null

    if (region && r.province) {
      const byCountry = (provincesByRegion[r.country] ??= {})
      const list = (byCountry[region] ??= [])
      if (!list.includes(r.province)) list.push(r.province)
    }

    const city = r.location?.trim()
    if (!city) continue
    const k = `${r.country}|${region ?? ''}|${city}`
    const e = counts.get(k)
    if (e) e.count++
    else counts.set(k, { country: r.country, region, city, count: 1 })
  }

  const entries = [...counts.values()].sort(
    (a, b) => a.country.localeCompare(b.country, 'es') || a.city.localeCompare(b.city, 'es'),
  )
  return { entries, provincesByRegion }
}
