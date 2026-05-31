import { redirect } from 'next/navigation'
import { getUserRole } from '@/lib/auth/getUserRole'
import { supabaseAdmin } from '@/lib/supabase/admin'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { Toaster } from 'sonner'

const URGENT_MS = 24 * 60 * 60 * 1000

async function getUrgentLeadsCount(): Promise<number> {
  const { data } = await supabaseAdmin
    .from('leads')
    .select('id, created_at')
    .eq('status', 'new')
    .neq('source', 'migration_test')
  if (!data) return 0
  const now = Date.now()
  return data.filter((l) => now - new Date(l.created_at).getTime() > URGENT_MS).length
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const role = await getUserRole()

  if (role !== 'admin') {
    if (role === 'agent') {
      redirect('/portal')
    }
    redirect('/admin/login')
  }

  const urgentCount = await getUrgentLeadsCount()

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <AdminSidebar urgentLeadsCount={urgentCount} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <Toaster position="bottom-right" richColors />
    </div>
  )
}
