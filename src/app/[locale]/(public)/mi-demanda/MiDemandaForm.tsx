'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { PhoneInput } from '@/components/PhoneInput'
import { fbqTrack, sendServerEvent } from '@/lib/meta/track'
import { getAttribution } from '@/lib/attribution'

export default function MiDemandaForm() {
  const t = useTranslations('MyDemand')

  const PROPERTY_TYPES = [
    { value: 'piso',   label: t('form_type_apt') },
    { value: 'villa',  label: t('form_type_villa') },
    { value: 'atico',  label: t('form_type_penthouse') },
    { value: 'local',  label: t('form_type_commercial') },
    { value: 'otro',   label: t('form_type_other') },
  ]

  const COUNTRIES = [
    { value: 'España',                 label: t('form_country_spain') },
    { value: 'México',                 label: t('form_country_mexico') },
    { value: 'Emiratos Árabes Unidos', label: t('form_country_uae') },
    { value: 'Argentina',              label: t('form_country_argentina') },
    { value: 'Estados Unidos',         label: t('form_country_usa') },
    { value: 'Costa Rica',             label: t('form_country_costarica') },
    { value: 'Reino Unido',            label: t('form_country_uk') },
    { value: 'Ecuador',                label: t('form_country_ecuador') },
    { value: 'Grecia',                 label: t('form_country_greece') },
  ]

  const BUDGETS = [
    { value: 'menos_300k', label: t('form_budget_under_300') },
    { value: '300k_600k',  label: t('form_budget_300_600') },
    { value: '600k_1m',    label: t('form_budget_600_1m') },
    { value: '1m_3m',      label: t('form_budget_1m_3m') },
    { value: 'mas_3m',     label: t('form_budget_over_3m') },
  ]

  const TIMELINES = [
    { value: 'inmediato',  label: t('form_timeline_immediate') },
    { value: '3_6_meses',  label: t('form_timeline_3_6') },
    { value: '6_12_meses', label: t('form_timeline_6_12') },
    { value: 'sin_prisa',  label: t('form_timeline_no_rush') },
  ]

  const EMPTY = { name: '', email: '', phone: '', propertyType: '', country: '', budget: '', features: '', timeline: '' }

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
        body: JSON.stringify({ ...form, phone_country: phoneCountry, phone_prefix: phonePrefix, attribution: getAttribution() }),
      })
      if (!res.ok) throw new Error('Error')
      const eventId = crypto.randomUUID()
      fbqTrack('Lead', {}, eventId)
      sendServerEvent({
        eventName: 'Lead',
        eventId,
        userData: {
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          firstName: form.name.trim().split(' ')[0],
          lastName: form.name.trim().split(' ').slice(1).join(' ') || undefined,
        },
      })
      setDone(true)
    } catch {
      setError(t('form_error'))
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="py-16 text-center">
        <div className="text-5xl mb-4">✦</div>
        <h2 className="font-display text-2xl font-semibold mb-3">{t('success_title')}</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">{t('success_subtitle')}</p>
      </div>
    )
  }

  const input = 'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-gold focus:outline-none'
  const select = 'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:border-gold focus:outline-none cursor-pointer'
  const label = 'block text-sm font-medium mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className={label} htmlFor="md-name">{t('form_name')}</label>
          <input id="md-name" required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} />
        </div>

        <div>
          <label className={label} htmlFor="md-email">{t('form_email')}</label>
          <input id="md-email" type="email" required maxLength={255} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} />
        </div>

        <div className="sm:col-span-2">
          <label className={label} htmlFor="md-phone">{t('form_phone')}</label>
          <PhoneInput value={form.phone} onChange={(p, country, prefix) => { setForm({ ...form, phone: p }); setPhoneCountry(country); setPhonePrefix(prefix) }} />
        </div>

        <div>
          <label className={label} htmlFor="md-type">{t('form_type')}</label>
          <select id="md-type" required value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value })} className={select}>
            <option value="">{t('form_type_placeholder')}</option>
            {PROPERTY_TYPES.map((tp) => <option key={tp.value} value={tp.value}>{tp.label}</option>)}
          </select>
        </div>

        <div>
          <label className={label} htmlFor="md-country">{t('form_country')}</label>
          <select id="md-country" required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={select}>
            <option value="">{t('form_country_placeholder') }</option>
            {COUNTRIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div>
          <label className={label} htmlFor="md-budget">{t('form_budget')}</label>
          <select id="md-budget" required value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className={select}>
            <option value="">{t('form_budget_placeholder_select') }</option>
            {BUDGETS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </div>

        <div>
          <label className={label} htmlFor="md-timeline">{t('form_timeline')}</label>
          <select id="md-timeline" required value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} className={select}>
            <option value="">{t('form_timeline_placeholder') }</option>
            {TIMELINES.map((tm) => <option key={tm.value} value={tm.value}>{tm.label}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={label} htmlFor="md-features">{t('form_features')}</label>
          <textarea id="md-features" rows={3} maxLength={1000} placeholder={t('form_features_placeholder')} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} className={`${input} resize-none`} />
        </div>

        <div className="sm:col-span-2 flex items-start gap-3">
          <input id="md-privacy" type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} className="mt-0.5 accent-gold" />
          <label htmlFor="md-privacy" className="text-sm text-muted-foreground cursor-pointer">
            {t('form_privacy_prefix')}{' '}
            <a href="/politica-de-privacidad" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">{t('form_privacy_link')}</a>
          </label>
        </div>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <button type="submit" disabled={submitting || !privacy} className="w-full rounded-lg bg-gold text-navy font-semibold py-3 text-sm hover:bg-gold/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? t('form_sending') : t('form_submit')}
      </button>
    </form>
  )
}
