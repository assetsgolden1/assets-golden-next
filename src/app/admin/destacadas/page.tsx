'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChevronUp, ChevronDown, X, Plus } from 'lucide-react'

interface FeaturedProperty {
  id: string
  title: string
  location: string | null
  price: number | null
  currency: string | null
  image_url: string | null
  featured_order: number | null
}

interface SearchResult {
  id: string
  title: string
  location: string | null
  country: string | null
}

const MAX_FEATURED = 12

export default function DestacadasPage() {
  const [featured, setFeatured] = useState<FeaturedProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    loadFeatured()
  }, [])

  async function loadFeatured() {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    // Intentar con featured_order, fallback a created_at
    let { data, error: fetchError } = await supabase
      .from('properties')
      .select('id,title,location,price,currency,image_url,featured_order')
      .eq('featured', true)
      .order('featured_order', { ascending: true })

    if (fetchError) {
      // fallback
      const result = await supabase
        .from('properties')
        .select('id,title,location,price,currency,image_url,featured_order')
        .eq('featured', true)
        .order('created_at', { ascending: false })
      data = result.data
      fetchError = result.error
    }

    if (fetchError) {
      setError('Error cargando destacadas: ' + fetchError.message)
    } else {
      setFeatured((data as FeaturedProperty[]) ?? [])
    }
    setLoading(false)
  }

  async function removeFeatured(id: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('properties')
      .update({ featured: false, featured_order: 0 })
      .eq('id', id)

    if (error) {
      alert('Error: ' + error.message)
    } else {
      loadFeatured()
    }
  }

  async function swapOrder(indexA: number, indexB: number) {
    const propA = featured[indexA]
    const propB = featured[indexB]
    if (!propA || !propB) return

    const supabase = createClient()
    const orderA = propA.featured_order ?? indexA + 1
    const orderB = propB.featured_order ?? indexB + 1

    await Promise.all([
      supabase.from('properties').update({ featured_order: orderB }).eq('id', propA.id),
      supabase.from('properties').update({ featured_order: orderA }).eq('id', propB.id),
    ])
    loadFeatured()
  }

  async function searchNonFeatured() {
    if (!searchQuery.trim()) return
    setSearching(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('properties')
      .select('id,title,location,country')
      .eq('featured', false)
      .ilike('title', `%${searchQuery}%`)
      .limit(10)

    setSearchResults((data as SearchResult[]) ?? [])
    setSearching(false)
  }

  async function addFeatured(prop: SearchResult) {
    if (featured.length >= MAX_FEATURED) return
    const supabase = createClient()
    const maxOrder = featured.reduce((max, p) => Math.max(max, p.featured_order ?? 0), 0)

    const { error } = await supabase
      .from('properties')
      .update({ featured: true, featured_order: maxOrder + 1 })
      .eq('id', prop.id)

    if (error) {
      alert('Error: ' + error.message)
    } else {
      setSearchResults([])
      setSearchQuery('')
      loadFeatured()
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Propiedades Destacadas</h1>
        <span className="text-sm text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
          {featured.length} / {MAX_FEATURED} propiedades destacadas
        </span>
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
          {/* Lista de destacadas */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            {featured.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                No hay propiedades destacadas
              </div>
            ) : (
              <ul>
                {featured.map((prop, idx) => (
                  <li key={prop.id} className="flex items-center gap-4 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    {prop.image_url ? (
                      <img
                        src={prop.image_url}
                        alt={prop.title}
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{prop.title}</p>
                      <p className="text-xs text-gray-400">{prop.location ?? '—'}</p>
                    </div>
                    <div className="text-sm text-gray-600">
                      {prop.price ? `${prop.currency ?? 'EUR'} ${prop.price.toLocaleString('es-ES')}` : '—'}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => idx > 0 && swapOrder(idx, idx - 1)}
                        disabled={idx === 0}
                        className="text-gray-400 hover:text-gray-700 disabled:opacity-20"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        onClick={() => idx < featured.length - 1 && swapOrder(idx, idx + 1)}
                        disabled={idx === featured.length - 1}
                        className="text-gray-400 hover:text-gray-700 disabled:opacity-20"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFeatured(prop.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Quitar destacada"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Añadir destacada */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Añadir propiedad destacada</h2>
            {featured.length >= MAX_FEATURED ? (
              <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                Has alcanzado el máximo de {MAX_FEATURED} propiedades destacadas. Elimina alguna para añadir más.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Buscar propiedad por título..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchNonFeatured()}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={searchNonFeatured}
                    disabled={searching}
                    className="bg-[#0a1628] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#1a2638] transition-colors disabled:opacity-50"
                  >
                    Buscar
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <ul className="border border-gray-200 rounded-lg overflow-hidden">
                    {searchResults.map((result) => (
                      <li
                        key={result.id}
                        className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 last:border-0 hover:bg-gray-50"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-800">{result.title}</p>
                          <p className="text-xs text-gray-400">{result.country ?? ''} {result.location ?? ''}</p>
                        </div>
                        <button
                          onClick={() => addFeatured(result)}
                          className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Plus size={13} /> Añadir
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
