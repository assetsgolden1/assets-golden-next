import { supabaseAdmin } from '@/lib/supabase/admin'

export async function createSyncRun(formId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('meta_sync_runs')
    .insert({ form_id: formId, status: 'running' })
    .select('id')
    .single()

  if (error) {
    console.error('[syncLog] No se pudo crear sync run:', error.message)
    return null
  }

  return data.id
}

export async function updateSyncRun(
  id: string,
  update: {
    status: 'ok' | 'error'
    leads_fetched?: number
    leads_duplicated?: number
    leads_added?: number
    error_message?: string
    details?: Record<string, unknown>
  },
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('meta_sync_runs')
    .update({ ...update, finished_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('[syncLog] Error actualizando sync run:', error.message)
  }
}
