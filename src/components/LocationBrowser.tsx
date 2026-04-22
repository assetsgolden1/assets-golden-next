'use client'

import { useState, useMemo, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ArrowRight, MapPin, BedDouble, Bath, Maximize, Building2 } from 'lucide-react'
import Link from 'next/link'
import type { Property } from '@/types'
import { translatePropertyType, translatePropertyTitle } from '@/lib/propertyTypes'
import { getCityImage } from '@/lib/constants/cityImages'
import { normalizeLocation } from '@/lib/utils/normalizeLocation'
import { getSpainZone } from '@/lib/constants/spainZones'

// ─── Types ────────────────────────────────────────────────────────

type LocationState =
  | { level: 'country' }
  | { level: 'zone'; zone: string }
  | { level: 'region'; region: string }
  | { level: 'city'; region: string; city: string }

interface ZoneData {
  displayName: string
  key: string
  count: number
  cities: CityData[]
}

interface RegionData {
  displayName: string
  key: string
  hasCities: boolean
  count: number
  cities: CityData[]
}

interface CityData {
  displayName: string
  key: string
  count: number
  province: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────

function toTitleCase(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatPrice(price: number | null, currency: string | null): string {
  if (!price) return 'Precio a consultar'
  const fmt = price.toLocaleString('es-ES')
  if (currency === 'EUR') return `${fmt} €`
  if (currency === 'USD') return `$${fmt}`
  if (currency === 'GBP') return `£${fmt}`
  return `${fmt} ${currency ?? ''}`
}

function getCityImageUrl(
  cityName: string,
  cityImages: Record<string, string> | null | undefined
): string {
  if (!cityImages) return getCityImage(cityName)
  const attempts = [
    cityName,
    cityName.toLowerCase(),
    cityName.trim(),
    cityName.toLowerCase().trim(),
    normalizeLocation(cityName),
    normalizeLocation(cityName).toLowerCase(),
  ]
  for (const attempt of attempts) {
    if (cityImages[attempt]) return cityImages[attempt]
  }
  return getCityImage(cityName)
}

const ITEMS_PER_PAGE = 12

// ─── LocationCard ─────────────────────────────────────────────────

interface LocationCardProps {
  displayName: string
  imageKey: string
  count: number
  index: number
  onClick: () => void
  cityImages?: Record<string, string> | null
}

function LocationCard({ displayName, imageKey, count, index, onClick, cityImages }: LocationCardProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    setRotate({ x: x * 4.5, y: -y * 4.5 })
  }

  function handleMouseLeave() {
    setRotate({ x: 0, y: 0 })
    setHovered(false)
  }

  const imageSrc = getCityImageUrl(displayName, cityImages) || getCityImageUrl(imageKey, cityImages)

  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setHovered(true)}
      style={{
        transform: hovered
          ? `perspective(1000px) rotateX(${rotate.y}deg) rotateY(${rotate.x}deg)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
        transition: hovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out',
        animationDelay: `${index * 50}ms`,
      }}
      className="group relative aspect-[3/4] rounded-xl overflow-hidden text-left"
    >
      <Image
        src={imageSrc}
        alt={displayName}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-110"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
      />
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100"
        style={{ background: 'radial-gradient(circle at 50% 80%, rgba(212,175,55,0.35) 0%, transparent 60%)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />
      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-gold/40 transition-colors duration-500 pointer-events-none" />
      <div className="absolute inset-0 flex flex-col justify-end p-4 lg:p-5">
        <h3 className="font-display text-base lg:text-lg text-white mb-1 leading-tight">
          {displayName}
        </h3>
        {count > 0 && (
          <p className="text-white/60 text-xs mb-2">
            {count} {count === 1 ? 'propiedad' : 'propiedades'}
          </p>
        )}
        <div className="flex items-center gap-1.5 text-gold text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <span>Explorar</span>
          <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </button>
  )
}

// ─── PropertyMiniCard ─────────────────────────────────────────────

function PropertyMiniCard({ property }: { property: Property }) {
  return (
    <Link
      href={`/propiedades/${property.slug ?? property.id}`}
      className="group block card-premium rounded-xl overflow-hidden"
    >
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {property.image_url ? (
          <Image
            src={property.image_url}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center gradient-navy">
            <Building2 className="h-10 w-10 text-gold/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        {property.property_type && (
          <span className="absolute top-3 left-3 rounded-full bg-gold px-2.5 py-0.5 text-xs font-semibold text-primary shadow">
            {translatePropertyType(property.property_type)}
          </span>
        )}
        {property.featured && (
          <span className="absolute top-3 right-3 rounded-full bg-primary/80 px-2.5 py-0.5 text-xs font-medium text-gold border border-gold/30">
            Destacada
          </span>
        )}
        <div className="absolute bottom-3 left-3 right-3">
          <span className="font-display text-xl font-medium text-white drop-shadow">
            {formatPrice(property.price, property.currency)}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display text-base text-foreground mb-1.5 line-clamp-1 group-hover:text-gold transition-colors">
          {translatePropertyTitle(property.title)}
        </h3>
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-3">
          <MapPin className="h-3.5 w-3.5 text-gold shrink-0" />
          <span className="line-clamp-1">{property.location ?? property.province}</span>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground text-xs border-t border-border pt-3">
          {property.area_sqm != null && (
            <span className="flex items-center gap-1">
              <Maximize className="h-3.5 w-3.5" /> {property.area_sqm} m²
            </span>
          )}
          {property.bedrooms != null && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5" /> {property.bedrooms}
            </span>
          )}
          {property.bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" /> {property.bathrooms}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

// ─── Main LocationBrowser ─────────────────────────────────────────

interface Props {
  properties: Property[]
  countryName: string
  cityImages?: Record<string, string> | null
}

export default function LocationBrowser({ properties, countryName, cityImages }: Props) {
  const [state, setState] = useState<LocationState>({ level: 'country' })
  const [page, setPage] = useState(0)

  const isSpain = countryName === 'España' || countryName === 'Espana' || countryName === 'espana'

  // ── Spain: build zone → city → properties hierarchy ─────────────
  const spainZoneMap = useMemo(() => {
    if (!isSpain) return null
    const map = new Map<string, ZoneData>()

    for (const p of properties) {
      const loc = p.location?.trim() || null
      if (!loc) continue
      const province = p.province?.trim() || null
      const normalizedCity = normalizeLocation(loc)
      const cityKey = normalizedCity.toLowerCase()
      const zoneName = getSpainZone(normalizedCity, province)
      const zoneKey = zoneName.toLowerCase()

      if (!map.has(zoneKey)) {
        map.set(zoneKey, { displayName: zoneName, key: zoneKey, count: 0, cities: [] })
      }
      const zd = map.get(zoneKey)!
      zd.count++

      const existing = zd.cities.find((c) => c.key === cityKey)
      if (existing) {
        existing.count++
        if (!existing.province && province) existing.province = province
      } else {
        zd.cities.push({ displayName: normalizedCity, key: cityKey, count: 1, province })
      }
    }

    return map
  }, [properties, isSpain])

  const sortedZones = useMemo(
    () =>
      spainZoneMap
        ? [...spainZoneMap.values()].filter((z) => z.count > 0).sort((a, b) => b.count - a.count)
        : [],
    [spainZoneMap]
  )

  // ── Non-Spain: build province → city hierarchy ───────────────────
  const hierarchy = useMemo(() => {
    if (isSpain) return new Map<string, RegionData>()
    const map = new Map<string, RegionData>()

    for (const p of properties) {
      const province = p.province?.trim() || null
      const location = p.location?.trim() || null
      if (!location) continue

      const regionKey = province ? province.toLowerCase() : location.toLowerCase()
      const regionDisplay = province ? toTitleCase(province) : normalizeLocation(location)
      const cityKey = location.toLowerCase()
      const cityDisplay = normalizeLocation(location)

      if (!map.has(regionKey)) {
        map.set(regionKey, {
          displayName: regionDisplay,
          key: regionKey,
          hasCities: !!province,
          count: 0,
          cities: [],
        })
      }

      const rd = map.get(regionKey)!
      rd.count++
      if (province) rd.hasCities = true

      const existingCity = rd.cities.find((c) => c.key === cityKey)
      if (existingCity) {
        existingCity.count++
      } else {
        rd.cities.push({ displayName: cityDisplay, key: cityKey, count: 1, province: null })
      }
    }

    return map
  }, [properties, isSpain])

  const sortedRegions = useMemo(
    () =>
      [...hierarchy.values()]
        .filter((rd) => rd.count > 0)
        .sort((a, b) => b.count - a.count),
    [hierarchy]
  )

  // ── Properties for current city view ─────────────────────────────
  const cityProperties = useMemo(() => {
    if (state.level !== 'city') return []

    if (isSpain) {
      return properties.filter((p) => {
        const loc = p.location?.trim() || ''
        return normalizeLocation(loc).toLowerCase() === state.city
      })
    }

    return properties.filter((p) => {
      const rKey = (p.province?.trim() || p.location?.trim() || '').toLowerCase()
      const cKey = p.location?.trim().toLowerCase() || ''
      return rKey === state.region && cKey === state.city
    })
  }, [state, properties, isSpain])

  const totalPages = Math.ceil(cityProperties.length / ITEMS_PER_PAGE)
  const pagedProperties = cityProperties.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)

  // ── Navigation ────────────────────────────────────────────────────

  function goToZone(zd: ZoneData) {
    setPage(0)
    setState({ level: 'zone', zone: zd.key })
  }

  function goToRegion(rd: RegionData) {
    setPage(0)
    if (rd.hasCities && rd.cities.length > 1) {
      setState({ level: 'region', region: rd.key })
    } else {
      const cityKey = rd.cities[0]?.key ?? rd.key
      setState({ level: 'city', region: rd.key, city: cityKey })
    }
  }

  function goToCity(region: string, city: CityData) {
    setPage(0)
    setState({ level: 'city', region, city: city.key })
  }

  function goBack() {
    setPage(0)
    if (state.level === 'city') {
      if (isSpain) {
        const zd = spainZoneMap?.get(state.region)
        const activeCities = (zd?.cities ?? []).filter((c) => c.count > 0)
        if (zd && activeCities.length > 1) {
          setState({ level: 'zone', zone: state.region })
        } else {
          setState({ level: 'country' })
        }
      } else {
        const rd = hierarchy.get(state.region)
        if (rd?.hasCities && rd.cities.length > 1) {
          setState({ level: 'region', region: state.region })
        } else {
          setState({ level: 'country' })
        }
      }
    } else if (state.level === 'zone' || state.level === 'region') {
      setState({ level: 'country' })
    }
  }

  const isEmpty = isSpain ? sortedZones.length === 0 : hierarchy.size === 0
  if (isEmpty) return null

  if (isSpain) {
    console.log('Zonas España:', sortedZones.map((z) => ({ name: z.displayName, count: z.count })))
  }

  // ── Breadcrumb ────────────────────────────────────────────────────
  const crumbs: string[] = [countryName]

  if (state.level === 'zone') {
    crumbs.push(spainZoneMap?.get(state.zone)?.displayName ?? state.zone)
  }
  if (state.level === 'region') {
    crumbs.push(hierarchy.get(state.region)?.displayName ?? state.region)
  }
  if (state.level === 'city') {
    if (isSpain) {
      const zd = spainZoneMap?.get(state.region)
      crumbs.push(zd?.displayName ?? state.region)
      const cityDisplay = zd?.cities.find((c) => c.key === state.city)?.displayName ?? state.city
      crumbs.push(cityDisplay)
    } else {
      if (hierarchy.get(state.region)?.hasCities) {
        crumbs.push(hierarchy.get(state.region)?.displayName ?? state.region)
      }
      const cityDisplay =
        hierarchy.get(state.region)?.cities.find((c) => c.key === state.city)?.displayName ?? state.city
      crumbs.push(cityDisplay)
    }
  }

  // ── Section header label ──────────────────────────────────────────
  const headerTitle = (() => {
    if (state.level === 'country') return `Zonas en ${countryName}`
    if (state.level === 'zone') return spainZoneMap?.get(state.zone)?.displayName ?? ''
    if (state.level === 'region') return hierarchy.get(state.region)?.displayName ?? ''
    if (state.level === 'city') {
      if (isSpain) {
        return (
          spainZoneMap?.get(state.region)?.cities.find((c) => c.key === state.city)?.displayName ??
          state.city
        )
      }
      return (
        hierarchy.get(state.region)?.cities.find((c) => c.key === state.city)?.displayName ?? state.city
      )
    }
    return ''
  })()

  // ── City display name for "Ver todas" link ────────────────────────
  const currentCityDisplayName = (() => {
    if (state.level !== 'city') return ''
    if (isSpain) {
      return (
        spainZoneMap?.get(state.region)?.cities.find((c) => c.key === state.city)?.displayName ?? state.city
      )
    }
    return (
      hierarchy.get(state.region)?.cities.find((c) => c.key === state.city)?.displayName ?? state.city
    )
  })()

  return (
    <div>
      {/* Section header */}
      <div className="mb-8 text-center">
        <p className="text-xs tracking-[0.25em] text-gold uppercase mb-3">Explorar por zona</p>
        <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
          {headerTitle}
        </h2>
        <div className="divider-gold mx-auto mt-4" />
      </div>

      {/* Back button + breadcrumb */}
      {state.level !== 'country' && (
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-sm text-gold hover:text-gold/80 transition-colors font-medium"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver a {crumbs[crumbs.length - 2]}
          </button>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {crumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-border">/</span>}
                <span className={i === crumbs.length - 1 ? 'text-foreground font-medium' : ''}>
                  {crumb}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── COUNTRY level ─────────────────────────────────────────── */}
      {state.level === 'country' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {isSpain
            ? sortedZones.map((zd, i) => (
                <LocationCard
                  key={zd.key}
                  displayName={zd.displayName}
                  imageKey={zd.key}
                  count={zd.count}
                  index={i}
                  onClick={() => goToZone(zd)}
                  cityImages={cityImages}
                />
              ))
            : sortedRegions.map((rd, i) => (
                <LocationCard
                  key={rd.key}
                  displayName={rd.displayName}
                  imageKey={rd.key}
                  count={rd.count}
                  index={i}
                  onClick={() => goToRegion(rd)}
                  cityImages={cityImages}
                />
              ))}
        </div>
      )}

      {/* ── ZONE level (Spain only) ────────────────────────────────── */}
      {state.level === 'zone' && (() => {
        const zd = spainZoneMap?.get(state.zone)
        if (!zd) return null
        const sortedCities = [...zd.cities].filter((c) => c.count > 0).sort((a, b) => b.count - a.count)
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedCities.map((city, i) => (
              <LocationCard
                key={city.key}
                displayName={city.displayName}
                imageKey={city.key}
                count={city.count}
                index={i}
                onClick={() => goToCity(state.zone, city)}
                cityImages={cityImages}
              />
            ))}
          </div>
        )
      })()}

      {/* ── REGION level (non-Spain) ───────────────────────────────── */}
      {state.level === 'region' && (() => {
        const rd = hierarchy.get(state.region)
        if (!rd) return null
        const sortedCities = [...rd.cities].filter((c) => c.count > 0).sort((a, b) => b.count - a.count)
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedCities.map((city, i) => (
              <LocationCard
                key={city.key}
                displayName={city.displayName}
                imageKey={city.key}
                count={city.count}
                index={i}
                onClick={() => goToCity(state.region, city)}
                cityImages={cityImages}
              />
            ))}
          </div>
        )
      })()}

      {/* ── CITY level ────────────────────────────────────────────── */}
      {state.level === 'city' && (
        <>
          {pagedProperties.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 text-sm">
              No hay propiedades disponibles en este momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pagedProperties.map((p) => (
                <PropertyMiniCard key={p.id} property={p} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:border-gold hover:text-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" /> Anterior
              </button>
              <span className="text-sm text-muted-foreground">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:border-gold hover:text-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Siguiente <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href={`/propiedades?ubicacion=${encodeURIComponent(currentCityDisplayName)}`}
              className="text-sm text-gold hover:underline"
            >
              Ver todas las propiedades en esta zona →
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
