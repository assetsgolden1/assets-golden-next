'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { PhoneInput } from '@/components/PhoneInput'

interface Props {
  propertyId: string
  propertyTitle: string
  propertySlug: string
}

export default function PropertyContactModal({ propertyId, propertyTitle, propertySlug }: Props) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneCountry, setPhoneCountry] = useState('España')
  const [phonePrefix, setPhonePrefix] = useState('+34')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    const form = e.currentTarget
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (typeof window !== 'undefined' ? window.location.origin : '')
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem('email') as HTMLInputElement).value.trim(),
      phone: phone || undefined,
      phone_country: phoneCountry,
      phone_prefix: phonePrefix,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value.trim() || undefined,
      source: 'property_contact',
      type: 'consulta-propiedad',
      property_id: propertyId,
      property_title: propertyTitle,
      property_url: `${baseUrl}/propiedades/${propertySlug}`,
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Error al enviar')
      setStatus('success')
    } catch {
      setErrorMsg('Ha ocurrido un error. Por favor inténtelo de nuevo.')
      setStatus('error')
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-[#d4af37] hover:bg-[#c9a42e] text-[#0a1628] font-semibold py-3 px-6 rounded-lg transition-colors text-sm"
      >
        Solicitar información
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white', borderRadius: 12, padding: 32,
              width: '100%', maxWidth: 480, position: 'relative',
              maxHeight: '90vh', overflowY: 'auto', zIndex: 10000,
            }}
          >
            <button
              onClick={() => setOpen(false)}
              style={{
                position: 'absolute', top: 16, right: 16,
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#9ca3af',
              }}
            >
              <X size={20} />
            </button>

            <h2 className="font-semibold text-xl text-gray-900 mb-1">Solicitar información</h2>
            <p className="text-sm text-gray-500 mb-5 line-clamp-2">{propertyTitle}</p>

            {status === 'success' ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">✓</div>
                <p className="font-semibold text-gray-800">¡Mensaje enviado!</p>
                <p className="text-sm text-gray-500 mt-1">Nos pondremos en contacto con usted pronto.</p>
                <button
                  onClick={() => { setOpen(false); setStatus('idle') }}
                  className="mt-5 text-sm text-[#d4af37] hover:underline"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
                  <input
                    name="name"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                    placeholder="Su nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono</label>
                  <PhoneInput
                    value={phone}
                    onChange={(p, country, prefix) => {
                      setPhone(p)
                      setPhoneCountry(country)
                      setPhonePrefix(prefix)
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Mensaje</label>
                  <textarea
                    name="message"
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] resize-none"
                    placeholder="¿Tiene alguna pregunta sobre esta propiedad?"
                  />
                </div>
                {status === 'error' && (
                  <p className="text-xs text-red-500">{errorMsg}</p>
                )}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-[#d4af37] hover:bg-[#c9a42e] text-[#0a1628] font-semibold py-3 rounded-lg transition-colors text-sm disabled:opacity-60"
                >
                  {status === 'loading' ? 'Enviando...' : 'Enviar consulta'}
                </button>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
