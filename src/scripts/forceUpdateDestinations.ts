import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function forceUpdate() {
  // 1. Obtener TODOS los destinos
  const { data: destinations } = await supabaseAdmin
    .from('country_destinations')
    .select('id, country_name')

  if (!destinations) return

  let updated = 0
  let deleted = 0

  for (const dest of destinations) {
    // Buscar primera propiedad del país
    const { data: firstProperty } = await supabaseAdmin
      .from('properties')
      .select('image_url, gallery_urls')
      .ilike('country', dest.country_name)
      .not('image_url', 'is', null)
      .not('hidden', 'eq', true)
      .limit(1)
      .maybeSingle()

    if (!firstProperty?.image_url) {
      // No tiene propiedades — eliminar destino
      const { error } = await supabaseAdmin
        .from('country_destinations')
        .delete()
        .eq('id', dest.id)

      if (error) {
        console.error(`✗ ${dest.country_name}: ${error.message}`)
      } else {
        deleted++
        console.log(`🗑 ${dest.country_name}: eliminado (sin propiedades)`)
      }
      continue
    }

    // Sobreescribir hero y card con foto real
    const heroImage = firstProperty.image_url
    const cardImage = (firstProperty.gallery_urls as string[] | null)?.[1]
      ?? firstProperty.image_url

    const { error } = await supabaseAdmin
      .from('country_destinations')
      .update({
        hero_image_url: heroImage,
        card_image_url: cardImage,
      })
      .eq('id', dest.id)

    if (error) {
      console.error(`✗ ${dest.country_name}: ${error.message}`)
    } else {
      updated++
      console.log(`↻ ${dest.country_name}: foto reemplazada`)
    }
  }

  console.log(`\n📊 RESULTADO:`)
  console.log(`  Actualizados: ${updated}`)
  console.log(`  Eliminados: ${deleted}`)
}

if (require.main === module) {
  forceUpdate().then(() => process.exit(0))
}
