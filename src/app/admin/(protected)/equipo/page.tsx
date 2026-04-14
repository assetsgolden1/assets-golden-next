'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit2, Trash2, X } from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  role_es: string | null
  bio_es: string | null
  photo_url: string | null
  linkedin_url: string | null
  country: string | null
  member_type: 'founder' | 'partner' | 'team'
  order_index: number
  active: boolean
}

const MEMBER_TYPES = [
  { value: 'founder', label: 'Fundadores' },
  { value: 'partner', label: 'Partners' },
  { value: 'team', label: 'Equipo' },
]

type MemberType = 'founder' | 'partner' | 'team'

const emptyForm: {
  name: string
  member_type: MemberType
  role_es: string
  country: string
  order_index: number
  photo_url: string
  linkedin_url: string
  bio_es: string
  active: boolean
} = {
  name: '',
  member_type: 'team',
  role_es: '',
  country: '',
  order_index: 0,
  photo_url: '',
  linkedin_url: '',
  bio_es: '',
  active: true,
}

export default function EquipoPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<typeof emptyForm>({ ...emptyForm })

  useEffect(() => { loadMembers() }, [])

  async function loadMembers() {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data, error: fetchError } = await supabase
      .from('team_members')
      .select('*')
      .order('order_index', { ascending: true })

    if (fetchError) setError('Error: ' + fetchError.message)
    else setMembers((data as TeamMember[]) ?? [])
    setLoading(false)
  }

  function openCreateForm() {
    setEditingMember(null)
    setForm({ ...emptyForm })
    setShowForm(true)
  }

  function openEditForm(member: TeamMember) {
    setEditingMember(member)
    setForm({
      name: member.name,
      member_type: member.member_type,
      role_es: member.role_es ?? '',
      country: member.country ?? '',
      order_index: member.order_index,
      photo_url: member.photo_url ?? '',
      linkedin_url: member.linkedin_url ?? '',
      bio_es: member.bio_es ?? '',
      active: member.active,
    })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.role_es.trim()) return
    setSaving(true)
    const supabase = createClient()

    const payload = {
      name: form.name,
      member_type: form.member_type,
      role_es: form.role_es,
      country: form.country || null,
      order_index: form.order_index,
      photo_url: form.photo_url || null,
      linkedin_url: form.linkedin_url || null,
      bio_es: form.bio_es || null,
      active: form.active,
    }

    let fetchError
    if (editingMember) {
      const { error } = await supabase.from('team_members').update(payload).eq('id', editingMember.id)
      fetchError = error
    } else {
      const { error } = await supabase.from('team_members').insert(payload)
      fetchError = error
    }

    if (fetchError) {
      alert('Error guardando: ' + fetchError.message)
    } else {
      setShowForm(false)
      loadMembers()
    }
    setSaving(false)
  }

  async function toggleActive(member: TeamMember) {
    const supabase = createClient()
    const { error } = await supabase
      .from('team_members')
      .update({ active: !member.active })
      .eq('id', member.id)

    if (error) alert('Error: ' + error.message)
    else loadMembers()
  }

  async function deleteMember(member: TeamMember) {
    if (!window.confirm(`¿Eliminar a ${member.name}?`)) return
    const supabase = createClient()
    const { error } = await supabase.from('team_members').delete().eq('id', member.id)
    if (error) alert('Error: ' + error.message)
    else loadMembers()
  }

  const byType = (type: string) => members.filter((m) => m.member_type === type)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Equipo</h1>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 bg-[#0a1628] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#1a2638] transition-colors"
        >
          <Plus size={16} /> Añadir miembro
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {MEMBER_TYPES.map(({ value, label }) => {
            const group = byType(value)
            if (group.length === 0) return null
            return (
              <div key={value}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{label}</h2>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {group.map((member, idx) => (
                    <div
                      key={member.id}
                      className={`flex items-center gap-4 px-5 py-4 ${idx > 0 ? 'border-t border-gray-50' : ''} ${!member.active ? 'opacity-50' : ''}`}
                    >
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-semibold flex-shrink-0">
                          {member.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.role_es}</p>
                        {member.country && <p className="text-xs text-gray-400">{member.country}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleActive(member)}
                          className={`text-xs px-2 py-1 rounded-full ${
                            member.active
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {member.active ? 'Activo' : 'Inactivo'}
                        </button>
                        <button
                          onClick={() => openEditForm(member)}
                          className="text-blue-500 hover:text-blue-700 p-1"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => deleteMember(member)}
                          className="text-red-400 hover:text-red-600 p-1"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
          {members.length === 0 && (
            <div className="text-center py-10 text-gray-400">No hay miembros del equipo</div>
          )}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">
                {editingMember ? 'Editar miembro' : 'Nuevo miembro'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={form.member_type}
                  onChange={(e) => setForm((f) => ({ ...f, member_type: e.target.value as MemberType }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {MEMBER_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.role_es}
                  onChange={(e) => setForm((f) => ({ ...f, role_es: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                  <input
                    type="number"
                    value={form.order_index}
                    onChange={(e) => setForm((f) => ({ ...f, order_index: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Foto</label>
                <input
                  type="text"
                  value={form.photo_url}
                  onChange={(e) => setForm((f) => ({ ...f, photo_url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={form.linkedin_url}
                  onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={form.bio_es}
                  onChange={(e) => setForm((f) => ({ ...f, bio_es: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  className="w-4 h-4"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">Activo</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.role_es.trim()}
                className="px-4 py-2 text-sm bg-[#0a1628] text-white rounded-lg hover:bg-[#1a2638] transition-colors disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
