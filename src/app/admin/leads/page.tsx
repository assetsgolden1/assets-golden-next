import { Suspense } from 'react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { LeadFilters } from '@/components/admin/leads/LeadFilters'
import LeadsClientWrapper from './LeadsClientWrapper'

interface Lead {
  id: string
  created_at: string
  name: string
  email: string | null
  phone: string | null
  neighborhood: string | null
  property_value_range: string | null
  sale_timeline: string | null
  is_owner: boolean | null
  interest: string | null
  message: string | null
  location: string | null
  score: number | null
  score_summary: string | null
  status: string | null
  source: string | null
  assigned_to: string | null
  notes: string | null
  property_id: string | null
  property_title: string | null
  property_url: string | null
}

const URGENT_MS = 24 * 60 * 60 * 1000

async function fetchLeads(params: {
  status?: string
  source?: string
  search?: string
  urgent_only?: string
}) {
  let query = supabaseAdmin
    .from('leads')
    .select('*')
    .neq('source', 'migration_test')
    .order('created_at', { ascending: false })
    .limit(200)

  if (params.status) query = query.eq('status', params.status)
  if (params.source) query = query.eq('source', params.source)
  if (params.search) {
    query = query.or(
      `name.ilike.%${params.search}%,email.ilike.%${params.search}%,message.ilike.%${params.search}%`
    )
  }

  const { data } = await query
  const leads = ((data as Lead[]) ?? []).map((l) => ({
    ...l,
    is_urgent: l.status === 'new' && Date.now() - new Date(l.created_at).getTime() > URGENT_MS,
  }))

  if (params.urgent_only === 'true') {
    return leads.filter((l) => l.is_urgent)
  }
  return leads
}

async function fetchStats() {
  const { data } = await supabaseAdmin
    .from('leads')
    .select('id, status, source, created_at')
    .neq('source', 'migration_test')

  const leads = data ?? []
  const now = Date.now()
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  return {
    total: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    urgent: leads.filter(
      (l) => l.status === 'new' && now - new Date(l.created_at).getTime() > URGENT_MS
    ).length,
    contacted_today: leads.filter(
      (l) => l.status === 'contacted' && new Date(l.created_at) >= startOfToday
    ).length,
  }
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent?: 'red' | 'blue' | 'green' | 'default'
}) {
  const colorMap = {
    red: 'text-red-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    default: 'text-gray-800',
  }
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-3xl font-bold ${colorMap[accent ?? 'default']}`}>{value}</p>
    </div>
  )
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; source?: string; search?: string; urgent_only?: string }>
}) {
  const params = await searchParams
  const [leads, stats] = await Promise.all([fetchLeads(params), fetchStats()])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Título */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <p className="text-sm text-gray-400 mt-0.5">Gestión de contactos y consultas</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total leads" value={stats.total} />
        <StatCard
          label="Nuevos sin atender"
          value={stats.new}
          accent={stats.new > 0 ? 'red' : 'default'}
        />
        <StatCard
          label="Urgentes (>24h)"
          value={stats.urgent}
          accent={stats.urgent > 0 ? 'red' : 'default'}
        />
        <StatCard label="Contactados hoy" value={stats.contacted_today} accent="green" />
      </div>

      {/* Filtros */}
      <Suspense fallback={<div className="h-28 bg-white rounded-xl shadow-sm mb-5 animate-pulse" />}>
        <LeadFilters />
      </Suspense>

      {/* Tabla + Modal */}
      <LeadsClientWrapper leads={leads} />
    </div>
  )
}
