const LOCATION_CORRECTIONS: Record<string, string> = {
  // Argentina
  'buenos aires': 'Buenos Aires',
  'buenosaires': 'Buenos Aires',
  'bs as': 'Buenos Aires',
  'bs aires': 'Buenos Aires',
  'tucuman': 'Tucumán',
  'córdoba': 'Córdoba',
  'cordoba': 'Córdoba',
  'mendoza': 'Mendoza',
  // España
  'malaga': 'Málaga',
  'málaga': 'Málaga',
  'cadiz': 'Cádiz',
  'cádiz': 'Cádiz',
  'almeria': 'Almería',
  'almería': 'Almería',
  'barcelona': 'Barcelona',
  'madrid': 'Madrid',
  'valencia': 'Valencia',
  'alicante': 'Alicante',
  'sevilla': 'Sevilla',
  'marbella': 'Marbella',
  'estepona': 'Estepona',
  'fuengirola': 'Fuengirola',
  'mallorca': 'Mallorca',
  'ibiza': 'Ibiza',
  // México
  'tulum': 'Tulum',
  'cancun': 'Cancún',
  'cancún': 'Cancún',
  'ciudad de mexico': 'Ciudad de México',
  'ciudad de méxico': 'Ciudad de México',
  'cdmx': 'Ciudad de México',
  'playa del carmen': 'Playa del Carmen',
  // Dubai
  'dubai': 'Dubai',
  'abu dhabi': 'Abu Dhabi',
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function normalizeLocation(location: string): string {
  if (!location) return 'Sin ciudad'
  const key = location.toLowerCase().trim()
  return LOCATION_CORRECTIONS[key] ?? toTitleCase(location.trim())
}
