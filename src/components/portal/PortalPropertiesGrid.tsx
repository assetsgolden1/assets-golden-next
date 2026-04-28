'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, MapPin, Maximize, BedDouble, Bath, Building2, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Property } from '@/types'
import { translatePropertyType, translatePropertyTitle } from '@/lib/propertyTypes'
import { toSentenceCase } from '@/lib/utils/normalizeText'

interface Props {
  initialProperties: Property[]
  total: number
}

function formatPrice(price: number | null, currency: string | null): string {
  if (!price) return 'Precio a consultar'
  const formatted = price.toLocaleString('es-ES')
  if (currency === 'EUR') return `${formatted} €`
  if (currency === 'USD') return `$${formatted}`
  if (currency === 'GBP') return `£${formatted}`
  return `${formatted} ${currency ?? ''}`
}

function PortalPropertyCard({ property }: { property: Property }) {
  return (
    <Link
      href={`/portal/propiedades/${property.slug}`}
      className="group block card-premium rounded-xl overflow-hidden"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {property.image_url ? (
          <Image
            src={property.image_url}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Building2 className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent opacity-40" />
        {property.featured && (
          <span className="absolute top-4 right-4 rounded-full bg-primary/80 px-2.5 py-1 text-xs font-medium text-gold border border-gold/30">
            Destacada
          </span>
        )}
      </div>

      <div className="p-3 sm:p-5">
        {property.property_type && (
          <p className="text-xs sm:text-sm text-gold font-medium mb-0.5">
            {translatePropertyType(property.property_type)}
          </p>
        )}
        <h3 className="font-display text-sm sm:text-base text-foreground mb-1 line-clamp-2 leading-tight group-hover:text-gold transition-colors">
          {toSentenceCase(translatePropertyTitle(property.title))}
        </h3>
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs sm:text-sm mb-2">
          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 shrink-0 text-gold" />
          <span className="truncate">{property.location}</span>
        </div>
        <p className="font-display text-lg sm:text-xl font-medium text-gold mb-2">
          {formatPrice(property.price, property.currency)}
        </p>
        <div className="flex items-center gap-2 sm:gap-4 text-muted-foreground text-xs sm:text-sm border-t border-border pt-2">
          {property.area_sqm != null && (
            <span className="flex items-center gap-1">
              <Maximize className="h-3 w-3" /> {property.area_sqm} m²
            </span>
          )}
          {property.bedrooms != null && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3 w-3" /> {property.bedrooms}
            </span>
          )}
          {property.bathrooms != null && (
            <span className="flex items-center gap-1">
              <Bath className="h-3 w-3" /> {property.bathrooms}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export function PortalPropertiesGrid({ initialProperties, total }: Props) {
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('')
  const [allProperties, setAllProperties] = useState<Property[]>(initialProperties)
  const [loadedCount, setLoadedCount] = useState(initialProperties.length)
  const [loadingMore, setLoadingMore] = useState(false)
  const supabase = createClient()

  const countries = useMemo(() => {
    const set = new Set(allProperties.map(p => p.country).filter(Boolean) as string[])
    return Array.from(set).sort()
  }, [allProperties])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return allProperties.filter(p => {
      const matchSearch = !q ||
        p.title.toLowerCase().includes(q) ||
        (p.location ?? '').toLowerCase().includes(q)
      const matchCountry = !country || p.country === country
      return matchSearch && matchCountry
    })
  }, [allProperties, search, country])

  async function loadMore() {
    setLoadingMore(true)
    const { data } = await supabase
      .from('properties')
      .select('*')
      .not('hidden', 'eq', true)
      .not('sold', 'eq', true)
      .order('created_at', { ascending: false })
      .range(loadedCount, loadedCount + 59)

    if (data && data.length > 0) {
      setAllProperties(prev => [...prev, ...(data as Property[])])
      setLoadedCount(prev => prev + data.length)
    }
    setLoadingMore(false)
  }

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por título o ubicación..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-gold text-sm"
          />
        </div>
        <div className="relative">
          <select
            value={country}
            onChange={e => setCountry(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 border border-border rounded-lg focus:outline-none focus:border-gold text-sm bg-white min-w-[160px]"
          >
            <option value="">Todos los países</option>
            {countries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Contador de resultados */}
      <p className="text-sm text-muted-foreground mb-4">
        {filtered.length} propiedad{filtered.length !== 1 ? 'es' : ''} mostrada{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(p => (
            <PortalPropertyCard key={p.id} property={p} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-muted-foreground">
          No se encontraron propiedades con esa búsqueda.
        </div>
      )}

      {/* Cargar más */}
      {loadedCount < total && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-8 py-3 border border-gold text-gold hover:bg-gold hover:text-primary rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loadingMore ? 'Cargando...' : `Cargar más (${total - loadedCount} restantes)`}
          </button>
        </div>
      )}
    </div>
  )
}
