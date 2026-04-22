'use client'

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

  const isPriceActive = (min: string, max: string) =>
    (currentFilters.precioMin?.toString() ?? '') === min &&
    (currentFilters.precioMax?.toString() ?? '') === max

  return (
    <aside
      style={{
        width: 280,
        flexShrink: 0,
        position: 'sticky',
        top: 100,
        height: 'fit-content',
        opacity: isPending ? 0.6 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>Filtros</h3>
        {hasFilters && (
          <button
            onClick={() => startTransition(() => router.push('/destinos/espana'))}
            style={{ fontSize: 12, color: '#D4AF37', background: 'none', border: 'none', cursor: 'pointer' }}
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
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid',
                  textAlign: 'left',
                  fontSize: 13,
                  cursor: 'pointer',
                  backgroundColor: active ? '#131D2E' : 'white',
                  color: active ? 'white' : '#374151',
                  borderColor: active ? '#131D2E' : '#e5e7eb',
                  fontWeight: active ? 600 : 400,
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
                  padding: '7px 12px',
                  borderRadius: 6,
                  border: '1px solid',
                  textAlign: 'left',
                  fontSize: 12,
                  cursor: 'pointer',
                  backgroundColor: active ? '#131D2E' : 'white',
                  color: active ? 'white' : '#374151',
                  borderColor: active ? '#131D2E' : '#e5e7eb',
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
                  width: 36, height: 36,
                  borderRadius: 6,
                  border: '1px solid',
                  fontSize: 13,
                  cursor: 'pointer',
                  backgroundColor: active ? '#131D2E' : 'white',
                  color: active ? 'white' : '#374151',
                  borderColor: active ? '#131D2E' : '#e5e7eb',
                  fontWeight: 600,
                }}
              >
                {n}+
              </button>
            )
          })}
        </div>
      </FilterSection>

      {/* Ordenar */}
      <FilterSection title="Ordenar por">
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
    </aside>
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

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #e5e7eb' }}>
      <h4 style={{
        fontSize: '0.75rem',
        fontWeight: 700,
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: 12,
        marginTop: 0,
      }}>
        {title}
      </h4>
      {children}
    </div>
  )
}
