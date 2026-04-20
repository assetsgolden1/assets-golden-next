'use client'

import { useState } from 'react'

interface Destino {
  id: string
  country_name: string
  slug: string
  hero_image_url: string | null
  description: string | null
  city_images: Record<string, string> | null
}

export function DestinosManager({
  destinos,
  countryStats,
}: {
  destinos: Destino[]
  countryStats: Record<string, { total: number; cities: Record<string, number> }>
}) {
  const [selectedCountry, setSelectedCountry] = useState<Destino | null>(null)
  const [cityImages, setCityImages] = useState<Record<string, string>>({})
  const [uploadingFor, setUploadingFor] = useState<string | null>(null)

  async function uploadPhoto(
    file: File,
    bucket: string,
    targetId: string,
    isCity = false
  ) {
    setUploadingFor(targetId)

    const fd = new FormData()
    fd.append('file', file)
    fd.append('bucket', bucket)

    const uploadRes = await fetch('/api/admin/upload-image', { method: 'POST', body: fd })
    const { url, error } = await uploadRes.json()

    if (error || !url) {
      alert('Error subiendo imagen: ' + (error ?? 'sin URL'))
      setUploadingFor(null)
      return
    }

    if (isCity) {
      const res = await fetch('/api/admin/update-destino', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedCountry?.id, cityName: targetId, cityImageUrl: url }),
      })
      if (!res.ok) {
        const d = await res.json()
        alert('Error guardando: ' + (d.error ?? 'desconocido'))
        setUploadingFor(null)
        return
      }
      window.location.reload()
    } else {
      await fetch('/api/admin/update-destino', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: targetId, hero_image_url: url }),
      })
      window.location.reload()
    }

    setUploadingFor(null)
  }

  // ── VISTA DETALLE ────────────────────────────────────────────────
  if (selectedCountry) {
    const stats = countryStats[selectedCountry.country_name]
    const cities = Object.entries(stats?.cities ?? {}).sort((a, b) => b[1] - a[1])
    const existingCityImages = { ...(selectedCountry.city_images ?? {}), ...cityImages }

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <button
            onClick={() => { setSelectedCountry(null); setCityImages({}) }}
            style={{
              padding: '8px 16px', backgroundColor: '#e5e7eb',
              border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14,
            }}
          >
            ← Volver
          </button>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
            {selectedCountry.country_name}
          </h2>
          <span style={{
            fontSize: 13, color: '#6b7280', backgroundColor: '#f3f4f6',
            padding: '4px 10px', borderRadius: 20,
          }}>
            {stats?.total ?? 0} propiedades
          </span>
        </div>

        {/* Foto de portada del país */}
        <div style={{
          backgroundColor: 'white', borderRadius: 10,
          border: '1px solid #e5e7eb', padding: 20, marginBottom: 24,
        }}>
          <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: '0.95rem', color: '#374151' }}>
            Foto de portada del país
          </h3>
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <img
              src={selectedCountry.hero_image_url ?? '/placeholder-property.svg'}
              alt={selectedCountry.country_name}
              style={{ width: 240, height: 160, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
              onError={(e) => { e.currentTarget.src = '/placeholder-property.svg' }}
            />
            <div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
                Aparece en la sección de destinos del home y en la cabecera de la página del país.
              </p>
              <label style={{
                display: 'inline-block', padding: '8px 16px',
                backgroundColor: uploadingFor === selectedCountry.id ? '#9ca3af' : '#131D2E',
                color: 'white', borderRadius: 6,
                cursor: uploadingFor === selectedCountry.id ? 'wait' : 'pointer',
                fontSize: 13, fontWeight: 600,
              }}>
                {uploadingFor === selectedCountry.id ? 'Subiendo...' : '📷 Cambiar foto de portada'}
                <input
                  type="file" accept="image/*" style={{ display: 'none' }}
                  disabled={!!uploadingFor}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) uploadPhoto(file, 'destination-images', selectedCountry.id, false)
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Ciudades */}
        <div style={{
          backgroundColor: 'white', borderRadius: 10,
          border: '1px solid #e5e7eb', padding: 20,
        }}>
          <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: '0.95rem', color: '#374151' }}>
            Ciudades ({cities.length})
          </h3>
          {cities.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: 14 }}>
              No hay ciudades registradas para este país.
            </p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 12,
            }}>
              {cities.map(([city, count]) => {
                const cityImg = existingCityImages[city]
                const isUploading = uploadingFor === city

                return (
                  <div key={city} style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={cityImg ?? 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=60'}
                        alt={city}
                        style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }}
                        onError={(e) => { e.currentTarget.src = '/placeholder-property.svg' }}
                      />
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.65))',
                        padding: '20px 8px 8px',
                      }}>
                        <p style={{ color: 'white', fontSize: 13, fontWeight: 600, margin: 0 }}>{city}</p>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, margin: 0 }}>{count} props</p>
                      </div>
                      {cityImg && (
                        <span style={{
                          position: 'absolute', top: 4, right: 4,
                          backgroundColor: '#16a34a', color: 'white',
                          fontSize: 10, padding: '2px 5px', borderRadius: 3,
                        }}>✓</span>
                      )}
                    </div>
                    <div style={{ padding: 8 }}>
                      <label style={{
                        display: 'block', textAlign: 'center', padding: '5px',
                        backgroundColor: isUploading ? '#9ca3af' : '#f3f4f6',
                        color: isUploading ? 'white' : '#374151',
                        borderRadius: 4,
                        cursor: isUploading ? 'wait' : 'pointer',
                        fontSize: 12, fontWeight: 500,
                      }}>
                        {isUploading ? 'Subiendo...' : '📷 Cambiar foto'}
                        <input
                          type="file" accept="image/*" style={{ display: 'none' }}
                          disabled={!!uploadingFor}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) uploadPhoto(file, 'destination-images', city, true)
                          }}
                        />
                      </label>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── VISTA PRINCIPAL: GRID DE PAÍSES ─────────────────────────────
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: 16,
    }}>
      {destinos.map((destino) => {
        const stats = countryStats[destino.country_name]

        return (
          <div
            key={destino.id}
            style={{
              backgroundColor: 'white', borderRadius: 10,
              border: '1px solid #e5e7eb', overflow: 'hidden',
              cursor: 'pointer',
            }}
            onClick={() => setSelectedCountry(destino)}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
          >
            <div style={{ position: 'relative' }}>
              <img
                src={destino.hero_image_url ?? '/placeholder-property.svg'}
                alt={destino.country_name}
                style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
                onError={(e) => { e.currentTarget.src = '/placeholder-property.svg' }}
              />
              {!destino.hero_image_url && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  backgroundColor: '#f59e0b', color: 'white',
                  fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                }}>
                  Sin foto
                </div>
              )}
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>
                  {destino.country_name}
                </h3>
                <span style={{
                  fontSize: 12, color: '#6b7280', backgroundColor: '#f3f4f6',
                  padding: '2px 8px', borderRadius: 20,
                }}>
                  {stats?.total ?? 0} props
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
                {Object.keys(stats?.cities ?? {}).length} ciudades · Clic para gestionar →
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
