'use client'
import { useTransition } from 'react'
import { X } from 'lucide-react'
import { deleteLead } from '@/app/admin/actions'

export function DeleteLeadButton({ id, name }: { id: string; name: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!window.confirm(`¿Eliminar el lead de ${name}?`)) return
    startTransition(() => deleteLead(id))
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-400 hover:text-red-600 p-1 disabled:opacity-50"
    >
      <X size={15} />
    </button>
  )
}
