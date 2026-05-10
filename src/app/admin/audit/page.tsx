import { supabaseAdmin } from '@/lib/supabase/admin'
import { ClipboardList } from 'lucide-react'

interface AuditEntry {
  id: string
  created_at: string
  actor_email: string | null
  action: string
  entity_type: string
  entity_id: string | null
  entity_label: string | null
  metadata: Record<string, unknown> | null
  ip_address: string | null
}

const PAGE_SIZE = 50

const ACTION_BADGE: Record<string, string> = {
  delete_property:        'bg-red-100 text-red-700',
  bulk_delete_properties: 'bg-red-100 text-red-700',
  delete_agent:           'bg-red-100 text-red-700',
  delete_blog_post:       'bg-red-100 text-red-700',
  delete_team_member:     'bg-red-100 text-red-700',
  delete_lead:            'bg-red-100 text-red-700',
  create_property:        'bg-green-100 text-green-700',
  create_agent:           'bg-green-100 text-green-700',
  create_blog_post:       'bg-green-100 text-green-700',
  create_team_member:     'bg-green-100 text-green-700',
  update_property:        'bg-blue-100 text-blue-700',
  update_agent:           'bg-blue-100 text-blue-700',
  update_blog_post:       'bg-blue-100 text-blue-700',
  update_team_member:     'bg-blue-100 text-blue-700',
  sync_habihub_manual:    'bg-purple-100 text-purple-700',
  send_password_reset:    'bg-orange-100 text-orange-700',
  toggle_featured:        'bg-yellow-100 text-yellow-700',
  toggle_hidden:          'bg-gray-100 text-gray-600',
  toggle_sold:            'bg-gray-100 text-gray-600',
  bulk_mark_as_sold:      'bg-gray-100 text-gray-600',
  toggle_agent:           'bg-gray-100 text-gray-600',
}

const ENTITY_LABELS: Record<string, string> = {
  property:    'Propiedad',
  agent:       'Agente',
  lead:        'Lead',
  blog_post:   'Post',
  team_member: 'Equipo',
  sync:        'Sync',
  destination: 'Destino',
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; entity_type?: string; actor?: string; page?: string }>
}) {
  const params = await searchParams
  const filterAction = params.action ?? ''
  const filterEntity = params.entity_type ?? ''
  const filterActor  = params.actor ?? ''
  const page = Math.max(0, parseInt(params.page ?? '0', 10))

  let query = supabaseAdmin
    .from('admin_audit_log')
    .select('id, created_at, actor_email, action, entity_type, entity_id, entity_label, metadata, ip_address')
    .order('created_at', { ascending: false })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

  if (filterAction) query = query.eq('action', filterAction)
  if (filterEntity) query = query.eq('entity_type', filterEntity)
  if (filterActor)  query = query.ilike('actor_email', `%${filterActor}%`)

  const { data } = await query
  const entries = (data as AuditEntry[]) ?? []

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    })
  }

  function buildUrl(overrides: Record<string, string>) {
    const merged: Record<string, string> = {
      action:      filterAction,
      entity_type: filterEntity,
      actor:       filterActor,
      page:        String(page),
      ...overrides,
    }
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries(merged)) {
      if (v) p.set(k, v)
    }
    const qs = p.toString()
    return qs ? `/admin/audit?${qs}` : '/admin/audit'
  }

  const hasFilters = filterAction || filterEntity || filterActor

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <ClipboardList size={22} className="text-gray-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Registro de acciones administrativas. Solo lectura — append-only.
          </p>
        </div>
      </div>

      <form
        method="GET"
        action="/admin/audit"
        className="bg-white rounded-xl shadow-sm p-4 mb-5 flex flex-wrap gap-3"
      >
        <input
          type="text"
          name="actor"
          defaultValue={filterActor}
          placeholder="Filtrar por email..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-[160px]"
        />
        <input
          type="text"
          name="action"
          defaultValue={filterAction}
          placeholder="Acción (ej. delete_property)..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-[200px]"
        />
        <select
          name="entity_type"
          defaultValue={filterEntity}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los tipos</option>
          {Object.entries(ENTITY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-[#0a1628] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#1a2638] transition-colors"
        >
          Filtrar
        </button>
        {hasFilters && (
          <a
            href="/admin/audit"
            className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Limpiar
          </a>
        )}
      </form>

      <div className="text-sm text-gray-500 mb-3">
        {entries.length === 0
          ? 'Sin entradas'
          : `${entries.length} entradas (página ${page + 1})`}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Fecha</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Actor</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Acción</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Tipo</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Entidad</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Metadata</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
                    No hay entradas que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const badgeColor = ACTION_BADGE[entry.action] ?? 'bg-gray-100 text-gray-600'
                  return (
                    <tr key={entry.id} className="border-t border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-gray-400 text-xs whitespace-nowrap">
                        {formatDate(entry.created_at)}
                      </td>
                      <td className="px-4 py-2.5 text-gray-700 text-xs">
                        {entry.actor_email ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-mono whitespace-nowrap ${badgeColor}`}>
                          {entry.action}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs text-gray-500">
                          {ENTITY_LABELS[entry.entity_type] ?? entry.entity_type}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 max-w-[200px]">
                        {entry.entity_label ? (
                          <span
                            className="text-xs text-gray-700 truncate block"
                            title={entry.entity_label}
                          >
                            {entry.entity_label}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                        {entry.entity_id && (
                          <span
                            className="text-xs text-gray-300 font-mono truncate block"
                            title={entry.entity_id}
                          >
                            {entry.entity_id.length > 8
                              ? `${entry.entity_id.slice(0, 8)}…`
                              : entry.entity_id}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        {entry.metadata ? (
                          <details className="max-w-[280px]">
                            <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 select-none">
                              ver
                            </summary>
                            <pre className="text-xs text-gray-600 bg-gray-50 rounded p-2 mt-1 overflow-auto max-h-32 whitespace-pre-wrap break-all">
                              {JSON.stringify(entry.metadata, null, 2)}
                            </pre>
                          </details>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          {page > 0 && (
            <a
              href={buildUrl({ page: String(page - 1) })}
              className="text-sm border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Anterior
            </a>
          )}
          {entries.length === PAGE_SIZE && (
            <a
              href={buildUrl({ page: String(page + 1) })}
              className="text-sm border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Siguiente →
            </a>
          )}
        </div>
        <span className="text-xs text-gray-400">Página {page + 1}</span>
      </div>
    </div>
  )
}
