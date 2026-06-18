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

// Los títulos de propiedad se guardan en español en la DB con el patrón
// "{Tipo} en {Ciudad}" (auto-generado por el sync). En la vista EN se
// traduce SOLO el tipo (prefijo); la ciudad se deja tal cual. Claves
// normalizadas a minúscula y sin acentos.
const TITLE_TYPE_EN: Record<string, string> = {
  apartamento: 'Apartment',
  piso: 'Apartment',
  villa: 'Villa',
  chalet: 'Villa',
  atico: 'Penthouse',
  penthouse: 'Penthouse',
  adosado: 'Townhouse',
  casa: 'House',
  duplex: 'Duplex',
  estudio: 'Studio',
  bungalow: 'Bungalow',
  finca: 'Country house',
  terreno: 'Plot',
  parcela: 'Plot',
  local: 'Commercial unit',
}

export function translatePropertyTitle(title: string, locale = 'es'): string {
  // Solo en EN; en ES (o cualquier otro) se devuelve el título tal cual.
  if (locale !== 'en' || !title) return title
  const m = title.match(/^(.+?)\s+en\s+(.+)$/i)
  if (!m) return title
  const typeKey = m[1]
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
  const en = TITLE_TYPE_EN[typeKey]
  if (!en) return title
  return `${en} in ${m[2].trim()}`
}
