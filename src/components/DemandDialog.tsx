'use client'

import { useState } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { PhoneInput } from '@/components/PhoneInput'

const inputClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors'

const selectClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-colors'

const labelClass = 'block text-xs font-medium tracking-wide text-foreground/70 mb-1.5 uppercase'

interface DemandDialogProps {
  open: boolean
  onClose: () => void
}

const INITIAL = {
  name: '', email: '', phone: '', propertyType: '',
  location: '', budget: '', bedrooms: '', message: '',
}

export default function DemandDialog({ open, onClose }: DemandDialogProps) {
  const t = useTranslations('MyDemand')
  const [form, setForm] = useState(INITIAL)
  const [phoneCountry, setPhoneCountry] = useState('España')
  const [phonePrefix, setPhonePrefix] = useState('+34')
  const [currency, setCurrency] = useState<'EUR' | 'USD'>('EUR')
  const [accepted, setAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  function set(key: string, val: string) {
    setForm((p) => ({ ...p, [key]: val }))
  }

  const PROPERTY_TYPES = [
    { value: 'apartment', label: t('form_type_apt_short') },
    { value: 'villa',     label: t('form_type_villa') },
    { value: 'house',     label: t('form_type_house') },
    { value: 'penthouse', label: t('form_type_penthouse') },
    { value: 'land',      label: t('form_type_land') },
    { value: 'building',  label: t('form_type_building') },
    { value: 'hotel',     label: t('form_type_hotel') },
    { value: 'rural',     label: t('form_type_rural') },
    { value: 'commercial',label: t('form_type_commercial') },
    { value: 'other',     label: t('form_type_other') },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!accepted) { setError(t('form_privacy_error')); return }
    setError('')
    setSubmitting(true)

    const typeLabel = PROPERTY_TYPES.find((tp) => tp.value === form.propertyType)?.label ?? form.propertyType
    const budgetStr = `${currency} ${form.budget}`
    // Tipo, ubicación y presupuesto ya van en sus columnas: aquí solo lo que
    // no tiene una (habitaciones) y los comentarios del cliente.
    const msg = [
      form.bedrooms && `Habitaciones: ${form.bedrooms}`,
      form.message.trim(),
    ].filter(Boolean).join(' · ')

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
          interest: 'demanda',
          property_type: typeLabel,
          zone: form.location,
          intention: 'Comprar',
          budget: budgetStr,
          message: msg,
          location: form.location,
          source: 'demand_form',
        }),
      })
      if (!res.ok) throw new Error('Error al enviar')
      setDone(true)
    } catch {
      setError(t('form_error'))
    } finally {
      setSubmitting(false)
    }
  }

  function handleClose() {
    setForm(INITIAL); setAccepted(false); setDone(false); setError(''); onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-background shadow-2xl border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
              <Search className="h-5 w-5 text-gold" />
            </div>
            <h2 className="font-display text-xl font-semibold">{t('hero_title')}</h2>
          </div>
          <button onClick={handleClose} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors" aria-label={t('dialog_close')}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {done ? (
            <div className="py-8 text-center">
              <div className="mb-4 text-5xl">✓</div>
              <h3 className="font-display text-xl font-semibold mb-2">{t('dialog_success_title')}</h3>
              <p className="text-sm text-muted-foreground">{t('dialog_success_subtitle')}</p>
              <button onClick={handleClose} className="btn-gold mt-6 rounded-lg px-6 py-2.5 text-sm font-semibold">{t('dialog_close')}</button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-5">{t('dialog_description')}</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={labelClass}>{t('form_name')}</label>
                    <input type="text" required maxLength={100} value={form.name} onChange={(e) => set('name', e.target.value)} className={inputClass} />
                  </div>

                  <div>
                    <label className={labelClass}>{t('form_email')}</label>
                    <input type="email" required maxLength={255} value={form.email} onChange={(e) => set('email', e.target.value)} className={inputClass} />
                  </div>

                  <div className="col-span-2">
                    <label className={labelClass}>{t('form_phone')}</label>
                    <PhoneInput value={form.phone} onChange={(p, country, prefix) => { set('phone', p); setPhoneCountry(country); setPhonePrefix(prefix) }} />
                  </div>

                  <div>
                    <label className={labelClass}>{t('form_type')}</label>
                    <select required value={form.propertyType} onChange={(e) => set('propertyType', e.target.value)} className={selectClass}>
                      <option value="">{t('form_type_placeholder')}</option>
                      {PROPERTY_TYPES.map((tp) => <option key={tp.value} value={tp.value}>{tp.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>{t('form_rooms')}</label>
                    <select value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} className={selectClass}>
                      <option value="">{t('form_rooms_any')}</option>
                      {['1', '2', '3', '4', '5+'].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className={labelClass}>{t('form_location')}</label>
                    <input type="text" required maxLength={100} placeholder={t('form_location_placeholder')} value={form.location} onChange={(e) => set('location', e.target.value)} className={inputClass} />
                  </div>

                  <div className="col-span-2">
                    <label className={labelClass}>{t('form_budget_approx')}</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select value={currency} onChange={(e) => setCurrency(e.target.value as 'EUR' | 'USD')} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 14, backgroundColor: 'white', minWidth: 80 }}>
                        <option value="EUR">€ EUR</option>
                        <option value="USD">$ USD</option>
                      </select>
                      <input type="text" required maxLength={50} placeholder={t('form_budget_placeholder')} value={form.budget} onChange={(e) => set('budget', e.target.value)} className={inputClass} />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className={labelClass}>{t('form_details')}</label>
                    <textarea rows={3} maxLength={1000} placeholder={t('form_details_placeholder')} value={form.message} onChange={(e) => set('message', e.target.value)} className={inputClass + ' resize-none'} />
                  </div>

                  <div className="col-span-2 flex items-start gap-3 pt-1">
                    <input id="demand-privacy" type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-gold cursor-pointer" />
                    <label htmlFor="demand-privacy" className="text-xs text-muted-foreground cursor-pointer leading-relaxed">
                      {t('form_privacy_prefix')}{' '}
                      <a href="/politica-de-privacidad" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">{t('form_privacy_link')}</a>
                      . <span className="text-gold">*</span>
                    </label>
                  </div>
                </div>

                {error && <p className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}

                <button type="submit" disabled={submitting || !accepted || !form.propertyType} className="btn-gold w-full rounded-lg px-6 py-3 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitting ? t('form_sending') : t('form_submit_demand')}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
