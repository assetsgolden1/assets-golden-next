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

export function addInternalLinks(html: string, language: 'es' | 'en' = 'es'): string {
  const linkMap = language === 'en' ? LINK_MAP_EN : LINK_MAP_ES
  let result = html

  for (const [term, url] of Object.entries(linkMap)) {
    // Match term preceded by >, whitespace, or start; followed by whitespace, <, punctuation.
    // Skips terms already inside an <a> tag by checking that the preceding context is not href="
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`([>\\s])(${escaped})([\\s<,\\.;:])`, 'i')
    const match = result.match(regex)
    if (!match) continue

    // Don't link if the term is inside an existing <a href="...">
    const idx = result.indexOf(match[0])
    const before = result.slice(Math.max(0, idx - 20), idx)
    if (/href\s*=\s*["'][^"']*$/i.test(before)) continue

    result = result.replace(
      regex,
      `$1<a href="${url}" class="text-gold underline underline-offset-2 hover:opacity-80 transition-opacity">$2</a>$3`,
    )
  }

  return result
}
