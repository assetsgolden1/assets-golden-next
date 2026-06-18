/**
 * Construye los alternates (canonical + hreflang) de una página bilingüe.
 *
 * @param path   Ruta ES (sin prefijo de idioma). Ej: '/propiedades'
 * @param locale Idioma de la página ACTUAL ('es' | 'en'). Determina el
 *               canonical self-referencing: ES canonicaliza a su URL sin
 *               prefijo y EN a su URL con /en (antes ambos apuntaban al ES).
 *
 * `languages` (hreflang) siempre apunta a AMBAS versiones; x-default va al ES.
 */
export function buildAlternates(path: string, locale: string = 'es') {
  const enPath = path === '/' ? '/en' : `/en${path}`
  return {
    canonical: locale === 'en' ? enPath : path,
    languages: {
      es: path,
      en: enPath,
      'x-default': path,
    },
  }
}
