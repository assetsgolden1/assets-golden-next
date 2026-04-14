'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Download, X } from 'lucide-react'

interface Lead {
  id: string
  name: string
  email: string
  phone?: string | null
  source?: string | null
  message?: string | null
  status?: string | null
  created_at: string
  interest?: string | null
  location?: string | null
}

const SOURCE_CONFIG: Record<string, { label: string; color: string }> = {
  collaboration_form: { label: 'Colaboración', color: 'bg-purple-100 text-purple-700' },
  property_contact: { label: 'Propiedad', color: 'bg-blue-100 text-blue-700' },
  demand_form: { label: 'Demanda', color: 'bg-orange-100 text-orange-700' },
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'Nuevo' },
  { value: 'contacted', label: 'Contactado' },
  { value: 'qualified', label: 'Calificado' },
  { value: 'closed', label: 'Cerrado' },
]

function sourceInfo(source?: string | null) {
  if (!source) return { label: 'Web', color: 'bg-gray-100 text-gray-600' }
  return SOURCE_CONFIG[source] ?? { label: source, color: 'bg-gray-100 text-gray-600' }
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterSource, setFilterSource] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [searchText, setSearchText] = useState('')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  useEffect(() => { loadLeads() }, [])

  async function loadLeads() {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) setError('Error: ' + fetchError.message)
    else setLeads((data as Lead[]) ?? [])
    setLoading(false)
  }

  async function updateStatus(lead: Lead, status: string) {
    const supabase = createClient()
    const { error } = await supabase.from('leads').update({ status }).eq('id', lead.id)
    if (error) alert('Error: ' + error.message)
    else setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, status } : l))
  }

  async function deleteLead(lead: Lead) {
    if (!window.confirm(`¿Eliminar el lead de ${lead.name}?`)) return
    const supabase = createClient()
    const { error } = await supabase.from('leads').delete().eq('id', lead.id)
    if (error) alert('Error: ' + error.message)
    else {
      setLeads((prev) => prev.filter((l) => l.id !== lead.id))
      if (selectedLead?.id === lead.id) setSelectedLead(null)
    }
  }

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      if (filterSource && lead.source !== filterSource) return false
      if (filterStatus && lead.status !== filterStatus) return false
      if (searchText) {
        const q = searchText.toLowerCase()
        if (!lead.name.toLowerCase().includes(q) && !lead.email.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [leads, filterSource, filterStatus, searchText])

  function exportCSV() {
    const headers = ['Fecha', 'Nombre', 'Email', 'Teléfono', 'Origen', 'Mensaje', 'Estado']
    const rows = filtered.map((l) => [
      new Date(l.created_at).toLocaleDateString('es-ES'),
      l.name,
      l.email,
      l.phone ?? '',
      sourceInfo(l.source).label,
      (l.message ?? '').replace(/"/g, '""'),
      l.status ?? '',
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          <Download size={16} /> Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-5 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-[200px]"
        />
        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los orígenes</option>
          {Object.entries(SOURCE_CONFIG).map(([value, { label }]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="text-sm text-gray-500 mb-3">
        {filtered.length} leads encontrados
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Fecha</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Nombre</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Teléfono</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Origen</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Mensaje</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Estado</th>
                  <th className="text-right px-4 py-3 text-gray-600 font-medium">Acc.</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400">
                      No se encontraron leads
                    </td>
                  </tr>
                ) : filtered.map((lead) => {
                  const src = sourceInfo(lead.source)
                  return (
                    <tr
                      key={lead.id}
                      className="border-t border-gray-50 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="px-4 py-2.5 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-gray-800">{lead.name}</td>
                      <td className="px-4 py-2.5 text-gray-500">{lead.email}</td>
                      <td className="px-4 py-2.5 text-gray-500">{lead.phone ?? '—'}</td>
                      <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${src.color}`}>
                          {src.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 max-w-[200px]">
                        <span className="truncate block">
                          {lead.message ? lead.message.slice(0, 50) + (lead.message.length > 50 ? '...' : '') : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={lead.status ?? 'new'}
                          onChange={(e) => updateStatus(lead, e.target.value)}
                          className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => deleteLead(lead)}
                          className="text-red-400 hover:text-red-600 p-1"
                        >
                          <X size={15} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal detalle */}
      {selectedLead && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedLead(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Detalle del lead</h2>
              <button onClick={() => setSelectedLead(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-3">
              {[
                { label: 'Nombre', value: selectedLead.name },
                { label: 'Email', value: selectedLead.email },
                { label: 'Teléfono', value: selectedLead.phone },
                { label: 'Origen', value: sourceInfo(selectedLead.source).label },
                { label: 'Estado', value: STATUS_OPTIONS.find((s) => s.value === selectedLead.status)?.label ?? selectedLead.status ?? 'Nuevo' },
                { label: 'Interés', value: selectedLead.interest },
                { label: 'Ubicación', value: selectedLead.location },
                { label: 'Fecha', value: new Date(selectedLead.created_at).toLocaleString('es-ES') },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-3">
                  <span className="text-sm font-medium text-gray-500 w-24 flex-shrink-0">{label}:</span>
                  <span className="text-sm text-gray-800">{value ?? '—'}</span>
                </div>
              ))}
              {selectedLead.message && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Mensaje:</p>
                  <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3">{selectedLead.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
