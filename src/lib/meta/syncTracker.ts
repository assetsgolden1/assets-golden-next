import { supabaseAdmin } from '@/lib/supabase/admin'

export async function getSyncedLeadIds(formId: string): Promise<Set<string>> {
  const { data, error } = await supabaseAdmin
    .from('meta_leads_synced')
    .select('meta_lead_id')
    .eq('form_id', formId)

  if (error) {
    console.error('[syncTracker] Error leyendo meta_lead_ids:', error.message)
    return new Set()
  }

  return new Set(data?.map(r => r.meta_lead_id) ?? [])
}

export async function getSyncedEmails(formId: string): Promise<Set<string>> {
  const { data, error } = await supabaseAdmin
    .from('meta_leads_synced')
    .select('email')
    .eq('form_id', formId)
    .not('email', 'is', null)

  if (error) {
    console.error('[syncTracker] Error leyendo emails:', error.message)
    return new Set()
  }

  return new Set(data?.map(r => r.email?.toLowerCase()).filter(Boolean) ?? [])
}

export async function recordSyncedLeads(
  leads: Array<{ meta_lead_id: string; email: string; created_time: string; form_id: string }>,
): Promise<void> {
  if (leads.length === 0) return

  const rows = leads.map(l => ({
    meta_lead_id: l.meta_lead_id,
    form_id: l.form_id,
    email: l.email || null,
    created_time: l.created_time,
  }))

  const { error } = await supabaseAdmin
    .from('meta_leads_synced')
    .upsert(rows, { onConflict: 'meta_lead_id' })

  if (error) {
    console.error('[syncTracker] Error guardando leads sincronizados:', error.message)
  }
}
