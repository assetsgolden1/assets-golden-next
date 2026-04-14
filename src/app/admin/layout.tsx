import AdminSidebar from '@/components/admin/AdminSidebar'

// DEBUG TEMPORAL: auth check desactivado para aislar el problema.
// La ruta /admin/login tiene su propio layout en login/layout.tsx
// que sobreescribe este sidebar.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <AdminSidebar userEmail="debug@test.com" />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
