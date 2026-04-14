import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (!user || authError) {
    redirect('/admin/login')
  }

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .maybeSingle()

  if (!roleData) {
    redirect('/')
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <AdminSidebar userEmail={user.email ?? ''} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
