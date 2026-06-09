'use client'

import { useState, useTransition } from 'react'
import { ExternalLink, Copy, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { bulkHideProperties, bulkDeleteProperties, bulkMarkAsSold } from '@/app/admin/actions'
import { translatePropertyType } from '@/lib/propertyTypes'
import { FeaturedToggleButton } from './FeaturedToggleButton'
import { PropertyVisibilityToggle } from './PropertyVisibilityToggle'
import { SoldToggleButton } from './SoldToggleButton'

export interface PropertyRow {
  id: string
  title: string
  location: string | null
  country: string | null
  price: number | null
  currency: string | null
  property_type: string | null
  featured: boolean
  hidden: boolean | null
  sold: boolean | null
  status: string
  image_url: string | null
  slug: string | null
  ref_code: string | null
  external_id: string | null
  external_source: string | null
  habihub_dev_id: string | null
}

export function PropiedadesTable({
  properties,
  totalCount,
  page,
  pageSize,
  filter,
  search,
  pais,
  ciudad,
  tipo,
  precioMin,
  precioMax,
  countries,
  cities,
  types,
  minPrice,
  maxPrice,
}: {
  properties: PropertyRow[]
  totalCount: number
  page: number
  pageSize: number
  filter: string
  search: string
  pais: string
  ciudad: string
  tipo: string
  precioMin: string
  precioMax: string
  countries: string[]
  cities: string[]
  types: string[]
  minPrice: number
  maxPrice: number
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [pending, startTransition] = useTransition()

  const start = totalCount === 0 ? 0 : page * pageSize + 1
  const end = Math.min((page + 1) * pageSize, totalCount)

  function buildUrl(overrides: Record<string, string>) {
    const p = new URLSearchParams()
    if (search) p.set('search', search)
    if (pais) p.set('pais', pais)
    if (ciudad) p.set('ciudad', ciudad)
    if (tipo) p.set('tipo', tipo)
    if (precioMin) p.set('precio_min', precioMin)
    if (precioMax) p.set('precio_max', precioMax)
    if (filter) p.set('filter', filter)
    p.set('page', String(page))
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) p.set(k, v)
      else p.delete(k)
    })
    return `/admin/propiedades?${p.toString()}`
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === properties.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(properties.map((p) => p.id)))
    }
  }

  function handleBulkHide() {
    if (selected.size === 0) return
    if (!window.confirm(`¿Ocultar ${selected.size} propiedades?`)) return
    startTransition(async () => {
      await bulkHideProperties(Array.from(selected))
      setSelected(new Set())
    })
  }

  function handleBulkDelete() {
    if (selected.size === 0) return
    if (!window.confirm(`¿ELIMINAR PERMANENTEMENTE ${selected.size} propiedades? Esta acción no se puede deshacer.`)) return
    startTransition(async () => {
      await bulkDeleteProperties(Array.from(selected))
      setSelected(new Set())
    })
  }

  function handleBulkSold() {
    if (selected.size === 0) return
    if (!window.confirm(`¿Marcar ${selected.size} propiedades como vendidas? Seguirán visibles con banda "VENDIDA".`)) return
    startTransition(async () => {
      await bulkMarkAsSold(Array.from(selected))
      setSelected(new Set())
    })
  }

  const hasActiveFilters = search || pais || ciudad || tipo || precioMin || precioMax

  return (
    <div>
      {/* Panel de filtros */}
      <form
        method="GET"
        action="/admin/propiedades"
        className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-end"
      >
        <input type="hidden" name="filter" value={filter} />
        <input type="hidden" name="page" value="0" />

        {/* Búsqueda flexible */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Búsqueda libre</label>
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="AG-1234, código HabiHub, ciudad..."
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>

        {/* País */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">País</label>
          <select
            name="pais"
            defaultValue={pais}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-44"
          >
            <option value="">Todos los países</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Ciudad */}
        {cities.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Ciudad</label>
            <select
              name="ciudad"
              defaultValue={ciudad}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-44"
            >
              <option value="">Todas las ciudades</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        {/* Tipo */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Tipo</label>
          <select
            name="tipo"
            defaultValue={tipo}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-44"
          >
            <option value="">Todos los tipos</option>
            {types.map((t) => (
              <option key={t} value={t}>{translatePropertyType(t)}</option>
            ))}
          </select>
        </div>

        {/* Precio mín */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">
            Precio mín {minPrice > 0 && <span className="text-gray-400">({minPrice.toLocaleString('es-ES')}€)</span>}
          </label>
          <input
            type="number"
            name="precio_min"
            defaultValue={precioMin}
            placeholder="Mínimo"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
          />
        </div>

        {/* Precio máx */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">
            Precio máx {maxPrice > 0 && <span className="text-gray-400">({maxPrice.toLocaleString('es-ES')}€)</span>}
          </label>
          <input
            type="number"
            name="precio_max"
            defaultValue={precioMax}
            placeholder="Máximo"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
          />
        </div>

        {/* Acciones */}
        <div className="flex gap-2 items-end">
          <button
            type="submit"
            className="bg-[#0a1628] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#1a2638] transition-colors"
          >
            Filtrar
          </button>
          {hasActiveFilters && (
            <a
              href={`/admin/propiedades${filter ? `?filter=${filter}` : ''}`}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200 transition-colors"
            >
              Limpiar
            </a>
          )}
        </div>
      </form>

      {/* Barra de acciones bulk / contador */}
      <div className={`flex items-center gap-3 mb-3 px-4 py-2.5 rounded-lg border text-sm ${
        selected.size > 0 ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'
      }`}>
        <span className="text-gray-600">
          {selected.size > 0
            ? `${selected.size} seleccionadas`
            : `Mostrando ${start}–${end} de ${totalCount} propiedades`}
        </span>
        {selected.size > 0 && (
          <>
            <button
              onClick={handleBulkHide}
              disabled={pending}
              className="px-3 py-1.5 bg-amber-500 text-white rounded-md text-xs font-semibold hover:bg-amber-600 disabled:opacity-50"
            >
              Ocultar ({selected.size})
            </button>
            <button
              onClick={handleBulkSold}
              disabled={pending}
              className="px-3 py-1.5 bg-green-600 text-white rounded-md text-xs font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              Vendidas ({selected.size})
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="px-3 py-1.5 bg-white text-gray-600 border border-gray-300 rounded-md text-xs hover:bg-gray-50"
            >
              Cancelar
            </button>
          </>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 w-8">
                  <input
                    type="checkbox"
                    checked={selected.size === properties.length && properties.length > 0}
                    onChange={toggleSelectAll}
                    className="cursor-pointer w-4 h-4"
                  />
                </th>
                <th className="text-left px-2 py-2 text-gray-600 font-medium" style={{ width: 50 }}>Img</th>
                <th className="text-left px-2 py-2 text-gray-600 font-medium" style={{ width: 145 }}>Título</th>
                <th className="text-left px-2 py-2 text-gray-600 font-medium" style={{ width: 76 }}>Ref.</th>
                <th className="text-left px-2 py-2 text-gray-600 font-medium" style={{ width: 92 }}>Cód. HabiHub</th>
                <th className="text-left px-2 py-2 text-gray-600 font-medium" style={{ width: 108 }}>País / Ciudad</th>
                <th className="text-left px-2 py-2 text-gray-600 font-medium" style={{ width: 96 }}>Precio</th>
                <th className="text-left px-2 py-2 text-gray-600 font-medium" style={{ width: 76 }}>Tipo</th>
                <th className="text-center px-1 py-2 text-gray-600 font-medium" style={{ width: 58 }}>★</th>
                <th className="text-center px-1 py-2 text-gray-600 font-medium" style={{ width: 68 }}>Visible</th>
                <th className="text-center px-1 py-2 text-gray-600 font-medium" style={{ width: 76 }}>Vendida</th>
                <th className="text-center px-1 py-2 text-gray-600 font-medium" style={{ width: 66 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {properties.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-8 text-gray-400">
                    No se encontraron propiedades
                  </td>
                </tr>
              ) : (
                properties.map((prop) => (
                  <tr
                    key={prop.id}
                    className={`border-t border-gray-50 hover:bg-gray-50 ${
                      selected.has(prop.id) ? 'bg-blue-50' : prop.hidden ? 'bg-red-50 opacity-70' : ''
                    }`}
                  >
                    <td className="px-2 py-2">
                      <input
                        type="checkbox"
                        checked={selected.has(prop.id)}
                        onChange={() => toggleSelect(prop.id)}
                        className="cursor-pointer w-4 h-4"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <img
                        src={prop.image_url ?? '/placeholder-property.svg'}
                        alt=""
                        className="w-9 h-9 object-cover rounded-md"
                        onError={(e) => { e.currentTarget.src = '/placeholder-property.svg' }}
                      />
                    </td>
                    <td className="px-2 py-2 overflow-hidden">
                      <p className="font-medium text-gray-800 truncate text-xs" title={prop.title}>{prop.title}</p>
                      <div className="flex flex-wrap gap-0.5 mt-0.5">
                        {prop.sold
                          ? <span className="text-[10px] px-1 py-0.5 rounded bg-red-100 text-red-700 font-semibold">VEND.</span>
                          : prop.hidden
                            ? <span className="text-[10px] px-1 py-0.5 rounded bg-gray-200 text-gray-500">OCU.</span>
                            : <span className="text-[10px] px-1 py-0.5 rounded bg-green-100 text-green-700">VIS.</span>
                        }
                        {prop.featured && (
                          <span className="text-[10px] px-1 py-0.5 rounded bg-amber-100 text-amber-700">★</span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <span className="font-mono text-xs text-gray-500">{prop.ref_code ?? '—'}</span>
                      {prop.external_source === 'habihub' && prop.external_id && /^\d+$/.test(prop.external_id) && (
                        <p className="font-mono text-xs text-blue-500 mt-0.5">{prop.external_id}</p>
                      )}
                    </td>
                    <td className="px-2 py-2 overflow-hidden">
                      {prop.habihub_dev_id ? (
                        <div className="flex items-center gap-0.5">
                          <span className="font-mono text-xs text-gray-400 truncate" title={prop.habihub_dev_id}>{prop.habihub_dev_id}</span>
                          <button
                            type="button"
                            title="Pegar en buscador de HabiHub para encontrar el development"
                            onClick={() => {
                              navigator.clipboard.writeText(prop.habihub_dev_id!)
                              toast.success(`Copiado: ${prop.habihub_dev_id}`)
                            }}
                            className="flex-shrink-0 p-0.5 text-gray-300 hover:text-blue-500 transition-colors"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-2 py-2 overflow-hidden">
                      <div
                        className="truncate text-xs text-gray-600"
                        title={[prop.country, prop.location].filter(Boolean).join(' / ')}
                      >
                        {prop.country ?? '—'}{prop.location && <span className="text-gray-400"> / {prop.location}</span>}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-gray-700 text-xs whitespace-nowrap">
                      {prop.price
                        ? `${prop.currency ?? 'EUR'} ${prop.price.toLocaleString('es-ES')}`
                        : '—'}
                    </td>
                    <td className="px-2 py-2 overflow-hidden">
                      {prop.property_type
                        ? <span className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-full truncate block">
                            {translatePropertyType(prop.property_type)}
                          </span>
                        : '—'}
                    </td>
                    <td className="px-1 py-2 text-center">
                      <FeaturedToggleButton id={prop.id} featured={prop.featured} />
                    </td>
                    <td className="px-1 py-2 text-center">
                      <PropertyVisibilityToggle id={prop.id} hidden={prop.hidden ?? false} />
                    </td>
                    <td className="px-1 py-2 text-center">
                      <SoldToggleButton id={prop.id} sold={prop.sold ?? false} />
                    </td>
                    <td className="px-1 py-2 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <a
                          href={`/admin/propiedades/${prop.id}/edit`}
                          className="text-gray-500 hover:text-[#131D2E] p-1 rounded border border-gray-200 hover:border-gray-400 transition-colors"
                          title="Editar propiedad"
                        >
                          <Pencil size={14} />
                        </a>
                        {prop.slug && (
                          <a
                            href={`/propiedades/${prop.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 hover:text-blue-600 p-1"
                            title="Ver en sitio"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
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
          ← Anterior
        </a>
        <span className="text-sm text-gray-500">
          Página {page + 1} de {Math.max(1, Math.ceil(totalCount / pageSize))}
        </span>
        <a
          href={end < totalCount ? buildUrl({ page: String(page + 1) }) : '#'}
          aria-disabled={end >= totalCount}
          className={`flex items-center gap-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 ${end >= totalCount ? 'opacity-40 pointer-events-none' : ''}`}
        >
          Siguiente →
        </a>
      </div>
    </div>
  )
}
