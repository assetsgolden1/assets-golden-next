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
  searchParams: Promise<{ page?: string; search?: string; pais?: string; filter?: string }>
}) {
  const params = await searchParams
  const page = Math.max(0, parseInt(params.page ?? '0') || 0)
  const search = params.search ?? ''
  const pais = params.pais ?? ''
  const filter = params.filter ?? ''
  const offset = page * PAGE_SIZE

  let query = supabaseAdmin
    .from('properties')
    .select(
      'id,title,location,country,price,currency,property_type,featured,hidden,status,image_url,slug',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (search) query = query.ilike('title', `%${search}%`)
  if (pais) query = query.eq('country', pais)

  if (filter === 'visible') {
    query = query.or('hidden.is.null,hidden.eq.false')
  } else if (filter === 'hidden') {
    query = query.eq('hidden', true)
  } else if (filter === 'featured') {
    query = query.eq('featured', true)
  }

  const { data, count, error } = await query

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

      {/* Filtros */}
      <form method="GET" action="/admin/propiedades" className="bg-white rounded-xl shadow-sm p-4 mb-5 flex flex-wrap gap-3">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Buscar por título..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-[200px]"
        />
        <input
          type="text"
          name="pais"
          defaultValue={pais}
          placeholder="País (ej: España)"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input type="hidden" name="filter" value={filter} />
        <input type="hidden" name="page" value="0" />
        <button
          type="submit"
          className="bg-[#0a1628] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#1a2638] transition-colors"
        >
          Filtrar
        </button>
      </form>

      <PropiedadesTable
        properties={(data as PropertyRow[]) ?? []}
        totalCount={count ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        filter={filter}
        search={search}
        pais={pais}
      />
    </div>
  )
}
