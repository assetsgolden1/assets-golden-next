import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserRole } from '@/lib/auth/getUserRole'
import { PortalHeader } from '@/components/portal/PortalHeader'

export default async function PortalAuthedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/portal/login')
  }

  const role = await getUserRole()
  if (role !== 'agent' && role !== 'admin') {
    redirect('/portal/login?error=unauthorized')
  }

  return (
    <div className="min-h-screen bg-background">
      <PortalHeader />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
