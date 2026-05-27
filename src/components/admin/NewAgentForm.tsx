'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, CheckCheck } from 'lucide-react'

export function NewAgentForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ email: string; tempPassword: string; name: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [form, setForm] = useState({
    email: '',
    full_name: '',
    phone: '',
    agency_name: '',
  })

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/admin/create-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      alert(data.error ?? 'Error creando agente')
      return
    }
    setResult({ email: form.email, tempPassword: data.tempPassword, name: form.full_name })
  }

  async function copyCredentials() {
    if (!result) return
    const msg = `Hola ${result.name}, ya tienes acceso al portal de Assets Golden.\n\nEntra aquí: https://assetsgolden.com/portal/login\nEmail: ${result.email}\nContraseña temporal: ${result.tempPassword}\n\nTe recomendamos cambiar la contraseña al primer acceso.`
    await navigator.clipboard.writeText(msg)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (result) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <h2 className="font-semibold text-green-900 mb-2">✓ Agente creado correctamente</h2>
        <p className="text-sm text-green-800 mb-5">
          Comparte estas credenciales con el agente por canal seguro (WhatsApp, teléfono). No usar email.
        </p>
        <div className="bg-white border border-green-200 rounded-lg p-4 mb-4 font-mono text-sm space-y-2">
          <p>
            <span className="text-gray-400 text-xs uppercase tracking-wide">Email</span>
            <br />
            <span className="text-gray-800">{result.email}</span>
          </p>
          <p>
            <span className="text-gray-400 text-xs uppercase tracking-wide">Contraseña temporal</span>
            <br />
            <span className="text-yellow-700 font-semibold bg-yellow-50 px-2 py-0.5 rounded select-all">
              {result.tempPassword}
            </span>
          </p>
        </div>
        <p className="text-xs text-gray-500 mb-5">
          El agente entra en <span className="font-mono">/portal/login</span> y cambia su contraseña desde el perfil.
        </p>
        <div className="flex gap-3">
          <button
            onClick={copyCredentials}
            className="flex items-center gap-2 text-sm px-4 py-2 border border-green-300 text-green-800 rounded-lg hover:bg-green-100 transition-colors"
          >
            {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
            {copied ? 'Copiado' : 'Copiar mensaje WhatsApp'}
          </button>
          <button
            onClick={() => router.push('/admin/agentes')}
            className="text-sm px-4 py-2 bg-[#0a1628] text-white rounded-lg hover:bg-[#1a2638] transition-colors"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          required
          value={form.email}
          onChange={set('email')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="agente@ejemplo.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre completo <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={form.full_name}
          onChange={set('full_name')}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="María García López"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+34 600 000 000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Agencia</label>
          <input
            type="text"
            value={form.agency_name}
            onChange={set('agency_name')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Inmobiliaria XYZ"
          />
        </div>
      </div>
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-[#0a1628] hover:bg-[#1a2638] text-white font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm"
        >
          {loading ? 'Creando agente...' : 'Crear agente'}
        </button>
      </div>
    </form>
  )
}
