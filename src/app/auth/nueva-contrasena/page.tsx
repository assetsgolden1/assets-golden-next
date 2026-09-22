'use client'
import Link from 'next/link'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Destino del enlace de recuperación (y de la invitación de agentes). Supabase entrega el
 * token en el hash de la URL; el cliente lo intercambia por una sesión de tipo "recovery"
 * y aquí el usuario define su contraseña nueva. Después se le manda al panel o al portal
 * según su rol.
 */
export default function NuevaContrasenaPage() {
  const [ready, setReady] = useState<'checking' | 'ok' | 'invalid'>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    // El SDK procesa el hash (#access_token=…&type=recovery) al inicializarse.
    supabase.auth.getSession().then(({ data }) => setReady(data.session ? 'ok' : 'invalid'))
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady('ok')
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres')
    if (password !== confirm) return setError('Las contraseñas no coinciden')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setLoading(false); return setError(error.message) }
    const { data: { user } } = await supabase.auth.getUser()
    const { data: role } = await supabase.from('user_roles').select('role').eq('user_id', user?.id ?? '').maybeSingle()
    const dest = role?.role === 'admin' ? '/admin' : '/portal'
    setDone(dest)
    setTimeout(() => { window.location.href = dest }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm">
        <img src="/logo.png" alt="Assets Golden" className="h-16 w-auto mx-auto mb-6" />
        <h1 className="text-xl font-semibold text-center text-gray-800 mb-6">Nueva contraseña</h1>

        {ready === 'checking' && <p className="text-sm text-gray-500 text-center">Comprobando el enlace…</p>}

        {ready === 'invalid' && (
          <div className="text-center">
            <p className="text-sm text-red-600 mb-4">El enlace no es válido o ha caducado.</p>
            <Link href="/auth/recuperar" className="text-sm text-[#0a1628] underline">Pedir un enlace nuevo</Link>
          </div>
        )}

        {ready === 'ok' && !done && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password" required autoFocus minLength={8} placeholder="Nueva contraseña (mínimo 8 caracteres)"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0a1628]"
            />
            <input
              type="password" required minLength={8} placeholder="Repetir contraseña"
              value={confirm} onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0a1628]"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full bg-[#0a1628] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#1a2638] transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando…' : 'Guardar contraseña'}
            </button>
          </form>
        )}

        {done && (
          <p className="text-sm text-green-700 text-center">Contraseña guardada. Entrando…</p>
        )}
      </div>
    </div>
  )
}
