'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'

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
  featured_order?: number | null
  slug?: string | null
}

const PAGE_SIZE = 20

export default function PropiedadesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [filterCountry, setFilterCountry] = useState('')
  const [filterFeatured, setFilterFeatured] = useState('')

  const loadProperties = useCallback(async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const offset = page * PAGE_SIZE

    let query = supabase
      .from('properties')
      .select('id,title,location,province,country,price,currency,property_type,featured,status,image_url,featured_order,slug', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1)

    if (searchText) {
      query = query.ilike('title', `%${searchText}%`)
    }
    if (filterCountry) {
      query = query.eq('country', filterCountry)
    }
    if (filterFeatured === 'yes') {
      query = query.eq('featured', true)
    } else if (filterFeatured === 'no') {
      query = query.eq('featured', false)
    }

    const { data, count, error: fetchError } = await query

    if (fetchError) {
      setError('Error cargando propiedades: ' + fetchError.message)
    } else {
      setProperties((data as Property[]) ?? [])
      setTotal(count ?? 0)
    }
    setLoading(false)
  }, [page, searchText, filterCountry, filterFeatured])

  useEffect(() => {
    loadProperties()
  }, [loadProperties])

  async function toggleFeatured(prop: Property) {
    const supabase = createClient()
    const newFeatured = !prop.featured

    let updateData: Record<string, unknown> = { featured: newFeatured }

    if (newFeatured) {
      // Obtener el máximo featured_order actual
      const { data: maxData } = await supabase
        .from('properties')
        .select('featured_order')
        .eq('featured', true)
        .order('featured_order', { ascending: false })
        .limit(1)

      const maxOrder = maxData?.[0]?.featured_order ?? 0
      updateData.featured_order = maxOrder + 1
    } else {
      updateData.featured_order = 0
    }

    const { error: updateError } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', prop.id)

    if (updateError) {
      alert('Error actualizando destacada: ' + updateError.message)
    } else {
      loadProperties()
    }
  }

  const start = page * PAGE_SIZE + 1
  const end = Math.min((page + 1) * PAGE_SIZE, total)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Propiedades</h1>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-5 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por título..."
          value={searchText}
          onChange={(e) => { setSearchText(e.target.value); setPage(0) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-[200px]"
        />
        <input
          type="text"
          placeholder="País (ej: España)"
          value={filterCountry}
          onChange={(e) => { setFilterCountry(e.target.value); setPage(0) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterFeatured}
          onChange={(e) => { setFilterFeatured(e.target.value); setPage(0) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas</option>
          <option value="yes">Destacadas</option>
          <option value="no">No destacadas</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 text-sm text-gray-500">
              Mostrando {total === 0 ? 0 : start}–{end} de {total} propiedades
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
                  ) : properties.map((prop) => (
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
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          prop.status === 'active' || prop.status === 'available'
                            ? 'bg-green-100 text-green-700'
                            : prop.status === 'sold'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {prop.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        <span>{prop.country ?? '—'}</span>
                        {prop.location && <span className="text-gray-400"> / {prop.location}</span>}
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
                        <button
                          onClick={() => toggleFeatured(prop)}
                          title={prop.featured ? 'Quitar destacada' : 'Marcar como destacada'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            prop.featured
                              ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                              : 'text-gray-300 hover:text-yellow-400 hover:bg-yellow-50'
                          }`}
                        >
                          <Star size={16} fill={prop.featured ? 'currentColor' : 'none'} />
                        </button>
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
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} /> Anterior
            </button>
            <span className="text-sm text-gray-500">Página {page + 1}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={end >= total}
              className="flex items-center gap-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
