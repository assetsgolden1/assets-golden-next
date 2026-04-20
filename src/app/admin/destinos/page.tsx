import { supabaseAdmin } from '@/lib/supabase/admin'
import { DestinosManager } from '@/components/admin/DestinosManager'

export default async function AdminDestinos() {
  const [{ data: destinos }, { data: propsByCountry }] = await Promise.all([
    supabaseAdmin
      .from('country_destinations')
      .select('id, country_name, slug, hero_image_url, description, city_images')
      .order('country_name'),
    supabaseAdmin
      .from('properties')
      .select('country, location')
      .not('country', 'is', null),
  ])

  const countryStats: Record<string, { total: number; cities: Record<string, number> }> = {}

  propsByCountry?.forEach((p) => {
    const country = (p.country as string).trim()
    const city = ((p.location as string | null) ?? 'Sin ciudad').trim()
    if (!countryStats[country]) countryStats[country] = { total: 0, cities: {} }
    countryStats[country].total++
    countryStats[country].cities[city] = (countryStats[country].cities[city] ?? 0) + 1
  })

  return (
    <div style={{ padding: 32, maxWidth: 1000 }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>
        Gestión de Destinos
      </h1>
      <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>
        Gestiona las fotos de portada de cada país y sus ciudades.
      </p>
      <DestinosManager destinos={destinos ?? []} countryStats={countryStats} />
    </div>
  )
}
