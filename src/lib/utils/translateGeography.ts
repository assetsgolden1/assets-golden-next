const COUNTRY_MAP: Record<string, string> = {
  'España': 'Spain',
  'Estados Unidos': 'United States',
  'Reino Unido': 'United Kingdom',
  'Emiratos Árabes Unidos': 'United Arab Emirates',
  'Costa Rica': 'Costa Rica',
  'México': 'Mexico',
  'Argentina': 'Argentina',
  'Brasil': 'Brazil',
  'Grecia': 'Greece',
  'Indonesia': 'Indonesia',
  'Ecuador': 'Ecuador',
  'Paraguay': 'Paraguay',
  'República Dominicana': 'Dominican Republic',
}

const PROVINCE_MAP: Record<string, string> = {
  'Andalucía': 'Andalusia',
  'Cataluña': 'Catalonia',
  'Islas Baleares': 'Balearic Islands',
  'País Vasco': 'Basque Country',
  'Comunidad Valenciana': 'Valencian Community',
  'Castilla y León': 'Castile and León',
  'Castilla-La Mancha': 'Castile-La Mancha',
  'Canarias': 'Canary Islands',
  'Aragón': 'Aragon',
  'Navarra': 'Navarre',
  'Málaga': 'Malaga',
  'Almería': 'Almeria',
  'Cádiz': 'Cadiz',
  'Córdoba': 'Cordoba',
}

const COUNTRY_ISO: Record<string, string> = {
  'España': 'ES',
  'México': 'MX',
  'Indonesia': 'ID',
  'Emiratos Árabes Unidos': 'AE',
  'Argentina': 'AR',
  'Brasil': 'BR',
  'Estados Unidos': 'US',
  'Grecia': 'GR',
  'Ecuador': 'EC',
  'Costa Rica': 'CR',
  'Paraguay': 'PY',
  'Reino Unido': 'GB',
  'República Dominicana': 'DO',
}

export function translateCountry(country: string, locale: string): string {
  if (locale !== 'en') return country
  return COUNTRY_MAP[country] ?? country
}

export function translateProvince(province: string, locale: string): string {
  if (locale !== 'en') return province
  return PROVINCE_MAP[province] ?? province
}

/**
 * Código ISO del país, o `undefined` si no está mapeado.
 *
 * Antes caía a 'ES' por defecto. Brasil se cargó el 26/07 sin añadirse a estos
 * mapas y durante un mes las fichas brasileñas publicaron
 * `addressCountry: "ES"` sin que nada fallara: un dato falso es peor que un
 * dato ausente, y encima silencioso. Ahora devuelve `undefined` y quien llama
 * omite el campo. Para detectar el hueco antes de que llegue a producción,
 * `npm run check-geo` compara estos mapas contra los países reales de la BD.
 */
export function countryToISO(country: string): string | undefined {
  return COUNTRY_ISO[country]
}

/** Países mapeados. Lo usa el script de verificación. */
export function mappedCountries(): { iso: string[]; en: string[] } {
  return { iso: Object.keys(COUNTRY_ISO), en: Object.keys(COUNTRY_MAP) }
}
