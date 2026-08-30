'use client'

import { useState } from 'react'
import { Building2, X, Loader2 } from 'lucide-react'
import { PhoneInput } from '@/components/PhoneInput'

const ASSET_TYPES = [
  { value: 'apartment', label: 'Apartamento' },
  { value: 'house', label: 'Casa / Chalet' },
  { value: 'villa', label: 'Villa' },
  { value: 'penthouse', label: 'Ático' },
  { value: 'commercial', label: 'Local Comercial' },
  { value: 'office', label: 'Oficina' },
  { value: 'building', label: 'Edificio' },
  { value: 'land', label: 'Terreno / Solar' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'rural', label: 'Finca rural' },
  { value: 'townhouse', label: 'Adosado' },
  { value: 'warehouse', label: 'Local o Nave' },
  { value: 'business', label: 'Negocios / Traspasos' },
  { value: 'other', label: 'Otro' },
]

const INTENTIONS = [
  { value: 'sell', label: 'Vender' },
  { value: 'rent', label: 'Alquilar' },
  { value: 'valuation', label: 'Valoración' },
  { value: 'investment', label: 'Buscar inversores' },
  { value: 'management', label: 'Gestión del activo' },
  { value: 'advice', label: 'Asesoramiento' },
]

const inputClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-gold focus:outline-none transition-colors'
const labelClass = 'block text-sm font-medium mb-1'

const INITIAL = { name: '', email: '', phone: '', assetType: '', location: '', intention: '', description: '' }

interface Props {
  open: boolean
  onClose: () => void
}

export default function AssetFormDialog({ open, onClose }: Props) {
  const [form, setForm] = useState(INITIAL)
  const [phoneCountry, setPhoneCountry] = useState('España')
  const [phonePrefix, setPhonePrefix] = useState('+34')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  function handleClose() {
    setForm(INITIAL)
    setDone(false)
    setError('')
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const assetTypeLabel = ASSET_TYPES.find((t) => t.value === form.assetType)?.label ?? form.assetType
    const intentionLabel = INTENTIONS.find((i) => i.value === form.intention)?.label ?? form.intention

    const message = `[TENGO UN ACTIVO]\nTipo: ${assetTypeLabel}\nUbicación: ${form.location}\nIntención: ${intentionLabel}\nDescripción: ${form.description || 'No especificada'}`

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          phone_country: phoneCountry,
          phone_prefix: phonePrefix,
          interest: form.assetType,
          // Sueltos para que el Sheet los ponga en columnas propias en vez de
          // apelmazarlos dentro del mensaje.
          property_type: assetTypeLabel,
          zone: form.location.trim(),
          intention: intentionLabel,
          message,
          location: form.location.trim(),
          source: 'asset_form',
        }),
      })
      if (!res.ok) throw new Error('Error al enviar')
      setDone(true)
    } catch {
      setError('No se pudo enviar el formulario. Inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-background shadow-2xl border border-border">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-gold" />
            <h2 className="font-display text-xl font-semibold">Tengo un Activo</h2>
          </div>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {done ? (
            <div className="py-8 text-center">
              <div className="text-4xl mb-4">✦</div>
              <h3 className="font-display text-xl font-semibold mb-2">¡Gracias!</h3>
              <p className="text-muted-foreground text-sm">Hemos recibido su información. Le contactaremos pronto.</p>
              <button onClick={handleClose} className="mt-6 text-sm text-gold hover:underline">Cerrar</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nombre *</label>
                  <input required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Su nombre" />
                </div>
                <div>
                  <label className={labelClass}>Email *</label>
                  <input required type="email" maxLength={255} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="tu@email.com" />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Teléfono</label>
                  <PhoneInput
                    value={form.phone}
                    onChange={(p, country, prefix) => {
                      setForm({ ...form, phone: p })
                      setPhoneCountry(country)
                      setPhonePrefix(prefix)
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Tipo de activo *</label>
                  <select required value={form.assetType} onChange={(e) => setForm({ ...form, assetType: e.target.value })} className={inputClass}>
                    <option value="">Selecciona el tipo</option>
                    {ASSET_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Ubicación *</label>
                  <input required maxLength={100} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass} placeholder="Ciudad, país" />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>¿Qué quieres hacer? *</label>
                  <select required value={form.intention} onChange={(e) => setForm({ ...form, intention: e.target.value })} className={inputClass}>
                    <option value="">Selecciona una opción</option>
                    {INTENTIONS.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Descripción</label>
                  <textarea rows={3} maxLength={1000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass + ' resize-none'} placeholder="Superficie, características, estado del activo..." />
                </div>
              </div>

              {error && <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

              <button type="submit" disabled={submitting} className="w-full rounded-lg bg-gold text-navy font-semibold py-2.5 text-sm hover:bg-gold/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? 'Enviando...' : 'Enviar'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
