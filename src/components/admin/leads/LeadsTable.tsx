'use client'

import { LeadStatusBadge } from './LeadStatusBadge'
import { UrgencyBadge } from './UrgencyBadge'
import { SourceBadge } from './SourceBadge'

export interface Lead {
  id: string
  created_at: string
  name: string
  email: string | null
  phone: string | null
  neighborhood: string | null
  property_value_range: string | null
  sale_timeline: string | null
  is_owner: boolean | null
  interest: string | null
  message: string | null
  location: string | null
  score: number | null
  score_summary: string | null
  status: string | null
  source: string | null
  assigned_to: string | null
  notes: string | null
  property_id: string | null
  property_title: string | null
  property_url: string | null
  is_urgent?: boolean
}

interface Props {
  leads: Lead[]
  onLeadClick: (lead: Lead) => void
}

function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `hace ${mins}m`
  const hours = Math.floor(diff / 3600000)
  if (hours < 24) return `hace ${hours}h`
  const days = Math.floor(diff / 86400000)
  if (days < 30) return `hace ${days}d`
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

function waLink(phone: string | null, name: string, propertyTitle: string | null) {
  if (!phone) return null
  const firstName = name.split(' ')[0]
  const subject = propertyTitle ? `tu consulta sobre ${propertyTitle}` : 'nuestras propiedades'
  const msg = `Hola ${firstName}, te contacto desde Assets Golden por ${subject}.`
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
}

export function LeadsTable({ leads, onLeadClick }: Props) {
  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
        No se encontraron leads con los filtros actuales.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Fecha</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Nombre</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Contacto</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Origen</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Interés</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Propiedad</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Urgencia</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Estado</th>
              <th className="text-right px-4 py-3 text-gray-500 font-medium text-xs uppercase tracking-wide">Acc.</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const wa = waLink(lead.phone, lead.name, lead.property_title)
              return (
                <tr
                  key={lead.id}
                  onClick={() => onLeadClick(lead)}
                  className="border-t border-gray-50 hover:bg-blue-50/40 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {relativeDate(lead.created_at)}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                    {lead.name}
                    {lead.score != null && (
                      <span className="ml-1.5 text-xs text-amber-500 font-normal">★{lead.score}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-blue-600 hover:underline truncate max-w-[160px]"
                        >
                          {lead.email}
                        </a>
                      )}
                      {lead.phone && (
                        <span className="text-xs text-gray-500">{lead.phone}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <SourceBadge source={lead.source} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-[120px] truncate">
                    {lead.interest ?? '—'}
                  </td>
                  <td className="px-4 py-3 max-w-[160px]">
                    {lead.property_title ? (
                      <span className="text-xs text-gray-600 line-clamp-2">{lead.property_title}</span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <UrgencyBadge createdAt={lead.created_at} status={lead.status} />
                  </td>
                  <td className="px-4 py-3">
                    <LeadStatusBadge status={lead.status} />
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    {wa && (
                      <a
                        href={wa}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-50 hover:bg-green-100 text-green-600 transition-colors"
                        title="Abrir WhatsApp"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </a>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
