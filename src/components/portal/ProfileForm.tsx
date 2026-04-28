'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { User, Upload, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Agent } from '@/types/agent'

interface Props {
  initialData: Agent
  userId: string
}

export function ProfileForm({ initialData, userId }: Props) {
  const [fullName, setFullName] = useState(initialData.full_name ?? '')
  const [phone, setPhone] = useState(initialData.phone ?? '')
  const [agencyName, setAgencyName] = useState(initialData.agency_name ?? '')
  const [logoUrl, setLogoUrl] = useState(initialData.logo_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'El archivo no puede superar 2 MB.' })
      return
    }

    setUploading(true)
    setMessage(null)

    const path = `${userId}/logo.${file.name.split('.').pop()}`
    const { error } = await supabase.storage
      .from('agent-logos')
      .upload(path, file, { upsert: true })

    if (error) {
      setMessage({ type: 'error', text: 'Error al subir el logo.' })
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('agent-logos')
      .getPublicUrl(path)

    setLogoUrl(publicUrl)
    setUploading(false)
    setMessage({ type: 'success', text: 'Logo actualizado.' })
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const res = await fetch('/api/portal/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fullName,
        phone: phone || null,
        agency_name: agencyName || null,
        logo_url: logoUrl || null,
      }),
    })

    setSaving(false)
    if (res.ok) {
      setMessage({ type: 'success', text: 'Perfil guardado correctamente.' })
    } else {
      setMessage({ type: 'error', text: 'Error al guardar el perfil.' })
    }
  }

  return (
    <form onSubmit={handleSave} className="bg-white rounded-2xl border border-border shadow-elegant p-6 space-y-6">
      {/* Logo */}
      <div>
        <label className="block text-sm font-medium mb-3">Logo de la agencia</label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl border-2 border-border overflow-hidden bg-muted flex items-center justify-center shrink-0">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Logo agencia"
                width={80}
                height={80}
                className="object-contain w-full h-full"
              />
            ) : (
              <User className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 border border-gold text-gold hover:bg-gold hover:text-primary rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Subiendo...' : 'Subir logo'}
            </button>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG o WEBP · Máx. 2 MB</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>
        </div>
      </div>

      {/* Nombre completo */}
      <div>
        <label className="block text-sm font-medium mb-1">Nombre completo *</label>
        <input
          type="text"
          required
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-gold text-sm"
          placeholder="Tu nombre y apellido"
        />
      </div>

      {/* Email (readonly) */}
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={initialData.email}
          readOnly
          className="w-full px-4 py-2.5 border border-border rounded-lg bg-muted text-muted-foreground text-sm cursor-not-allowed"
        />
      </div>

      {/* Teléfono */}
      <div>
        <label className="block text-sm font-medium mb-1">Teléfono</label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-gold text-sm"
          placeholder="+34 600 000 000"
        />
      </div>

      {/* Agencia */}
      <div>
        <label className="block text-sm font-medium mb-1">Nombre de la inmobiliaria / agencia</label>
        <input
          type="text"
          value={agencyName}
          onChange={e => setAgencyName(e.target.value)}
          className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:border-gold text-sm"
          placeholder="Tu agencia o empresa"
        />
      </div>

      {/* Mensaje de estado */}
      {message && (
        <p className={`text-sm ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
