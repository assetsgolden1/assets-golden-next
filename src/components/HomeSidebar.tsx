'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronRight,
  ChevronLeft,
  Globe,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Users,
  Home,
  Handshake,
  Search,
} from 'lucide-react'
import type { CountryDestination } from '@/types'

interface Props {
  destinations: CountryDestination[]
  propertyCounts: Record<string, number>
}

const SIDEBAR_LINKS = [
  { label: 'Coffee Break | Blog', href: '/blog', Icon: BookOpen },
  { label: 'Sobre Nosotros', href: '/sobre-nosotros', Icon: Users },
  { label: 'Tengo un Activo', href: '/vender-tu-piso', Icon: Home },
  { label: 'Colabora', href: '/colabora', Icon: Handshake },
  { label: 'Mi Demanda', href: '/mi-demanda', Icon: Search },
]

export default function HomeSidebar({ destinations, propertyCounts }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [countriesOpen, setCountriesOpen] = useState(false)

  function countFor(countryName: string): number {
    const key = Object.keys(propertyCounts).find(
      (k) => k.toLowerCase().trim() === countryName.toLowerCase().trim()
    )
    return key ? propertyCounts[key] : 0
  }

  const countriesWithProps = destinations.filter((d) => countFor(d.country_name) > 0)

  return (
    <>
      {/* Toggle button (always visible on desktop) */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Cerrar menú lateral' : 'Abrir menú lateral'}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-40 flex h-10 w-6 items-center justify-center rounded-r-lg bg-navy/90 text-gold border border-l-0 border-gold/20 shadow-lg backdrop-blur-sm transition-transform hover:w-7"
      >
        {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      {/* Sidebar panel */}
      <div
        className={`fixed left-0 top-20 bottom-0 z-40 w-56 bg-navy/95 backdrop-blur-md border-r border-gold/10 shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 pt-6 flex flex-col gap-1">
          {/* Header */}
          <p className="text-[10px] tracking-[0.25em] text-gold/60 uppercase mb-3 px-2">Explorar</p>

          {/* Countries dropdown */}
          <div>
            <button
              onClick={() => setCountriesOpen(!countriesOpen)}
              className="w-full flex items-center justify-between px-2 py-2 rounded-lg text-white/80 hover:text-gold hover:bg-white/5 transition-colors text-sm"
            >
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gold" />
                Países
              </span>
              {countriesOpen ? (
                <ChevronUp className="h-3.5 w-3.5 text-gold/60" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-gold/60" />
              )}
            </button>

            {countriesOpen && (
              <div className="mt-1 ml-6 flex flex-col gap-0.5">
                {countriesWithProps.map((dest) => {
                  const count = countFor(dest.country_name)
                  const href = `/destinos/${dest.slug ?? dest.id}`
                  return (
                    <Link
                      key={dest.id}
                      href={href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-2 py-1.5 rounded-lg text-white/60 hover:text-gold hover:bg-white/5 transition-colors text-xs"
                    >
                      <span>{dest.country_name}</span>
                      {count > 0 && (
                        <span className="text-[10px] text-gold/40">{count}</span>
                      )}
                    </Link>
                  )
                })}
                <Link
                  href="/destinos"
                  onClick={() => setOpen(false)}
                  className="px-2 py-1.5 rounded-lg text-gold/60 hover:text-gold text-xs transition-colors"
                >
                  Ver todos los destinos →
                </Link>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="my-3 h-px bg-white/10" />

          {/* Nav links */}
          {SIDEBAR_LINKS.map(({ label, href, Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-2 py-2 rounded-lg text-sm transition-colors ${
                pathname === href
                  ? 'text-gold bg-white/5'
                  : 'text-white/70 hover:text-gold hover:bg-white/5'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Backdrop for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}
