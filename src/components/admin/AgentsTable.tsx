'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Agent } from '@/types/agent'
import { Edit2, Trash2, ToggleLeft, ToggleRight, Mail, Plus } from 'lucide-react'

export function AgentsTable({ agents }: { agents: Agent[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function toggleActive(agent: Agent) {
    setLoading(agent.id)
    const res = await fetch('/api/admin/toggle-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: agent.id, active: !agent.active }),
    })
    setLoading(null)
    if (res.ok) router.refresh()
    else alert('Error al cambiar estado')
  }

  async function deleteAgent(agent: Agent) {
    if (!confirm(`¿Eliminar a ${agent.full_name}? Esta acción no se puede deshacer.`)) return
    setLoading(agent.id)
    const res = await fetch('/api/admin/delete-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: agent.id }),
    })
    setLoading(null)
    if (res.ok) router.refresh()
    else alert('Error al eliminar agente')
  }

  async function sendPasswordReset(agent: Agent) {
    const res = await fetch('/api/admin/send-password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: agent.email }),
    })
    if (res.ok) alert(`Email de reset enviado a ${agent.email}`)
    else alert('Error enviando email')
  }

  if (agents.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
        <p className="text-gray-400 mb-4">No hay agentes registrados todavía</p>
        <Link href="/admin/agentes/nuevo" className="text-yellow-500 underline text-sm">
          Crear el primer agente
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Agente
            </th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Agencia
            </th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {agents.map((agent, idx) => (
            <tr
              key={agent.id}
              className={`${idx > 0 ? 'border-t border-gray-50' : ''} hover:bg-gray-50/50 transition-colors ${loading === agent.id ? 'opacity-50' : ''}`}
            >
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  {agent.logo_url ? (
                    <img
                      src={agent.logo_url}
                      alt={agent.full_name}
                      className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-500 flex-shrink-0">
                      {agent.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{agent.full_name}</p>
                    {agent.phone && (
                      <p className="text-xs text-gray-400">{agent.phone}</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-sm text-gray-600">{agent.email}</td>
              <td className="px-5 py-4 text-sm text-gray-500">{agent.agency_name ?? '—'}</td>
              <td className="px-5 py-4">
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    agent.active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {agent.active ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => sendPasswordReset(agent)}
                    title="Enviar reset de contraseña"
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Mail size={15} />
                  </button>
                  <button
                    onClick={() => toggleActive(agent)}
                    disabled={loading === agent.id}
                    title={agent.active ? 'Desactivar' : 'Activar'}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {agent.active ? (
                      <ToggleRight size={18} className="text-green-500" />
                    ) : (
                      <ToggleLeft size={18} />
                    )}
                  </button>
                  <Link
                    href={`/admin/agentes/${agent.id}/edit`}
                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={15} />
                  </Link>
                  <button
                    onClick={() => deleteAgent(agent)}
                    disabled={loading === agent.id}
                    title="Eliminar"
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50">
        <Link
          href="/admin/agentes/nuevo"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
        >
          <Plus size={13} />
          Añadir agente
        </Link>
      </div>
    </div>
  )
}
