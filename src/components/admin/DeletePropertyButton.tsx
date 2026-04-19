'use client'
import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteProperty } from '@/app/admin/actions'

export function DeletePropertyButton({ id, title }: { id: string; title: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!window.confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) return
    startTransition(() => deleteProperty(id))
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      title="Eliminar propiedad"
      className="text-red-400 hover:text-red-600 p-1 disabled:opacity-50"
    >
      <Trash2 size={15} />
    </button>
  )
}
