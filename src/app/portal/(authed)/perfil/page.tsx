import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/portal/ProfileForm'
import { ChangePasswordForm } from '@/components/portal/ChangePasswordForm'
import type { Agent } from '@/types/agent'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/portal/login')

  const { data: agent } = await supabase
    .from('agents')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  const initialData: Agent = agent ?? {
    id: user.id,
    full_name: user.user_metadata?.full_name ?? '',
    email: user.email ?? '',
    phone: null,
    agency_name: null,
    logo_url: null,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl text-primary mb-2">
          Mi perfil
        </h1>
        <p className="text-muted-foreground">
          Gestiona tu información como agente
        </p>
      </div>
      <ProfileForm initialData={initialData} userId={user.id} />

      <div className="border-t border-border pt-6 mt-8">
        <h2 className="font-display text-xl text-primary mb-4">Cambiar contraseña</h2>
        <ChangePasswordForm />
      </div>
    </div>
  )
}
