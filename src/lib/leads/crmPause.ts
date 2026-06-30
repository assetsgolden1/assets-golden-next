import { supabaseAdmin } from '@/lib/supabase/admin'
import { readCrmStatuses } from '@/lib/googleSheets'

// Conecta el Estado del CRM (Google Sheet, pestaña 'CRM') con la pausa de la
// secuencia de nurture. Lee el CRM y pausa (seq_paused=true) a los leads cuyo
// Estado sea avanzado o terminal, ANTES de cada envío diario.
//
// REGLAS DURAS:
// - SOLO pausa (seq_paused=true). NUNCA reactiva (nunca setea false).
// - Solo LEE el Sheet, nunca lo escribe. Solo toca meta_leads.seq_paused.
// - Match por email normalizado (lower + trim).
// - Idempotente: solo actualiza los que hoy están en false.
// - Si no se puede leer el CRM (o falla la DB) → ok:false/aborted:true para que
//   el caller ABORTE el envío (no mandar a ciegas a un Ganado/Descartado).

// Estados del CRM que PAUSAN, ya normalizados (trim + lowercase + sin acentos).
const PAUSE_STATES = new Set([
  'en conversacion',
  'propuesta enviada',
  'propuesta',
  'visita',
  'negociacion',
  'ganado',
  'perdido',
  'descartado',
])

function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

function normalizeEstado(s: string): string {
  return stripAccents(s.trim().toLowerCase())
}

function normalizeEmail(s: string): string {
  return s.trim().toLowerCase()
}

export interface CrmPauseResult {
  ok: boolean
  aborted: boolean
  error?: string
  crmRowsRead: number
  pauseCandidates: number // emails únicos en el CRM cuyo Estado pausa
  newlyPaused: number
  pausedEmails: string[]
}

const ZERO = { crmRowsRead: 0, pauseCandidates: 0, newlyPaused: 0, pausedEmails: [] as string[] }

export async function pauseLeadsFromCrm(): Promise<CrmPauseResult> {
  const spreadsheetId =
    process.env.META_LEADS_SHEET_ID ?? '1Q_PRvDe45XxRoB43JZGWVJyJli8Cqf0G2Ry8vJcvZcA'

  // ── 1. Leer el CRM (si falla → abortar la corrida) ─────────────────────
  let crmRows
  try {
    crmRows = await readCrmStatuses(spreadsheetId)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[crmPause] No se pudo leer el CRM, se ABORTA el envío:', msg)
    return { ok: false, aborted: true, error: `No se pudo leer el CRM: ${msg}`, ...ZERO }
  }

  // ── 2. Set de emails a pausar según Estado del CRM ─────────────────────
  const emailsToPause = new Set<string>()
  for (const row of crmRows) {
    const email = normalizeEmail(row.email)
    if (!email) continue
    if (PAUSE_STATES.has(normalizeEstado(row.estado))) {
      emailsToPause.add(email)
    }
  }

  if (emailsToPause.size === 0) {
    return {
      ok: true,
      aborted: false,
      crmRowsRead: crmRows.length,
      pauseCandidates: 0,
      newlyPaused: 0,
      pausedEmails: [],
    }
  }

  // ── 3. Leads activos en meta_leads (solo los que hoy NO están pausados) ─
  const { data, error } = await supabaseAdmin
    .from('meta_leads')
    .select('id, email')
    .eq('seq_paused', false)

  if (error) {
    console.error('[crmPause] Error leyendo meta_leads, se ABORTA el envío:', error.message)
    return {
      ok: false,
      aborted: true,
      error: `Error leyendo meta_leads: ${error.message}`,
      crmRowsRead: crmRows.length,
      pauseCandidates: emailsToPause.size,
      newlyPaused: 0,
      pausedEmails: [],
    }
  }

  // ── 4. Match por email normalizado → ids a pausar ──────────────────────
  const idsToPause: string[] = []
  const pausedEmails: string[] = []
  for (const lead of data ?? []) {
    if (!lead.email) continue
    if (emailsToPause.has(normalizeEmail(lead.email))) {
      idsToPause.push(lead.id)
      pausedEmails.push(lead.email)
    }
  }

  if (idsToPause.length === 0) {
    return {
      ok: true,
      aborted: false,
      crmRowsRead: crmRows.length,
      pauseCandidates: emailsToPause.size,
      newlyPaused: 0,
      pausedEmails: [],
    }
  }

  // ── 5. UPDATE seq_paused=true (NUNCA false), solo sobre esos id ─────────
  const { error: updateError } = await supabaseAdmin
    .from('meta_leads')
    .update({ seq_paused: true })
    .in('id', idsToPause)

  if (updateError) {
    console.error('[crmPause] Error actualizando seq_paused, se ABORTA el envío:', updateError.message)
    return {
      ok: false,
      aborted: true,
      error: `Error actualizando seq_paused: ${updateError.message}`,
      crmRowsRead: crmRows.length,
      pauseCandidates: emailsToPause.size,
      newlyPaused: 0,
      pausedEmails: [],
    }
  }

  console.log(`[crmPause] Pausados ${idsToPause.length} lead(s) por estado del CRM:`, pausedEmails.join(', '))

  return {
    ok: true,
    aborted: false,
    crmRowsRead: crmRows.length,
    pauseCandidates: emailsToPause.size,
    newlyPaused: idsToPause.length,
    pausedEmails,
  }
}
