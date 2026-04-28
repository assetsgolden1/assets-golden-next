'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 8 caracteres' })
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' })
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setLoading(false)

    if (error) {
      setMessage({ type: 'error', text: error.message })
      return
    }

    setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' })
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="text-sm font-medium mb-1 block">Nueva contraseña</label>
        <input
          type="password"
          required
          minLength={8}
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg text-sm"
          placeholder="Mínimo 8 caracteres"
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Confirmar nueva contraseña</label>
        <input
          type="password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg text-sm"
        />
      </div>

      {message && (
        <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-gold hover:bg-gold/90 text-primary font-semibold px-4 py-2 rounded-lg disabled:opacity-50 text-sm"
      >
        {loading ? 'Actualizando...' : 'Cambiar contraseña'}
      </button>
    </form>
  )
}
