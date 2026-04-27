import { createClient } from '@/lib/supabase/server'

export async function getUserRole(): Promise<'admin' | 'agent' | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  return (data?.role as 'admin' | 'agent') ?? null
}

export async function requireAdmin() {
  const role = await getUserRole()
  if (role !== 'admin') {
    throw new Error('Acceso denegado: requiere admin')
  }
}

export async function requireAgent() {
  const role = await getUserRole()
  if (role !== 'agent' && role !== 'admin') {
    throw new Error('Acceso denegado: requiere agente o admin')
  }
}
