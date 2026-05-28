interface Props {
  source: string | null
}

const SOURCE_MAP: Record<string, { label: string; classes: string }> = {
  property_contact: { label: 'Ficha propiedad', classes: 'bg-blue-100 text-blue-700' },
  demand_form: { label: 'Demanda', classes: 'bg-orange-100 text-orange-700' },
  contacto: { label: 'Contacto', classes: 'bg-purple-100 text-purple-700' },
}

function capitalize(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function SourceBadge({ source }: Props) {
  const cfg = SOURCE_MAP[source ?? ''] ?? {
    label: source ? capitalize(source) : 'Web',
    classes: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.classes}`}>
      {cfg.label}
    </span>
  )
}
