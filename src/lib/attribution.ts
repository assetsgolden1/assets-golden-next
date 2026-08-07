/**
 * Atribución de campañas (WEB-ATRIB-1).
 *
 * Guarda en `sessionStorage` el origen con el que el visitante llegó a la web, para
 * poder distinguir un lead pagado de uno orgánico. Es **first-touch de la sesión**:
 * si después navega por el sitio, el origen NO se pisa.
 *
 * Todo vive en el cliente: no toca SSR/ISR ni añade dependencias.
 */

export const ATTRIBUTION_KEY = 'ag_attribution'

export interface Attribution {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_content: string | null
  fbclid: string | null
  landing_page: string | null
  referrer: string | null
}

const EMPTY: Attribution = {
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  utm_content: null,
  fbclid: null,
  landing_page: null,
  referrer: null,
}

/** Recorta y normaliza: evita guardar basura o valores gigantes en la BD. */
function clean(v: string | null): string | null {
  if (!v) return null
  const t = v.trim().slice(0, 200)
  return t.length ? t : null
}

/**
 * Lee la atribución guardada. Devuelve todos los campos en `null` si no hay nada,
 * de modo que el insert del lead funcione igual que hoy para tráfico orgánico.
 */
export function getAttribution(): Attribution {
  if (typeof window === 'undefined') return { ...EMPTY }
  try {
    const raw = window.sessionStorage.getItem(ATTRIBUTION_KEY)
    if (!raw) return { ...EMPTY }
    const parsed = JSON.parse(raw) as Partial<Attribution>
    return {
      utm_source: clean(parsed.utm_source ?? null),
      utm_medium: clean(parsed.utm_medium ?? null),
      utm_campaign: clean(parsed.utm_campaign ?? null),
      utm_content: clean(parsed.utm_content ?? null),
      fbclid: clean(parsed.fbclid ?? null),
      landing_page: clean(parsed.landing_page ?? null),
      referrer: clean(parsed.referrer ?? null),
    }
  } catch {
    return { ...EMPTY }
  }
}

/**
 * Captura los parámetros de la URL actual. Solo guarda si hay al menos un `utm_*`
 * o `fbclid`, y solo si NO había nada guardado (first-touch).
 * Devuelve true si escribió.
 */
export function captureAttribution(): boolean {
  if (typeof window === 'undefined') return false
  try {
    if (window.sessionStorage.getItem(ATTRIBUTION_KEY)) return false // first-touch: no pisar

    const q = new URLSearchParams(window.location.search)
    const data: Attribution = {
      utm_source: clean(q.get('utm_source')),
      utm_medium: clean(q.get('utm_medium')),
      utm_campaign: clean(q.get('utm_campaign')),
      utm_content: clean(q.get('utm_content')),
      fbclid: clean(q.get('fbclid')),
      landing_page: clean(window.location.pathname),
      referrer: clean(document.referrer),
    }

    const hasCampaign = Boolean(
      data.utm_source || data.utm_medium || data.utm_campaign || data.utm_content || data.fbclid,
    )
    if (!hasCampaign) return false // sin parámetros no se escribe nada

    window.sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(data))
    return true
  } catch {
    return false // sessionStorage bloqueado (modo privado): no romper la web
  }
}

/**
 * Etiqueta para la columna "Fuente" del Google Sheet: `{source}/{campaign}/{content}`.
 * Si no hay atribución devuelve `fallback` (el valor de siempre).
 */
export function attributionLabel(a: Attribution, fallback: string): string {
  const parts = [a.utm_source, a.utm_campaign, a.utm_content].filter(Boolean)
  if (!parts.length) return a.fbclid ? `meta/fbclid` : fallback
  return parts.join('/')
}
