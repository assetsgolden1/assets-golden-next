import { supabaseAdmin } from '@/lib/supabase/admin'
import { TeamManager } from '@/components/admin/TeamManager'

interface TeamMember {
  id: string
  name: string
  role_es: string | null
  bio_es: string | null
  photo_url: string | null
  linkedin_url: string | null
  country: string | null
  member_type: 'founder' | 'partner' | 'team'
  order_index: number
  active: boolean
}

export default async function EquipoPage() {
  const { data } = await supabaseAdmin
    .from('team_members')
    .select('*')
    .order('order_index', { ascending: true })

  const members = (data as TeamMember[]) ?? []

  return <TeamManager initialMembers={members} />
}
