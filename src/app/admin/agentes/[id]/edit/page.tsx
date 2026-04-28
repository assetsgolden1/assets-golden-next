import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/getUserRole'
import { EditAgentForm } from '@/components/admin/EditAgentForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import type { Agent } from '@/types/agent'

export default async function EditAgentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()

  const { id } = await params

  const { data } = await supabaseAdmin
    .from('agents')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!data) notFound()

  const agent = data as Agent

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link
        href="/admin/agentes"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
      >
        <ArrowLeft size={14} />
        Volver a agentes
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Editar agente — {agent.full_name}
      </h1>

      <EditAgentForm agent={agent} />
    </div>
  )
}
