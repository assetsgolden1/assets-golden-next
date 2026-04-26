'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { PhoneInput } from '@/components/PhoneInput'

const PROPERTY_TYPES = [
  { value: 'piso', label: 'Piso / Apartamento' },
  { value: 'villa', label: 'Villa' },
  { value: 'atico', label: 'Ático' },
  { value: 'local', label: 'Local comercial' },
  { value: 'otro', label: 'Otro' },
]

const COUNTRIES = [
  'España',
  'México',
  'Emiratos Árabes Unidos',
  'Argentina',
  'Estados Unidos',
  'Costa Rica',
  'Reino Unido',
  'Ecuador',
  'Grecia',
]

const BUDGETS = [
  { value: 'menos_300k', label: 'Menos de 300.000€' },
  { value: '300k_600k', label: '300.000€ – 600.000€' },
  { value: '600k_1m', label: '600.000€ – 1.000.000€' },
  { value: '1m_3m', label: '1.000.000€ – 3.000.000€' },
  { value: 'mas_3m', label: 'Más de 3.000.000€' },
]

const TIMELINES = [
  { value: 'inmediato', label: 'Inmediato' },
  { value: '3_6_meses', label: '3–6 meses' },
  { value: '6_12_meses', label: '6–12 meses' },
  { value: 'sin_prisa', label: 'Sin prisa' },
]

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  propertyType: '',
  country: '',
  budget: '',
  features: '',
  timeline: '',
}

export default function MiDemandaForm() {
  const [form, setForm] = useState(EMPTY)
  const [phoneCountry, setPhoneCountry] = useState('España')
  const [phonePrefix, setPhonePrefix] = useState('+34')
  const [privacy, setPrivacy] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!privacy) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/demands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, phone_country: phoneCountry, phone_prefix: phonePrefix }),
      })
      if (!res.ok) throw new Error('Error')
      setDone(true)
    } catch {
      setError('No se pudo enviar el formulario. Por favor, inténtelo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="py-16 text-center">
        <div className="text-5xl mb-4">✦</div>
        <h2 className="font-display text-2xl font-semibold mb-3">¡Demanda registrada!</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Hemos recibido su búsqueda. Nuestro equipo de Personal Shopper analizará la cartera offmarket y le contactará en un máximo de 48 horas.
        </p>
      </div>
    )
  }

  const input =
    'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-gold focus:outline-none'
  const select =
    'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-gold focus:outline-none cursor-pointer'
  const label = 'block text-sm font-medium mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={label} htmlFor="md-name">Nombre completo *</label>
          <input id="md-name" required maxLength={100} value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={input} />
        </div>

        <div>
          <label className={label} htmlFor="md-email">Email *</label>
          <input id="md-email" type="email" required maxLength={255} value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={input} />
        </div>

        <div>
          <label className={label} htmlFor="md-phone">Teléfono</label>
          <PhoneInput
            value={form.phone}
            onChange={(p, country, prefix) => {
              setForm({ ...form, phone: p })
              setPhoneCountry(country)
              setPhonePrefix(prefix)
            }}
          />
        </div>

        <div>
          <label className={label} htmlFor="md-type">Tipo de propiedad *</label>
          <select id="md-type" required value={form.propertyType}
            onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
            className={select}>
            <option value="">Seleccionar...</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={label} htmlFor="md-country">País / Zona de interés *</label>
          <select id="md-country" required value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            className={select}>
            <option value="">Seleccionar...</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={label} htmlFor="md-budget">Presupuesto máximo *</label>
          <select id="md-budget" required value={form.budget}
            onChange={(e) => setForm({ ...form, budget: e.target.value })}
            className={select}>
            <option value="">Seleccionar...</option>
            {BUDGETS.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={label} htmlFor="md-timeline">Plazo de compra *</label>
          <select id="md-timeline" required value={form.timeline}
            onChange={(e) => setForm({ ...form, timeline: e.target.value })}
            className={select}>
            <option value="">Seleccionar...</option>
            {TIMELINES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={label} htmlFor="md-features">Características imprescindibles</label>
          <textarea id="md-features" rows={3} maxLength={1000}
            placeholder="Ej: vista al mar, piscina privada, mínimo 4 dormitorios, garaje..."
            value={form.features}
            onChange={(e) => setForm({ ...form, features: e.target.value })}
            className={`${input} resize-none`} />
        </div>

        <div className="sm:col-span-2 flex items-start gap-3">
          <input id="md-privacy" type="checkbox" checked={privacy}
            onChange={(e) => setPrivacy(e.target.checked)}
            className="mt-0.5 accent-gold" />
          <label htmlFor="md-privacy" className="text-sm text-muted-foreground cursor-pointer">
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
        className="w-full rounded-lg bg-gold text-navy font-semibold py-3 text-sm hover:bg-gold/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? 'Enviando...' : 'Registrar mi búsqueda'}
      </button>
    </form>
  )
}
