import { supabaseAdmin } from '@/lib/supabase/admin'
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import { FeaturedToggleButton } from '@/components/admin/FeaturedToggleButton'

interface Property {
  id: string
  title: string
  location: string | null
  province: string | null
  country: string | null
  price: number | null
  currency: string | null
  property_type: string | null
  featured: boolean
  status: string
  image_url: string | null
  featured_order: number | null
  slug: string | null
}

const PAGE_SIZE = 20

export default async function PropiedadesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; pais?: string; featured?: string }>
}) {
  const params = await searchParams
  const page = Math.max(0, parseInt(params.page ?? '0') || 0)
  const search = params.search ?? ''
  const pais = params.pais ?? ''
  const featured = params.featured ?? ''

  const offset = page * PAGE_SIZE

  let query = supabaseAdmin
    .from('properties')
    .select(
      'id,title,location,province,country,price,currency,property_type,featured,status,image_url,featured_order,slug',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (search) {
    query = query.ilike('title', `%${search}%`)
  }
  if (pais) {
    query = query.eq('country', pais)
  }
  if (featured === 'yes') {
    query = query.eq('featured', true)
  } else if (featured === 'no') {
    query = query.eq('featured', false)
  }

  const { data, count } = await query
  const properties = (data as Property[]) ?? []
  const total = count ?? 0

  const start = total === 0 ? 0 : page * PAGE_SIZE + 1
  const end = Math.min((page + 1) * PAGE_SIZE, total)

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams()
    if (search) p.set('search', search)
    if (pais) p.set('pais', pais)
    if (featured) p.set('featured', featured)
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

      {/* Filtros — formulario GET puro */}
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
        <select
          name="featured"
          defaultValue={featured}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas</option>
          <option value="yes">Destacadas</option>
          <option value="no">No destacadas</option>
        </select>
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
                <th className="text-center px-4 py-3 text-gray-600 font-medium">Ver</th>
              </tr>
            </thead>
            <tbody>
              {properties.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    No se encontraron propiedades
                  </td>
                </tr>
              ) : (
                properties.map((prop) => (
                  <tr key={prop.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {prop.image_url ? (
                        <img
                          src={prop.image_url}
                          alt={prop.title}
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                          Sin img
                        </div>
                      )}
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
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <FeaturedToggleButton id={prop.id} featured={prop.featured} />
                    </td>
                    <td className="px-4 py-2 text-center">
                      {prop.slug ? (
                        <a
                          href={`/propiedades/${prop.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-500 hover:text-blue-700 p-1 inline-block"
                        >
                          <ExternalLink size={15} />
                        </a>
                      ) : (
                        '—'
                      )}
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
