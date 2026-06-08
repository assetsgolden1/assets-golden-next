'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Building2,
  Star,
  Newspaper,
  Inbox,
  RefreshCw,
  UserCircle,
  Settings,
  PlusCircle,
  UserCheck,
  ClipboardList,
  MapPin,
} from 'lucide-react'

const navLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/propiedades', label: 'Propiedades', icon: Building2 },
  { href: '/admin/nueva-propiedad', label: 'Nueva propiedad', icon: PlusCircle },
  { href: '/admin/destacadas', label: 'Destacadas', icon: Star },
  { href: '/admin/blog', label: 'Blog', icon: Newspaper },
  { href: '/admin/leads', label: 'Leads', icon: Inbox, showUrgentBadge: true },
  { href: '/admin/agentes', label: 'Agentes', icon: UserCheck },
  { href: '/admin/destinos', label: 'Destinos', icon: MapPin },
  { href: '/admin/sync', label: 'Sincronización', icon: RefreshCw },
  { href: '/admin/equipo', label: 'Equipo', icon: UserCircle },
  { href: '/admin/audit', label: 'Auditoría', icon: ClipboardList },
  { href: '/admin/settings', label: 'Ajustes', icon: Settings },
]

export default function AdminSidebar({ urgentLeadsCount = 0 }: { urgentLeadsCount?: number }) {
  const pathname = usePathname()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? '')
    })
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-64 bg-[#0a1628] flex flex-col h-full flex-shrink-0">
      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <a href="/" target="_blank" rel="noreferrer">
          <img src="/logo.png" alt="Assets Golden" className="h-12 w-auto" />
        </a>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navLinks.map((link) => {
            const active = isActive(link.href, link.exact)
            const Icon = link.icon
            const showBadge = link.showUrgentBadge && urgentLeadsCount > 0
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-yellow-500/20 text-yellow-400 border-l-2 border-yellow-400 pl-[10px]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} />
                  <span className="flex-1">{link.label}</span>
                  {showBadge && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold animate-pulse">
                      {urgentLeadsCount > 9 ? '9+' : urgentLeadsCount}
                    </span>
                  )}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <p className="text-xs text-gray-500 truncate" title={userEmail}>
          {userEmail}
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleSignOut}
            className="flex-1 text-xs text-gray-400 hover:text-red-400 bg-white/5 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors"
          >
            Cerrar sesión
          </button>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex-1 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors text-center"
          >
            Ver web →
          </a>
        </div>
      </div>
    </aside>
  )
}
