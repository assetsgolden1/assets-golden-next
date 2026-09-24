'use client'

import { useMemo, useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { translatePropertyType } from '@/lib/propertyTypes'
import type { LocationEntry } from '@/lib/admin/regions'

/**
 * Filtros del panel de propiedades. Imitan el filtro público de /propiedades:
 * cada clic aplica el filtro al momento (sin botón "Filtrar") y la ubicación va en
 * cascada País → Región → Ciudad, de modo que al elegir España solo se ven sus
 * regiones y sus ciudades.
 *
 * A diferencia del público (zonas escritas a mano en spainZones.ts), la región sale
 * de la provincia guardada en BD, así que cubre todo el catálogo: Cataluña incluida.
 */

export interface AdminFilterValues {
  search: string
  pais: string
  region: string
  ciudad: string
  tipo: string
  precioMin: string
  precioMax: string
  filter: string
}

const PRICE_RANGES = [
  { label: 'Hasta 300.000 €', min: '', max: '300000' },
  { label: '300.000 – 600.000 €', min: '300000', max: '600000' },
  { label: '600.000 € – 1 M€', min: '600000', max: '1000000' },
  { label: '1 M€ – 3 M€', min: '1000000', max: '3000000' },
  { label: 'Más de 3 M€', min: '3000000', max: '' },
]

function tally(items: { name: string; count: number }[]) {
  const m = new Map<string, number>()
  for (const { name, count } of items) m.set(name, (m.get(name) ?? 0) + count)
  return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], 'es'))
}

const fmt = (n: number) => n.toLocaleString('es-ES')

