/**
 * [LEADS-SEQ-IMPORT-05] Importar leads históricos del Sheet de Meta a meta_leads.
 *
 * Dedup por EMAIL normalizado (el Sheet no trae el meta_lead_id real).
 * Por defecto corre en DRY-RUN (no escribe nada). Para el INSERT real:
 *     npx tsx scripts/importHistoricalLeads.ts --apply
 *
 * Mapeo Sheet 'Hoja 1'!A:K → meta_leads:
 *   B Nombre → nombre · C Email → email · D Teléfono → telefono
 *   E Tipo → tipo_propiedad · F Presupuesto → presupuesto_raw (y presupuesto)
 *   G Timeline → timeline · H Purpose → purpose · I Variante → variante
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import { google } from 'googleapis'
import { createClient } from '@supabase/supabase-js'
import { deriveSegment, formatBudgetRange } from '../src/lib/email/nurtureHelpers'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const APPLY = process.argv.includes('--apply')

function obfuscate(email: string): string {
  const [user, domain] = email.split('@')
  if (!domain) return email
  const head = user.slice(0, 2)
  return `${head}${'*'.repeat(Math.max(1, user.length - 2))}@${domain}`
}

interface SheetLead {
  nombre: string
  email: string // normalizado (trim + lowercase)
  telefono: string
  tipo_propiedad: string
  presupuesto_raw: string
  timeline: string
  purpose: string
  variante: string
}

async function readSheet(spreadsheetId: string): Promise<string[][]> {
  const credentialsJson = process.env.GOOGLE_SHEETS_CREDENTIALS_JSON
  if (!credentialsJson) throw new Error('Falta GOOGLE_SHEETS_CREDENTIALS_JSON')
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(credentialsJson),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  const sheets = google.sheets({ version: 'v4', auth })
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'Hoja 1'!A:K",
  })
  return (res.data.values as string[][]) ?? []
}

async function main() {
  const spreadsheetId = process.env.META_LEADS_SHEET_ID
  if (!spreadsheetId) throw new Error('Falta META_LEADS_SHEET_ID')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )

  // 1) Leer el Sheet (A:K). Fila 0 = encabezados.
  const rows = await readSheet(spreadsheetId)
  const dataRows = rows.slice(1)

  // 2) Emails ya presentes en meta_leads (normalizados).
  const { data: existing, error } = await supabase.from('meta_leads').select('email')
  if (error) throw new Error('Error leyendo meta_leads: ' + error.message)
  const existingEmails = new Set(
    (existing ?? [])
      .map(r => (r.email as string | null)?.toLowerCase().trim())
      .filter((e): e is string => !!e),
  )

  // 3) Parsear filas + dedup interno del Sheet (primera aparición gana).
  const seenInSheet = new Set<string>()
  const toInsert: SheetLead[] = []
  const skipped: { email: string; reason: string }[] = []
  let blankEmail = 0

  for (const r of dataRows) {
    const email = (r[2] ?? '').toLowerCase().trim() // col C
    if (!email) {
      blankEmail++
      continue
    }
    if (existingEmails.has(email)) {
      skipped.push({ email, reason: 'ya existe en meta_leads' })
      continue
    }
    if (seenInSheet.has(email)) {
      skipped.push({ email, reason: 'duplicado dentro del Sheet' })
      continue
    }
    seenInSheet.add(email)
    toInsert.push({
      nombre: (r[1] ?? '').trim(),
      email,
      telefono: (r[3] ?? '').trim(),
      tipo_propiedad: (r[4] ?? '').trim(),
      presupuesto_raw: (r[5] ?? '').trim(),
      timeline: (r[6] ?? '').trim(),
      purpose: (r[7] ?? '').trim(),
      variante: (r[8] ?? '').trim(),
    })
  }

  // 4) Reporte.
  console.log('\n========== [LEADS-SEQ-IMPORT-05] ' + (APPLY ? 'APPLY' : 'DRY-RUN') + ' ==========')
  console.log(`Filas de datos en el Sheet : ${dataRows.length}`)
  console.log(`Emails ya en meta_leads    : ${existingEmails.size}`)
  console.log(`Filas con email vacío      : ${blankEmail}`)
  console.log(`A INSERTAR                 : ${toInsert.length}`)
  console.log(`SKIP                       : ${skipped.length}`)
  console.log('')

  if (toInsert.length) {
    console.log('--- Leads a insertar ---')
    console.table(
      toInsert.map(l => ({
        email: obfuscate(l.email),
        tipo_propiedad: l.tipo_propiedad || '(vacío)',
        presupuesto: l.presupuesto_raw || '(vacío)',
        segmento: deriveSegment(l.presupuesto_raw),
        rango_derivado: formatBudgetRange(l.presupuesto_raw),
      })),
    )
  }

  if (skipped.length) {
    const yaExiste = skipped.filter(s => s.reason === 'ya existe en meta_leads').length
    const dupSheet = skipped.filter(s => s.reason === 'duplicado dentro del Sheet').length
    console.log(`\n--- SKIP detalle ---  ya en meta_leads: ${yaExiste} · duplicados en Sheet: ${dupSheet}`)
  }

  if (!APPLY) {
    console.log('\nDRY-RUN: no se escribió nada. Para aplicar: npx tsx scripts/importHistoricalLeads.ts --apply')
    return
  }

  // 5) INSERT real (solo con --apply).
  const payload = toInsert.map(l => ({
    meta_lead_id: 'HIST-' + l.email,
    email: l.email,
    nombre: l.nombre || null,
    telefono: l.telefono || null,
    tipo_propiedad: l.tipo_propiedad || null,
    presupuesto_raw: l.presupuesto_raw || null,
    presupuesto: l.presupuesto_raw || null,
    timeline: l.timeline || null,
    purpose: l.purpose || null,
    variante: l.variante || null,
    created_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    synced_at: new Date().toISOString(),
    seq_email1_sent_at: null,
    seq_email2_sent_at: null,
    seq_email3_sent_at: null,
    seq_email4_sent_at: null,
    seq_email5_sent_at: null,
    seq_paused: false,
  }))

  if (!payload.length) {
    console.log('\nNada para insertar.')
    return
  }

  const { data: inserted, error: insErr } = await supabase
    .from('meta_leads')
    .upsert(payload, { onConflict: 'meta_lead_id', ignoreDuplicates: true })
    .select('email')

  if (insErr) throw new Error('Error en INSERT: ' + insErr.message)
  console.log(`\nINSERT OK: ${inserted?.length ?? 0} filas insertadas.`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
