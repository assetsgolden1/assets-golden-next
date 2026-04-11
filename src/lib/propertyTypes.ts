export const propertyTypeMap: Record<string, string> = {
  apartment: 'Apartamento',
  villa: 'Villa',
  penthouse: 'Ático',
  house: 'Casa',
  ground_floor: 'Planta baja',
  'ground-floor': 'Planta baja',
  townhouse: 'Adosado',
  land: 'Terreno',
  building: 'Edificio',
  rural: 'Finca rural',
  finca_rural: 'Finca rural',
  'finca rural': 'Finca rural',
  warehouse: 'Local / Nave',
  business: 'Traspaso',
  hotel: 'Hotel',
  other: 'Otro',
}

export function translatePropertyType(type: string | null | undefined): string {
  if (!type) return 'Propiedad'
  return propertyTypeMap[type.toLowerCase()] ?? type
}

const titlePrefixes: Record<string, string> = {
  'Apartment': 'Apartamento',
  'Penthouse': 'Ático',
  'Ground-floor': 'Planta baja',
  'Ground floor': 'Planta baja',
  'Villa': 'Villa',
  'House': 'Casa',
  'Studio': 'Estudio',
  'Duplex': 'Dúplex',
  'Townhouse': 'Adosado',
}

export function translatePropertyTitle(title: string): string {
  for (const [en, es] of Object.entries(titlePrefixes)) {
    if (title.startsWith(en)) return title.replace(en, es)
  }
  return title
}
