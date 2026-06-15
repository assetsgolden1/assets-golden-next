// Helpers de la secuencia de nurture (LEADS-SEQ-P03).
// Fuente de verdad del copy y la ramificación: Downloads/LEADS-SEQ-contenido.md
//
// Notas sobre el formato de los datos en meta_leads:
//  - presupuesto_raw: valor CRUDO de Meta, ej 'under_300k_eur', '1m_2m_eur'.
//  - tipo_propiedad: queda MAPEADO a español por el parser ('Apartamento', 'Villa',
//    'Penthouse', 'Townhouse', 'Cualquier tipo'). Aceptamos también el valor crudo EN
//    por robustez.
//  - purpose: también mapeado a español ('Inversión', 'Segunda residencia',
//    'Mix (residencia + inversión)', 'Residencia principal').

// Base pública del portal. Coincide con sendWelcomeEmail (locale /en).
const PROPERTIES_BASE_URL = 'https://assetsgolden.com/en/propiedades'

// ── Segmento A/B (solo Email 1) ──────────────────────────────────────────────
// A: under_300k_eur, 300k_500k_eur, 500k_1m_eur
// B: 1m_2m_eur, 2m_5m_eur, above_2m_eur
const SEGMENT_B_BUDGETS = new Set(['1m_2m_eur', '2m_5m_eur', 'above_2m_eur'])

function normalizeBudget(presupuestoRaw: string | null | undefined): string {
  return (presupuestoRaw ?? '').trim().toLowerCase()
}

/** 'A' (hasta €1M) | 'B' (€1M+). Default 'A' si no se reconoce. */
export function deriveSegment(presupuestoRaw: string | null | undefined): 'A' | 'B' {
  return SEGMENT_B_BUDGETS.has(normalizeBudget(presupuestoRaw)) ? 'B' : 'A'
}

// ── Rango de presupuesto en texto EN ─────────────────────────────────────────
const BUDGET_RANGE_EN: Record<string, string> = {
  under_300k_eur: 'under €300K',
  '300k_500k_eur': '€300K to €500K',
  '500k_1m_eur': '€500K to €1M',
  '1m_2m_eur': '€1M to €2M',
  '2m_5m_eur': '€2M to €5M',
  above_2m_eur: '€2M and above',
}

/** Frase EN del rango. Fallback neutro si el valor es desconocido/vacío. */
export function formatBudgetRange(presupuestoRaw: string | null | undefined): string {
  return BUDGET_RANGE_EN[normalizeBudget(presupuestoRaw)] ?? 'your'
}

// ── Rango de presupuesto → precio_min / precio_max (EUR) ──────────────────────
// Para construir el link filtrado de /propiedades.
const BUDGET_PRICE_BOUNDS: Record<string, { min?: number; max?: number }> = {
  under_300k_eur: { max: 300_000 },
  '300k_500k_eur': { min: 300_000, max: 500_000 },
  '500k_1m_eur': { min: 500_000, max: 1_000_000 },
  '1m_2m_eur': { min: 1_000_000, max: 2_000_000 },
  '2m_5m_eur': { min: 2_000_000, max: 5_000_000 },
  above_2m_eur: { min: 2_000_000 },
}

// ── Tipo de propiedad ────────────────────────────────────────────────────────
// Normaliza el valor almacenado (español o crudo EN) a la clave canónica EN
// que usa el query param `tipo` de /propiedades.
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
}

function normalizeType(tipo: string | null | undefined): string {
  const key = (tipo ?? '').trim().toLowerCase()
  return TYPE_NORMALIZE[key] ?? 'any'
}

const TYPE_PHRASE_EN: Record<string, string> = {
  villa: 'a villa',
  penthouse: 'a penthouse',
  townhouse: 'a townhouse',
  apartment: 'an apartment',
  any: 'a new build home',
}

/** Frase EN del tipo de propiedad (ej "a villa"). 'a new build home' si any/null. */
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

  const bounds = BUDGET_PRICE_BOUNDS[normalizeBudget(presupuestoRaw)]
  if (bounds?.min != null) params.set('precio_min', String(bounds.min))
  if (bounds?.max != null) params.set('precio_max', String(bounds.max))

  const typeKey = normalizeType(tipo)
  if (typeKey !== 'any') params.set('tipo', typeKey)

  return `${PROPERTIES_BASE_URL}?${params.toString()}`
}

// ── Purpose (Email 2) ────────────────────────────────────────────────────────
// Devuelve la clave de bloque a usar en Email 2 según el purpose del lead.
// Acepta el valor mapeado a español (lo que guarda el parser) y el crudo EN.
export type PurposeBlock = 'investment' | 'second_home' | 'neutral'

export function derivePurposeBlock(purpose: string | null | undefined): PurposeBlock {
  const key = (purpose ?? '').trim().toLowerCase()
  if (key === 'investment_rental_income' || key === 'inversión' || key === 'inversion') {
    return 'investment'
  }
  if (
    key === 'second_home_holiday_residence' ||
    key === 'segunda residencia'
  ) {
    return 'second_home'
  }
  // mix_of_the_above, primary_residence y cualquier otro → bloque neutro
  return 'neutral'
}

// ── First name ───────────────────────────────────────────────────────────────
/** Primer nombre de `nombre`; 'there' si vacío. Igual criterio que el welcome. */
export function firstNameFrom(nombre: string | null | undefined): string {
  const trimmed = (nombre ?? '').trim()
  if (!trimmed) return 'there'
  return trimmed.split(/\s+/)[0]
}
