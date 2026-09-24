import { supabaseAdmin } from '@/lib/supabase/admin'
import { PropiedadesTable, type PropertyRow } from '@/components/admin/PropiedadesTable'
import { AdminPropertyFilters, type AdminFilterValues } from '@/components/admin/AdminPropertyFilters'
import { buildLocationIndex, spainRegionFromText, type LocationIndex } from '@/lib/admin/regions'

const PAGE_SIZE = 20
/** Tope de filas que devuelve Supabase por consulta: un `.limit()` mayor se ignora en silencio. */
const DB_PAGE = 1000

/**
 * Trae (país, provincia, ciudad) de TODO el catálogo para montar los desplegables.
 * Antes se pedía con `.limit(5000)`, pero Supabase corta en 1.000 filas: el desplegable
 * se quedaba en las ciudades hasta la "E" (82 de 250) y Sitges, por ejemplo, no salía.
 */
async function fetchLocationIndex(): Promise<LocationIndex> {
  const { count } = await supabaseAdmin.from('properties').select('*', { count: 'exact', head: true })
  const pages = Math.ceil((count ?? 0) / DB_PAGE)
  const results = await Promise.all(
    Array.from({ length: pages }, (_, i) =>
      supabaseAdmin
        .from('properties')
        .select('country,province,location')
        .order('id')
        .range(i * DB_PAGE, (i + 1) * DB_PAGE - 1),
    ),
  )
  return buildLocationIndex(results.flatMap((r) => r.data ?? []))
}

/** Valores crudos de `province` que forman una región ("Cataluña" → Barcelona, Girona...). */
function provincesOf(index: LocationIndex, region: string, pais: string): string[] {
  const byCountry = pais ? [index.provincesByRegion[pais] ?? {}] : Object.values(index.provincesByRegion)
  const list = byCountry.flatMap((m) => m[region] ?? [])
  return list.length ? list : [region]
}

/** Lista para `.or()` de PostgREST: comillas para admitir espacios y comas en los nombres. */
const inList = (values: string[]) => `(${values.map((v) => `"${v.replace(/"/g, '')}"`).join(',')})`

export default async function PropiedadesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    search?: string
    pais?: string
    region?: string
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
  const region = params.region ?? ''
  const ciudad = params.ciudad ?? ''
  const tipo = params.tipo ?? ''
  const precioMin = params.precio_min ?? ''
  const precioMax = params.precio_max ?? ''
  const filter = params.filter ?? ''
  const offset = page * PAGE_SIZE

  // Índice de ubicaciones: alimenta los desplegables y traduce "región" a provincias.
  const locationsPromise = fetchLocationIndex()
  const searchRegion = search ? spainRegionFromText(search) : null

  // Queries en paralelo: filtros vía RPC (DISTINCT server-side) + principal + counts para tabs
  const [filtersResult, locationIndex, mainResult, allCountResult, featuredCountResult] = await Promise.all([
    // Países y tipos únicos — GROUP BY en la DB, sin límite de rows
    supabaseAdmin.rpc('get_property_filters'),

    locationsPromise,

    // Query principal con todos los filtros. Solo espera al índice si hay que traducir una región.
    (async () => {
      const index = region || searchRegion ? await locationsPromise : null
      let q = supabaseAdmin
        .from('properties')
        .select(
          'id,title,location,country,price,currency,property_type,featured,hidden,sold,status,image_url,slug,ref_code,external_id,external_source,habihub_dev_id',
          { count: 'exact' }
        )
        .order('created_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1)

      if (search) {
        const trimmed = search.trim()
        const safe = trimmed.replace(/[%,()]/g, '')
        if (safe) {
          if (/^\d+$/.test(safe)) {
            // Numérico: buscar como ref_code AG-XXXXX (pad 5 dígitos) Y como external_id exacto
            const padded = safe.padStart(5, '0')
            q = q.or(`ref_code.ilike.%AG-${padded}%,external_id.eq.${safe}`)
          } else if (/^ag-/i.test(safe)) {
            // Formato AG-XXXX: normalizar y buscar en ref_code
            q = q.ilike('ref_code', `%${safe.toUpperCase()}%`)
          } else {
            // Texto libre: buscar en título, ciudad, provincia. Si el texto es una comunidad
            // ("cataluña"), incluir también sus provincias: en BD se guarda "Barcelona", no "Cataluña".
            const regionClause = searchRegion && index
              ? `,province.in.${inList(provincesOf(index, searchRegion, pais))}`
              : ''
            q = q.or(`title.ilike.%${safe}%,location.ilike.%${safe}%,province.ilike.%${safe}%${regionClause}`)
          }
        }
      }
      if (pais) q = q.eq('country', pais)
      if (region && index) q = q.in('province', provincesOf(index, region, pais))
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

  const filterValues: AdminFilterValues = { search, pais, region, ciudad, tipo, precioMin, precioMax, filter }

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
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Propiedades</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        {TABS.map((tab) => {
          const p = new URLSearchParams()
          if (search) p.set('search', search)
          if (pais) p.set('pais', pais)
          if (region) p.set('region', region)
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

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        <AdminPropertyFilters
          // Se remonta en cada cambio de filtro para que los campos de texto reflejen la URL.
          key={JSON.stringify(filterValues)}
          values={filterValues}
          countries={uniqueCountries}
          locations={locationIndex.entries}
          types={uniqueTypes}
          totalCount={count ?? 0}
        />
        <div className="flex-1 min-w-0 w-full">
          <PropiedadesTable
            properties={(data as PropertyRow[]) ?? []}
            totalCount={count ?? 0}
            page={page}
            pageSize={PAGE_SIZE}
            {...filterValues}
          />
        </div>
      </div>
    </div>
  )
}
