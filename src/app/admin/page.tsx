'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Building2, Star, Users, Newspaper } from 'lucide-react'

interface StatCard {
  label: string
  value: number
  icon: React.ElementType
  color: string
  bg: string
}

interface RecentLead {
  id: string
  name: string
  email: string
  source: string | null
  created_at: string
  status: string | null
}

interface RecentProperty {
  id: string
  title: string
  location: string | null
  price: number | null
  currency: string | null
  status: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ active: 0, featured: 0, leads: 0, posts: 0 })
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([])
  const [recentProperties, setRecentProperties] = useState<RecentProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      const supabase = createClient()
      const hace7Dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const [
        { count: active },
        { count: featured },
        { count: leadsCount },
        { count: posts },
        { data: leads },
        { data: properties },
      ] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }).in('status', ['active', 'available']),
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('featured', true),
        supabase.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', hace7Dias),
        supabase.from('blog_posts').select('id', { count: 'exact', head: true }).eq('published', true),
        supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('properties').select('id,title,location,price,currency,status').order('created_at', { ascending: false }).limit(5),
      ])

      setStats({
        active: active ?? 0,
        featured: featured ?? 0,
        leads: leadsCount ?? 0,
        posts: posts ?? 0,
      })
      setRecentLeads((leads as RecentLead[]) ?? [])
      setRecentProperties((properties as RecentProperty[]) ?? [])
    } catch (err) {
      setError('Error cargando el dashboard')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const statCards: StatCard[] = [
    { label: 'Propiedades activas', value: stats.active, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Propiedades destacadas', value: stats.featured, icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Leads esta semana', value: stats.leads, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Posts publicados', value: stats.posts, icon: Newspaper, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  const now = new Date()
  const dateStr = now.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1 capitalize">{dateStr}</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {statCards.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.label} className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                  <div className={`${card.bg} ${card.color} p-3 rounded-lg`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-sm text-gray-500">{card.label}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Leads */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">Últimos leads</h2>
                <a href="/admin/leads" className="text-sm text-blue-600 hover:text-blue-800">Ver todos →</a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2 text-gray-600 font-medium">Nombre</th>
                      <th className="text-left px-4 py-2 text-gray-600 font-medium">Email</th>
                      <th className="text-left px-4 py-2 text-gray-600 font-medium">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLeads.length === 0 ? (
                      <tr><td colSpan={3} className="text-center py-4 text-gray-400">Sin leads</td></tr>
                    ) : recentLeads.map((lead) => (
                      <tr key={lead.id} className="border-t border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-gray-800">{lead.name}</td>
                        <td className="px-4 py-2 text-gray-500 truncate max-w-[150px]">{lead.email}</td>
                        <td className="px-4 py-2 text-gray-400 text-xs">
                          {new Date(lead.created_at).toLocaleDateString('es-ES')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Properties */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">Últimas propiedades</h2>
                <a href="/admin/propiedades" className="text-sm text-blue-600 hover:text-blue-800">Ver todas →</a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2 text-gray-600 font-medium">Título</th>
                      <th className="text-left px-4 py-2 text-gray-600 font-medium">Ubicación</th>
                      <th className="text-left px-4 py-2 text-gray-600 font-medium">Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProperties.length === 0 ? (
                      <tr><td colSpan={3} className="text-center py-4 text-gray-400">Sin propiedades</td></tr>
                    ) : recentProperties.map((prop) => (
                      <tr key={prop.id} className="border-t border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-gray-800 truncate max-w-[150px]">{prop.title}</td>
                        <td className="px-4 py-2 text-gray-500">{prop.location ?? '—'}</td>
                        <td className="px-4 py-2 text-gray-600 text-xs">
                          {prop.price ? `${prop.currency ?? 'EUR'} ${prop.price.toLocaleString('es-ES')}` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
