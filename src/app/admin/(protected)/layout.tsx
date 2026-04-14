import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // DEBUG TEMPORAL: auth check desactivado para aislar el problema.
  // Si el dashboard se ve → el problema está en getUser() / user_roles.
  // Restaurar auth check una vez confirmado.
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <AdminSidebar userEmail="debug@test.com" />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
