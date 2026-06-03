'use client'

import { useState, useEffect } from 'react'
import { useTransition } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { translatePropertyType } from '@/lib/propertyTypes'
import { translateCountry } from '@/lib/utils/translateGeography'
import { formatNumber } from '@/lib/utils/format'
import { ZONE_SLUGS, getCitiesInZone } from '@/lib/constants/spainZones'

interface PropiedadesFiltersProps {
  countries: string[]
  cities: string[]
  types: string[]
  currentFilters: {
    pais?: string
    zona?: string
    ciudad?: string
    tipo?: string
    precioMin?: number | null
    precioMax?: number | null
    habitaciones?: number | null
    orden?: string
    destacadas?: string
    q?: string
  }
  totalCount: number
  basePath: string
}

export function PropiedadesFilters({
  countries,
  cities,
  types,
  currentFilters,
  totalCount,
  basePath,
}: PropiedadesFiltersProps) {
  const t = useTranslations('Filters')
  const locale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchText, setSearchText] = useState(currentFilters.q ?? '')

  useEffect(() => {
    setSearchText(currentFilters.q ?? '')
  }, [currentFilters.q])

  const PRICE_RANGES = [
    { label: t('price_to_300'),  min: '',        max: '300000' },
    { label: t('price_300_600'), min: '300000',  max: '600000' },
    { label: t('price_600_1m'),  min: '600000',  max: '1000000' },
    { label: t('price_1m_3m'),   min: '1000000', max: '3000000' },
    { label: t('price_over_3m'), min: '3000000', max: '' },
  ]

  function applyFilter(key: string, value: string, resetKeys: string[] = []) {
    const params = new URLSearchParams(window.location.search)
    if (value) params.set(key, value)
    else params.delete(key)
    resetKeys.forEach((k) => params.delete(k))
    params.delete('page')
    params.delete('pagina')
    startTransition(() => {
      router.push(`${basePath}?${params.toString()}`)
    })
  }

  const isSpain =
    currentFilters.pais === 'España' ||
    currentFilters.pais?.toLowerCase().includes('espa')

  const spainZones = Object.entries(ZONE_SLUGS)

  const visibleCities = isSpain
    ? currentFilters.zona
      ? getCitiesInZone(ZONE_SLUGS[currentFilters.zona] ?? '').sort()
      : []
    : cities

  const hasActiveFilters = Object.entries(currentFilters).some(
    ([k, v]) => k !== 'orden' && v
  )

  const activeCount = [
    currentFilters.pais,
    currentFilters.zona,
    currentFilters.ciudad,
    currentFilters.tipo,
    currentFilters.precioMin || currentFilters.precioMax,
    currentFilters.habitaciones,
    currentFilters.destacadas,
  ].filter(Boolean).length

  const panelContent = (
    <div style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 0.15s' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #e5e7eb' }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0, color: '#131D2E' }}>
          {t('title')}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            {formatNumber(totalCount, locale)} props
          </span>
          {hasActiveFilters && (
            <button
              onClick={() => startTransition(() => router.push(basePath))}
              style={{ fontSize: 11, color: '#D4AF37', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
            >
              {t('clear')}
            </button>
          )}
        </div>
      </div>

      {/* Free search */}
      <FilterBlock title={t('apply')}>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); applyFilter('q', searchText.trim()) }
            }}
            placeholder={t('search_placeholder')}
            style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 13, backgroundColor: 'white', color: '#374151', outline: 'none' }}
          />
          <button
            onClick={() => applyFilter('q', searchText.trim())}
            disabled={isPending}
            style={{ padding: '8px 12px', borderRadius: 6, backgroundColor: '#131D2E', color: 'white', border: 'none', fontSize: 12, fontWeight: 600, cursor: isPending ? 'wait' : 'pointer', opacity: isPending ? 0.7 : 1, whiteSpace: 'nowrap' }}
          >
            {t('apply')}
          </button>
        </div>
        {currentFilters.q && (
          <button
            onClick={() => { setSearchText(''); applyFilter('q', '') }}
            style={{ marginTop: 6, fontSize: 11, color: '#D4AF37', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
          >
            {t('remove_search')}
          </button>
        )}
      </FilterBlock>

      {/* Featured toggle */}
      <FilterBlock title={t('featured_only')}>
        <button
          onClick={() => applyFilter('destacadas', currentFilters.destacadas === 'true' ? '' : 'true')}
          style={{
            padding: '8px 12px', borderRadius: 6, border: '1px solid', width: '100%', textAlign: 'left', fontSize: 13,
            cursor: isPending ? 'wait' : 'pointer',
            backgroundColor: currentFilters.destacadas === 'true' ? '#D4AF37' : 'white',
            color: currentFilters.destacadas === 'true' ? 'white' : '#374151',
            borderColor: currentFilters.destacadas === 'true' ? '#D4AF37' : '#e5e7eb',
            fontWeight: currentFilters.destacadas === 'true' ? 600 : 400,
            opacity: isPending ? 0.7 : 1,
          }}
        >
          ⭐ {currentFilters.destacadas === 'true' ? t('featured_only') : t('featured_only')}
        </button>
      </FilterBlock>

      {/* Country */}
      <FilterBlock title={t('country')}>
        <select value={currentFilters.pais ?? ''} onChange={(e) => applyFilter('pais', e.target.value, ['zona', 'ciudad'])} style={selectStyle}>
          <option value="">{t('all_countries')}</option>
          {countries.map((c) => <option key={c} value={c}>{translateCountry(c, locale)}</option>)}
        </select>
      </FilterBlock>

      {/* Zone — only for Spain */}
      {isSpain && (
        <FilterBlock title={t('zone')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {spainZones.map(([slug, name]) => (
              <button
                key={slug}
                onClick={() => applyFilter('zona', currentFilters.zona === slug ? '' : slug, ['ciudad'])}
                style={{
                  padding: '8px 12px', borderRadius: 6, border: '1px solid', textAlign: 'left', fontSize: 13,
                  cursor: isPending ? 'wait' : 'pointer',
                  backgroundColor: currentFilters.zona === slug ? '#131D2E' : 'white',
                  color: currentFilters.zona === slug ? 'white' : '#374151',
                  borderColor: currentFilters.zona === slug ? '#131D2E' : '#e5e7eb',
                  fontWeight: currentFilters.zona === slug ? 600 : 400,
                  opacity: isPending ? 0.7 : 1,
                }}
              >
                {name}
              </button>
            ))}
          </div>
        </FilterBlock>
      )}

      {/* City */}
      {visibleCities.length > 0 && (
        <FilterBlock title={t('city')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: visibleCities.length > 15 ? 280 : 'none', overflowY: visibleCities.length > 15 ? 'auto' : 'visible' }}>
            {visibleCities.map((city) => (
              <button
                key={city}
                onClick={() => applyFilter('ciudad', currentFilters.ciudad === city ? '' : city)}
                style={{
                  padding: '8px 12px', borderRadius: 6, border: '1px solid', textAlign: 'left', fontSize: 13,
                  cursor: isPending ? 'wait' : 'pointer',
                  backgroundColor: currentFilters.ciudad === city ? '#131D2E' : 'white',
                  color: currentFilters.ciudad === city ? 'white' : '#374151',
                  borderColor: currentFilters.ciudad === city ? '#131D2E' : '#e5e7eb',
                  fontWeight: currentFilters.ciudad === city ? 600 : 400,
                  opacity: isPending ? 0.7 : 1,
                }}
              >
                {city}
              </button>
            ))}
          </div>
        </FilterBlock>
      )}

      {/* Zone hint */}
      {isSpain && !currentFilters.zona && (
        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: -8, marginBottom: 16, fontStyle: 'italic' }}>
          {t('zone_cities_hint')}
        </p>
      )}

      {/* Type */}
      <FilterBlock title={t('type')}>
        <select value={currentFilters.tipo ?? ''} onChange={(e) => applyFilter('tipo', e.target.value)} style={selectStyle}>
          <option value="">{t('all_types')}</option>
          {types.map((tp) => <option key={tp} value={tp}>{translatePropertyType(tp, locale)}</option>)}
        </select>
      </FilterBlock>

      {/* Price */}
      <FilterBlock title={t('price')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {PRICE_RANGES.map((range) => {
            const isActive =
              (currentFilters.precioMin?.toString() ?? '') === range.min &&
              (currentFilters.precioMax?.toString() ?? '') === range.max
            return (
              <button
                key={range.label}
                onClick={() => {
                  const params = new URLSearchParams(window.location.search)
                  if (isActive) { params.delete('precio_min'); params.delete('precio_max') }
                  else {
                    if (range.min) params.set('precio_min', range.min); else params.delete('precio_min')
                    if (range.max) params.set('precio_max', range.max); else params.delete('precio_max')
                  }
                  params.delete('page'); params.delete('pagina')
                  startTransition(() => { router.push(`${basePath}?${params.toString()}`) })
                }}
                style={{
                  padding: '7px 10px', borderRadius: 6, border: '1px solid', textAlign: 'left', fontSize: 12,
                  cursor: isPending ? 'wait' : 'pointer',
                  backgroundColor: isActive ? '#131D2E' : 'white',
                  color: isActive ? 'white' : '#374151',
                  borderColor: isActive ? '#131D2E' : '#e5e7eb',
                  opacity: isPending ? 0.7 : 1,
                }}
              >
                {range.label}
              </button>
            )
          })}
        </div>
      </FilterBlock>

      {/* Min bedrooms */}
      <FilterBlock title={t('min_rooms')}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => applyFilter('habitaciones', currentFilters.habitaciones === n ? '' : n.toString())}
              style={{
                width: 36, height: 36, borderRadius: 6, border: '1px solid', fontSize: 12,
                cursor: isPending ? 'wait' : 'pointer', fontWeight: 600,
                backgroundColor: currentFilters.habitaciones === n ? '#131D2E' : 'white',
                color: currentFilters.habitaciones === n ? 'white' : '#374151',
                borderColor: currentFilters.habitaciones === n ? '#131D2E' : '#e5e7eb',
                opacity: isPending ? 0.7 : 1,
              }}
            >
              {n}+
            </button>
          ))}
        </div>
      </FilterBlock>

      {/* Sort */}
      <FilterBlock title={t('order')} last>
        <select value={currentFilters.orden ?? ''} onChange={(e) => applyFilter('orden', e.target.value)} style={selectStyle}>
          <option value="">{t('order_recent')}</option>
          <option value="precio_asc">{t('order_price_asc')}</option>
          <option value="precio_desc">{t('order_price_desc')}</option>
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
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 8, border: '1px solid #e5e7eb', backgroundColor: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#131D2E', marginBottom: 16 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="9" y2="18"/></svg>
          {t('title')}{activeCount > 0 ? ` (${activeCount})` : ''}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}
          onClick={(e) => { if (e.target === e.currentTarget) setMobileOpen(false) }}
        >
          <div style={{ backgroundColor: 'white', borderRadius: '16px 16px 0 0', padding: 24, width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>{t('title')}</span>
              <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280' }}>✕</button>
            </div>
            {panelContent}
          </div>
        </div>
      )}

      {/* Desktop aside */}
      <aside className="props-filters-desktop" style={{ width: 260, flexShrink: 0, position: 'sticky', top: 100, height: 'fit-content', backgroundColor: 'white', borderRadius: 10, border: '1px solid #e5e7eb', padding: 20 }}>
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
  width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 13, backgroundColor: 'white', color: '#374151',
}

function FilterBlock({ title, children, last = false }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ marginBottom: last ? 0 : 20, paddingBottom: last ? 0 : 20, borderBottom: last ? 'none' : '1px solid #f3f4f6' }}>
      <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, marginTop: 0 }}>
        {title}
      </p>
      {children}
    </div>
  )
}
