import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/getUserRole'
import { AgentsTable } from '@/components/admin/AgentsTable'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import type { Agent } from '@/types/agent'

export default async function AdminAgentsPage() {
  await requireAdmin()

  const { data } = await supabaseAdmin
    .from('agents')
    .select('*')
    .order('created_at', { ascending: false })

  const agents = (data as Agent[]) ?? []

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agentes del portal</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {agents.length} {agents.length === 1 ? 'agente registrado' : 'agentes registrados'}
          </p>
        </div>
        <Link
          href="/admin/agentes/nuevo"
          className="flex items-center gap-2 bg-[#0a1628] hover:bg-[#1a2638] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Nuevo agente
        </Link>
      </div>

      <AgentsTable agents={agents} />
    </div>
  )
}
