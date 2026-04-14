import AdminSidebar from '@/components/admin/AdminSidebar'

// Auth protegida por middleware (src/middleware.ts)
// El middleware redirige a /admin/login si no hay sesión activa
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
