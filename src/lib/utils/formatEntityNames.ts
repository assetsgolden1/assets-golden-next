// Palabras que NO deben ir en mayúsculas pese a ser cortas.
const LOWER_WORDS = new Set(['of', 'and', 'the', 'de', 'la', 'las', 'los', 'del', 'y', 'at'])

/**
 * Siglas presentes en el feed, enumeradas a mano. NO vale la regla "token corto
 * = sigla": rompe apellidos reales (`carlos_ott` daría "Carlos OTT").
 */
const ACRONYMS = new Set([
  // promotoras
  'pmg', 'oko', 'jmh', 'jds', 'cmc', 'bh', 'mg', 'tc', 'vda', 'llc',
  // estudios de arquitectura
  'oma', 'as', 'gg', 'rn', 'am', 'dti', 'odp', 'hac', 'msa', 'rsp', 'fsmy',
])

/**
 * Sufijos societarios: van tras coma pero son parte del MISMO nombre
 * ("Metropica Developments, LLC"), no una segunda empresa.
 */
const LEGAL_SUFFIXES = new Set(['llc', 'inc', 'inc.', 'corp', 'corp.', 'ltd', 'ltd.', 'sa', 's.a.'])

function cap(w: string): string {
  return w.charAt(0).toUpperCase() + w.slice(1)
}

/**
 * Los campos `developer` y `architect` del feed de Cervera vienen como slugs
 * (`sieger_suarez_architects,carlos_ott`) y se colaban crudos en las
 * descripciones publicadas ("promovida por pmg"). Los convierte a nombres
 * legibles: "Sieger Suarez Architects y Carlos Ott".
 *
 * - Valores ya formateados en la fuente se respetan tal cual:
 *   "Kar Properties", "CUBE 3", "The John Buck Company + FVP".
 * - Siglas cortas en mayúsculas (pmg → PMG, oma → OMA, grupo_tc → Grupo TC).
 * - Conserva guiones internos: bernardo_fort-brescia → Bernardo Fort-Brescia.
 * - Une varios nombres con "y" (es) / "and" (en).
 */
export function formatEntityNames(raw: string, lang: 'es' | 'en'): string {
  const chunks = raw.split(',').map((s) => s.trim()).filter(Boolean)
  // Reune el sufijo societario con el nombre que lo precede.
  const merged: string[] = []
  for (const chunk of chunks) {
    if (merged.length && LEGAL_SUFFIXES.has(chunk.toLowerCase())) {
      merged[merged.length - 1] += `, ${chunk}`
    } else {
      merged.push(chunk)
    }
  }
  const parts = merged
    .map((name) => {
      // Ya formateado a mano en la fuente → no tocar.
      if (/\s/.test(name) || /[A-Z]/.test(name)) return name
      return name
        .split('_')
        .filter(Boolean)
        .map((word, i) => {
          if (/\d/.test(word)) return word
          if (LOWER_WORDS.has(word)) return i === 0 ? cap(word) : word
          // Iniciales sueltas (s_e_architects) y siglas conocidas.
          if (word.length === 1 || ACRONYMS.has(word)) return word.toUpperCase()
          // Capitaliza también después de guion (fort-brescia → Fort-Brescia).
          return word.split('-').map(cap).join('-')
        })
        .join(' ')
    })
  if (parts.length <= 1) return parts[0] ?? ''
  const last = parts.pop() as string
  return `${parts.join(', ')}${lang === 'es' ? ' y ' : ' and '}${last}`
}
