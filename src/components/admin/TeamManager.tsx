'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, X, Upload } from 'lucide-react'
import { createTeamMember, updateTeamMember, deleteTeamMember } from '@/app/admin/actions'
import { createClient } from '@/lib/supabase/client'

function TeamPhotoUploader({
  value,
  onChange,
}: {
  value: string
  onChange: (url: string) => void
}) {
  const [uploading, setUploading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar 5 MB')
      return
    }
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage
      .from('team-photos')
      .upload(fileName, file, { cacheControl: '3600', upsert: false })
    if (error) {
      alert('Error subiendo foto: ' + error.message)
      setUploading(false)
      return
    }
    const { data: { publicUrl } } = supabase.storage.from('team-photos').getPublicUrl(fileName)
    onChange(publicUrl)
    setUploading(false)
    // reset input so same file can be re-uploaded
    e.target.value = ''
  }

  return (
    <div className="flex items-center gap-4">
      {value ? (
        <img
          src={value}
          alt="Foto"
          className="w-16 h-16 rounded-full object-cover border border-gray-200 flex-shrink-0"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
          <Upload size={18} className="text-gray-400" />
        </div>
      )}
      <div className="flex-1">
        <label className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 border rounded-lg cursor-pointer transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 border-gray-300'}`}>
          <Upload size={13} />
          {uploading ? 'Subiendo…' : value ? 'Cambiar foto' : 'Subir foto'}
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={handleFile}
            className="hidden"
          />
        </label>
        <p className="text-xs text-gray-400 mt-1">JPG/PNG/WEBP · máx 5 MB</p>
      </div>
    </div>
  )
}

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

export function TeamManager({ initialMembers }: { initialMembers: TeamMember[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [form, setForm] = useState<typeof emptyForm>({ ...emptyForm })

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

  function handleSave() {
    if (!form.name.trim() || !form.role_es.trim()) return
    startTransition(async () => {
      const payload = {
        name: form.name,
        member_type: form.member_type,
        role_es: form.role_es,
        country: form.country,
        order_index: form.order_index,
        photo_url: form.photo_url,
        linkedin_url: form.linkedin_url,
        bio_es: form.bio_es,
        active: form.active,
      }
      if (editingMember) {
        await updateTeamMember(editingMember.id, payload)
      } else {
        await createTeamMember(payload)
      }
      setShowForm(false)
      router.refresh()
    })
  }

  function handleToggleActive(member: TeamMember) {
    startTransition(async () => {
      await updateTeamMember(member.id, { active: !member.active })
      router.refresh()
    })
  }

  function handleDelete(member: TeamMember) {
    if (!window.confirm(`¿Eliminar a ${member.name}?`)) return
    startTransition(async () => {
      await deleteTeamMember(member.id)
      router.refresh()
    })
  }

  const byType = (type: string) => initialMembers.filter((m) => m.member_type === type)

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

      <div className="space-y-8">
        {MEMBER_TYPES.map(({ value, label }) => {
          const group = byType(value)
          if (group.length === 0) return null
          return (
            <div key={value}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {label}
              </h2>
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
                        onClick={() => handleToggleActive(member)}
                        disabled={isPending}
                        className={`text-xs px-2 py-1 rounded-full disabled:opacity-50 ${
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
                        onClick={() => handleDelete(member)}
                        disabled={isPending}
                        className="text-red-400 hover:text-red-600 p-1 disabled:opacity-50"
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
        {initialMembers.length === 0 && (
          <div className="text-center py-10 text-gray-400">No hay miembros del equipo</div>
        )}
      </div>

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
                  onChange={(e) =>
                    setForm((f) => ({ ...f, member_type: e.target.value as MemberType }))
                  }
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
                    onChange={(e) =>
                      setForm((f) => ({ ...f, order_index: parseInt(e.target.value) || 0 }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Foto</label>
                <TeamPhotoUploader
                  value={form.photo_url}
                  onChange={(url) => setForm((f) => ({ ...f, photo_url: url }))}
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
                disabled={isPending || !form.name.trim() || !form.role_es.trim()}
                className="px-4 py-2 text-sm bg-[#0a1628] text-white rounded-lg hover:bg-[#1a2638] transition-colors disabled:opacity-50"
              >
                {isPending ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
