'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { translatePropertyType } from '@/lib/propertyTypes'

interface CurrentFilters {
  zona?: string
  ciudad?: string
  tipo?: string
  precioMin?: number | null
  precioMax?: number | null
  habitaciones?: number | null
  orden?: string
}

interface SpainFiltersProps {
  zones: [string, string][]
  cities: string[]
  types: string[]
  currentFilters: CurrentFilters
}

const PRICE_RANGES = [
  { label: 'Hasta 300.000€',          min: '',        max: '300000' },
  { label: '300.000€ – 600.000€',     min: '300000',  max: '600000' },
  { label: '600.000€ – 1.000.000€',   min: '600000',  max: '1000000' },
  { label: '1.000.000€ – 3.000.000€', min: '1000000', max: '3000000' },
  { label: 'Más de 3.000.000€',       min: '3000000', max: '' },
]

export function SpainFilters({ zones, cities, types, currentFilters }: SpainFiltersProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [mobileOpen, setMobileOpen] = useState(false)

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
    const overrides: Record<string, string> = { [key]: value }
    if (key === 'zona') overrides['ciudad'] = ''
    startTransition(() => {
      router.push(`/destinos/espana?${buildParams(overrides)}`)
    })
  }

  const hasFilters = !!(
    currentFilters.zona || currentFilters.ciudad || currentFilters.tipo ||
    currentFilters.precioMin || currentFilters.precioMax || currentFilters.habitaciones
  )

  const activeCount = [
    currentFilters.zona,
    currentFilters.ciudad,
    currentFilters.tipo,
    currentFilters.precioMin || currentFilters.precioMax,
    currentFilters.habitaciones,
  ].filter(Boolean).length

  const isPriceActive = (min: string, max: string) =>
    (currentFilters.precioMin?.toString() ?? '') === min &&
    (currentFilters.precioMax?.toString() ?? '') === max

  const panelContent = (
    <div style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 0.15s' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #e5e7eb',
      }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0, color: '#131D2E' }}>
          Filtros
        </h3>
        {hasFilters && (
          <button
            onClick={() => startTransition(() => router.push('/destinos/espana'))}
            style={{ fontSize: 11, color: '#D4AF37', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* Zona */}
      <FilterSection title="Zona">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {zones.map(([slug, name]) => {
            const active = currentFilters.zona === slug
            return (
              <button
                key={slug}
                onClick={() => applyFilter('zona', active ? '' : slug)}
                style={{
                  padding: '8px 12px', borderRadius: 6, border: '1px solid',
                  textAlign: 'left', fontSize: 13, cursor: 'pointer',
                  backgroundColor: active ? '#131D2E' : 'white',
                  color: active ? 'white' : '#374151',
                  borderColor: active ? '#131D2E' : '#e5e7eb',
                  fontWeight: active ? 600 : 400,
                  opacity: isPending ? 0.7 : 1,
                }}
              >
                {name}
              </button>
            )
          })}
        </div>
      </FilterSection>

      {/* Ciudad — solo con zona seleccionada */}
      {currentFilters.zona && cities.length > 0 && (
        <FilterSection title="Ciudad">
          <select
            value={currentFilters.ciudad ?? ''}
            onChange={e => applyFilter('ciudad', e.target.value)}
            style={selectStyle}
          >
            <option value="">Todas las ciudades</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </FilterSection>
      )}

      {/* Tipo */}
      <FilterSection title="Tipo de propiedad">
        <select
          value={currentFilters.tipo ?? ''}
          onChange={e => applyFilter('tipo', e.target.value)}
          style={selectStyle}
        >
          <option value="">Todos los tipos</option>
          {types.map(t => (
            <option key={t} value={t}>{translatePropertyType(t)}</option>
          ))}
        </select>
      </FilterSection>

      {/* Precio */}
      <FilterSection title="Precio">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PRICE_RANGES.map(range => {
            const active = isPriceActive(range.min, range.max)
            return (
              <button
                key={range.label}
                onClick={() => {
                  const overrides = active
                    ? { precio_min: '', precio_max: '' }
                    : { precio_min: range.min, precio_max: range.max }
                  startTransition(() => {
                    router.push(`/destinos/espana?${buildParams(overrides)}`)
                  })
                }}
                style={{
                  padding: '7px 12px', borderRadius: 6, border: '1px solid',
                  textAlign: 'left', fontSize: 12, cursor: 'pointer',
                  backgroundColor: active ? '#131D2E' : 'white',
                  color: active ? 'white' : '#374151',
                  borderColor: active ? '#131D2E' : '#e5e7eb',
                  opacity: isPending ? 0.7 : 1,
                }}
              >
                {range.label}
              </button>
            )
          })}
        </div>
      </FilterSection>

      {/* Habitaciones */}
      <FilterSection title="Habitaciones mínimas">
        <div style={{ display: 'flex', gap: 6 }}>
          {[1, 2, 3, 4, 5].map(n => {
            const active = currentFilters.habitaciones === n
            return (
              <button
                key={n}
                onClick={() => applyFilter('habitaciones', active ? '' : String(n))}
                style={{
                  width: 36, height: 36, borderRadius: 6, border: '1px solid',
                  fontSize: 13, cursor: 'pointer', fontWeight: 600,
                  backgroundColor: active ? '#131D2E' : 'white',
                  color: active ? 'white' : '#374151',
                  borderColor: active ? '#131D2E' : '#e5e7eb',
                  opacity: isPending ? 0.7 : 1,
                }}
              >
                {n}+
              </button>
            )
          })}
        </div>
      </FilterSection>

      {/* Ordenar */}
      <FilterSection title="Ordenar por" last>
        <select
          value={currentFilters.orden ?? 'reciente'}
          onChange={e => applyFilter('orden', e.target.value)}
          style={selectStyle}
        >
          <option value="reciente">Más reciente</option>
          <option value="precio_asc">Precio: menor a mayor</option>
          <option value="precio_desc">Precio: mayor a menor</option>
        </select>
      </FilterSection>
    </div>
  )

  return (
    <>
      {/* Mobile trigger */}
      <div style={{ display: 'none' }} className="spain-filters-mobile-trigger">
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
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="4" y1="12" x2="14" y2="12"/>
            <line x1="4" y1="18" x2="9" y2="18"/>
          </svg>
          Filtros{activeCount > 0 ? ` (${activeCount})` : ''}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'flex-end',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setMobileOpen(false) }}
        >
          <div style={{
            backgroundColor: 'white', borderRadius: '16px 16px 0 0',
            padding: 24, width: '100%', maxHeight: '85vh', overflowY: 'auto',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 20,
            }}>
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

      {/* Desktop aside */}
      <aside
        className="spain-filters-desktop"
        style={{
          width: 280, flexShrink: 0,
          position: 'sticky', top: 100, height: 'fit-content',
          backgroundColor: 'white', borderRadius: 10,
          border: '1px solid #e5e7eb', padding: 20,
        }}
      >
        {panelContent}
      </aside>

      <style>{`
        @media (max-width: 767px) {
          .spain-filters-desktop { display: none !important; }
          .spain-filters-mobile-trigger { display: block !important; }
        }
      `}</style>
    </>
  )
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 6,
  border: '1px solid #e5e7eb',
  fontSize: 13,
  backgroundColor: 'white',
  color: '#374151',
}

function FilterSection({ title, children, last = false }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ marginBottom: last ? 0 : 24, paddingBottom: last ? 0 : 24, borderBottom: last ? 'none' : '1px solid #e5e7eb' }}>
      <h4 style={{
        fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        marginBottom: 12, marginTop: 0,
      }}>
        {title}
      </h4>
      {children}
    </div>
  )
}
