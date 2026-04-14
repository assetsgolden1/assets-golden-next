import { supabaseAdmin } from '@/lib/supabase/admin'
import { LeadStatusSelect } from '@/components/admin/LeadStatusSelect'
import { DeleteLeadButton } from '@/components/admin/DeleteLeadButton'
import LeadsClientWrapper from './LeadsClientWrapper'

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

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; status?: string; search?: string }>
}) {
  const params = await searchParams
  const filterSource = params.source ?? ''
  const filterStatus = params.status ?? ''
  const searchText = params.search ?? ''

  let query = supabaseAdmin
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (filterSource) {
    query = query.eq('source', filterSource)
  }
  if (filterStatus) {
    query = query.eq('status', filterStatus)
  }
  if (searchText) {
    query = query.or(`name.ilike.%${searchText}%,email.ilike.%${searchText}%`)
  }

  const { data } = await query
  const leads = (data as Lead[]) ?? []

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <LeadsClientWrapper leads={leads} />
      </div>

      {/* Filtros — formulario GET puro */}
      <form method="GET" action="/admin/leads" className="bg-white rounded-xl shadow-sm p-4 mb-5 flex flex-wrap gap-3">
        <input
          type="text"
          name="search"
          defaultValue={searchText}
          placeholder="Buscar por nombre o email..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-[200px]"
        />
        <select
          name="source"
          defaultValue={filterSource}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los orígenes</option>
          {Object.entries(SOURCE_CONFIG).map(([value, { label }]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={filterStatus}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-[#0a1628] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#1a2638] transition-colors"
        >
          Filtrar
        </button>
      </form>

      <div className="text-sm text-gray-500 mb-3">
        {leads.length} leads encontrados
      </div>

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
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">
                    No se encontraron leads
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const src = sourceInfo(lead.source)
                  return (
                    <tr key={lead.id} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-gray-800">{lead.name}</td>
                      <td className="px-4 py-2.5 text-gray-500">{lead.email}</td>
                      <td className="px-4 py-2.5 text-gray-500">{lead.phone ?? '—'}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${src.color}`}>
                          {src.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500 max-w-[200px]">
                        <span className="truncate block">
                          {lead.message
                            ? lead.message.slice(0, 50) + (lead.message.length > 50 ? '...' : '')
                            : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <LeadStatusSelect id={lead.id} status={lead.status} />
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <DeleteLeadButton id={lead.id} name={lead.name} />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
