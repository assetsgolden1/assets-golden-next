'use client'
import { useTransition } from 'react'
import { Star } from 'lucide-react'
import { toggleFeatured } from '@/app/admin/actions'

export function FeaturedToggleButton({ id, featured }: { id: string; featured: boolean }) {
  const [isPending, startTransition] = useTransition()
  return (
    <button
      onClick={() => startTransition(() => toggleFeatured(id, !featured))}
      disabled={isPending}
      className={`p-1 rounded transition-colors ${featured ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-300 hover:text-yellow-400'} disabled:opacity-50`}
      title={featured ? 'Quitar destacada' : 'Marcar como destacada'}
    >
      <Star size={16} fill={featured ? 'currentColor' : 'none'} />
    </button>
  )
}
