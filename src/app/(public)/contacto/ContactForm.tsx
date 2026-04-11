'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

const inputClass =
  'w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors'

const selectClass =
  'w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors appearance-none'

const labelClass = 'block text-xs font-medium tracking-wide text-foreground/70 mb-1.5 uppercase'

const INTERESES = [
  { value: 'buy', label: 'Comprar propiedad' },
  { value: 'sell', label: 'Vender propiedad' },
  { value: 'invest', label: 'Invertir' },
  { value: 'other', label: 'Otra consulta' },
]

export default function ContactForm() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', interest: '', message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  function set(key: string, val: string) {
    setForm((p) => ({ ...p, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          interest: form.interest || undefined,
          message: form.message.trim(),
          source: 'contacto',
        }),
      })
      if (!res.ok) throw new Error('Error')
      setDone(true)
    } catch {
      setError('No se pudo enviar el mensaje. Por favor inténtelo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-gold/20 bg-gold/5 p-10 text-center">
        <div className="mb-4 text-5xl">✓</div>
        <h3 className="font-display text-2xl font-semibold mb-3">Mensaje recibido</h3>
        <p className="text-muted-foreground text-sm">
          Gracias por contactarnos. Un especialista le responderá en menos de 24 horas.
        </p>
        <div className="mt-6 h-1 w-16 mx-auto rounded-full bg-gold" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass}>Nombre completo <span className="text-gold">*</span></label>
        <input
          type="text"
          required
          maxLength={100}
          placeholder="María García"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Email <span className="text-gold">*</span></label>
          <input
            type="email"
            required
            maxLength={255}
            placeholder="maria@email.com"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Teléfono</label>
          <input
            type="tel"
            maxLength={20}
            placeholder="+34 600 000 000"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Tipo de consulta</label>
        <div className="relative">
          <select
            value={form.interest}
            onChange={(e) => set('interest', e.target.value)}
            className={selectClass}
          >
            <option value="">Seleccionar...</option>
            {INTERESES.map((i) => (
              <option key={i.value} value={i.value}>{i.label}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">▾</div>
        </div>
      </div>

      <div>
        <label className={labelClass}>Mensaje <span className="text-gold">*</span></label>
        <textarea
          required
          rows={5}
          maxLength={2000}
          placeholder="Cuéntenos en qué podemos ayudarle..."
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
          className={inputClass + ' resize-none'}
        />
      </div>

      <div className="flex items-start gap-3">
        <input
          id="contact-gdpr"
          type="checkbox"
          required
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-gold cursor-pointer"
        />
        <label htmlFor="contact-gdpr" className="text-xs text-muted-foreground cursor-pointer leading-relaxed">
          Acepto la{' '}
          <a href="/politica-de-privacidad" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
            política de privacidad
          </a>{' '}
          y el tratamiento de mis datos para la gestión de mi solicitud.{' '}
          <span className="text-gold">*</span>
        </label>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-gold w-full rounded-lg px-6 py-4 text-sm font-semibold tracking-wide disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? 'Enviando...' : 'Enviar mensaje'}
      </button>

      <p className="text-center text-xs text-muted-foreground">Respuesta en menos de 24 horas · Sin compromiso</p>
    </form>
  )
}
