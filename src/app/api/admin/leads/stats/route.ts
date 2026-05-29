import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/getUserRole'

const URGENT_MS = 24 * 60 * 60 * 1000
const KNOWN_SOURCES = ['property_contact', 'demand_form', 'contacto']

// Returns [start, end) UTC bounds for "today" in Europe/Madrid timezone.
// Server runs in UTC (Vercel); Madrid is UTC+1 (CET) or UTC+2 (CEST).
function getMadridTodayBounds(): { start: Date; end: Date } {
  const now = new Date()
  // sv-SE locale produces "YYYY-MM-DD" — the date as seen in Madrid right now
  const madridDateStr = now.toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
  const [y, m, d] = madridDateStr.split('-').map(Number)
  // Midnight UTC of that calendar date
  const midnightUTC = new Date(Date.UTC(y, m - 1, d))
  // What hour does Madrid show at midnight UTC? That equals the UTC offset (+1 or +2).
  const offset = parseInt(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Madrid',
      hour: '2-digit',
      hour12: false,
      hourCycle: 'h23',
    }).format(midnightUTC),
  )
  const start = new Date(midnightUTC.getTime() - offset * 3_600_000)
  const end = new Date(start.getTime() + 86_400_000)
  return { start, end }
}

export async function GET() {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: leads, error } = await supabaseAdmin
    .from('leads')
    .select('id, status, source, created_at, status_changed_at')
    .neq('source', 'migration_test')

  if (error || !leads) {
    return NextResponse.json({ error: error?.message ?? 'Error' }, { status: 500 })
  }

  const now = Date.now()
  const { start: todayStart, end: todayEnd } = getMadridTodayBounds()

  const total = leads.length
  const newCount = leads.filter((l) => l.status === 'new').length
  const urgent = leads.filter((l) => {
    if (l.status !== 'new') return false
    return now - new Date(l.created_at).getTime() > URGENT_MS
  }).length
  const contactedToday = leads.filter((l) => {
    if (l.status !== 'contacted') return false
    const changedAt = new Date(l.status_changed_at ?? l.created_at)
    return changedAt >= todayStart && changedAt < todayEnd
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
