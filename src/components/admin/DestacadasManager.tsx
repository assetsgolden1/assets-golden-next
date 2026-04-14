'use client'
import { useState, useTransition } from 'react'
import { ChevronUp, ChevronDown, X, Plus } from 'lucide-react'
import { toggleFeatured, updateFeaturedOrder } from '@/app/admin/actions'
import { useRouter } from 'next/navigation'

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

export function DestacadasManager({
  featured,
  all,
}: {
  featured: FeaturedProperty[]
  all: AllProperty[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState('')

  const nonFeatured = all.filter((p) => !p.featured)
  const searchResults = searchQuery.trim()
    ? nonFeatured.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  async function handleSwap(indexA: number, indexB: number) {
    const propA = featured[indexA]
    const propB = featured[indexB]
    if (!propA || !propB) return
    const orderA = propA.featured_order ?? indexA + 1
    const orderB = propB.featured_order ?? indexB + 1
    startTransition(async () => {
      await updateFeaturedOrder(propA.id, orderB)
      await updateFeaturedOrder(propB.id, orderA)
      router.refresh()
    })
  }

  async function handleRemove(id: string) {
    startTransition(async () => {
      await toggleFeatured(id, false)
      router.refresh()
    })
  }

  async function handleAdd(prop: AllProperty) {
    if (featured.length >= MAX_FEATURED) return
    const maxOrder = featured.reduce((max, p) => Math.max(max, p.featured_order ?? 0), 0)
    startTransition(async () => {
      await updateFeaturedOrder(prop.id, maxOrder + 1)
      await toggleFeatured(prop.id, true)
      setSearchQuery('')
      router.refresh()
    })
  }

  return (
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
              <li
                key={prop.id}
                className="flex items-center gap-4 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50"
              >
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
                  {prop.price
                    ? `${prop.currency ?? 'EUR'} ${prop.price.toLocaleString('es-ES')}`
                    : '—'}
                </div>
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => idx > 0 && handleSwap(idx, idx - 1)}
                    disabled={idx === 0 || isPending}
                    className="text-gray-400 hover:text-gray-700 disabled:opacity-20"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => idx < featured.length - 1 && handleSwap(idx, idx + 1)}
                    disabled={idx === featured.length - 1 || isPending}
                    className="text-gray-400 hover:text-gray-700 disabled:opacity-20"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
                <button
                  onClick={() => handleRemove(prop.id)}
                  disabled={isPending}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1 disabled:opacity-50"
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
            Has alcanzado el máximo de {MAX_FEATURED} propiedades destacadas. Elimina alguna para
            añadir más.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Buscar propiedad por título..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                      <p className="text-xs text-gray-400">
                        {result.country ?? ''} {result.location ?? ''}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAdd(result)}
                      disabled={isPending}
                      className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Plus size={13} /> Añadir
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {searchQuery.trim() && searchResults.length === 0 && (
              <p className="text-sm text-gray-400">No se encontraron propiedades con ese título</p>
            )}
          </div>
        )}
      </div>
    </>
  )
}
