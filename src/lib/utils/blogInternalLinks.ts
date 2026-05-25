const LINK_MAP_ES: Record<string, string> = {
  'Costa del Sol': '/destinos/espana?zona=costa-del-sol',
  'Costa Blanca': '/destinos/espana?zona=costa-blanca',
  'Costa Cálida': '/destinos/espana?zona=costa-calida',
  'Marbella': '/propiedades?pais=Espa%C3%B1a&ciudad=Marbella',
  'Estepona': '/propiedades?pais=Espa%C3%B1a&ciudad=Estepona',
  'Tulum': '/propiedades?pais=M%C3%A9xico&ciudad=Tulum',
  'Dubai': '/propiedades?pais=Emiratos+%C3%81rabes+Unidos',
  'Grecia': '/destinos/grecia',
  'Emiratos Árabes Unidos': '/destinos/emiratos-arabes-unidos',
}

const LINK_MAP_EN: Record<string, string> = {
  'Costa del Sol': '/destinos/espana?zona=costa-del-sol',
  'Costa Blanca': '/destinos/espana?zona=costa-blanca',
  'Marbella': '/propiedades?pais=Espa%C3%B1a&ciudad=Marbella',
  'Estepona': '/propiedades?pais=Espa%C3%B1a&ciudad=Estepona',
  'Tulum': '/propiedades?pais=M%C3%A9xico&ciudad=Tulum',
  'Dubai': '/propiedades?pais=Emiratos+%C3%81rabes+Unidos',
  'Greece': '/destinos/grecia',
  'United Arab Emirates': '/destinos/emiratos-arabes-unidos',
}

/**
 * Compound proper nouns and institutional names that must NOT be partially linked.
 * E.g. "Dubai Land Department" — linking only "Dubai" breaks the compound name.
 */
const PROTECTED_PHRASES: string[] = [
  // Dubai compounds
  'Dubai Land Department',
  'Dubai Marina',
  'Dubai Hills',
  'Dubai Hills Estate',
  'Dubai Internet City',
  'Dubai Media City',
  'Dubai Investments Park',
  'Dubai South',
  'Dubai Creek',
  'Dubai Creek Harbour',
  'Dubai Silicon Oasis',
  'Dubai Festival City',
  'Dubai Sports City',
  'Dubai Healthcare City',
  'Downtown Dubai',
  // Spain institutional names
  'Banco de España',
  'Colegio de Registradores',
  'Costa del Sol Tourism Board',
  'Costa del Sol Hospital',
  'Costa del Sol Airport',
  'Costa Blanca Tourism Board',
  // Marbella compounds (incluye las que contienen "Marbella" como término linkeable)
  'Las Lomas Marbella Club',
  'Marbella Club',
  'Marbella Club Hotel',
  'Marbella Town Hall',
  'Marbella Country Club',
  // Marbella micro-zonas (defensivo: no contienen término linkeable pero documentan nomenclatura)
  'Sierra Blanca',
  'Altos Reales',
  'Puerto Banús',
  'Golden Mile',
  'Nueva Andalucía',
  'Valle del Golf',
  // Other destination compounds
  'Tulum Country Club',
  'Tulum National Park',
]

/**
 * Capitalized words that, when immediately following a trigger term (separated by
 * whitespace), indicate the trigger is part of a compound proper noun.
 * Only evaluated when the separator ($3) is whitespace.
 */
const INSTITUTIONAL_SUFFIXES: string[] = [
  'Land', 'Authority', 'Department', 'Board', 'Council',
  'Hospital', 'Airport', 'Club', 'Hotel', 'Tower', 'Tourism',
  'Properties', 'Realty', 'Estate', 'Marina', 'Hills', 'Creek',
  'Harbour', 'Harbor', 'Bay', 'City', 'Park', 'Centre', 'Center',
  'Group', 'Holdings', 'Investments', 'Trust', 'Bank',
  'Town', 'Country', 'National', 'International',
  'Foundation', 'Institute', 'Federation', 'Association',
  'Registry', 'Registrar', 'Commission', 'Ministry',
]

