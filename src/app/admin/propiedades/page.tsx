import { supabaseAdmin } from '@/lib/supabase/admin'
import { PropiedadesTable, type PropertyRow } from '@/components/admin/PropiedadesTable'

const PAGE_SIZE = 20

const TABS = [
  { key: '', label: 'Todas' },
  { key: 'visible', label: 'Visibles' },
  { key: 'hidden', label: 'Ocultas' },
  { key: 'featured', label: 'Destacadas' },
]

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

  // Queries de opciones y principal en paralelo
  const [
    { data: countriesData },
    { data: citiesData },
    { data: typesData },
    { data: priceData },
    mainResult,
  ] = await Promise.all([
    // Países únicos
    supabaseAdmin
      .from('properties')
      .select('country')
      .not('country', 'is', null)
      .order('country'),

    // Ciudades (filtradas por país si hay uno activo)
    pais
      ? supabaseAdmin
          .from('properties')
          .select('location')
          .not('location', 'is', null)
          .eq('country', pais)
          .order('location')
      : supabaseAdmin
          .from('properties')
          .select('location')
          .not('location', 'is', null)
          .order('location'),

    // Tipos únicos
    supabaseAdmin
      .from('properties')
      .select('property_type')
      .not('property_type', 'is', null),

    // Rango de precios
    supabaseAdmin
      .from('properties')
      .select('price')
      .not('price', 'is', null)
      .order('price', { ascending: true }),

    // Query principal con todos los filtros
    (() => {
      let q = supabaseAdmin
        .from('properties')
        .select(
          'id,title,location,country,price,currency,property_type,featured,hidden,status,image_url,slug',
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

      if (filter === 'visible') q = q.or('hidden.is.null,hidden.eq.false')
      else if (filter === 'hidden') q = q.eq('hidden', true)
      else if (filter === 'featured') q = q.eq('featured', true)

      return q
    })(),
  ])

  const uniqueCountries = [...new Set(
    (countriesData ?? []).map((p) => p.country as string).filter(Boolean)
  )].sort()

  const uniqueCities = [...new Set(
    (citiesData ?? []).map((p) => p.location as string).filter(Boolean)
  )].sort()

  const uniqueTypes = [...new Set(
    (typesData ?? []).map((p) => p.property_type as string).filter(Boolean)
  )].sort()

  const prices = (priceData ?? []).map((p) => p.price as number)
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
