'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import {
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  toggleBlogPublished,
} from '@/app/admin/actions'

interface BlogPost {
  id: string
  title: string
  slug: string | null
  category: string | null
  excerpt: string | null
  content: string | null
  cover_image?: string | null
  banner_image_url?: string | null
  published: boolean
  published_at: string | null
  created_at: string
  read_time?: number | null
}

const CATEGORIES = [
  { value: 'article', label: 'Artículo' },
  { value: 'tip', label: 'Consejo' },
  { value: 'news', label: 'Noticia' },
]

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function categoryLabel(cat: string | null) {
  return CATEGORIES.find((c) => c.value === cat)?.label ?? cat ?? '—'
}

function convertMarkdown(text: string): string {
  if (!text) return ''
  const lines = text.split('\n')
  const out: string[] = []
  let inList = false

  for (const raw of lines) {
    const line = raw
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#b8942e;text-decoration:underline">$1</a>')

    if (/^### /.test(raw)) {
      if (inList) { out.push('</ul>'); inList = false }
      out.push(`<h3 style="font-size:1.1em;font-weight:600;margin:1em 0 .4em">${line.slice(4)}</h3>`)
    } else if (/^## /.test(raw)) {
      if (inList) { out.push('</ul>'); inList = false }
      out.push(`<h2 style="font-size:1.3em;font-weight:700;margin:1.2em 0 .5em">${line.slice(3)}</h2>`)
    } else if (/^# /.test(raw)) {
      if (inList) { out.push('</ul>'); inList = false }
      out.push(`<h1 style="font-size:1.6em;font-weight:700;margin:1.2em 0 .5em">${line.slice(2)}</h1>`)
    } else if (/^- /.test(raw)) {
      if (!inList) { out.push('<ul style="padding-left:1.5em;margin:.5em 0">'); inList = true }
      out.push(`<li style="margin:.2em 0">${line.slice(2)}</li>`)
    } else if (raw.trim() === '') {
      if (inList) { out.push('</ul>'); inList = false }
      out.push('<br/>')
    } else {
      if (inList) { out.push('</ul>'); inList = false }
      out.push(`<p style="margin:.6em 0">${line}</p>`)
    }
  }

  if (inList) out.push('</ul>')
  return out.join('\n')
}

const emptyForm = {
  title: '',
  slug: '',
  category: 'article',
  excerpt: '',
  content: '',
  cover_image: '',
  banner_image_url: '',
  published: false,
  read_time: 5,
}

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

