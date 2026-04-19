'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface Props {
  propertyId: string
  propertyTitle: string
  propertySlug: string
}

export default function PropertyContactModal({ propertyId, propertyTitle, propertySlug }: Props) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem('email') as HTMLInputElement).value.trim(),
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value.trim() || undefined,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value.trim() || undefined,
      source: 'property_contact',
      property_id: propertyId,
      property_title: propertyTitle,
      property_url: `/propiedades/${propertySlug}`,
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

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-6">
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
                    <input
                      name="phone"
                      type="tel"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                      placeholder="+34 600 000 000"
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
          </div>
        </div>
      )}
    </>
  )
}
