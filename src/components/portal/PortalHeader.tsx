'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, User, Home, ExternalLink } from 'lucide-react'
import { EXPERTOS_GESTION } from '@/lib/constants/externalPortals'

export function PortalHeader() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/portal/login')
    router.refresh()
  }

  return (
    <header className="bg-primary border-b border-gold/20">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/portal" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Assets Golden" width={100} height={40} />
          <span className="text-white text-sm border-l border-gold/30 pl-3 hidden sm:block">
            Portal de Agentes
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/portal"
            className="px-3 py-2 text-white hover:text-gold transition-colors flex items-center gap-2 text-sm"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Propiedades</span>
          </Link>
          <Link
            href="/portal/perfil"
            className="px-3 py-2 text-white hover:text-gold transition-colors flex items-center gap-2 text-sm"
          >
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Mi perfil</span>
          </Link>
          <a
            href={EXPERTOS_GESTION.url}
            target="_blank"
            rel="noopener noreferrer"
            title={EXPERTOS_GESTION.name + ' (Nº de experto ' + EXPERTOS_GESTION.expertNumber + ')'}
            className="px-3 py-2 text-white hover:text-gold transition-colors flex items-center gap-2 text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">CRM</span>
          </a>
          <button
            onClick={handleLogout}
            className="px-3 py-2 text-white/80 hover:text-red-400 transition-colors flex items-center gap-2 text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </nav>
      </div>
    </header>
  )
}
