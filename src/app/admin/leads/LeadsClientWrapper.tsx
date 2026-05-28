'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { LeadsTable, type Lead } from '@/components/admin/leads/LeadsTable'
import { LeadDetailModal } from '@/components/admin/leads/LeadDetailModal'

interface Props {
  leads: Lead[]
}

function sourceLabel(source?: string | null) {
  const MAP: Record<string, string> = {
    property_contact: 'Ficha propiedad',
    demand_form: 'Demanda',
    contacto: 'Contacto',
  }
  if (!source) return 'Web'
  return MAP[source] ?? source
}

export default function LeadsClientWrapper({ leads: initial }: Props) {
  const [leads, setLeads] = useState(initial)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  function handleUpdate(updated: Lead) {
    setLeads((prev) => prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)))
    if (selectedLead?.id === updated.id) {
      setSelectedLead({ ...selectedLead, ...updated })
    }
  }

  function exportCSV() {
    const headers = ['Fecha', 'Nombre', 'Email', 'Teléfono', 'Origen', 'Interés', 'Mensaje', 'Estado', 'Notas']
    const rows = leads.map((l) => [
      new Date(l.created_at).toLocaleDateString('es-ES'),
      l.name,
      l.email ?? '',
      l.phone ?? '',
      sourceLabel(l.source),
      l.interest ?? '',
      (l.message ?? '').replace(/"/g, '""'),
      l.status ?? '',
      (l.notes ?? '').replace(/"/g, '""'),
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{leads.length} lead{leads.length !== 1 ? 's' : ''} encontrado{leads.length !== 1 ? 's' : ''}</p>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          <Download size={16} /> Exportar CSV
        </button>
      </div>

      <LeadsTable leads={leads} onLeadClick={setSelectedLead} />

      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleUpdate}
        />
      )}
    </>
  )
}
