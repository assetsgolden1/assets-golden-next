export interface Agent {
  id: string
  full_name: string
  email: string
  phone: string | null
  agency_name: string | null
  logo_url: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface UserRole {
  user_id: string
  role: 'admin' | 'agent'
}
