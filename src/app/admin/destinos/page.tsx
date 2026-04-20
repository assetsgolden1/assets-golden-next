import { supabaseAdmin } from '@/lib/supabase/admin'
import { DestinosManager } from '@/components/admin/DestinosManager'

export default async function AdminDestinos() {
  const { data: destinos } = await supabaseAdmin
    .from('country_destinations')
    .select('id, country_name, slug, hero_image_url, description')
    .order('country_name')

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>
        Destinos
      </h1>
      <DestinosManager destinos={destinos ?? []} />
    </div>
  )
}
