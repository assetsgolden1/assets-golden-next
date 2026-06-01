export const propertyTypeMap: Record<string, { es: string; en: string }> = {
  apartment:    { es: 'Apartamento',   en: 'Apartment' },
  villa:        { es: 'Villa',         en: 'Villa' },
  penthouse:    { es: 'Ático',         en: 'Penthouse' },
  house:        { es: 'Casa',          en: 'House' },
  ground_floor: { es: 'Planta baja',   en: 'Ground floor' },
  'ground-floor':{ es: 'Planta baja',  en: 'Ground floor' },
  townhouse:    { es: 'Adosado',       en: 'Townhouse' },
  land:         { es: 'Terreno',       en: 'Land' },
  building:     { es: 'Edificio',      en: 'Building' },
  rural:        { es: 'Finca rural',   en: 'Rural property' },
  finca_rural:  { es: 'Finca rural',   en: 'Rural property' },
  'finca rural':{ es: 'Finca rural',   en: 'Rural property' },
  warehouse:    { es: 'Local / Nave',  en: 'Commercial premises' },
  business:     { es: 'Traspaso',      en: 'Business transfer' },
  hotel:        { es: 'Hotel',         en: 'Hotel' },
  other:        { es: 'Otro',          en: 'Other' },
}

export function translatePropertyType(type: string | null | undefined, locale = 'es'): string {
  if (!type) return locale === 'en' ? 'Property' : 'Propiedad'
  const entry = propertyTypeMap[type.toLowerCase()]
  if (!entry) return type
  return locale === 'en' ? entry.en : entry.es
}

const titlePrefixesEN: Record<string, string> = {
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

export function translatePropertyTitle(title: string, locale = 'es'): string {
  // In EN mode return title as-is (already in English from the feed)
  if (locale === 'en') return title
  for (const [en, es] of Object.entries(titlePrefixesEN)) {
    if (title.startsWith(en)) return title.replace(en, es)
  }
  return title
}