export function BlogManager({ initialPosts }: { initialPosts: BlogPost[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [uploadingImage, setUploadingImage] = useState<'card' | 'banner' | null>(null)
  const [view, setView] = useState<'edit' | 'preview'>('edit')

  async function handleImageUpload(file: File, field: 'cover_image' | 'banner_image_url') {
    setUploadingImage(field === 'cover_image' ? 'card' : 'banner')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('bucket', 'blog-images')
    try {
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) {
        setForm((prev) => ({ ...prev, [field]: data.url }))
      } else {
        alert('Error al subir imagen: ' + (data.error ?? 'desconocido'))
      }
    } catch {
      alert('Error de conexión al subir imagen')
    } finally {
      setUploadingImage(null)
    }
  }

  function openCreateForm() {
    setEditingPost(null)
    setForm({ ...emptyForm })
    setView('edit')
    setShowForm(true)
  }

  function openEditForm(post: BlogPost) {
    setEditingPost(post)
    setForm({
      title: post.title,
      slug: post.slug ?? '',
      category: post.category ?? 'article',
      excerpt: post.excerpt ?? '',
      content: post.content ?? '',
      cover_image: post.cover_image ?? '',
      banner_image_url: post.banner_image_url ?? '',
      published: post.published,
      read_time: post.read_time ?? 5,
    })
    setView('edit')
    setShowForm(true)
  }

  function handleTitleChange(value: string) {
    setForm((f) => ({
      ...f,
      title: value,
      slug: editingPost ? f.slug : slugify(value),
    }))
  }

  function handleSave() {
    if (!form.title.trim()) return
    startTransition(async () => {
      const payload = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        category: form.category,
        excerpt: form.excerpt,
        content: form.content,
        cover_image: form.cover_image,
        banner_image_url: form.banner_image_url,
        published: form.published,
        read_time: form.read_time,
      }
      if (editingPost) {
        await updateBlogPost(editingPost.id, payload)
      } else {
        await createBlogPost(payload)
      }
      setShowForm(false)
      router.refresh()
    })
  }

  function handleTogglePublished(post: BlogPost) {
    startTransition(async () => {
      await toggleBlogPublished(post.id, !post.published)
      router.refresh()
    })
  }

  function handleDelete(post: BlogPost) {
    if (!window.confirm(`¿Eliminar el post "${post.title}"?`)) return
    startTransition(async () => {
      await deleteBlogPost(post.id)
      router.refresh()
    })
  }

  const uploadBtnStyle = (loading: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    border: '1.5px dashed #d1d5db',
    borderRadius: 8,
    fontSize: 13,
    color: loading ? '#9ca3af' : '#4b5563',
    cursor: loading ? 'not-allowed' : 'pointer',
    background: '#f9fafb',
    transition: 'border-color .15s',
  })

  const removeBtn: React.CSSProperties = {
    position: 'absolute',
    top: 4,
    right: 4,
    background: 'rgba(0,0,0,.55)',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: 24,
    height: 24,
    fontSize: 16,
    lineHeight: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 bg-[#0a1628] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#1a2638] transition-colors"
        >
          <Plus size={16} /> Nuevo post
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {initialPosts.length === 0 ? (
          <div className="text-center py-10 text-gray-400">No hay posts aún</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Título</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Categoría</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Fecha</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Estado</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {initialPosts.map((post) => (
                <tr key={post.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 max-w-[250px]">
                    <p className="font-medium text-gray-800 truncate">{post.title}</p>
                    {post.slug && <p className="text-xs text-gray-400">{post.slug}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                      {categoryLabel(post.category)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(post.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleTogglePublished(post)}
                      disabled={isPending}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors disabled:opacity-50 ${
                        post.published
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {post.published ? 'Publicado' : 'Borrador'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditForm(post)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="Editar"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(post)}
                        disabled={isPending}
                        className="text-red-400 hover:text-red-600 p-1 disabled:opacity-50"
                        title="Eliminar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">
                {editingPost ? 'Editar post' : 'Nuevo post'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* Título */}
              <div>
                <label className={labelCls}>Título <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className={inputCls}
                />
              </div>

              {/* Slug */}
              <div>
                <label className={labelCls}>Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className={inputCls + ' font-mono'}
                />
              </div>

              {/* Categoría + Tiempo lectura */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Categoría</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className={inputCls}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Tiempo de lectura (min)</label>
                  <input
                    type="number"
                    value={form.read_time}
                    onChange={(e) => setForm((f) => ({ ...f, read_time: parseInt(e.target.value) || 5 }))}
                    className={inputCls}
                    min={1}
                  />
                </div>
              </div>

              {/* Extracto */}
              <div>
                <label className={labelCls}>Extracto</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  rows={2}
                  className={inputCls + ' resize-none'}
                />
              </div>

              {/* Editor / Preview tabs */}
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <button
                    type="button"
                    onClick={() => setView('edit')}
                    style={{
                      padding: '5px 14px',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 500,
                      border: '1px solid',
                      borderColor: view === 'edit' ? '#0a1628' : '#d1d5db',
                      background: view === 'edit' ? '#0a1628' : '#fff',
                      color: view === 'edit' ? '#fff' : '#4b5563',
                      cursor: 'pointer',
                    }}
                  >
                    ✍️ Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('preview')}
                    style={{
                      padding: '5px 14px',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 500,
                      border: '1px solid',
                      borderColor: view === 'preview' ? '#0a1628' : '#d1d5db',
                      background: view === 'preview' ? '#0a1628' : '#fff',
                      color: view === 'preview' ? '#fff' : '#4b5563',
                      cursor: 'pointer',
                    }}
                  >
                    👁️ Preview
                  </button>
                </div>

                <label className={labelCls}>
                  Contenido
                  <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 6, fontSize: 11 }}>
                    Markdown: **negrita**, *cursiva*, ## Título, [link](url), - lista
                  </span>
                </label>

                {view === 'edit' ? (
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                    rows={16}
                    className={inputCls + ' font-mono resize-y'}
                    placeholder={'Escribe el contenido del post...\n\n## Subtítulo\n\nPárrafo con **negrita** y *cursiva*.\n\n- Elemento de lista\n- Otro elemento'}
                  />
                ) : (
                  <div
                    style={{
                      minHeight: 320,
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      padding: '12px 16px',
                      fontSize: 14,
                      lineHeight: 1.7,
                      color: '#374151',
                      background: '#fafafa',
                      overflowY: 'auto',
                    }}
                    dangerouslySetInnerHTML={{ __html: convertMarkdown(form.content) || '<span style="color:#9ca3af;font-style:italic">Sin contenido todavía...</span>' }}
                  />
                )}
              </div>

              {/* Imagen de tarjeta */}
              <div>
                <label className={labelCls}>
                  Imagen principal (tarjeta)
                  <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 6, fontSize: 11 }}>
                    Aparece en el listado · Recomendado: 800×500px
                  </span>
                </label>
                {form.cover_image ? (
                  <div style={{ position: 'relative', width: 'fit-content' }}>
                    <img
                      src={form.cover_image}
                      alt="Preview tarjeta"
                      style={{ width: 240, height: 150, objectFit: 'cover', borderRadius: 6, display: 'block' }}
                    />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, cover_image: '' }))}
                      style={removeBtn}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label style={uploadBtnStyle(uploadingImage === 'card')}>
                    {uploadingImage === 'card' ? '⌛ Subiendo...' : '📷 Subir imagen desde ordenador'}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      disabled={!!uploadingImage}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, 'cover_image')
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Imagen banner */}
              <div>
                <label className={labelCls}>
                  Imagen banner del post
                  <span style={{ fontWeight: 400, color: '#9ca3af', marginLeft: 6, fontSize: 11 }}>
                    Cabecera del post · Recomendado: 1920×800px
                  </span>
                </label>
                {form.banner_image_url ? (
                  <div style={{ position: 'relative', width: '100%' }}>
                    <img
                      src={form.banner_image_url}
                      alt="Preview banner"
                      style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 6, display: 'block' }}
                    />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, banner_image_url: '' }))}
                      style={removeBtn}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label style={uploadBtnStyle(uploadingImage === 'banner')}>
                    {uploadingImage === 'banner' ? '⌛ Subiendo...' : '🖼️ Subir banner desde ordenador'}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      disabled={!!uploadingImage}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, 'banner_image_url')
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Publicar */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={form.published}
                  onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                  className="w-4 h-4"
                />
                <label htmlFor="published" className="text-sm font-medium text-gray-700">
                  Publicar inmediatamente
                </label>
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
                disabled={isPending || !form.title.trim() || !!uploadingImage}
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
