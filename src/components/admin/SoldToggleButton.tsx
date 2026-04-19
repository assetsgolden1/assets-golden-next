'use client'
import { useTransition } from 'react'
import { togglePropertySold } from '@/app/admin/actions'

export function SoldToggleButton({ id, sold }: { id: string; sold: boolean }) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!sold && !window.confirm('¿Marcar como vendida? Se ocultará de la web.')) return
    startTransition(() => togglePropertySold(id, !sold))
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      title={sold ? 'Marcar como disponible' : 'Marcar como vendida'}
      className={`text-xs px-2 py-1 rounded border transition-colors disabled:opacity-50 whitespace-nowrap ${
        sold
          ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
          : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
      }`}
    >
      {pending ? '...' : sold ? 'Vendida' : 'Marcar vendida'}
    </button>
  )
}