export function AdminPropertyFilters({
  values,
  countries,
  locations,
  types,
  totalCount,
}: {
  values: AdminFilterValues
  countries: string[]
  locations: LocationEntry[]
  types: string[]
  totalCount: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  const [searchText, setSearchText] = useState(values.search)
  const [cityQuery, setCityQuery] = useState('')
  const [minText, setMinText] = useState(values.precioMin)
  const [maxText, setMaxText] = useState(values.precioMax)

  /** Aplica cambios a la URL al instante. `null` borra la clave. Siempre vuelve a la página 1. */
  function apply(changes: Partial<Record<keyof AdminFilterValues | 'precio_min' | 'precio_max', string | null>>) {
    const current: Record<string, string> = {
      search: values.search,
      pais: values.pais,
      region: values.region,
      ciudad: values.ciudad,
      tipo: values.tipo,
      precio_min: values.precioMin,
      precio_max: values.precioMax,
      filter: values.filter,
    }
    for (const [k, v] of Object.entries(changes)) current[k] = v ?? ''
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries(current)) if (v) p.set(k, v)
    p.set('page', '0')
    startTransition(() => router.push(`${pathname}?${p.toString()}`))
  }

  const countryCounts = useMemo(() => {
    const m = new Map<string, number>()
    for (const l of locations) m.set(l.country, (m.get(l.country) ?? 0) + l.count)
    return m
  }, [locations])

  const regionOptions = useMemo(
    () => (values.pais
      ? tally(locations.filter((l) => l.country === values.pais && l.region).map((l) => ({ name: l.region!, count: l.count })))
      : []),
    [locations, values.pais],
  )

  const cityOptions = useMemo(() => {
    if (!values.pais) return []
    const all = tally(
      locations
        .filter((l) => l.country === values.pais && (!values.region || l.region === values.region))
        .map((l) => ({ name: l.city, count: l.count })),
    )
    const q = cityQuery.trim().toLowerCase()
    return q ? all.filter(([name]) => name.toLowerCase().includes(q)) : all
  }, [locations, values.pais, values.region, cityQuery])

  const priceActive = values.precioMin || values.precioMax
  const chips: { label: string; clear: Parameters<typeof apply>[0] }[] = []
  if (values.search) chips.push({ label: `“${values.search}”`, clear: { search: null } })
  if (values.pais) chips.push({ label: values.pais, clear: { pais: null, region: null, ciudad: null } })
  if (values.region) chips.push({ label: values.region, clear: { region: null, ciudad: null } })
  if (values.ciudad) chips.push({ label: values.ciudad, clear: { ciudad: null } })
  if (values.tipo) chips.push({ label: translatePropertyType(values.tipo), clear: { tipo: null } })
  if (priceActive) {
    const a = values.precioMin ? fmt(Number(values.precioMin)) : '0'
    const b = values.precioMax ? fmt(Number(values.precioMax)) : '∞'
    chips.push({ label: `${a} – ${b} €`, clear: { precio_min: null, precio_max: null } })
  }

  const chipBtn = (active: boolean) =>
    `w-full text-left px-3 py-2 rounded-md border text-[13px] transition-colors flex justify-between items-center gap-2 ${
      active
        ? 'bg-[#0a1628] border-[#0a1628] text-white font-semibold'
        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
    }`

  return (
    <aside
      className={`w-full lg:w-72 shrink-0 bg-white rounded-xl shadow-sm p-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto transition-opacity ${
        pending ? 'opacity-60' : ''
      }`}
    >
      {/* Cabecera */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-900">Filtros</h2>
        <span className="text-xs text-gray-500">{fmt(totalCount)} props</span>
      </div>

      {/* Filtros activos */}
      {chips.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <button
              key={c.label}
              onClick={() => apply(c.clear)}
              className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs text-amber-900 hover:bg-amber-100"
              title="Quitar este filtro"
            >
              {c.label} <X className="w-3 h-3" />
            </button>
          ))}
          <button
            onClick={() => {
              setSearchText(''); setMinText(''); setMaxText('')
              startTransition(() => router.push(`${pathname}${values.filter ? `?filter=${values.filter}` : ''}`))
            }}
            className="text-xs font-semibold text-[#b08d4f] hover:underline px-1"
          >
            Limpiar todo
          </button>
        </div>
      )}

      {/* Búsqueda libre */}
      <Block title="Buscar">
        <form
          className="flex gap-1.5"
          onSubmit={(e) => { e.preventDefault(); apply({ search: searchText.trim() || null }) }}
        >
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="AG-1234, HabiHub, título, ciudad…"
            className="flex-1 min-w-0 border border-gray-200 rounded-md px-2.5 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="bg-[#0a1628] text-white rounded-md px-3 text-xs font-semibold hover:bg-[#1a2638]">
            Buscar
          </button>
        </form>
      </Block>

      {/* País */}
      <Block title="País">
        <select
          value={values.pais}
          onChange={(e) => { setCityQuery(''); apply({ pais: e.target.value || null, region: null, ciudad: null }) }}
          className="w-full border border-gray-200 rounded-md px-2.5 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los países</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}{countryCounts.get(c) ? ` (${fmt(countryCounts.get(c)!)})` : ''}
            </option>
          ))}
        </select>
      </Block>

      {/* Región */}
      {regionOptions.length > 0 && (
        <Block title={values.pais === 'España' ? 'Comunidad autónoma' : 'Región'}>
          <div className="flex flex-col gap-1.5">
            {regionOptions.map(([name, n]) => (
              <button
                key={name}
                onClick={() => { setCityQuery(''); apply({ region: values.region === name ? null : name, ciudad: null }) }}
                className={chipBtn(values.region === name)}
              >
                <span className="truncate">{name}</span>
                <span className={`text-xs ${values.region === name ? 'text-white/70' : 'text-gray-400'}`}>{fmt(n)}</span>
              </button>
            ))}
          </div>
        </Block>
      )}

      {/* Ciudad */}
      {values.pais && (
        <Block title={`Ciudad${values.region ? ` · ${values.region}` : ''}`}>
          <input
            type="text"
            value={cityQuery}
            onChange={(e) => setCityQuery(e.target.value)}
            placeholder="Buscar ciudad…"
            className="w-full mb-2 border border-gray-200 rounded-md px-2.5 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-1">
            {cityOptions.length === 0 && <p className="text-xs text-gray-400 italic">Sin ciudades</p>}
            {cityOptions.map(([name, n]) => (
              <button
                key={name}
                onClick={() => apply({ ciudad: values.ciudad === name ? null : name })}
                className={chipBtn(values.ciudad === name)}
              >
                <span className="truncate">{name}</span>
                <span className={`text-xs ${values.ciudad === name ? 'text-white/70' : 'text-gray-400'}`}>{fmt(n)}</span>
              </button>
            ))}
          </div>
        </Block>
      )}
      {!values.pais && (
        <p className="-mt-2 mb-4 text-xs italic text-gray-400">Elige un país para ver sus regiones y ciudades.</p>
      )}

      {/* Tipo */}
      <Block title="Tipo">
        <select
          value={values.tipo}
          onChange={(e) => apply({ tipo: e.target.value || null })}
          className="w-full border border-gray-200 rounded-md px-2.5 py-2 text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los tipos</option>
          {types.map((t) => <option key={t} value={t}>{translatePropertyType(t)}</option>)}
        </select>
      </Block>

      {/* Precio */}
      <Block title="Precio" last>
        <div className="flex flex-col gap-1.5">
          {PRICE_RANGES.map((r) => {
            const active = values.precioMin === r.min && values.precioMax === r.max
            return (
              <button
                key={r.label}
                onClick={() => {
                  setMinText(active ? '' : r.min); setMaxText(active ? '' : r.max)
                  apply(active ? { precio_min: null, precio_max: null } : { precio_min: r.min || null, precio_max: r.max || null })
                }}
                className={chipBtn(active)}
              >
                {r.label}
              </button>
            )
          })}
        </div>
        <form
          className="mt-2 flex gap-1.5 items-center"
          onSubmit={(e) => { e.preventDefault(); apply({ precio_min: minText || null, precio_max: maxText || null }) }}
        >
          <input
            type="number" value={minText} onChange={(e) => setMinText(e.target.value)} placeholder="Mín"
            className="w-full min-w-0 border border-gray-200 rounded-md px-2 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number" value={maxText} onChange={(e) => setMaxText(e.target.value)} placeholder="Máx"
            className="w-full min-w-0 border border-gray-200 rounded-md px-2 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="bg-gray-100 text-gray-700 rounded-md px-2.5 py-1.5 text-xs font-semibold hover:bg-gray-200">
            OK
          </button>
        </form>
      </Block>
    </aside>
  )
}

function Block({ title, children, last = false }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={last ? '' : 'mb-4 pb-4 border-b border-gray-100'}>
      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">{title}</p>
      {children}
    </div>
  )
}
