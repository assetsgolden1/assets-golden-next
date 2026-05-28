const ONE_DAY_MS = 24 * 60 * 60 * 1000
const SIX_HOURS_MS = 6 * 60 * 60 * 1000

interface Props {
  createdAt: string
  status: string | null
}

export function UrgencyBadge({ createdAt, status }: Props) {
  if (status !== 'new') return null

  const age = Date.now() - new Date(createdAt).getTime()

  if (age > ONE_DAY_MS) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 animate-pulse">
        🔴 Sin atender &gt;24h
      </span>
    )
  }

  if (age > SIX_HOURS_MS) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        🟡 Pendiente &gt;6h
      </span>
    )
  }

  return null
}
