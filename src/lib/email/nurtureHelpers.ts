// Helpers de la secuencia de nurture (LEADS-SEQ-P03).
// Fuente de verdad del copy y la ramificación: Downloads/LEADS-SEQ-contenido.md
//
// Los formularios de Meta cambiaron de formato con el tiempo. Conviven 3 generaciones
// de valores en meta_leads y en el Sheet histórico; los helpers los normalizan TODOS:
//  - clave vieja:   '300k_500k_eur', '1m_2m_eur', 'apartment', 'investment_rental_income'
//  - display vieja:  '300K - 500K EUR', 'Apartamento', 'Inversión'
//  - crudo nuevo:    '€300k_–_€500k' (con € y guion largo U+2013 '–'), 'open_to_any',
//                    'investment_/_rental'
// presupuesto_raw puede venir en cualquiera de los 3 formatos; tipo_propiedad y purpose
// pueden venir mapeados a español (parser) o crudos EN.

// Base pública del portal. Coincide con sendWelcomeEmail (locale /en).
const PROPERTIES_BASE_URL = 'https://assetsgolden.com/en/propiedades'

// ── Presupuesto: normalización canónica ──────────────────────────────────────
// Colapsa cualquier generación a una clave compacta: lowercase, quita
// 'eur'/'€'/espacios y elimina TODO tipo de guion (- , – U+2013, — U+2014, _).
// Así "300k_500k_eur", "300K - 500K EUR" y "€300k_–_€500k" → "300k500k".
function budgetKey(presupuestoRaw: string | null | undefined): string {
  return (presupuestoRaw ?? '')
    .toLowerCase()
    .replace(/eur/g, '')
    .replace(/€/g, '')
    .replace(/[-–—_]/g, '')
    .replace(/\s+/g, '')
}

// Única fuente de verdad por banda de presupuesto: segmento A/B, frase EN del rango
// y límites de precio (EUR) para el link filtrado.
const BUDGET_BY_KEY: Record<
  string,
  { segment: 'A' | 'B'; range: string; min?: number; max?: number }
> = {
  under300k: { segment: 'A', range: 'under €300K', max: 300_000 },
  '300k500k': { segment: 'A', range: '€300K to €500K', min: 300_000, max: 500_000 },
  '500k1m': { segment: 'A', range: '€500K to €1M', min: 500_000, max: 1_000_000 },
  '1m2m': { segment: 'B', range: '€1M to €2M', min: 1_000_000, max: 2_000_000 },
  '2m5m': { segment: 'B', range: '€2M to €5M', min: 2_000_000, max: 5_000_000 },
  above2m: { segment: 'B', range: '€2M+', min: 2_000_000 },
  above5m: { segment: 'B', range: '€2M+', min: 5_000_000 },
}

/** 'A' (banda con tope < €1M) | 'B' (banda de €1M o más). Default 'A' si no se reconoce. */
export function deriveSegment(presupuestoRaw: string | null | undefined): 'A' | 'B' {
  return BUDGET_BY_KEY[budgetKey(presupuestoRaw)]?.segment ?? 'A'
}

/**
 * Frase EN del rango para el copy (se inserta en "in the ${range} range").
 * Si el formato es desconocido devuelve un genérico natural ('the right') para que
 * el correo se lea bien sin afirmar un rango concreto (nada de "your" ni texto roto).
 */
export function formatBudgetRange(presupuestoRaw: string | null | undefined): string {
  return BUDGET_BY_KEY[budgetKey(presupuestoRaw)]?.range ?? 'the right'
}

// ── Tipo de propiedad ────────────────────────────────────────────────────────
// Normaliza el valor almacenado (español, crudo EN viejo o crudo EN nuevo) a la
// clave canónica EN que usa el query param `tipo` de /propiedades.
const TYPE_NORMALIZE: Record<string, string> = {
  apartamento: 'apartment',
  apartment: 'apartment',
  villa: 'villa',
  penthouse: 'penthouse',
  atico: 'penthouse',
  'ático': 'penthouse',
  townhouse: 'townhouse',
  adosado: 'townhouse',
  'cualquier tipo': 'any',
  any: 'any',
  open_to_any: 'any',
}

