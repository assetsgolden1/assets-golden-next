export const SPAIN_COASTAL_ZONES: Record<string, string> = {
  // Costa del Sol
  'Málaga': 'Costa del Sol',
  'Marbella': 'Costa del Sol',
  'Estepona': 'Costa del Sol',
  'Fuengirola': 'Costa del Sol',
  'Torremolinos': 'Costa del Sol',
  'Nerja': 'Costa del Sol',
  'Benalmádena': 'Costa del Sol',
  'Mijas': 'Costa del Sol',
  'Manilva': 'Costa del Sol',
  'Sotogrande': 'Costa del Sol',
  // Costa Cálida
  'Almería': 'Costa Cálida',
  'Cartagena': 'Costa Cálida',
  'Murcia': 'Costa Cálida',
  'Mojácar': 'Costa Cálida',
  'Vera': 'Costa Cálida',
  'Pulpí': 'Costa Cálida',
  // Costa Blanca
  'Alicante': 'Costa Blanca',
  'Valencia': 'Costa Blanca',
  'Benidorm': 'Costa Blanca',
  'Torrevieja': 'Costa Blanca',
  'Denia': 'Costa Blanca',
  'Jávea': 'Costa Blanca',
  'Altea': 'Costa Blanca',
  'Calpe': 'Costa Blanca',
  'Castellón': 'Costa Blanca',
  // Cataluña
  'Barcelona': 'Cataluña',
  'Girona': 'Cataluña',
  'Sitges': 'Cataluña',
  'Tarragona': 'Cataluña',
  'Lloret de Mar': 'Cataluña',
  'Castelldefels': 'Cataluña',
  // Madrid
  'Madrid': 'Madrid',
  // Islas Baleares
  'Mallorca': 'Islas Baleares',
  'Ibiza': 'Islas Baleares',
  'Menorca': 'Islas Baleares',
  'Formentera': 'Islas Baleares',
  // Granada / Costa Tropical
  'Granada': 'Costa Tropical',
  'Motril': 'Costa Tropical',
  // Cádiz / Costa de la Luz
  'Cádiz': 'Costa de la Luz',
  'Jerez': 'Costa de la Luz',
  'Chiclana': 'Costa de la Luz',
  'Conil': 'Costa de la Luz',
}

export function getSpainZone(city: string): string | null {
  return SPAIN_COASTAL_ZONES[city] ?? null
}
