'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Globe, ChevronDown, ArrowRight } from 'lucide-react'
import type { CountryDestination, TeamMember } from '@/types'
import CollaborateDialog from '@/components/CollaborateDialog'
import DemandDialog from '@/components/DemandDialog'
import AssetFormDialog from '@/components/AssetFormDialog'

interface Props {
  destinations: CountryDestination[]
  propertyCounts: Record<string, number>
  partners: TeamMember[]
}

export default function HomeSidebar({ destinations, propertyCounts, partners }: Props) {
  const [countriesOpen, setCountriesOpen] = useState(false)
  const [collaborateOpen, setCollaborateOpen] = useState(false)
  const [demandOpen, setDemandOpen] = useState(false)
  const [assetFormOpen, setAssetFormOpen] = useState(false)
  const [currentPartnerIndex, setCurrentPartnerIndex] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  function countFor(countryName: string): number {
    const key = Object.keys(propertyCounts).find(
      (k) => k.toLowerCase().trim() === countryName.toLowerCase().trim()
    )
    return key ? propertyCounts[key] : 0
  }

  const countriesWithProps = destinations.filter((d) => countFor(d.country_name) > 0)

  // Partner carousel rotation
  useEffect(() => {
    if (partners.length === 0) return
    const interval = setInterval(() => {
      setCurrentPartnerIndex((prev) => (prev + 1) % partners.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [partners.length])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCountriesOpen(false)
      }
    }
    if (countriesOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [countriesOpen])

  return (
    <>
      {/* Sidebar — visible solo en desktop, columna fija izquierda del hero */}
      <div
        className="hidden lg:flex flex-col w-64 xl:w-72 bg-primary shrink-0 relative z-10 pt-20"
        style={{ height: '100%', overflow: 'hidden' }}
      >
        <div className="flex flex-col h-full">

          {/* 1. Brand Section */}
          <div className="p-4 lg:p-6 border-b border-primary-foreground/10" style={{ flexShrink: 0 }}>
            <h2 className="font-display text-xl lg:text-2xl text-primary-foreground leading-tight">
              Assets Golden
            </h2>
            <p className="text-xs tracking-widest text-gold mt-1 uppercase">
              International Real Estate Consulting
            </p>
          </div>

          {/* 2. Navigation */}
          <nav className="flex-1 py-3 overflow-hidden" style={{ display: 'flex', flexDirection: 'column' }}>

            {/* Países dropdown */}
            {countriesWithProps.length > 0 && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setCountriesOpen(!countriesOpen)}
                  className="group flex items-center justify-between w-full py-3 px-6 bg-gold/10 hover:bg-gold/20 border-l-4 border-gold transition-all duration-300"
                >
                  <span className="font-semibold text-lg flex items-center gap-3 text-gold">
                    <Globe className="w-6 h-6" />
                    Países
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gold transition-transform duration-300 ${countriesOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <div
                  className={`absolute left-0 top-full w-full bg-primary shadow-2xl z-50 transition-all duration-300 border-t border-primary-foreground/10 ${
                    countriesOpen
                      ? 'opacity-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 -translate-y-2 pointer-events-none'
                  }`}
                >
                  <div className="py-2 max-h-[50vh] overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {countriesWithProps.map((dest) => {
                      const count = countFor(dest.country_name)
                      return (
                        <Link
                          key={dest.id}
                          href={`/destinos/${dest.slug ?? dest.id}`}
                          onClick={() => setCountriesOpen(false)}
                          className="group flex items-center justify-between w-full py-3 px-8 text-sm text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/5 transition-all duration-300"
                        >
                          <span className="font-medium tracking-wide uppercase text-xs">
                            {dest.country_name}
                          </span>
                          <div className="flex items-center gap-2">
                            {count > 0 && (
                              <span className="text-[10px] text-gold/60">{count}</span>
                            )}
                            <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-gold" />
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Coffee Break | Blog */}
            <Link
              href="/blog"
              className="group flex items-center justify-between py-3 px-6 text-sm text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/5 transition-all duration-300"
            >
              <span className="font-medium">Coffee Break | Blog</span>
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </Link>

            {/* Sobre Nosotros */}
            <Link
              href="/sobre-nosotros"
              className="group flex items-center justify-between py-3 px-6 text-sm text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/5 transition-all duration-300"
            >
              <span className="font-medium">Sobre Nosotros</span>
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </Link>

            {/* Tengo un Activo */}
            <button
              onClick={() => setAssetFormOpen(true)}
              className="group flex items-center justify-between w-full py-3 px-6 text-sm text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/5 transition-all duration-300"
            >
              <span className="font-medium">Tengo un Activo</span>
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </button>

            {/* Separador */}
            <div className="mt-2 pt-2 border-t border-primary-foreground/10">
              {/* Colabora */}
              <button
                onClick={() => setCollaborateOpen(true)}
                className="group flex items-center justify-between w-full py-3 px-6 text-sm text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/5 transition-all duration-300"
              >
                <span className="font-medium">Colabora</span>
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </button>

              {/* Mi Demanda */}
              <button
                onClick={() => setDemandOpen(true)}
                className="group flex items-center justify-between w-full py-3 px-6 text-sm text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/5 transition-all duration-300"
              >
                <span className="font-medium">Mi Demanda</span>
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </button>
            </div>
          </nav>

          {/* 4. Partners carousel */}
          {partners.length > 0 && (
            <div className="border-t border-primary-foreground/10" style={{ flexShrink: 0 }}>
              <Link
                href="/partners"
                className="block w-full p-4 text-left hover:bg-primary-foreground/5 transition-colors group"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs tracking-widest text-primary-foreground/40 uppercase">
                    Nuestros Partners
                  </p>
                  <ArrowRight className="w-4 h-4 text-gold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>
                <div className="relative h-28">
                  {partners.map((partner, index) => (
                    <div
                      key={partner.id}
                      className={`absolute inset-0 flex flex-col items-center transition-opacity duration-700 ${
                        index === currentPartnerIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {partner.photo_url ? (
                        <Image
                          src={partner.photo_url}
                          alt={partner.name}
                          width={96}
                          height={96}
                          unoptimized
                          className="w-24 h-24 rounded-xl object-cover object-top border-2 border-gold/30 group-hover:border-gold/60 transition-colors"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-xl bg-primary-foreground/10 border-2 border-gold/30 flex items-center justify-center">
                          <span className="font-display text-2xl text-gold">
                            {partner.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <p className="text-primary-foreground font-medium text-sm mt-2 text-center">
                        {partner.name.split(' ').slice(0, 2).join(' ')}
                      </p>
                    </div>
                  ))}
                </div>
                {/* Indicadores */}
                <div className="flex justify-center gap-1.5 mt-1">
                  {partners.map((_, index) => (
                    <span
                      key={index}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === currentPartnerIndex
                          ? 'w-4 bg-gold'
                          : 'w-1.5 bg-primary-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              </Link>
              {/* Línea decorativa */}
              <div className="h-1 bg-gradient-to-r from-gold via-gold/50 to-transparent" />
            </div>
          )}

        </div>
      </div>

      {/* Modals */}
      <CollaborateDialog open={collaborateOpen} onClose={() => setCollaborateOpen(false)} />
      <DemandDialog open={demandOpen} onClose={() => setDemandOpen(false)} />
      <AssetFormDialog open={assetFormOpen} onClose={() => setAssetFormOpen(false)} />
    </>
  )
}
