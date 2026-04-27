import { supabaseAdmin } from '@/lib/supabase/admin'

async function syncDestinations() {
  console.log('🌍 Sincronizando country_destinations desde properties...\n')

  // Obtener países distintos con su primera imagen
  const { data: rows, error } = await supabaseAdmin
    .from('properties')
    .select('country, image_url')
    .eq('external_source', 'scraper-lovable')
    .not('country', 'is', null)

  if (error) {
    console.error('Error leyendo properties:', error.message)
    process.exit(1)
  }

  // Agrupar por país: primera imagen disponible
  const byCountry = new Map<string, string | null>()
  for (const row of rows ?? []) {
    if (!byCountry.has(row.country)) {
      byCountry.set(row.country, row.image_url ?? null)
    }
  }

  console.log(`Países encontrados: ${[...byCountry.keys()].join(', ')}\n`)

  let upserted = 0
  let errors = 0

  for (const [country, heroImage] of byCountry) {
    const slug = country
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const { error: upsertError } = await supabaseAdmin
      .from('country_destinations')
      .upsert(
        {
          country_name: country,
          slug,
          hero_image_url: heroImage,
          card_image_url: heroImage,
          description: `Propiedades en ${country}`,
          active: true,
          sort_order: 0,
        },
        { onConflict: 'slug' }
      )

    if (upsertError) {
      console.error(`✗ ${country}: ${upsertError.message}`)
      errors++
    } else {
      console.log(`✓ ${country} → slug: ${slug} | foto: ${heroImage ? 'sí' : 'no'}`)
      upserted++
    }
  }

  console.log(`\n📊 RESULTADO: ${upserted} upserted, ${errors} errores`)
}

syncDestinations().catch(err => {
  console.error('\n❌ Error fatal:', err)
  process.exit(1)
})
