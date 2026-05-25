const LINK_MAP_ES: Record<string, string> = {
  'Costa del Sol': '/destinos/espana?zona=costa-del-sol',
  'Costa Blanca': '/destinos/espana?zona=costa-blanca',
  'Costa Cálida': '/destinos/espana?zona=costa-calida',
  'Marbella': '/propiedades?pais=Espa%C3%B1a&ciudad=Marbella',
  'Estepona': '/propiedades?pais=Espa%C3%B1a&ciudad=Estepona',
  'Tulum': '/propiedades?pais=M%C3%A9xico&ciudad=Tulum',
  'Dubai': '/propiedades?pais=Emiratos+%C3%81rabes+Unidos',
  'Grecia': '/destinos/grecia',
}

const LINK_MAP_EN: Record<string, string> = {
  'Costa del Sol': '/destinos/espana?zona=costa-del-sol',
  'Costa Blanca': '/destinos/espana?zona=costa-blanca',
  'Marbella': '/propiedades?pais=Espa%C3%B1a&ciudad=Marbella',
  'Estepona': '/propiedades?pais=Espa%C3%B1a&ciudad=Estepona',
  'Tulum': '/propiedades?pais=M%C3%A9xico&ciudad=Tulum',
  'Dubai': '/propiedades?pais=Emiratos+%C3%81rabes+Unidos',
  'Greece': '/destinos/grecia',
}

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

    // Skip if the match falls inside an existing <a> or <h1>–<h6> tag
    if (isInsideProtectedTag(result, idx)) continue

    result = result.replace(
      regex,
      `$1<a href="${url}" class="text-gold underline underline-offset-2 hover:opacity-80 transition-opacity">$2</a>$3`,
    )
  }

  return result
}
