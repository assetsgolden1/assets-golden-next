import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function isPlaceholder(url: string | null): boolean {
  if (!url) return true
  if (url.includes('unsplash.com')) return true
  if (url.includes('placeholder')) return true
  return false
}

export async function syncDestinations() {
  // Obtener países únicos de properties
  const { data: countries } = await supabaseAdmin
    .from('properties')
    .select('country')
    .not('country', 'is', null)
    .not('hidden', 'eq', true)

  if (!countries) return

  const uniqueCountries = [
    ...new Set(countries.map(c => c.country))
  ]

  let created = 0
  let updated = 0
  let skipped = 0

  for (const countryName of uniqueCountries) {
    // Buscar destino existente
    const { data: existing } = await supabaseAdmin
      .from('country_destinations')
      .select('id, hero_image_url, card_image_url')
      .ilike('country_name', countryName)
      .maybeSingle()

    // Tomar primera propiedad del país con imagen
    const { data: firstProperty } = await supabaseAdmin
      .from('properties')
      .select('image_url, gallery_urls')
      .eq('country', countryName)
      .not('image_url', 'is', null)
      .not('hidden', 'eq', true)
      .limit(1)
      .maybeSingle()

    if (!firstProperty?.image_url) {
      console.log(`⚠ ${countryName}: sin propiedades con foto, saltando`)
      skipped++
      continue
    }

    const heroImage = firstProperty.image_url
    const cardImage = (firstProperty.gallery_urls as string[] | null)?.[1]
      ?? firstProperty.image_url

    if (existing) {
      // Solo actualizar si tiene foto placeholder
      const heroIsPlaceholder = isPlaceholder(existing.hero_image_url)
      const cardIsPlaceholder = isPlaceholder(existing.card_image_url)

      if (!heroIsPlaceholder && !cardIsPlaceholder) {
        console.log(`✓ ${countryName}: foto custom existente, no se toca`)
        skipped++
        continue
      }

      const updateData: Record<string, string> = {}
      if (heroIsPlaceholder) updateData.hero_image_url = heroImage
      if (cardIsPlaceholder) updateData.card_image_url = cardImage

      const { error } = await supabaseAdmin
        .from('country_destinations')
        .update(updateData)
        .eq('id', existing.id)

      if (error) {
        console.error(`✗ ${countryName}: ${error.message}`)
      } else {
        updated++
        console.log(`↻ ${countryName}: foto actualizada con propiedad real`)
      }
    } else {
      // Crear nuevo destino
      const slug = countryName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      const { error } = await supabaseAdmin
        .from('country_destinations')
        .insert({
          country_name: countryName,
          slug,
          hero_image_url: heroImage,
          card_image_url: cardImage,
          active: true,
          description: null,
          city_images: {},
        })

      if (error) {
        console.error(`✗ ${countryName}: ${error.message}`)
      } else {
        created++
        console.log(`+ ${countryName}: creado con foto real`)
      }
    }
  }

  console.log(`\n📊 RESULTADO:`)
  console.log(`  Creados: ${created}`)
  console.log(`  Actualizados: ${updated}`)
  console.log(`  Sin cambios: ${skipped}`)
}

if (require.main === module) {
  syncDestinations().then(() => process.exit(0))
}
