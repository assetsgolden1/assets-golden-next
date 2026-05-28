/**
 * FASE-4.F-P1 — Test de migración Google Sheet
 * Uso: tsx --env-file=.env.local scripts/testSheetWrite.ts
 *
 * Fase 1 (solo preflight): verifica que la pestaña "Hoja 1" existe en el sheet nuevo.
 * Fase 2 (write test): si GOOGLE_SHEETS_LEADS_ID ya apunta al nuevo ID, escribe la fila de test.
 */

import { google } from 'googleapis'

const NEW_SHEET_ID = '1nkRaLHwnIz3RsLTA0A3zNnxErqVWMa4sm8dlwcSNRjQ'
const EXPECTED_TAB = 'Hoja 1'

async function main() {
  const credentialsJson = process.env.GOOGLE_SHEETS_CREDENTIALS_JSON
  if (!credentialsJson) {
    console.error('❌ GOOGLE_SHEETS_CREDENTIALS_JSON no está configurada')
    process.exit(1)
  }

  const credentials = JSON.parse(credentialsJson)
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  const sheets = google.sheets({ version: 'v4', auth })

  // ─── PRE-FLIGHT: verificar nombre de pestaña ────────────────────────────────
  console.log('\n🔍 PRE-FLIGHT — Verificando pestaña en sheet nuevo...')
  console.log(`   Sheet ID: ${NEW_SHEET_ID}`)

  const meta = await sheets.spreadsheets.get({ spreadsheetId: NEW_SHEET_ID })
  const tabs = (meta.data.sheets ?? []).map(s => s.properties?.title ?? '')
  console.log('   Pestañas encontradas:', tabs)

  if (!tabs.includes(EXPECTED_TAB)) {
    console.error(`\n❌ PRE-FLIGHT FALLÓ`)
    console.error(`   La pestaña "${EXPECTED_TAB}" NO existe en el sheet nuevo.`)
    console.error(`   Pestañas reales: ${tabs.join(', ')}`)
    console.error(`   Actualizar el range en src/lib/googleSheets.ts antes de tocar env vars.`)
    process.exit(1)
  }

  console.log(`\n✅ PRE-FLIGHT OK — pestaña "${EXPECTED_TAB}" confirmada.`)

  // ─── WRITE TEST ─────────────────────────────────────────────────────────────
  const sheetId = process.env.GOOGLE_SHEETS_LEADS_ID
  console.log(`\n📝 WRITE TEST — GOOGLE_SHEETS_LEADS_ID activo: ${sheetId}`)

  if (sheetId !== NEW_SHEET_ID) {
    console.warn('\n⚠️  GOOGLE_SHEETS_LEADS_ID todavía apunta al sheet VIEJO.')
    console.warn('   Actualiza .env.local (TAREA 1) y vuelve a ejecutar este script.')
    console.warn('   El write test se omite.')
    process.exit(0)
  }

  console.log('   Escribiendo fila de test...')

  const now = new Date()
  const fecha = now.toLocaleString('es-ES', {
    timeZone: 'Europe/Madrid',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const result = await sheets.spreadsheets.values.append({
    spreadsheetId: NEW_SHEET_ID,
    range: `'${EXPECTED_TAB}'!A:L`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        fecha,
        'TEST migración Sheet',
        'test-migration@ibott.dev',
        '+34',
        '000000000',
        'ES',
        'test',
        `Lead de test — migración Sheet ${now.toISOString()}`,
        '',
        '',
        '',
        'migration_test',
      ]],
    },
  })

  const updatedRange = result.data.updates?.updatedRange ?? '(sin rango)'
  console.log('\n✅ WRITE TEST OK')
  console.log(`   Rango devuelto: ${updatedRange}`)
  console.log(`   Filas actualizadas: ${result.data.updates?.updatedRows ?? '?'}`)
  console.log(`\n👉 Verificar fila en el Sheet nuevo de Ivan:`)
  console.log(`   https://docs.google.com/spreadsheets/d/${NEW_SHEET_ID}/edit`)
}

main().catch(err => {
  console.error('\n❌ Error fatal:', err?.message ?? err)
  process.exit(1)
})
