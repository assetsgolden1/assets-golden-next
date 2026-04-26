'use client'

import { useState } from 'react'
import { Briefcase, Building2, HardHat, ArrowLeft, Loader2, X } from 'lucide-react'
import { PhoneInput } from '@/components/PhoneInput'

type CollabType = 'profesional' | 'agencia' | 'promotora'

interface Props {
  open: boolean
  initialType?: CollabType | null
  onClose: () => void
}

const TYPES = [
  {
    id: 'profesional' as CollabType,
    Icon: Briefcase,
    title: 'Profesional',
    description: 'Agentes inmobiliarios, asesores, arquitectos y otros profesionales del sector',
    cta: 'Unirme como profesional',
  },
  {
    id: 'agencia' as CollabType,
    Icon: Building2,
    title: 'Agencia',
    description: 'Agencias inmobiliarias que buscan expandir su red de colaboración',
    cta: 'Unirme como agencia',
  },
  {
    id: 'promotora' as CollabType,
    Icon: HardHat,
    title: 'Promotora',
    description: 'Promotoras y desarrolladoras inmobiliarias con proyectos activos',
    cta: 'Unirme como promotora',
  },
]

const EMPTY = { name: '', email: '', phone: '', company: '', specialty: '', message: '' }

export default function CollaborateDialog({ open, initialType = null, onClose }: Props) {
  const [selectedType, setSelectedType] = useState<CollabType | null>(initialType)
  const [form, setForm] = useState(EMPTY)
  const [phoneCountry, setPhoneCountry] = useState('España')
  const [phonePrefix, setPhonePrefix] = useState('+34')
  const [privacy, setPrivacy] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const handleClose = () => {
    setSelectedType(null)
    setForm(EMPTY)
    setPrivacy(false)
    setDone(false)
    setError(null)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedType || !privacy) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/collaborations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          phone_country: phoneCountry,
          phone_prefix: phonePrefix,
          company: form.company,
          specialty: form.specialty,
          message: form.message,
          collaborationType: selectedType,
        }),
      })
      if (!res.ok) throw new Error('Error al enviar')
      setDone(true)
    } catch {
      setError('No se pudo enviar el formulario. Por favor, inténtelo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const sel = TYPES.find((t) => t.id === selectedType)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display text-2xl font-semibold">Colabora con Nosotros</h2>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {done ? (
            <div className="py-8 text-center">
              <div className="text-4xl mb-4">✦</div>
              <h3 className="font-display text-xl font-semibold mb-2">¡Gracias!</h3>
              <p className="text-muted-foreground text-sm">
                Hemos recibido su solicitud. Le contactaremos a la brevedad.
              </p>
              <button onClick={handleClose} className="mt-6 text-sm text-gold hover:underline">
                Cerrar
              </button>
            </div>
          ) : !selectedType ? (
            <>
              <p className="text-muted-foreground text-sm mb-4">
                Seleccione el tipo de colaboración que mejor se adapte a su perfil:
              </p>
              <div className="space-y-3">
                {TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedType(t.id)}
                    className="w-full p-4 rounded-xl border border-border hover:border-gold bg-card hover:bg-accent/30 transition-all text-left group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-gold/10 text-gold group-hover:bg-gold group-hover:text-navy transition-colors shrink-0">
                        <t.Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-display text-base font-semibold group-hover:text-gold transition-colors">
                          {t.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">{t.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <button
                type="button"
                onClick={() => setSelectedType(null)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-gold transition-colors mb-2"
              >
                <ArrowLeft className="h-4 w-4" /> Volver
              </button>

              <div className="rounded-lg bg-gold/10 border border-gold/20 px-4 py-2">
                <p className="text-sm text-gold font-medium">{sel?.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1" htmlFor="cn">Nombre completo *</label>
                  <input id="cn" required maxLength={100} value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-gold focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="ce">Email *</label>
                  <input id="ce" type="email" required maxLength={255} value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-gold focus:outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1" htmlFor="cp">Teléfono</label>
                  <PhoneInput
                    value={form.phone}
                    onChange={(p, country, prefix) => {
                      setForm({ ...form, phone: p })
                      setPhoneCountry(country)
                      setPhonePrefix(prefix)
                    }}
                  />
                </div>
                {(selectedType === 'agencia' || selectedType === 'promotora') && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1" htmlFor="cc">Nombre de la empresa *</label>
                    <input id="cc" required maxLength={100} value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-gold focus:outline-none" />
                  </div>
                )}
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1" htmlFor="cs">Especialidad / Área de trabajo *</label>
                  <input id="cs" required maxLength={100} placeholder="Ej: Obra nueva, Lujo, Retail..." value={form.specialty}
                    onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-gold focus:outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1" htmlFor="cm">Cuéntanos sobre ti (opcional)</label>
                  <textarea id="cm" rows={3} maxLength={1000} placeholder="Experiencia, proyectos actuales, zonas de trabajo..." value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-gold focus:outline-none resize-none" />
                </div>
                <div className="col-span-2 flex items-start gap-3">
                  <input id="cprivacy" type="checkbox" checked={privacy}
                    onChange={(e) => setPrivacy(e.target.checked)}
                    className="mt-0.5 accent-gold" />
                  <label htmlFor="cprivacy" className="text-sm text-muted-foreground cursor-pointer">
                    He leído y acepto la{' '}
                    <a href="/politica-de-privacidad" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
                      política de privacidad
                    </a>
                  </label>
                </div>
              </div>

              {error && <p className="text-destructive text-sm">{error}</p>}

              <button
                type="submit"
                disabled={submitting || !privacy}
                className="w-full rounded-lg bg-gold text-navy font-semibold py-2.5 text-sm hover:bg-gold/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
