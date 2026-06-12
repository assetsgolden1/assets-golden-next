import { MetaLeadRaw } from './leadsApi'

export interface ParsedMetaLead {
  meta_lead_id: string
  fecha: string
  nombre: string
  email: string
  telefono: string
  tipo_propiedad: string
  presupuesto: string
  timeline: string
  purpose: string
  variante: string
}

function extractField(
  fieldData: Array<{ name: string; values: string[] }>,
  ...keys: string[]
): string {
  for (const key of keys) {
    const field = fieldData.find(f => f.name.toLowerCase() === key.toLowerCase())
    if (field?.values?.[0]) return field.values[0]
  }
  return ''
}

const PROPERTY_TYPE_MAP: Record<string, string> = {
  apartment: 'Apartamento',
  villa: 'Villa',
  penthouse: 'Penthouse',
  townhouse: 'Townhouse',
  any: 'Cualquier tipo',
}

const BUDGET_MAP: Record<string, string> = {
  under_300k_eur: '< 300K EUR',
  '300k_500k_eur': '300K - 500K EUR',
  '500k_1m_eur': '500K - 1M EUR',
  '1m_2m_eur': '1M - 2M EUR',
  '2m_5m_eur': '2M - 5M EUR',
  above_2m_eur: 'Más de 2M EUR',
}

const TIMELINE_MAP: Record<string, string> = {
  within_3_months: 'En 3 meses',
  '3_to_6_months': '3 a 6 meses',
  '6_to_12_months': '6 a 12 meses',
  more_than_12_months: 'Más de 12 meses',
  just_exploring: 'Solo explorando',
}

const PURPOSE_MAP: Record<string, string> = {
  second_home_holiday_residence: 'Segunda residencia',
  investment_rental_income: 'Inversión',
  mix_of_the_above: 'Mix (residencia + inversión)',
  primary_residence: 'Residencia principal',
}

function mapValue(raw: string, map: Record<string, string>): string {
  if (!raw) return raw
  const key = raw.toLowerCase().replace(/[\s-]/g, '_')
  return map[key] ?? raw
}

function extractVariant(adName?: string): string {
  if (!adName) return ''
  const match = adName.match(/[Cc]arousel[-_]([A-Za-z])/i)
  if (match) return `Carrusel ${match[1].toUpperCase()}`
  // fallback: letter at end of name segment e.g. "...EN-v1-A"
  const fallback = adName.match(/[-_]([A-Za-z])(?:[-_]|$)/)
  return fallback ? `Carrusel ${fallback[1].toUpperCase()}` : ''
}

export function parseMetaLead(raw: MetaLeadRaw): ParsedMetaLead {
  const { id, field_data, created_time, ad_name } = raw

  const fecha = new Date(created_time).toLocaleString('es-ES', {
    timeZone: 'Europe/Madrid',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const nombre =
    extractField(field_data, 'full_name') ||
    [extractField(field_data, 'first_name'), extractField(field_data, 'last_name')]
      .filter(Boolean)
      .join(' ') ||
    extractField(field_data, 'name')

  const email = extractField(field_data, 'email')
  const telefono = extractField(field_data, 'phone_number', 'phone')

  const rawPropertyType = extractField(
    field_data,
    "what_type_of_property_are_you_looking_for?",
    "what type of property are you looking for?",
    'property_type',
    'type of property',
  )

  const rawBudget = extractField(
    field_data,
    "what's_your_budget_range?",
    "what's your budget range?",
    'budget_range',
    'budget',
  )

  const rawTimeline = extractField(
    field_data,
    "when_are_you_planning_to_buy?",
    "when are you planning to buy?",
    'timeline',
    'when_to_buy',
  )

  const rawPurpose = extractField(
    field_data,
    "what's_the_main_purpose?",
    "what's the main purpose?",
    'main_purpose',
    'purpose',
  )

  return {
    meta_lead_id: id,
    fecha,
    nombre,
    email,
    telefono,
    tipo_propiedad: mapValue(rawPropertyType, PROPERTY_TYPE_MAP),
    presupuesto: mapValue(rawBudget, BUDGET_MAP),
    timeline: mapValue(rawTimeline, TIMELINE_MAP),
    purpose: mapValue(rawPurpose, PURPOSE_MAP),
    variante: extractVariant(ad_name),
  }
}
