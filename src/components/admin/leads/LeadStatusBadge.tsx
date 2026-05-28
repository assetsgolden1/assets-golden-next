interface Props {
  status: string | null
}

const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  new: { label: 'Nuevo', classes: 'bg-blue-100 text-blue-700' },
  contacted: { label: 'Contactado', classes: 'bg-yellow-100 text-yellow-700' },
  in_progress: { label: 'En proceso', classes: 'bg-orange-100 text-orange-700' },
  closed: { label: 'Cerrado', classes: 'bg-green-100 text-green-700' },
  discarded: { label: 'Descartado', classes: 'bg-gray-100 text-gray-500' },
}

export function LeadStatusBadge({ status }: Props) {
  const cfg = STATUS_MAP[status ?? ''] ?? { label: status ?? '—', classes: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.classes}`}>
      {cfg.label}
    </span>
  )
}
