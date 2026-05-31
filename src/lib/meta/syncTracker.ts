import { supabaseAdmin } from '@/lib/supabase/admin'

// First run fallback: pull leads from the last 30 days
const FIRST_RUN_LOOKBACK_DAYS = 30

export async function getLastSyncedTimestamp(formId: string): Promise<number> {
  const { data } = await supabaseAdmin
    .from('meta_sync_log')
    .select('last_synced_at')
    .eq('form_id', formId)
    .eq('status', 'ok')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data?.last_synced_at) {
    const fallbackMs = Date.now() - FIRST_RUN_LOOKBACK_DAYS * 24 * 60 * 60 * 1000
    return Math.floor(fallbackMs / 1000)
  }

  return Math.floor(new Date(data.last_synced_at).getTime() / 1000)
}

export async function recordSync(
  formId: string,
  leadsCount: number,
  status: 'ok' | 'error',
  details?: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabaseAdmin.from('meta_sync_log').insert({
    form_id: formId,
    last_synced_at: new Date().toISOString(),
    leads_count: leadsCount,
    status,
    details: details ?? null,
  })

  if (error) {
    console.error('[syncTracker] Error al insertar en meta_sync_log:', error.message)
  }
}
