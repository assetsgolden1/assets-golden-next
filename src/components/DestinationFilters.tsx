'use client'

import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import { translatePropertyType } from '@/lib/propertyTypes'

interface CurrentFilters {
  ciudad?: string
  tipo?: string
  precioMin?: number | null
  precioMax?: number | null
  habitaciones?: number | null
  orden?: string
}

interface DestinationFiltersProps {
  slug: string
  cities: string[]
  types: string[]
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

export function DestinationFilters({
  slug,
  cities,
  types,
  currentFilters,
  totalCount,
}: DestinationFiltersProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [mobileOpen, setMobileOpen] = useState(false)
  const basePath = `/destinos/${slug}`

  const activeCount = [
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
    next.delete('page')
    for (const [k, v] of Object.entries(overrides)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    return next.toString()
  }

  function applyFilter(key: string, value: string) {
    startTransition(() => {
      router.push(`${basePath}?${buildParams({ [key]: value })}`)
    })
  }

  function applyPrice(min: string, max: string, isActive: boolean) {
    startTransition(() => {
      if (isActive) {
        router.push(`${basePath}?${buildParams({ precio_min: '', precio_max: '' })}`)
      } else {
        router.push(`${basePath}?${buildParams({ precio_min: min, precio_max: max })}`)
      }
    })
  }

  function clearAll() {
    startTransition(() => { router.push(basePath) })
    setMobileOpen(false)
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
          <span style={{ fontSize: 12, color: '#6b7280' }}>{totalCount} props</span>
          {activeCount > 0 && (
            <button onClick={clearAll} style={{
              fontSize: 11, color: '#D4AF37', background: 'none',
              border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0,
            }}>
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Ciudad */}
      {cities.length > 0 && (
        <FilterBlock title="Ciudad">
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            maxHeight: cities.length > 15 ? 280 : 'none',
            overflowY: cities.length > 15 ? 'auto' : 'visible',
            paddingRight: cities.length > 15 ? 4 : 0,
          }}>
            {cities.map(city => {
              const active = currentFilters.ciudad === city
              return (
                <button
                  key={city}
                  onClick={() => applyFilter('ciudad', active ? '' : city)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: '1px solid',
                    textAlign: 'left',
                    fontSize: 13,
                    cursor: isPending ? 'wait' : 'pointer',
                    backgroundColor: active ? '#131D2E' : 'white',
                    color: active ? 'white' : '#374151',
                    borderColor: active ? '#131D2E' : '#e5e7eb',
                    fontWeight: active ? 600 : 400,
                    opacity: isPending ? 0.7 : 1,
                  }}
                >
                  {city}
                </button>
              )
            })}
          </div>
        </FilterBlock>
      )}

      {/* Tipo */}
      {types.length > 0 && (
        <FilterBlock title="Tipo de propiedad">
          <select value={currentFilters.tipo ?? ''} onChange={e => applyFilter('tipo', e.target.value)} style={selectStyle}>
            <option value="">Todos los tipos</option>
            {types.map(t => <option key={t} value={t}>{translatePropertyType(t)}</option>)}
          </select>
        </FilterBlock>
      )}

      {/* Precio */}
      <FilterBlock title="Precio">
        {PRICE_RANGES.map(range => {
          const active = isPriceActive(range.min, range.max)
          return (
            <button
              key={range.label}
              onClick={() => applyPrice(range.min, range.max, active)}
              style={{
                display: 'block', width: '100%',
                padding: '7px 10px', borderRadius: 6,
                border: '1px solid', textAlign: 'left',
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
        <select value={currentFilters.orden ?? 'reciente'} onChange={e => applyFilter('orden', e.target.value)} style={selectStyle}>
          <option value="reciente">Más reciente</option>
          <option value="precio_asc">Precio ↑ menor a mayor</option>
          <option value="precio_desc">Precio ↓ mayor a menor</option>
        </select>
      </FilterBlock>
    </div>
  )

  return (
    <>
      {/* Mobile: botón disparador */}
      <div style={{ display: 'none' }} className="filters-mobile-trigger">
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

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="filters-mobile-drawer"
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
              <button
                onClick={() => setMobileOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' }}
              >
                ✕
              </button>
            </div>
            {panelContent}
          </div>
        </div>
      )}

      {/* Desktop: sidebar fija */}
      <aside
        className="filters-desktop"
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
          .filters-desktop { display: none !important; }
          .filters-mobile-trigger { display: block !important; }
          .filters-mobile-drawer { display: flex !important; }
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
