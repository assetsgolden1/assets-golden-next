'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Search, SlidersHorizontal, X, Building2,
  MapPin, Maximize, BedDouble, Bath,
} from 'lucide-react'
import { translatePropertyType, translatePropertyTitle } from '@/lib/propertyTypes'
import { toSentenceCase } from '@/lib/utils/normalizeText'
import { optimizedImage } from '@/lib/utils/optimizedImage'
import type { Property } from '@/types'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ─── Constants ───────────────────────────────────────────────────

const PRICE_RANGES = [
  { label: 'Hasta 300.000€',  min: '',        max: '300000'  },
  { label: '300k – 600k€',    min: '300000',  max: '600000'  },
  { label: '600k – 1M€',      min: '600000',  max: '1000000' },
  { label: '1M – 3M€',        min: '1000000', max: '3000000' },
  { label: 'Más de 3M€',      min: '3000000', max: ''        },
]

// ─── Types ───────────────────────────────────────────────────────

interface CountryMeta { name: string; count: number }
interface TypeMeta    { name: string; count: number }

interface FilterState {
  q:        string
  country:  string
  city:     string
  type:     string
  minPrice: string
  maxPrice: string
  bedrooms: string
  sort:     string
}

const EMPTY_FILTERS: FilterState = {
  q:        '',
  country:  '',
  city:     '',
  type:     '',
  minPrice: '',
  maxPrice: '',
  bedrooms: '',
  sort:     'recent',
}

// ─── Helpers ─────────────────────────────────────────────────────

function formatPrice(price: number | null, currency: string | null): string {
  if (!price) return 'Precio a consultar'
  const n = price.toLocaleString('es-ES')
  if (currency === 'EUR') return `${n} €`
  if (currency === 'USD') return `$${n}`
  if (currency === 'GBP') return `£${n}`
  return `${n} ${currency ?? ''}`
}

function activeFilterCount(f: FilterState): number {
  return [f.country, f.city, f.type, f.minPrice || f.maxPrice, f.bedrooms]
    .filter(Boolean).length
}

// ─── Property Card ───────────────────────────────────────────────

