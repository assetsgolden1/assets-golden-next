import { MetaLeadRaw } from './leadsApi'

export interface ParsedMetaLead {
  fecha: string
  nombre: string
  email: string
  telefono: string
  tipo_propiedad: string
  presupuesto: string
  timeline: string
  purpose: string
  variante: string
  estado: string
}

function extractField(
  fieldData: Array<{ name: string; values: string[] }>,
  key: string,
): string {
  const field = fieldData.find(f => f.name.toLowerCase() === key.toLowerCase())
  return field?.values?.[0] ?? ''
}

// Deduce variant letter (A/B/C) from ad_name, e.g. "Marbella-Leads-EN-v1-A"
function extractVariant(adName?: string): string {
  if (!adName) return ''
  const match = adName.match(/[-_\s]([A-Ca-c])(?:[-_\s]|$)/)
  return match ? match[1].toUpperCase() : ''
}

export function parseMetaLead(raw: MetaLeadRaw): ParsedMetaLead {
  const { field_data, created_time, ad_name } = raw

  const fecha = new Date(created_time).toLocaleString('es-ES', {
    timeZone: 'Europe/Madrid',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const nombre =
    extractField(field_data, 'full_name') ||
    extractField(field_data, 'first_name') ||
    extractField(field_data, 'name')

  const email = extractField(field_data, 'email')
  const telefono =
    extractField(field_data, 'phone_number') ||
    extractField(field_data, 'phone')

  return {
    fecha,
    nombre,
    email,
    telefono,
    tipo_propiedad: extractField(field_data, 'type of property'),
    presupuesto: extractField(field_data, 'budget'),
    timeline: extractField(field_data, 'timeline'),
    purpose: extractField(field_data, 'purpose'),
    variante: extractVariant(ad_name),
    estado: '',
  }
}
