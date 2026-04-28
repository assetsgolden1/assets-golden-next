import { requireAdmin } from '@/lib/auth/getUserRole'
import { NewAgentForm } from '@/components/admin/NewAgentForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewAgentPage() {
  await requireAdmin()

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link
        href="/admin/agentes"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
      >
        <ArrowLeft size={14} />
        Volver a agentes
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nuevo agente</h1>

      <NewAgentForm />
    </div>
  )
}
