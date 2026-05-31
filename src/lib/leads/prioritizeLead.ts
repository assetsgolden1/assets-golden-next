/**
 * Lógica de priorización de leads para el Sheet de seguimiento.
 * Reutilizable tanto en el script one-shot como en la sincronización automática Meta API.
 */

// Dominios de email gratuitos / de consumo
export const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com', 'yahoo.es', 'yahoo.co.uk', 'yahoo.de', 'yahoo.fr', 'yahoo.it', 'yahoo.com.ar',
  'hotmail.com', 'hotmail.es', 'hotmail.co.uk', 'hotmail.de', 'hotmail.fr',
  'outlook.com', 'outlook.es',
  'live.com', 'msn.com',
  'web.de', 'gmx.de', 'gmx.com', 'gmx.net', 'gmx.at',
  'icloud.com', 'me.com', 'mac.com',
])

// ISO 3166-1 alpha-2 → prefijo(s) de teléfono esperado(s)
export const COUNTRY_PHONE_PREFIXES: Record<string, string[]> = {
  GB: ['+44'],
  DE: ['+49'],
  SE: ['+46'],
  DK: ['+45'],
  NO: ['+47'],
  FI: ['+358'],
  PK: ['+92'],
  IN: ['+91'],
  ES: ['+34'],
  FR: ['+33'],
  IT: ['+39'],
  NL: ['+31'],
  BE: ['+32'],
  AT: ['+43'],
  CH: ['+41'],
  US: ['+1'],
  CA: ['+1'],
  AU: ['+61'],
  AE: ['+971'],
  MX: ['+52'],
  AR: ['+54'],
  CO: ['+57'],
  BR: ['+55'],
}

// Mapeo de nivel presupuesto (1=bajo … 5=altísimo) para comparaciones
const BUDGET_LEVELS: Record<string, number> = {
  '< 300K EUR': 1,
  '300K - 500K EUR': 2,
  '500K - 1M EUR': 3,
  '1M - 2M EUR': 4,
  '2M - 5M EUR': 5,
  '2M+ EUR': 5,
  'Más de 2M EUR': 5,
}

export function getBudgetLevel(presupuesto: string): number {
  return BUDGET_LEVELS[presupuesto] ?? 2
}

export interface LeadInput {
  email: string
  telefono: string
  tipo_propiedad: string
  presupuesto: string
  timeline: string
  purpose: string
  /** ISO 3166-1 alpha-2 del país detectado por Meta (opcional) */
  country?: string
}

function isCorporateEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase() ?? ''
  return !FREE_EMAIL_DOMAINS.has(domain)
}

function hasPhoneCountryMismatch(telefono: string, country?: string): boolean {
  if (!country) return false
  const expected = COUNTRY_PHONE_PREFIXES[country.toUpperCase()]
  if (!expected) return false
  return !expected.some(prefix => telefono.startsWith(prefix))
}

/**
 * Clasifica un lead como 'Alta', 'Media' o 'Baja' según criterios objetivos.
 *
 * REGLA 1 (Alta): timeline ≤ 3 meses, O presupuesto ≥ 1M EUR,
 *                 O email corporativo + timeline ≤ 6 meses.
 * REGLA 2 (Baja): purpose=Mix, O explorando+budget<500K,
 *                 O inconsistencia país/teléfono,
 *                 O email gratuito+Villa+budget≤500K.
 * REGLA 3 (Media): todo lo demás.
 */
export function categorizeLead(lead: LeadInput): 'Alta' | 'Media' | 'Baja' {
  const corporate = isCorporateEmail(lead.email)
  const budgetLevel = getBudgetLevel(lead.presupuesto)
  const timelineLc = lead.timeline.toLowerCase()
  const isUrgent = timelineLc.includes('3 meses') || timelineLc.includes('3 months')
  const isMediumTimeline = timelineLc.includes('3 a 6') || timelineLc.includes('3 to 6')
  const isExploring = timelineLc.includes('explorando') || timelineLc.includes('exploring')
  const isMix = lead.purpose.toLowerCase().startsWith('mix')

  // REGLA 1 — Alta
  if (isUrgent) return 'Alta'
  if (budgetLevel >= 4) return 'Alta'
  if (corporate && isMediumTimeline) return 'Alta'

  // REGLA 2 — Baja
  if (isMix) return 'Baja'
  if (isExploring && budgetLevel < 3) return 'Baja'
  if (hasPhoneCountryMismatch(lead.telefono, lead.country)) return 'Baja'
  if (!corporate && lead.tipo_propiedad.toLowerCase() === 'villa' && budgetLevel <= 2) return 'Baja'

  return 'Media'
}

/**
 * Devuelve una nota especial para la columna Estado, o null si no aplica.
 * Actualmente detecta inconsistencia país/teléfono.
 */
export function getSpecialStateNotes(lead: LeadInput): string | null {
  if (hasPhoneCountryMismatch(lead.telefono, lead.country)) {
    return 'Validar por WhatsApp antes de llamar'
  }
  return null
}
