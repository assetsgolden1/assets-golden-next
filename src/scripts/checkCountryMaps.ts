/**
 * Verifica que todo país presente en la BD esté en los mapas de geografía.
 *
 * Por qué existe: Brasil se cargó el 26/07/2026 y nadie lo añadió a
 * `translateGeography`. Durante un mes las fichas brasileñas publicaron
 * `addressCountry: "ES"` (el fallback silencioso de entonces) y en inglés el
 * país salía "Brasil". No falló ningún build ni ningún test: se descubrió por
 * casualidad revisando otra cosa. Este script convierte ese hueco silencioso
 * en un fallo ruidoso.
 *
 * Uso:
 *   npm run check-geo
 *
 * Sale con código 1 si falta algún país, para poder engancharlo a CI o
 * ejecutarlo después de una carga grande.
 */

import { createClient } from '@supabase/supabase-js'
import { mappedCountries } from '../lib/utils/translateGeography'
import { SERVED_COUNTRIES } from '../components/seo/GlobalSchemaOrg'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

async function main() {
  const db = createClient(url!, key!)

  // Solo los países del catálogo publicado: una propiedad oculta con un país
  // raro no justifica romper el build.
  const { data, error } = await db
    .from('properties')
    .select('country')
    .in('status', ['active', 'available'])
    .not('hidden', 'is', true)
    .not('hidden_by_sync', 'is', true)
    .not('country', 'is', null)
    .limit(10000)

  if (error) {
    console.error('Error consultando la BD:', error.message)
    process.exit(1)
  }

  const enBD = [...new Set((data ?? []).map((p) => (p.country ?? '').trim()).filter(Boolean))].sort()
  const { iso, en } = mappedCountries()

  const faltan = {
    iso: enBD.filter((c) => !iso.includes(c)),
    en: enBD.filter((c) => !en.includes(c)),
    served: enBD.filter((c) => !SERVED_COUNTRIES.includes(c)),
  }

  console.log(`Países en el catálogo publicado: ${enBD.length}`)
  console.log(`  ${enBD.join(' · ')}\n`)

  const problemas: string[] = []
  if (faltan.iso.length) problemas.push(`COUNTRY_ISO (translateGeography.ts): ${faltan.iso.join(', ')}`)
  if (faltan.en.length) problemas.push(`COUNTRY_MAP (translateGeography.ts): ${faltan.en.join(', ')}`)
  if (faltan.served.length) problemas.push(`SERVED_COUNTRIES (GlobalSchemaOrg.tsx): ${faltan.served.join(', ')}`)

  if (problemas.length === 0) {
    console.log('OK — los 3 mapas cubren todos los países del catálogo.')
    return
  }

  console.error('FALTAN PAÍSES EN LOS MAPAS:\n')
  for (const p of problemas) console.error(`  - ${p}`)
  console.error(
    '\nConsecuencias si se deja así:' +
      '\n  - COUNTRY_ISO: la ficha omite addressCountry en el JSON-LD.' +
      '\n  - COUNTRY_MAP: el país se muestra en español dentro de la web en inglés.' +
      '\n  - SERVED_COUNTRIES: el país no aparece en areaServed del schema de empresa.'
  )
  // `exitCode` en vez de `process.exit()`: salir de golpe con el cliente de
  // Supabase todavía abierto dispara una assertion de libuv en Windows.
  process.exitCode = 1
}

main()
