import { redirect } from 'next/navigation'
import { getUserRole } from '@/lib/auth/getUserRole'
import AdminSidebar from '@/components/admin/AdminSidebar'

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

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
