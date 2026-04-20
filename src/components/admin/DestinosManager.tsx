'use client'

import { useState } from 'react'

interface Destino {
  id: string
  country_name: string
  slug: string
  hero_image_url: string | null
  description: string | null
}

export function DestinosManager({ destinos }: { destinos: Destino[] }) {
  const [editing, setEditing] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  async function handlePhotoUpload(destinoId: string, file: File) {
    setUploading(true)

    const fd = new FormData()
    fd.append('file', file)
    fd.append('bucket', 'destination-images')

    const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd })
    const data = await res.json()

    if (data.url) {
      await fetch('/api/admin/update-destino', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: destinoId, hero_image_url: data.url }),
      })
      window.location.reload()
    }

    setUploading(false)
    setEditing(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {destinos.map((destino) => (
        <div
          key={destino.id}
          style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: 16, backgroundColor: 'white',
            borderRadius: 8, border: '1px solid #e5e7eb',
          }}
        >
          <img
            src={destino.hero_image_url ?? '/placeholder-property.svg'}
            alt={destino.country_name}
            style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
            onError={(e) => { e.currentTarget.src = '/placeholder-property.svg' }}
          />

          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 2 }}>
              {destino.country_name}
            </p>
            <p style={{ fontSize: 12, color: '#6b7280' }}>/{destino.slug}</p>
          </div>

          {editing === destino.id ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handlePhotoUpload(destino.id, file)
                }}
                style={{ fontSize: 13 }}
              />
              <button
                onClick={() => setEditing(null)}
                style={{
                  padding: '4px 10px', backgroundColor: '#e5e7eb',
                  border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12,
                }}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(destino.id)}
              style={{
                padding: '6px 14px', backgroundColor: '#131D2E',
                color: 'white', border: 'none', borderRadius: 6,
                cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap',
              }}
            >
              📷 Cambiar foto
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