function normalizeType(tipo: string | null | undefined): string {
  const key = (tipo ?? '').trim().toLowerCase()
  return TYPE_NORMALIZE[key] ?? 'any'
}

const TYPE_PHRASE_EN: Record<string, string> = {
  apartment: 'an apartment',
  villa: 'a villa',
  penthouse: 'a penthouse',
  townhouse: 'a townhouse',
  any: 'a property',
}

/** Frase EN del tipo de propiedad (ej "a villa"). 'a property' si any/open_to_any/desconocido. */
export function formatPropertyType(tipo: string | null | undefined): string {
  return TYPE_PHRASE_EN[normalizeType(tipo)]
}

/**
 * Link a /propiedades filtrado por rango de precio del lead + tipo + zona Costa del Sol.
 * Params reales verificados en src/app/[locale]/(public)/propiedades/page.tsx:
 *   tipo, precio_min, precio_max, pais, zona.
 * El filtro `zona` solo se aplica si `pais` incluye "espa" (queries.ts:56), por eso
 * siempre incluimos pais=España. Si el tipo es any/null no se agrega `tipo` (más amplio).
 */
export function buildFilteredLink(
  presupuestoRaw: string | null | undefined,
  tipo: string | null | undefined,
): string {
  const params = new URLSearchParams()
  params.set('pais', 'España')
  params.set('zona', 'costa-del-sol')

  const bounds = BUDGET_BY_KEY[budgetKey(presupuestoRaw)]
  if (bounds?.min != null) params.set('precio_min', String(bounds.min))
  if (bounds?.max != null) params.set('precio_max', String(bounds.max))

  const typeKey = normalizeType(tipo)
  if (typeKey !== 'any') params.set('tipo', typeKey)

  return `${PROPERTIES_BASE_URL}?${params.toString()}`
}

// ── Purpose (Email 2) ────────────────────────────────────────────────────────
// Devuelve la clave de bloque a usar en Email 2 según el purpose del lead.
// Acepta display español (parser), crudo EN viejo y crudo EN nuevo (con "/").
// NOTA: la plantilla (PURPOSE_BLOCK_TEXT) solo define 3 bloques —investment,
// second_home, neutral—. "Residencia principal" no tiene bloque propio, así que
// cae en el bloque lifestyle (second_home), el más cercano sin tocar el copy.
export type PurposeBlock = 'investment' | 'second_home' | 'neutral'

export function derivePurposeBlock(purpose: string | null | undefined): PurposeBlock {
  const key = (purpose ?? '').trim().toLowerCase()

  // Inversión
  if (
    key === 'investment_rental_income' ||
    key === 'investment_/_rental' ||
    key === 'inversión' ||
    key === 'inversion'
  ) {
    return 'investment'
  }

  // Segunda residencia
  if (
    key === 'second_home_holiday_residence' ||
    key === 'second_home_/_holiday_residence' ||
    key === 'segunda residencia'
  ) {
    return 'second_home'
  }

  // Residencia principal → sin bloque propio: usa el lifestyle (second_home)
  if (
    key === 'primary_residence' ||
    key === 'relocation_/_primary_residence' ||
    key === 'residencia principal'
  ) {
    return 'second_home'
  }

  // mix_of_the_above, 'Mix (residencia + inversión)' y cualquier otro → neutro
  return 'neutral'
}

// ── First name ───────────────────────────────────────────────────────────────
/** Primer nombre de `nombre`; 'there' si vacío. Igual criterio que el welcome. */
export function firstNameFrom(nombre: string | null | undefined): string {
  const trimmed = (nombre ?? '').trim()
  if (!trimmed) return 'there'
  return trimmed.split(/\s+/)[0]
}
