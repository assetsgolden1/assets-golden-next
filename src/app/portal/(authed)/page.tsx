import { createClient } from '@/lib/supabase/server'
import { PortalPropertiesGrid } from '@/components/portal/PortalPropertiesGrid'
import type { Property } from '@/types'

export default async function PortalHome() {
  const supabase = await createClient()

  const { data: properties, count } = await supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .not('hidden', 'eq', true)
    .not('sold', 'eq', true)
    .order('created_at', { ascending: false })
    .limit(60)

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl text-primary mb-2">
          Catálogo de propiedades
        </h1>
        <p className="text-muted-foreground">
          {count?.toLocaleString()} propiedades disponibles
        </p>
      </div>

      <PortalPropertiesGrid
        initialProperties={(properties ?? []) as Property[]}
        total={count ?? 0}
      />
    </div>
  )
}
