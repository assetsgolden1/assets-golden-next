const COUNTRY_MAP: Record<string, string> = {
  'España': 'Spain',
  'Estados Unidos': 'United States',
  'Reino Unido': 'United Kingdom',
  'Emiratos Árabes Unidos': 'United Arab Emirates',
  'Costa Rica': 'Costa Rica',
  'México': 'Mexico',
  'Argentina': 'Argentina',
  'Grecia': 'Greece',
  'Indonesia': 'Indonesia',
  'Ecuador': 'Ecuador',
  'Paraguay': 'Paraguay',
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
}

export function translateCountry(country: string, locale: string): string {
  if (locale !== 'en') return country
  return COUNTRY_MAP[country] ?? country
}

export function translateProvince(province: string, locale: string): string {
  if (locale !== 'en') return province
  return PROVINCE_MAP[province] ?? province
}
