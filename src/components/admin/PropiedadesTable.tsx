'use client'

import { useState, useTransition } from 'react'
import { ExternalLink } from 'lucide-react'
import { bulkHideProperties, bulkDeleteProperties } from '@/app/admin/actions'
import { translatePropertyType } from '@/lib/propertyTypes'
import { FeaturedToggleButton } from './FeaturedToggleButton'
import { PropertyVisibilityToggle } from './PropertyVisibilityToggle'
import { DeletePropertyButton } from './DeletePropertyButton'

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
  status: string
  image_url: string | null
  slug: string | null
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

        {/* Búsqueda */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500 font-medium">Título</label>
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Buscar..."
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
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
              onClick={handleBulkDelete}
              disabled={pending}
              className="px-3 py-1.5 bg-red-600 text-white rounded-md text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
            >
              Eliminar ({selected.size})
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
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selected.size === properties.length && properties.length > 0}
                    onChange={toggleSelectAll}
                    className="cursor-pointer w-4 h-4"
                  />
                </th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium w-14">Img</th>
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
                  <td colSpan={9} className="text-center py-8 text-gray-400">
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
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selected.has(prop.id)}
                        onChange={() => toggleSelect(prop.id)}
                        className="cursor-pointer w-4 h-4"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <img
                        src={prop.image_url ?? '/placeholder-property.svg'}
                        alt=""
                        className="w-10 h-10 object-cover rounded-lg"
                        onError={(e) => { e.currentTarget.src = '/placeholder-property.svg' }}
                      />
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
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                      {prop.price
                        ? `${prop.currency ?? 'EUR'} ${prop.price.toLocaleString('es-ES')}`
                        : '—'}
                    </td>
                    <td className="px-4 py-2">
                      {prop.property_type
                        ? <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                            {translatePropertyType(prop.property_type)}
                          </span>
                        : '—'}
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
                            className="text-blue-500 hover:text-blue-700 p-1"
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
