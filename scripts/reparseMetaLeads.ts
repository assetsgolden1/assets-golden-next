/**
 * Backfill one-off: re-parsea leads ya sincronizados con el parser corregido
 * (soporte de ambos forms + tokens de valor actuales de Meta).
 *
 * Qué hace:
 *  - Re-trae field_data de Meta para cada lead de meta_leads_synced.
 *  - Re-parsea con parseMetaLead (fuente única de verdad).
 *  - UPDATE meta_leads (tipo/presupuesto/timeline/purpose/etc).
 *  - Sheet pestaña LEADS: RELLENA SOLO celdas VACÍAS (E=tipo, F=presupuesto,
 *    G=timeline, H=purpose). Nunca sobrescribe una celda con dato (append-only).
 *
 * Uso:  npx tsx --env-file=.env.local scripts/reparseMetaLeads.ts          (dry-run)
 *       npx tsx --env-file=.env.local scripts/reparseMetaLeads.ts --apply  (aplica)
 */
import { google } from 'googleapis'
import { supabaseAdmin } from '../src/lib/supabase/admin'
import { parseMetaLead } from '../src/lib/meta/leadParser'
import type { MetaLeadRaw } from '../src/lib/meta/leadsApi'

const APPLY = process.argv.includes('--apply')
const META_BASE = 'https://graph.facebook.com/v19.0'
const LEAD_FIELDS =
  'id,created_time,ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,field_data,platform'

async function fetchRaw(id: string, token: string): Promise<MetaLeadRaw | null> {
  const res = await fetch(`${META_BASE}/${id}?fields=${LEAD_FIELDS}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    console.warn(`   ⚠ Meta ${res.status} para lead ${id} (¿venció la retención de 90 días?)`)
    return null
  }
  return (await res.json()) as MetaLeadRaw
}

async function main() {
  const token = process.env.META_LEADS_SYNC_TOKEN
  const spreadsheetId = process.env.META_LEADS_SHEET_ID
  if (!token || !spreadsheetId) { console.error('Faltan META_LEADS_SYNC_TOKEN o META_LEADS_SHEET_ID'); process.exit(1) }

  console.log(APPLY ? '=== MODO APPLY ===' : '=== DRY-RUN (usá --apply para aplicar) ===')

  const { data: synced, error } = await supabaseAdmin
    .from('meta_leads_synced')
    .select('meta_lead_id, email')
    .order('created_time', { ascending: false })
  if (error) { console.error('Error leyendo meta_leads_synced:', error.message); process.exit(1) }

  // Sheet: leer LEADS!A:L una vez para localizar filas por email.
  const sheets = google.sheets({
    version: 'v4',
    auth: new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS_JSON!),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    }),
  })
  const sheetRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: "'LEADS'!A:L" })
  const rows = sheetRes.data.values ?? []
  const emailToRow = new Map<string, number>() // email norm → índice de fila (1-based en el Sheet)
  rows.forEach((r, i) => {
    const em = (r[2] as string | undefined)?.toLowerCase().trim()
    if (em && i > 0) emailToRow.set(em, i + 1)
  })

  let dbUpdated = 0, sheetFilled = 0, skipped = 0
  const sheetUpdates: { range: string; values: string[][] }[] = []

  for (const s of synced ?? []) {
    const raw = await fetchRaw(s.meta_lead_id, token)
    if (!raw) { skipped++; continue }
    const p = parseMetaLead(raw)

    // ── meta_leads (idempotente por meta_lead_id) ──
    const dbRow = {
      email: p.email || null, nombre: p.nombre || null, telefono: p.telefono || null,
      tipo_propiedad: p.tipo_propiedad || null, presupuesto_raw: p.presupuesto_raw || null,
      presupuesto: p.presupuesto || null, timeline: p.timeline || null, purpose: p.purpose || null,
      variante: p.variante || null,
    }
    console.log(`\n${p.email}  tipo=${p.tipo_propiedad || '∅'} | presup=${p.presupuesto || '∅'} | timeline=${p.timeline || '∅'} | purpose=${p.purpose || '∅'}`)
    if (APPLY) {
      const { error: uerr } = await supabaseAdmin.from('meta_leads').update(dbRow).eq('meta_lead_id', p.meta_lead_id)
      if (uerr) console.warn(`   ⚠ DB update falló: ${uerr.message}`); else dbUpdated++
    } else dbUpdated++

    // ── Sheet: rellenar SOLO vacías en E:H (tipo/presup/timeline/purpose) ──
    const rowNum = p.email ? emailToRow.get(p.email.toLowerCase().trim()) : undefined
    if (!rowNum) { console.log('   (no encontrado en Sheet LEADS)'); continue }
    const cur = rows[rowNum - 1]
    const cells = [
      { idx: 4, val: p.tipo_propiedad }, // E
      { idx: 5, val: p.presupuesto },    // F
      { idx: 6, val: p.timeline },       // G
      { idx: 7, val: p.purpose },        // H
    ]
    const merged = cells.map(c => {
      const existing = (cur[c.idx] as string | undefined)?.trim()
      if (existing) return existing            // NO sobrescribir
      if (c.val) { sheetFilled++; return c.val } // rellenar vacío
      return ''
    })
    const anyFilled = cells.some((c, k) => !((cur[c.idx] as string | undefined)?.trim()) && !!c.val)
    if (anyFilled) {
      console.log(`   Sheet fila ${rowNum}: rellenar E:H → ${JSON.stringify(merged)}`)
      sheetUpdates.push({ range: `'LEADS'!E${rowNum}:H${rowNum}`, values: [merged] })
    }
  }

  if (APPLY && sheetUpdates.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: { valueInputOption: 'USER_ENTERED', data: sheetUpdates },
    })
  }

  console.log(`\n─────────\nDB updates: ${dbUpdated} | Sheet celdas rellenadas: ${sheetFilled} | leads saltados (sin Meta): ${skipped}`)
  console.log(APPLY ? 'APLICADO.' : 'DRY-RUN (nada escrito).')
}
main().catch(e => { console.error(e); process.exit(1) })
