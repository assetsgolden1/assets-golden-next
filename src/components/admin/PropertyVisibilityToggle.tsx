'use client'
import { useTransition } from 'react'
import { togglePropertyVisibility } from '@/app/admin/actions'

export function PropertyVisibilityToggle({ id, hidden }: { id: string; hidden: boolean }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => togglePropertyVisibility(id, !hidden))}
      disabled={pending}
      title={hidden ? 'Mostrar propiedad' : 'Ocultar propiedad'}
      className={`text-xs px-2 py-1 rounded border transition-colors disabled:opacity-50 ${
        hidden
          ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
          : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
      }`}
    >
      {pending ? '...' : hidden ? 'Oculta' : 'Visible'}
    </button>
  )
}