/**
 * Returns true if the character at position `pos` in `html` falls inside
 * an open <a> tag or an open <h1>–<h6> tag.
 *
 * Strategy: count opening vs. closing tags in the prefix up to `pos`.
 * An unclosed open tag means we are currently inside it.
 */
function isInsideProtectedTag(html: string, pos: number): boolean {
  const before = html.slice(0, pos)

  // Unclosed <a …> / </a> pairs
  const openA  = (before.match(/<a[\s>]/gi) ?? []).length
  const closeA = (before.match(/<\/a>/gi)   ?? []).length
  if (openA > closeA) return true

  // Unclosed <h1>–<h6> / </h1>–</h6> pairs
  const openH  = (before.match(/<h[1-6][^>]*>/gi) ?? []).length
  const closeH = (before.match(/<\/h[1-6]>/gi)    ?? []).length
  if (openH > closeH) return true

  return false
}

/**
 * Returns true if the matched trigger term is part of a compound proper noun
 * and therefore should NOT be wrapped in a link.
 *
 * Two checks are combined:
 *  1. PROTECTED_PHRASES — scan a ±50-char context window around the match for
 *     any phrase that contains the trigger. Case-insensitive.
 *  2. INSTITUTIONAL_SUFFIXES — if the character immediately after the trigger
 *     ($3 group) is whitespace, check whether the next word is a known suffix
 *     (e.g. "Land", "Department", "Marina"…). Only applied when $3 is whitespace
 *     so it doesn't fire on "Dubai," or "Dubai.".
 */
function isPartOfCompoundProper(
  html: string,
  matchIndex: number,
  matchLength: number,
  term: string,
  followChar: string,
): boolean {
  // 1. PROTECTED_PHRASES context-window check
  const windowStart = Math.max(0, matchIndex - 10)
  const windowEnd   = Math.min(html.length, matchIndex + matchLength + 50)
  const context     = html.slice(windowStart, windowEnd)

  for (const phrase of PROTECTED_PHRASES) {
    if (phrase.toLowerCase().includes(term.toLowerCase())) {
      if (context.toLowerCase().includes(phrase.toLowerCase())) {
        return true
      }
    }
  }

  // 2. INSTITUTIONAL_SUFFIXES — only when the separator after the term is whitespace
  if (/\s/.test(followChar)) {
    // Grab up to 40 chars after the full match to find the next word
    const afterMatch = html.slice(matchIndex + matchLength, matchIndex + matchLength + 40)
    const nextWordMatch = afterMatch.match(/^\s*([A-Z][a-zA-Záéíóúüñ]*)/)
    if (nextWordMatch) {
      const nextWord = nextWordMatch[1]
      if (INSTITUTIONAL_SUFFIXES.includes(nextWord)) {
        return true
      }
    }
  }

  return false
}

export function addInternalLinks(html: string, language: 'es' | 'en' = 'es'): string {
  const linkMap = language === 'en' ? LINK_MAP_EN : LINK_MAP_ES
  let result = html

  for (const [term, url] of Object.entries(linkMap)) {
    // Match term preceded by >, whitespace; followed by whitespace, <, or punctuation.
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`([>\\s])(${escaped})([\\s<,\\.;:])`, 'i')
    const match = result.match(regex)
    if (!match) continue

    const idx = result.indexOf(match[0])

    // idx points to the first char of match[0], which is the $1 group
    // (either `>` or whitespace). We use idx+1 so the "before" slice
    // includes that character — critical when $1 is `>` from an opening
    // tag like <h3> or <a href="...">, otherwise the closing `>` is
    // excluded and the tag-counting regex won't detect it as open.
    if (isInsideProtectedTag(result, idx + 1)) continue

    // The term itself starts at idx+1 (after the $1 group char) and has length term.length
    const termStart  = idx + 1
    const followChar = match[3] // $3 group — char immediately after the term

    if (isPartOfCompoundProper(result, termStart, term.length, term, followChar)) continue

    result = result.replace(
      regex,
      `$1<a href="${url}" class="text-gold underline underline-offset-2 hover:opacity-80 transition-opacity">$2</a>$3`,
    )
  }

  return result
}
