'use client'
import { useTransition } from 'react'
import { updateLeadStatus } from '@/app/admin/actions'

const STATUS_OPTIONS = [
  { value: 'new', label: 'Nuevo' },
  { value: 'contacted', label: 'Contactado' },
  { value: 'qualified', label: 'Calificado' },
  { value: 'closed', label: 'Cerrado' },
]

export function LeadStatusSelect({ id, status }: { id: string; status: string | null }) {
  const [isPending, startTransition] = useTransition()

  return (
    <select
      value={status ?? 'new'}
      onChange={(e) => startTransition(() => updateLeadStatus(id, e.target.value))}
      disabled={isPending}
      className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:opacity-50"
    >
      {STATUS_OPTIONS.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  )
}
