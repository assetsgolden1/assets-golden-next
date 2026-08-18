'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Agent } from '@/types/agent'

export function EditAgentForm({ agent }: { agent: Agent }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: agent.full_name,
    phone: agent.phone ?? '',
    agency_name: agent.agency_name ?? '',
  })
  // Marca del PDF: por defecto Assets Golden. Este toggle permite devolverle la
  // marca propia a un colaborador sin necesidad de un deploy.
  const [whiteLabel, setWhiteLabel] = useState(agent.white_label_enabled === true)

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/update-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: agent.id, ...form, white_label_enabled: whiteLabel }),
    })
    setLoading(false)
    if (res.ok) {
      router.push('/admin/agentes')
      router.refresh()
    } else {
      const data = await res.json()
      alert(data.error ?? 'Error guardando cambios')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          disabled
          value={agent.email}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
        />
        <p className="text-xs text-gray-400 mt-1">El email no se puede cambiar desde aquí</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre completo <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={form.full_name}
          onChange={set('full_name')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Agencia</label>
          <input
            type="text"
            value={form.agency_name}
            onChange={set('agency_name')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={whiteLabel}
            onChange={e => setWhiteLabel(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300"
          />
          <span>
            <span className="block text-sm font-medium text-gray-700">Marca propia en el PDF (white-label)</span>
            <span className="block text-xs text-gray-500 mt-0.5">
              Desactivado (por defecto): los PDF salen con el logo de Assets Golden. Los datos de
              contacto del asesor se muestran siempre, en ambos casos.
            </span>
          </span>
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#0a1628] hover:bg-[#1a2638] text-white font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm"
        >
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/agentes')}
          className="px-5 py-2.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
