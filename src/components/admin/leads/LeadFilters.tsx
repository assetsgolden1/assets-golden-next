'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'

const STATUS_CHIPS = [
  { value: '', label: 'Todos' },
  { value: 'new', label: 'Nuevos' },
  { value: 'contacted', label: 'Contactados' },
  { value: 'in_progress', label: 'En proceso' },
  { value: 'closed', label: 'Cerrados' },
  { value: 'discarded', label: 'Descartados' },
]

const SOURCE_CHIPS = [
  { value: '', label: 'Todos' },
  { value: 'property_contact', label: 'Ficha' },
  { value: 'demand_form', label: 'Demanda' },
  { value: 'contacto', label: 'Contacto' },
]

export function LeadFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const currentStatus = searchParams.get('status') ?? ''
  const currentSource = searchParams.get('source') ?? ''
  const currentSearch = searchParams.get('search') ?? ''
  const urgentOnly = searchParams.get('urgent_only') === 'true'

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  function toggleUrgent() {
    const params = new URLSearchParams(searchParams.toString())
    if (urgentOnly) {
      params.delete('urgent_only')
    } else {
      params.set('urgent_only', 'true')
    }
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value
    updateParam('search', q)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-5 space-y-3">
      {/* Status chips */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-500 font-medium w-14">Estado:</span>
        {STATUS_CHIPS.map((chip) => (
          <button
            key={chip.value}
            onClick={() => updateParam('status', chip.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              currentStatus === chip.value
                ? 'bg-[#0a1628] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Source chips */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-500 font-medium w-14">Origen:</span>
        {SOURCE_CHIPS.map((chip) => (
          <button
            key={chip.value}
            onClick={() => updateParam('source', chip.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              currentSource === chip.value
                ? 'bg-[#0a1628] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Urgent toggle + search */}
      <div className="flex flex-wrap gap-3 items-center">
        <button
          onClick={toggleUrgent}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            urgentOnly
              ? 'bg-red-50 border-red-300 text-red-700'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          🔴 Solo urgentes (&gt;24h sin atender)
        </button>

        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[240px]">
          <input
            name="search"
            defaultValue={currentSearch}
            placeholder="Buscar nombre, email o mensaje..."
            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-[#0a1628] text-white rounded-lg text-xs hover:bg-[#1a2638] transition-colors"
          >
            Buscar
          </button>
          {currentSearch && (
            <button
              type="button"
              onClick={() => updateParam('search', '')}
              className="px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg text-xs hover:bg-gray-50 transition-colors"
            >
              Limpiar
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
