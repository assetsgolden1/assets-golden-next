import { supabaseAdmin } from '@/lib/supabase/admin'
import type { ParsedMetaLead } from './leadParser'

// Dedupe multi-form: unión de meta_lead_ids ya cargados de TODOS los forms.
// meta_lead_id es único global, así que la unión es correcta sin riesgo de colisión.
export async function getSyncedLeadIds(formIds: string[]): Promise<Set<string>> {
  const { data, error } = await supabaseAdmin
    .from('meta_leads_synced')
    .select('meta_lead_id')
    .in('form_id', formIds)

  if (error) {
    console.error('[syncTracker] Error leyendo meta_lead_ids:', error.message)
    return new Set()
  }

  return new Set(data?.map(r => r.meta_lead_id) ?? [])
}

// Dedupe multi-form: unión de emails ya cargados de TODOS los forms.
export async function getSyncedEmails(formIds: string[]): Promise<Set<string>> {
  const { data, error } = await supabaseAdmin
    .from('meta_leads_synced')
    .select('email')
    .in('form_id', formIds)
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

// Persiste el lead parseado en meta_leads (base de la secuencia de nurture).
// Idempotente vía onConflict: 'meta_lead_id'. ADICIONAL al Sheet + meta_leads_synced.
// No calcula el segmento A/B: eso se deriva en el cron de la secuencia.
export async function upsertMetaLead(lead: ParsedMetaLead): Promise<void> {
  const { error } = await supabaseAdmin.from('meta_leads').upsert(
    {
      meta_lead_id: lead.meta_lead_id,
      email: lead.email || null,
      nombre: lead.nombre || null,
      telefono: lead.telefono || null,
      tipo_propiedad: lead.tipo_propiedad || null,
      presupuesto_raw: lead.presupuesto_raw || null,
      presupuesto: lead.presupuesto || null,
      timeline: lead.timeline || null,
      purpose: lead.purpose || null,
      variante: lead.variante || null,
      created_time: lead.created_time || null,
    },
    { onConflict: 'meta_lead_id' },
  )

  if (error) {
    console.error('[syncTracker] Error guardando meta_lead:', error.message)
  }
}
