import { supabaseAdmin } from '@/lib/supabase/admin'
import { DestacadasManager } from '@/components/admin/DestacadasManager'

interface FeaturedProperty {
  id: string
  title: string
  location: string | null
  price: number | null
  currency: string | null
  image_url: string | null
  featured_order: number | null
}

interface AllProperty {
  id: string
  title: string
  location: string | null
  country: string | null
  featured: boolean
}

const MAX_FEATURED = 12

export default async function DestacadasPage() {
  const [{ data: featuredData }, { data: allData }] = await Promise.all([
    supabaseAdmin
      .from('properties')
      .select('id,title,location,price,currency,image_url,featured_order')
      .eq('featured', true)
      .order('featured_order', { ascending: true }),
    supabaseAdmin
      .from('properties')
      .select('id,title,location,country,featured')
      .order('title', { ascending: true }),
  ])

  const featured = (featuredData as FeaturedProperty[]) ?? []
  const all = (allData as AllProperty[]) ?? []

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Propiedades Destacadas</h1>
        <span className="text-sm text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
          {featured.length} / {MAX_FEATURED} propiedades destacadas
        </span>
      </div>

      <DestacadasManager featured={featured} all={all} />
    </div>
  )
}
