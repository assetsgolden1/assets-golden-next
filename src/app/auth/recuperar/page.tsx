'use client'
import Link from 'next/link'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * "Olvidé mi contraseña" — común para admins (/admin/login) y agentes (/portal/login).
 * Supabase envía un email con un enlace que aterriza en /auth/nueva-contrasena.
 * Siempre responde igual (exista o no el email) para no revelar qué cuentas existen.
 */
export default function RecuperarPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/nueva-contrasena`,
    })
    setLoading(false)
    if (error) {
      // Rate limit u otro fallo de envío: se muestra sin revelar si el email existe.
      setError('No se pudo enviar el correo. Espera unos minutos e inténtalo de nuevo.')
      return
    }
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm">
        <img src="/logo.png" alt="Assets Golden" className="h-16 w-auto mx-auto mb-6" />
        <h1 className="text-xl font-semibold text-center text-gray-800 mb-2">Recuperar contraseña</h1>

        {sent ? (
          <p className="text-sm text-gray-600 text-center mt-4">
            Si <strong>{email}</strong> tiene una cuenta, en unos minutos recibirás un correo con un enlace
            para crear una contraseña nueva. Revisa también la carpeta de spam.
          </p>
        ) : (
          <>
            <p className="text-sm text-gray-500 text-center mb-6">
              Escribe tu email y te enviaremos un enlace para crear una contraseña nueva.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                required
                autoFocus
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0a1628]"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0a1628] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#1a2638] transition-colors disabled:opacity-50"
              >
                {loading ? 'Enviando…' : 'Enviar enlace'}
              </button>
            </form>
          </>
        )}

        <div className="mt-6 text-center space-x-4">
          <Link href="/admin/login" className="text-sm text-gray-500 hover:text-gray-700">Panel admin</Link>
          <Link href="/portal/login" className="text-sm text-gray-500 hover:text-gray-700">Portal de agentes</Link>
        </div>
      </div>
    </div>
  )
}