function PortalPropertyCard({ p }: { p: Property }) {
  return (
    <Link
      href={`/portal/propiedades/${p.slug ?? p.id}`}
      className="group block bg-white rounded-xl overflow-hidden border border-border hover:border-gold/40 hover:shadow-elegant transition-all"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {p.image_url ? (
          <Image
            src={optimizedImage(p.image_url, { width: 640, quality: 70 })}
            alt={p.title}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Building2 className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
        {p.featured && (
          <span className="absolute top-2 right-2 rounded-full bg-primary/80 px-2 py-0.5 text-xs font-medium text-gold border border-gold/30">
            Destacada
          </span>
        )}
      </div>

      <div className="p-3 sm:p-4">
        {p.property_type && (
          <p className="text-xs text-gold font-medium mb-0.5 uppercase tracking-wide">
            {translatePropertyType(p.property_type)}
          </p>
        )}
        <h3 className="font-display text-sm leading-snug text-foreground line-clamp-2 mb-1 group-hover:text-primary transition-colors">
          {toSentenceCase(translatePropertyTitle(p.title))}
        </h3>
        <div className="flex items-center gap-1 text-muted-foreground text-xs mb-2">
          <MapPin className="h-3 w-3 shrink-0 text-gold" />
          <span className="truncate">{[p.location, p.country].filter(Boolean).join(', ')}</span>
        </div>
        <p className="font-display text-base font-semibold text-gold mb-1">
          {formatPrice(p.price, p.currency)}
        </p>
        {p.ref_code && (
          <p className="text-xs text-muted-foreground font-mono mb-2">{p.ref_code}</p>
        )}
        <div className="flex items-center gap-3 text-muted-foreground text-xs border-t border-border pt-2">
          {p.area_sqm    != null && <span className="flex items-center gap-1"><Maximize className="h-3 w-3" />{p.area_sqm} m²</span>}
          {p.bedrooms    != null && <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" />{p.bedrooms}</span>}
          {p.bathrooms   != null && <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{p.bathrooms}</span>}
        </div>
      </div>
    </Link>
  )
}

// ─── Filters Panel ───────────────────────────────────────────────

interface FiltersPanelProps {
  filters:       FilterState
  countries:     CountryMeta[]
  types:         TypeMeta[]
  cities:        string[]
  totalCount:    number
  onChange:      (patch: Partial<FilterState>) => void
  onClear:       () => void
}

function FiltersPanel({
  filters, countries, types, cities, totalCount, onChange, onClear,
}: FiltersPanelProps) {
  const activePriceRange = PRICE_RANGES.find(
    r => r.min === filters.minPrice && r.max === filters.maxPrice,
  )

  function setPriceRange(range: typeof PRICE_RANGES[number]) {
    const isActive = activePriceRange?.label === range.label
    onChange(isActive
      ? { minPrice: '', maxPrice: '' }
      : { minPrice: range.min, maxPrice: range.max },
    )
  }

  const count = activeFilterCount(filters)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <span className="font-semibold text-sm text-primary">Filtros</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {totalCount.toLocaleString()} props
          </span>
          {count > 0 && (
            <button
              onClick={onClear}
              className="text-xs text-gold hover:underline font-medium"
            >
              Limpiar ({count})
            </button>
          )}
        </div>
      </div>

      {/* Búsqueda */}
      <FilterBlock title="Buscar">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={filters.q}
            onChange={e => onChange({ q: e.target.value })}
            placeholder="Título, ubicación o código (AG-12345)..."
            className="w-full pl-8 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-gold"
          />
          {UUID_REGEX.test(filters.q) && (
            <p className="mt-1 text-xs text-gold">
              Buscando por UUID exacto
            </p>
          )}
        </div>
      </FilterBlock>

      {/* País */}
      <FilterBlock title="País">
        <select
          value={filters.country}
          onChange={e => onChange({ country: e.target.value, city: '' })}
          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-gold"
        >
          <option value="">Todos los países</option>
          {countries.map(c => (
            <option key={c.name} value={c.name}>
              {c.name} ({c.count})
            </option>
          ))}
        </select>
      </FilterBlock>

      {/* Ciudad — solo si hay país */}
      {filters.country && cities.length > 0 && (
        <FilterBlock title="Ciudad">
          <div className="flex flex-col gap-1 max-h-52 overflow-y-auto pr-1">
            {cities.slice(0, 60).map(city => (
              <button
                key={city}
                onClick={() => onChange({ city: filters.city === city ? '' : city })}
                className={`text-left px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                  filters.city === city
                    ? 'bg-primary text-white border-primary font-semibold'
                    : 'bg-white text-foreground border-border hover:border-gold/50'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </FilterBlock>
      )}

      {/* Tipo */}
      <FilterBlock title="Tipo de propiedad">
        <select
          value={filters.type}
          onChange={e => onChange({ type: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-gold"
        >
          <option value="">Todos los tipos</option>
          {types.map(t => (
            <option key={t.name} value={t.name}>
              {translatePropertyType(t.name)} ({t.count})
            </option>
          ))}
        </select>
      </FilterBlock>

      {/* Precio */}
      <FilterBlock title="Precio">
        <div className="flex flex-col gap-1.5">
          {PRICE_RANGES.map(range => {
            const isActive = activePriceRange?.label === range.label
            return (
              <button
                key={range.label}
                onClick={() => setPriceRange(range)}
                className={`text-left px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                  isActive
                    ? 'bg-primary text-white border-primary font-semibold'
                    : 'bg-white text-foreground border-border hover:border-gold/50'
                }`}
              >
                {range.label}
              </button>
            )
          })}
        </div>
      </FilterBlock>

      {/* Habitaciones */}
      <FilterBlock title="Habitaciones mín." last>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => onChange({ bedrooms: filters.bedrooms === String(n) ? '' : String(n) })}
              className={`w-9 h-9 rounded-lg text-xs border font-semibold transition-colors ${
                filters.bedrooms === String(n)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-foreground border-border hover:border-gold/50'
              }`}
            >
              {n}+
            </button>
          ))}
        </div>
      </FilterBlock>
    </div>
  )
}

function FilterBlock({
  title, children, last = false,
}: {
  title: string
  children: React.ReactNode
  last?: boolean
}) {
  return (
    <div className={last ? '' : 'pb-5 border-b border-border/60'}>
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
        {title}
      </p>
      {children}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────

export function PortalPropertiesGrid() {
  const [filters, setFilters]     = useState<FilterState>(EMPTY_FILTERS)
  const [page, setPage]           = useState(1)
  const [properties, setProperties] = useState<Property[]>([])
  const [total, setTotal]         = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading]     = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  const [countries, setCountries] = useState<CountryMeta[]>([])
  const [types, setTypes]         = useState<TypeMeta[]>([])
  const [cities, setCities]       = useState<string[]>([])

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load metadata on mount
  useEffect(() => {
    fetch('/api/portal/filters-metadata')
      .then(r => r.json())
      .then(data => {
        setCountries(data.countries ?? [])
        setTypes(data.types ?? [])
      })
  }, [])

  // Load cities when country changes
  useEffect(() => {
    if (!filters.country) {
      setCities([])
      return
    }
    fetch(`/api/portal/filters-metadata?country=${encodeURIComponent(filters.country)}`)
      .then(r => r.json())
      .then(data => setCities(data.cities ?? []))
  }, [filters.country])

  // Fetch results con AbortController para cancelar requests stale
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const controller = new AbortController()

    const run = () => {
      setLoading(true)
      const p = new URLSearchParams()
      if (filters.q)        p.set('q',        filters.q)
      if (filters.country)  p.set('country',  filters.country)
      if (filters.city)     p.set('city',     filters.city)
      if (filters.type)     p.set('type',     filters.type)
      if (filters.minPrice) p.set('minPrice', filters.minPrice)
      if (filters.maxPrice) p.set('maxPrice', filters.maxPrice)
      if (filters.bedrooms) p.set('bedrooms', filters.bedrooms)
      p.set('sort', filters.sort)
      p.set('page', String(page))

      fetch(`/api/portal/search-properties?${p}`, { signal: controller.signal })
        .then(r => r.json())
        .then(data => {
          if (data.error) {
            console.error('[portal search]', data.error)
            setProperties([])
            setTotal(0)
            setTotalPages(1)
          } else {
            setProperties(data.properties ?? [])
            setTotal(data.total ?? 0)
            setTotalPages(data.totalPages ?? 1)
          }
          setLoading(false)
        })
        .catch(err => {
          if (err.name === 'AbortError') return
          console.error('[portal search fetch]', err)
          setLoading(false)
        })
    }

    // Debounce cuando hay texto; inmediato para cambios de filtro/página
    if (filters.q) {
      debounceRef.current = setTimeout(run, 350)
    } else {
      run()
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      controller.abort()
    }
  }, [filters, page])

  function patchFilters(patch: Partial<FilterState>) {
    setFilters(prev => ({ ...prev, ...patch }))
    setPage(1)
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS)
    setPage(1)
  }

  const activeCount = activeFilterCount(filters)

  const filterPanelProps: FiltersPanelProps = {
    filters, countries, types, cities, totalCount: total, onChange: patchFilters, onClear: clearFilters,
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
      {/* Mobile: filtros trigger */}
      <div className="w-full md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg border border-border bg-white text-sm font-medium"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            Filtros {activeCount > 0 && `(${activeCount})`}
          </span>
          <span className="text-xs text-muted-foreground">
            {loading ? '...' : `${total.toLocaleString()} resultados`}
          </span>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg text-primary">Filtros</h2>
              <button onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <FiltersPanel {...filterPanelProps} />
            <button
              onClick={() => setMobileOpen(false)}
              className="mt-5 w-full py-3 bg-primary text-white font-semibold rounded-lg"
            >
              Ver {total.toLocaleString()} propiedades
            </button>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-56 lg:w-64 shrink-0 sticky top-24 bg-white rounded-xl border border-border p-4">
        <FiltersPanel {...filterPanelProps} />
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Barra superior: contador + orden */}
        <div className="flex items-center justify-between mb-4 gap-4">
          <p className="text-sm text-muted-foreground">
            {loading
              ? 'Buscando...'
              : (
                <>
                  <span className="font-semibold text-foreground">
                    {total.toLocaleString()}
                  </span>{' '}
                  {total === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
                </>
              )}
          </p>
          <select
            value={filters.sort}
            onChange={e => patchFilters({ sort: e.target.value })}
            className="text-sm border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:border-gold bg-white shrink-0"
          >
            <option value="recent">Más recientes</option>
            <option value="price-asc">Precio ↑</option>
            <option value="price-desc">Precio ↓</option>
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-muted rounded-xl animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground mb-3">
              No hay propiedades con esos filtros.
            </p>
            <button
              onClick={clearFilters}
              className="text-sm text-gold hover:underline"
            >
              Limpiar todos los filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {properties.map(p => (
              <PortalPropertyCard key={p.id} p={p} />
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 rounded-lg border border-border text-sm hover:border-gold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>
            <span className="text-sm text-muted-foreground px-2">
              Página {page} de {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 rounded-lg border border-border text-sm hover:border-gold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
