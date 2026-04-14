'use client'
import { Download } from 'lucide-react'

interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  source: string | null
  message: string | null
  status: string | null
  created_at: string
  interest: string | null
  location: string | null
}

const SOURCE_CONFIG: Record<string, { label: string }> = {
  collaboration_form: { label: 'Colaboración' },
  property_contact: { label: 'Propiedad' },
  demand_form: { label: 'Demanda' },
}

function sourceLabel(source?: string | null) {
  if (!source) return 'Web'
  return SOURCE_CONFIG[source]?.label ?? source
}

export default function LeadsClientWrapper({ leads }: { leads: Lead[] }) {
  function exportCSV() {
    const headers = ['Fecha', 'Nombre', 'Email', 'Teléfono', 'Origen', 'Mensaje', 'Estado']
    const rows = leads.map((l) => [
      new Date(l.created_at).toLocaleDateString('es-ES'),
      l.name,
      l.email,
      l.phone ?? '',
      sourceLabel(l.source),
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
    <button
      onClick={exportCSV}
      className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
    >
      <Download size={16} /> Exportar CSV
    </button>
  )
}
