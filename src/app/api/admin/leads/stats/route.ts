import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/getUserRole'

const URGENT_MS = 24 * 60 * 60 * 1000
const KNOWN_SOURCES = ['property_contact', 'demand_form', 'contacto']

export async function GET() {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: leads, error } = await supabaseAdmin
    .from('leads')
    .select('id, status, source, created_at')
    .neq('source', 'migration_test')

  if (error || !leads) {
    return NextResponse.json({ error: error?.message ?? 'Error' }, { status: 500 })
  }

  const now = Date.now()
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const total = leads.length
  const newCount = leads.filter((l) => l.status === 'new').length
  const urgent = leads.filter((l) => {
    if (l.status !== 'new') return false
    return now - new Date(l.created_at).getTime() > URGENT_MS
  }).length
  const contactedToday = leads.filter((l) => {
    if (l.status !== 'contacted') return false
    return new Date(l.created_at) >= startOfToday
  }).length

  return NextResponse.json({
    total,
    new: newCount,
    urgent,
    contacted_today: contactedToday,
    by_source: {
      property_contact: leads.filter((l) => l.source === 'property_contact').length,
      demand_form: leads.filter((l) => l.source === 'demand_form').length,
      contacto: leads.filter((l) => l.source === 'contacto').length,
      otros: leads.filter((l) => !KNOWN_SOURCES.includes(l.source ?? '')).length,
    },
  })
}
