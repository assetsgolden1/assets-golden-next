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
  image_url?: string | null
  cover_image?: string | null
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
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function categoryLabel(cat: string | null) {
  return CATEGORIES.find((c) => c.value === cat)?.label ?? cat ?? '—'
}

const emptyForm = {
  title: '',
  slug: '',
  category: 'article',
  excerpt: '',
  content: '',
  image_url: '',
  published: false,
  read_time: 5,
}

export function BlogManager({ initialPosts }: { initialPosts: BlogPost[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [form, setForm] = useState({ ...emptyForm })

  function openCreateForm() {
    setEditingPost(null)
    setForm({ ...emptyForm })
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
      image_url: post.cover_image ?? post.image_url ?? '',
      published: post.published,
      read_time: post.read_time ?? 5,
    })
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
        image_url: form.image_url,
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">
                {editingPost ? 'Editar post' : 'Nuevo post'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiempo de lectura (min)
                  </label>
                  <input
                    type="number"
                    value={form.read_time}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, read_time: parseInt(e.target.value) || 5 }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={1}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Extracto</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contenido (Markdown)
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  rows={10}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de imagen de portada
                </label>
                <input
                  type="text"
                  value={form.image_url}
                  onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>

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
                disabled={isPending || !form.title.trim()}
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
