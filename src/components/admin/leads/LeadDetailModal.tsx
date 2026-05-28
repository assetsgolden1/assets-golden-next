'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, ExternalLink, Mail, Phone } from 'lucide-react'
import { LeadStatusBadge } from './LeadStatusBadge'
import { UrgencyBadge } from './UrgencyBadge'
import { SourceBadge } from './SourceBadge'
import type { Lead } from './LeadsTable'

const VALID_STATUSES = [
  { value: 'new', label: 'Nuevo' },
  { value: 'contacted', label: 'Contactado' },
  { value: 'in_progress', label: 'En proceso' },
  { value: 'closed', label: 'Cerrado' },
  { value: 'discarded', label: 'Descartado' },
]

const ASSIGNEES = [
  { value: '', label: 'Sin asignar' },
  { value: 'Atilio', label: 'Atilio' },
  { value: 'Joan', label: 'Joan' },
]

interface Props {
  lead: Lead
  onClose: () => void
  onUpdate: (updated: Lead) => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function waLink(phone: string | null, name: string, propertyTitle: string | null) {
  if (!phone) return null
  const firstName = name.split(' ')[0]
  const subject = propertyTitle ? `tu consulta sobre ${propertyTitle}` : 'nuestras propiedades'
  const msg = `Hola ${firstName}, te contacto desde Assets Golden por ${subject}.`
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`
}

export function LeadDetailModal({ lead: initialLead, onClose, onUpdate }: Props) {
  const router = useRouter()
  const [lead, setLead] = useState(initialLead)
  const [notes, setNotes] = useState(initialLead.notes ?? '')
  const [assignee, setAssignee] = useState('')
  const [saving, setSaving] = useState(false)
  const [statusSaving, setStatusSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function patchLead(updates: Record<string, unknown>) {
    const res = await fetch(`/api/admin/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!res.ok) {
      const body = await res.json()
      throw new Error(body.error ?? 'Error al guardar')
    }
    return res.json() as Promise<Lead>
  }

  async function handleSaveNotes() {
    setSaving(true)
    setError('')
    try {
      const updated = await patchLead({ notes })
      setLead(updated)
      onUpdate(updated)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(newStatus: string) {
    setStatusSaving(true)
    setError('')
    try {
      const updated = await patchLead({ status: newStatus })
      setLead(updated)
      onUpdate(updated)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setStatusSaving(false)
    }
  }

  const wa = waLink(lead.phone, lead.name, lead.property_title)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between rounded-t-2xl">
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-gray-900">{lead.name}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <LeadStatusBadge status={lead.status} />
              <UrgencyBadge createdAt={lead.created_at} status={lead.status} />
              <SourceBadge source={lead.source} />
            </div>
            <p className="text-xs text-gray-400">{formatDate(lead.created_at)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors ml-4 flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Sección Contacto */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contacto</h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
              {lead.email && (
                <div className="flex items-center gap-2.5">
                  <Mail size={14} className="text-gray-400 flex-shrink-0" />
                  <a href={`mailto:${lead.email}`} className="text-sm text-blue-600 hover:underline">
                    {lead.email}
                  </a>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{lead.phone}</span>
                  {wa && (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      WhatsApp
                    </a>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Sección Interés */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Interés</h3>
            <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3">
              {[
                { label: 'Interés', value: lead.interest },
                { label: 'Zona/Barrio', value: lead.neighborhood },
                { label: 'Rango de precio', value: lead.property_value_range },
                { label: 'Plazo de venta', value: lead.sale_timeline },
                { label: 'Es propietario', value: lead.is_owner != null ? (lead.is_owner ? 'Sí' : 'No') : null },
                { label: 'Ubicación', value: lead.location },
              ].map(({ label, value }) =>
                value ? (
                  <div key={label}>
                    <dt className="text-xs text-gray-400">{label}</dt>
                    <dd className="text-sm text-gray-700 font-medium">{value}</dd>
                  </div>
                ) : null
              )}
            </div>
          </section>

          {/* Mensaje */}
          {lead.message && (
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Mensaje</h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{lead.message}</p>
              </div>
            </section>
          )}

          {/* Propiedad */}
          {lead.property_id && lead.property_title && (
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Propiedad</h3>
              <div className="bg-gray-50 rounded-xl p-4 flex items-start justify-between gap-3">
                <span className="text-sm text-gray-700 font-medium">{lead.property_title}</span>
                <div className="flex gap-2 flex-shrink-0">
                  <a
                    href={`/admin/propiedades/${lead.property_id}/edit`}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Editar <ExternalLink size={10} />
                  </a>
                  {lead.property_url && (
                    <a
                      href={lead.property_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-gray-500 hover:underline flex items-center gap-1"
                    >
                      Ver <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Score */}
          {lead.score != null && (
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Score</h3>
              <div className="bg-amber-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-bold text-amber-600">★ {lead.score}</span>
                </div>
                {lead.score_summary && (
                  <p className="text-sm text-gray-600">{lead.score_summary}</p>
                )}
              </div>
            </section>
          )}

          {/* Notas */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Notas internas</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Agregar notas sobre este lead..."
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <button
              onClick={handleSaveNotes}
              disabled={saving || notes === (lead.notes ?? '')}
              className="mt-2 px-4 py-1.5 bg-[#0a1628] text-white rounded-lg text-xs hover:bg-[#1a2638] disabled:opacity-50 transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar nota'}
            </button>
          </section>

          {/* Gestión */}
          <section>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Gestión</h3>
            <div className="flex flex-wrap gap-3 items-center">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Estado</label>
                <select
                  value={lead.status ?? 'new'}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={statusSaving}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {VALID_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Asignado a</label>
                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ASSIGNEES.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* Footer — Quick actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex flex-wrap gap-2 rounded-b-2xl">
          {lead.status !== 'contacted' && (
            <button
              onClick={() => handleStatusChange('contacted')}
              disabled={statusSaving}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 disabled:opacity-50 transition-colors"
            >
              Marcar contactado
            </button>
          )}
          {lead.status !== 'in_progress' && (
            <button
              onClick={() => handleStatusChange('in_progress')}
              disabled={statusSaving}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 disabled:opacity-50 transition-colors"
            >
              Marcar en proceso
            </button>
          )}
          {lead.status !== 'closed' && (
            <button
              onClick={() => handleStatusChange('closed')}
              disabled={statusSaving}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 disabled:opacity-50 transition-colors"
            >
              Cerrar
            </button>
          )}
          {lead.status !== 'discarded' && (
            <button
              onClick={() => handleStatusChange('discarded')}
              disabled={statusSaving}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-gray-50 hover:bg-gray-100 text-gray-500 border border-gray-200 disabled:opacity-50 transition-colors"
            >
              Descartar
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cerrar modal
          </button>
        </div>
      </div>
    </div>
  )
}
