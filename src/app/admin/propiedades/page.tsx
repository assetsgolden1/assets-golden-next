import { supabaseAdmin } from '@/lib/supabase/admin'
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import { FeaturedToggleButton } from '@/components/admin/FeaturedToggleButton'
import { PropertyVisibilityToggle } from '@/components/admin/PropertyVisibilityToggle'
import { DeletePropertyButton } from '@/components/admin/DeletePropertyButton'

interface Property {
  id: string
  title: string
  location: string | null
  country: string | null
  price: number | null
  currency: string | null
  property_type: string | null
  featured: boolean
  hidden: boolean | null
  status: string
  image_url: string | null
  slug: string | null
}

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
            <p className="mt-3 text-sm text-red-600">
              La columna <code className="bg-red-100 px-1 rounded">hidden</code> no existe en la tabla.
              Ejecuta en Supabase SQL Editor:
              <br />
              <code className="bg-red-100 px-1 rounded mt-1 inline-block">
                ALTER TABLE properties ADD COLUMN IF NOT EXISTS hidden boolean DEFAULT false;
              </code>
            </p>
          )}
        </div>
      </div>
    )
  }

  const properties = (data as Property[]) ?? []
  const total = count ?? 0
  const start = total === 0 ? 0 : page * PAGE_SIZE + 1
  const end = Math.min((page + 1) * PAGE_SIZE, total)

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams()
    if (search) p.set('search', search)
    if (pais) p.set('pais', pais)
    if (filter) p.set('filter', filter)
    p.set('page', String(page))
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) p.set(k, v)
      else p.delete(k)
    })
    return `/admin/propiedades?${p.toString()}`
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
          const isActive = filter === tab.key
          return (
            <a
              key={tab.key}
              href={`/admin/propiedades?${p.toString()}`}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                isActive
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
        {filter && <input type="hidden" name="filter" value={filter} />}
        <input type="hidden" name="page" value="0" />
        <button
          type="submit"
          className="bg-[#0a1628] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#1a2638] transition-colors"
        >
          Filtrar
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 text-sm text-gray-500">
          Mostrando {start}–{end} de {total} propiedades
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Imagen</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Título</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">País / Ciudad</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Precio</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Tipo</th>
                <th className="text-center px-4 py-3 text-gray-600 font-medium">Destacada</th>
                <th className="text-center px-4 py-3 text-gray-600 font-medium">Visible</th>
                <th className="text-center px-4 py-3 text-gray-600 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {properties.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">
                    No se encontraron propiedades
                  </td>
                </tr>
              ) : (
                properties.map((prop) => (
                  <tr key={prop.id} className={`border-t border-gray-50 hover:bg-gray-50 ${prop.hidden ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-2">
                      <img
                        src={prop.image_url ?? '/placeholder-property.svg'}
                        alt=""
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                    </td>
                    <td className="px-4 py-2 max-w-[200px]">
                      <p className="font-medium text-gray-800 truncate">{prop.title}</p>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          prop.status === 'active' || prop.status === 'available'
                            ? 'bg-green-100 text-green-700'
                            : prop.status === 'sold'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {prop.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      <span>{prop.country ?? '—'}</span>
                      {prop.location && (
                        <span className="text-gray-400"> / {prop.location}</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-gray-700">
                      {prop.price
                        ? `${prop.currency ?? 'EUR'} ${prop.price.toLocaleString('es-ES')}`
                        : '—'}
                    </td>
                    <td className="px-4 py-2">
                      {prop.property_type ? (
                        <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                          {prop.property_type}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <FeaturedToggleButton id={prop.id} featured={prop.featured} />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <PropertyVisibilityToggle id={prop.id} hidden={prop.hidden ?? false} />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {prop.slug && (
                          <a
                            href={`/propiedades/${prop.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-500 hover:text-blue-700 p-1 inline-block"
                            title="Ver en sitio"
                          >
                            <ExternalLink size={15} />
                          </a>
                        )}
                        <DeletePropertyButton id={prop.id} title={prop.title} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between mt-4">
        <a
          href={page > 0 ? buildUrl({ page: String(page - 1) }) : '#'}
          aria-disabled={page === 0}
          className={`flex items-center gap-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 ${page === 0 ? 'opacity-40 pointer-events-none' : ''}`}
        >
          <ChevronLeft size={16} /> Anterior
        </a>
        <span className="text-sm text-gray-500">Página {page + 1}</span>
        <a
          href={end < total ? buildUrl({ page: String(page + 1) }) : '#'}
          aria-disabled={end >= total}
          className={`flex items-center gap-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 ${end >= total ? 'opacity-40 pointer-events-none' : ''}`}
        >
          Siguiente <ChevronRight size={16} />
        </a>
      </div>
    </div>
  )
}
