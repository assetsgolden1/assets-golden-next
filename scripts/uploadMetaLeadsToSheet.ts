/**
 * FASE-2-P3 — Carga manual de leads históricos de Meta al Sheet de seguimiento
 * Uso: npx tsx --env-file=.env.local scripts/uploadMetaLeadsToSheet.ts
 * Script de un solo uso (one-shot). No re-ejecutar sin limpiar las filas primero.
 */

import { google } from 'googleapis'

const SHEET_ID = '1Q_PRvDe45XxRoB43JZGWVJyJli8Cqf0G2Ry8vJcvZcA'
const TABS_TO_TRY = ['Hoja 1', 'Sheet1']

// Columnas A-J: Fecha | Nombre | Email | Teléfono | Tipo | Presupuesto | Timeline | Purpose | Variante | Estado
const LEADS = [
  {
    prioridad: 1,
    label: 'ALTA — Heather Meakin (timeline corto)',
    row: ['2026-05-30 23:41', 'Heather Meakin', 'heathermeakin@thedentalbrokers.co.uk', '+447932517109', 'Villa', '500K - 1M EUR', 'En 3 meses', 'Segunda residencia', 'Carrusel A', ''],
  },
  {
    prioridad: 2,
    label: 'ALTA — Andreas Langsch (presupuesto top)',
    row: ['2026-05-29 09:25', 'Andreas Langsch', 'a.langsch@avr-gruppe.de', '+4916096083833', 'Penthouse', '1M - 2M EUR', 'Solo explorando', 'Segunda residencia', 'Carrusel A', ''],
  },
  {
    prioridad: 3,
    label: 'ALTA — Michael Johansen (email corporativo)',
    row: ['2026-05-31 00:19', 'Michael Johansen', 'Michael@flexto.dk', '+4521344386', 'Apartamento', '300K - 500K EUR', '3 a 6 meses', 'Segunda residencia', 'Carrusel A', ''],
  },
  {
    prioridad: 4,
    label: 'MEDIA — Mary Larson Uhlin',
    row: ['2026-05-31 18:24', 'Mary Larson Uhlin', 'marylarsonuhlin@gmail.com', '+46705893848', 'Cualquier tipo', '300K - 500K EUR', '3 a 6 meses', 'Segunda residencia', 'Carrusel A', ''],
  },
  {
    prioridad: 5,
    label: 'MEDIA — Fabienne Richman',
    row: ['2026-05-30 13:13', 'Fabienne Richman', 'fabiener@gmail.com', '+4790022180', 'Apartamento', '500K - 1M EUR', '3 a 6 meses', 'Segunda residencia', 'Carrusel A', ''],
  },
  {
    prioridad: 6,
    label: 'BAJA — Beatrice Lenz',
    row: ['2026-05-30 10:25', 'Beatrice Lenz', 'Beatricelenz@web.de', '+4917623226572', 'Villa', '300K - 500K EUR', '3 a 6 meses', 'Mix (residencia + inversión)', 'Carrusel A', ''],
  },
  {
    prioridad: 7,
    label: 'VALIDAR — Saqlain Abbas (inconsistencia país/teléfono)',
    row: ['2026-05-29 17:59', 'Saqlain Abbas', 'saqlainabbaspk834@gmail.com', '+34631118046', 'Townhouse', '300K - 500K EUR', 'Solo explorando', 'Segunda residencia', 'Carrusel A', ''],
  },
]

async function main() {
  const start = Date.now()

  const credentialsJson = process.env.GOOGLE_SHEETS_CREDENTIALS_JSON
  if (!credentialsJson) {
    console.error('❌ GOOGLE_SHEETS_CREDENTIALS_JSON no está configurada en .env.local')
    process.exit(1)
  }

  const credentials = JSON.parse(credentialsJson)
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  const sheets = google.sheets({ version: 'v4', auth })

  // ─── PRE-FLIGHT: detectar nombre de pestaña ──────────────────────────────
  console.log('\n🔍 PRE-FLIGHT — Detectando pestaña en el Sheet destino...')
  console.log(`   Sheet ID: ${SHEET_ID}`)

  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID })
  const tabs = (meta.data.sheets ?? []).map(s => s.properties?.title ?? '')
  console.log('   Pestañas encontradas:', tabs)

  let activeTab: string | null = null
  for (const candidate of TABS_TO_TRY) {
    if (tabs.includes(candidate)) {
      activeTab = candidate
      break
    }
  }

  if (!activeTab) {
    console.error(`\n❌ PRE-FLIGHT FALLÓ`)
    console.error(`   Ninguna de las pestañas esperadas (${TABS_TO_TRY.join(', ')}) existe en el Sheet.`)
    console.error(`   Pestañas reales: ${tabs.join(', ')}`)
    process.exit(1)
  }

  console.log(`   ✅ Pestaña activa: "${activeTab}"`)

  // ─── BATCH APPEND ────────────────────────────────────────────────────────
  console.log(`\n📋 Cargando ${LEADS.length} leads en orden de prioridad...\n`)

  let added = 0
  const errors: string[] = []

  for (const lead of LEADS) {
    try {
      const result = await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `'${activeTab}'!A:J`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [lead.row] },
      })
      const range = result.data.updates?.updatedRange ?? '(sin rango)'
      console.log(`   [${lead.prioridad}/7] ✅ ${lead.label}`)
      console.log(`         → ${range}`)
      added++
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`   [${lead.prioridad}/7] ❌ ${lead.label}`)
      console.error(`         → ERROR: ${msg}`)
      errors.push(`Lead ${lead.prioridad} (${lead.row[1]}): ${msg}`)
    }
  }

  // ─── RESUMEN ─────────────────────────────────────────────────────────────
  const elapsed = ((Date.now() - start) / 1000).toFixed(2)
  console.log(`\n${'─'.repeat(60)}`)
  console.log(`✅ Filas agregadas: ${added} / ${LEADS.length}`)
  console.log(`⏱  Tiempo total:   ${elapsed}s`)
  if (errors.length > 0) {
    console.error(`\n⚠️  ${errors.length} error(es):`)
    errors.forEach(e => console.error(`   • ${e}`))
  }
  console.log(`\n👉 Verificar Sheet:`)
  console.log(`   https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`)

  if (errors.length > 0) process.exit(1)
}

main().catch(err => {
  console.error('\n❌ Error fatal:', err?.message ?? err)
  process.exit(1)
})
