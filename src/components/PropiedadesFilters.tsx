'use client'

import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import { translatePropertyType } from '@/lib/propertyTypes'

interface CurrentFilters {
  pais?: string
  ciudad?: string
  tipo?: string
  precioMin?: number | null
  precioMax?: number | null
  habitaciones?: number | null
  orden?: string
}

interface PropiedadesFiltersProps {
  countries: string[]
  cities: string[]
  currentFilters: CurrentFilters
  totalCount: number
}

const PRICE_RANGES = [
  { label: 'Hasta 300.000€',        min: '',        max: '300000' },
  { label: '300k – 600k€',          min: '300000',  max: '600000' },
  { label: '600k – 1M€',            min: '600000',  max: '1000000' },
  { label: '1M – 3M€',              min: '1000000', max: '3000000' },
  { label: 'Más de 3M€',            min: '3000000', max: '' },
]

const PROPERTY_TYPES = [
  'apartment', 'penthouse', 'villa', 'house',
  'townhouse', 'land', 'building', 'rural', 'ground_floor',
]

export function PropiedadesFilters({
  countries,
  cities,
  currentFilters,
  totalCount,
}: PropiedadesFiltersProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [mobileOpen, setMobileOpen] = useState(false)

  const activeCount = [
    currentFilters.pais,
    currentFilters.ciudad,
    currentFilters.tipo,
    currentFilters.precioMin || currentFilters.precioMax,
    currentFilters.habitaciones,
  ].filter(Boolean).length

  function buildParams(overrides: Record<string, string>) {
    const current = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams()
    const next = new URLSearchParams(current)
    next.delete('pagina')
    for (const [k, v] of Object.entries(overrides)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    return next.toString()
  }

  function applyFilter(key: string, value: string) {
    const overrides: Record<string, string> = { [key]: value }
    // Al cambiar país, resetear ciudad
    if (key === 'pais') overrides['ciudad'] = ''
    startTransition(() => {
      router.push(`/propiedades?${buildParams(overrides)}`)
    })
  }

  function applyPrice(min: string, max: string, isActive: boolean) {
    startTransition(() => {
      if (isActive) {
        router.push(`/propiedades?${buildParams({ precio_min: '', precio_max: '' })}`)
      } else {
        router.push(`/propiedades?${buildParams({ precio_min: min, precio_max: max })}`)
      }
    })
  }

  const isPriceActive = (min: string, max: string) =>
    (currentFilters.precioMin?.toString() ?? '') === min &&
    (currentFilters.precioMax?.toString() ?? '') === max

  const panelContent = (
    <div style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 0.15s' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 20,
        paddingBottom: 16, borderBottom: '1px solid #e5e7eb',
      }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0, color: '#131D2E' }}>
          Filtros
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>{totalCount.toLocaleString('es-ES')} props</span>
          {activeCount > 0 && (
            <button
              onClick={() => startTransition(() => router.push('/propiedades'))}
              style={{ fontSize: 11, color: '#D4AF37', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* País */}
      {countries.length > 0 && (
        <FilterBlock title="País">
          <select value={currentFilters.pais ?? ''} onChange={e => applyFilter('pais', e.target.value)} style={selectStyle}>
            <option value="">Todos los países</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </FilterBlock>
      )}

      {/* Ciudad — solo si hay país seleccionado */}
      {currentFilters.pais && cities.length > 0 && (
        <FilterBlock title="Ciudad">
          <select value={currentFilters.ciudad ?? ''} onChange={e => applyFilter('ciudad', e.target.value)} style={selectStyle}>
            <option value="">Todas las ciudades</option>
            {cities.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
        </FilterBlock>
      )}

      {/* Tipo */}
      <FilterBlock title="Tipo de propiedad">
        <select value={currentFilters.tipo ?? ''} onChange={e => applyFilter('tipo', e.target.value)} style={selectStyle}>
          <option value="">Todos los tipos</option>
          {PROPERTY_TYPES.map(t => (
            <option key={t} value={t}>{translatePropertyType(t)}</option>
          ))}
        </select>
      </FilterBlock>

      {/* Precio */}
      <FilterBlock title="Precio">
        {PRICE_RANGES.map(range => {
          const active = isPriceActive(range.min, range.max)
          return (
            <button
              key={range.label}
              onClick={() => applyPrice(range.min, range.max, active)}
              style={{
                display: 'block', width: '100%', padding: '7px 10px',
                borderRadius: 6, border: '1px solid', textAlign: 'left',
                fontSize: 12, cursor: 'pointer', marginBottom: 4,
                backgroundColor: active ? '#131D2E' : 'white',
                color: active ? 'white' : '#374151',
                borderColor: active ? '#131D2E' : '#e5e7eb',
              }}
            >
              {range.label}
            </button>
          )
        })}
      </FilterBlock>

      {/* Habitaciones */}
      <FilterBlock title="Habitaciones mínimas">
        <div style={{ display: 'flex', gap: 6 }}>
          {[1, 2, 3, 4, 5].map(n => {
            const active = currentFilters.habitaciones === n
            return (
              <button
                key={n}
                onClick={() => applyFilter('habitaciones', active ? '' : String(n))}
                style={{
                  width: 36, height: 36, borderRadius: 6, border: '1px solid',
                  fontSize: 12, cursor: 'pointer', fontWeight: 600,
                  backgroundColor: active ? '#131D2E' : 'white',
                  color: active ? 'white' : '#374151',
                  borderColor: active ? '#131D2E' : '#e5e7eb',
                }}
              >
                {n}+
              </button>
            )
          })}
        </div>
      </FilterBlock>

      {/* Ordenar */}
      <FilterBlock title="Ordenar por" last>
        <select value={currentFilters.orden ?? ''} onChange={e => applyFilter('orden', e.target.value)} style={selectStyle}>
          <option value="">Más reciente</option>
          <option value="precio_asc">Precio ↑ menor a mayor</option>
          <option value="precio_desc">Precio ↓ mayor a menor</option>
        </select>
      </FilterBlock>
    </div>
  )

  return (
    <>
      {/* Mobile trigger */}
      <div style={{ display: 'none' }} className="props-filters-mobile-trigger">
        <button
          onClick={() => setMobileOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 16px', borderRadius: 8,
            border: '1px solid #e5e7eb', backgroundColor: 'white',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            color: '#131D2E', marginBottom: 16,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/>
            <line x1="4" y1="18" x2="9" y2="18"/>
          </svg>
          Filtros{activeCount > 0 ? ` (${activeCount})` : ''}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="props-filters-drawer"
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'flex-end',
          }}
          onClick={e => { if (e.target === e.currentTarget) setMobileOpen(false) }}
        >
          <div style={{
            backgroundColor: 'white', borderRadius: '16px 16px 0 0',
            padding: 24, width: '100%', maxHeight: '85vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>Filtros</span>
              <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' }}>
                ✕
              </button>
            </div>
            {panelContent}
          </div>
        </div>
      )}

      {/* Desktop aside */}
      <aside
        className="props-filters-desktop"
        style={{
          width: 260, flexShrink: 0,
          position: 'sticky', top: 100, height: 'fit-content',
          backgroundColor: 'white', borderRadius: 10,
          border: '1px solid #e5e7eb', padding: 20,
        }}
      >
        {panelContent}
      </aside>

      <style>{`
        @media (max-width: 767px) {
          .props-filters-desktop { display: none !important; }
          .props-filters-mobile-trigger { display: block !important; }
        }
      `}</style>
    </>
  )
}

const selectStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', borderRadius: 6,
  border: '1px solid #e5e7eb', fontSize: 13,
  backgroundColor: 'white', color: '#374151',
}

function FilterBlock({ title, children, last = false }: {
  title: string; children: React.ReactNode; last?: boolean
}) {
  return (
    <div style={{
      marginBottom: last ? 0 : 20, paddingBottom: last ? 0 : 20,
      borderBottom: last ? 'none' : '1px solid #f3f4f6',
    }}>
      <p style={{
        fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        marginBottom: 10, marginTop: 0,
      }}>
        {title}
      </p>
      {children}
    </div>
  )
}
