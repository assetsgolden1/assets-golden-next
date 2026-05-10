import { supabaseAdmin } from '@/lib/supabase/admin'
import { PropiedadesTable, type PropertyRow } from '@/components/admin/PropiedadesTable'

const PAGE_SIZE = 20

export default async function PropiedadesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    search?: string
    pais?: string
    ciudad?: string
    tipo?: string
    precio_min?: string
    precio_max?: string
    filter?: string
  }>
}) {
  const params = await searchParams
  const page = Math.max(0, parseInt(params.page ?? '0') || 0)
  const search = params.search ?? ''
  const pais = params.pais ?? ''
  const ciudad = params.ciudad ?? ''
  const tipo = params.tipo ?? ''
  const precioMin = params.precio_min ?? ''
  const precioMax = params.precio_max ?? ''
  const filter = params.filter ?? ''
  const offset = page * PAGE_SIZE

  // Queries en paralelo: filtros vía RPC (DISTINCT server-side) + principal + counts para tabs
  const [filtersResult, citiesResult, priceResult, mainResult, allCountResult, featuredCountResult] = await Promise.all([
    // Países y tipos únicos — GROUP BY en la DB, sin límite de rows
    supabaseAdmin.rpc('get_property_filters'),

    // Ciudades filtradas por país si hay uno activo
    pais
      ? supabaseAdmin
          .from('properties')
          .select('location')
          .not('location', 'is', null)
          .not('location', 'eq', '')
          .eq('country', pais)
          .order('location')
          .limit(5000)
      : supabaseAdmin
          .from('properties')
          .select('location')
          .not('location', 'is', null)
          .not('location', 'eq', '')
          .order('location')
          .limit(5000),

    // Rango de precios
    supabaseAdmin
      .from('properties')
      .select('price')
      .not('price', 'is', null)
      .order('price', { ascending: true })
      .limit(10000),

    // Query principal con todos los filtros
    (() => {
      let q = supabaseAdmin
        .from('properties')
        .select(
          'id,title,location,country,price,currency,property_type,featured,hidden,sold,status,image_url,slug,ref_code',
          { count: 'exact' }
        )
        .order('created_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1)

      if (search) q = q.ilike('title', `%${search}%`)
      if (pais) q = q.eq('country', pais)
      if (ciudad) q = q.eq('location', ciudad)
      if (tipo) q = q.eq('property_type', tipo)
      if (precioMin) q = q.gte('price', parseInt(precioMin))
      if (precioMax) q = q.lte('price', parseInt(precioMax))

      if (filter === 'visible') q = q.or('hidden.is.null,hidden.eq.false').or('sold.is.null,sold.eq.false')
      else if (filter === 'hidden') q = q.eq('hidden', true).or('sold.is.null,sold.eq.false')
      else if (filter === 'sold') q = q.eq('sold', true)
      else if (filter === 'featured') q = q.eq('featured', true)

      return q
    })(),

    // Count total del catálogo (sin filtros de tab) para badge "Todas"
    supabaseAdmin.from('properties').select('*', { count: 'exact', head: true }),

    // Count solo destacadas para badge "Destacadas"
    supabaseAdmin.from('properties').select('*', { count: 'exact', head: true }).eq('featured', true),
  ])

  const totalFeatured = featuredCountResult.count ?? 0
  const totalAll = allCountResult.count ?? 0

  const TABS = [
    { key: '', label: 'Todas', count: totalAll },
    { key: 'visible', label: 'Visibles' },
    { key: 'hidden', label: 'Ocultas' },
    { key: 'sold', label: 'Vendidas' },
    { key: 'featured', label: 'Destacadas', count: totalFeatured },
  ]

  // Si el RPC aún no existe, caer de vuelta a listas vacías (no rompe la UI)
  const rpcFilters = filtersResult.data as {
    countries: string[] | null
    types: string[] | null
  } | null

  const uniqueCountries: string[] = (rpcFilters?.countries ?? []).sort()
  const uniqueTypes: string[] = (rpcFilters?.types ?? []).sort()

  const uniqueCities = [...new Set(
    (citiesResult.data ?? []).map((p) => p.location as string).filter(Boolean)
  )].sort()

  const prices = (priceResult.data ?? []).map((p) => p.price as number)
  const minPrice = prices[0] ?? 0
  const maxPrice = prices[prices.length - 1] ?? 0

  const { data, count, error } = mainResult

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Propiedades</h1>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
          <p className="font-semibold mb-1">Error al cargar propiedades</p>
          <p className="text-sm font-mono">{error.message}</p>
          {error.message.includes('hidden') && (
            <p className="mt-3 text-sm">
              Ejecuta en Supabase SQL Editor:
              <code className="block bg-red-100 px-2 py-1 rounded mt-1 font-mono">
                ALTER TABLE properties ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;
              </code>
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Propiedades</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        {TABS.map((tab) => {
          const p = new URLSearchParams()
          if (search) p.set('search', search)
          if (pais) p.set('pais', pais)
          if (ciudad) p.set('ciudad', ciudad)
          if (tipo) p.set('tipo', tipo)
          if (precioMin) p.set('precio_min', precioMin)
          if (precioMax) p.set('precio_max', precioMax)
          if (tab.key) p.set('filter', tab.key)
          p.set('page', '0')
          return (
            <a
              key={tab.key}
              href={`/admin/propiedades?${p.toString()}`}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                filter === tab.key
                  ? 'border-[#0a1628] text-[#0a1628]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-1.5 text-xs font-normal ${
                  filter === tab.key ? 'text-[#0a1628]/70' : 'text-gray-400'
                }`}>
                  ({tab.count.toLocaleString('es-ES')})
                </span>
              )}
            </a>
          )
        })}
      </div>

      <PropiedadesTable
        properties={(data as PropertyRow[]) ?? []}
        totalCount={count ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        filter={filter}
        search={search}
        pais={pais}
        ciudad={ciudad}
        tipo={tipo}
        precioMin={precioMin}
        precioMax={precioMax}
        countries={uniqueCountries}
        cities={uniqueCities}
        types={uniqueTypes}
        minPrice={minPrice}
        maxPrice={maxPrice}
      />
    </div>
  )
}
