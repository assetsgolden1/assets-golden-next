/**
 * FASE-2-P3 — Carga manual de leads históricos de Meta al Sheet de seguimiento.
 * Uso: npx tsx --env-file=.env.local scripts/uploadMetaLeadsToSheet.ts
 *
 * Script de un solo uso (one-shot). Limpiar filas anteriores antes de re-ejecutar.
 * Columnas A-K (11): Fecha|Nombre|Email|Teléfono|Tipo|Presupuesto|Timeline|Purpose|Variante|Prioridad|Estado
 */

import { google } from 'googleapis'
import { categorizeLead, getSpecialStateNotes, type LeadInput } from '../src/lib/leads/prioritizeLead'

const SHEET_ID = '1Q_PRvDe45XxRoB43JZGWVJyJli8Cqf0G2Ry8vJcvZcA'
const TABS_TO_TRY = ['Hoja 1', 'Sheet1']

interface HistoricLead extends LeadInput {
  fecha: string
  nombre: string
  variante: string
}

// Ordenados por fecha más reciente (desc)
const LEADS: HistoricLead[] = [
  {
    fecha: '2026-05-31 18:24',
    nombre: 'Mary Larson Uhlin',
    email: 'marylarsonuhlin@gmail.com',
    telefono: '+46705893848',
    tipo_propiedad: 'Cualquier tipo',
    presupuesto: '300K - 500K EUR',
    timeline: '3 a 6 meses',
    purpose: 'Segunda residencia',
    variante: 'Carrusel A',
  },
  {
    fecha: '2026-05-31 00:19',
    nombre: 'Michael Johansen',
    email: 'Michael@flexto.dk',
    telefono: '+4521344386',
    tipo_propiedad: 'Apartamento',
    presupuesto: '300K - 500K EUR',
    timeline: '3 a 6 meses',
    purpose: 'Segunda residencia',
    variante: 'Carrusel A',
  },
  {
    fecha: '2026-05-30 23:41',
    nombre: 'Heather Meakin',
    email: 'heathermeakin@thedentalbrokers.co.uk',
    telefono: '+447932517109',
    tipo_propiedad: 'Villa',
    presupuesto: '500K - 1M EUR',
    timeline: 'En 3 meses',
    purpose: 'Segunda residencia',
    variante: 'Carrusel A',
  },
  {
    fecha: '2026-05-30 13:13',
    nombre: 'Fabienne Richman',
    email: 'fabiener@gmail.com',
    telefono: '+4790022180',
    tipo_propiedad: 'Apartamento',
    presupuesto: '500K - 1M EUR',
    timeline: '3 a 6 meses',
    purpose: 'Segunda residencia',
    variante: 'Carrusel A',
  },
  {
    fecha: '2026-05-30 10:25',
    nombre: 'Beatrice Lenz',
    email: 'Beatricelenz@web.de',
    telefono: '+4917623226572',
    tipo_propiedad: 'Villa',
    presupuesto: '300K - 500K EUR',
    timeline: '3 a 6 meses',
    purpose: 'Mix (residencia + inversión)',
    variante: 'Carrusel A',
  },
  {
    fecha: '2026-05-29 17:59',
    nombre: 'Saqlain Abbas',
    email: 'saqlainabbaspk834@gmail.com',
    telefono: '+34631118046',
    tipo_propiedad: 'Townhouse',
    presupuesto: '300K - 500K EUR',
    timeline: 'Solo explorando',
    purpose: 'Segunda residencia',
    variante: 'Carrusel A',
    country: 'GB',
  },
  {
    fecha: '2026-05-29 09:25',
    nombre: 'Andreas Langsch',
    email: 'a.langsch@avr-gruppe.de',
    telefono: '+4916096083833',
    tipo_propiedad: 'Penthouse',
    presupuesto: '1M - 2M EUR',
    timeline: 'Solo explorando',
    purpose: 'Segunda residencia',
    variante: 'Carrusel A',
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

  // ─── PRE-FLIGHT ───────────────────────────────────────────────────────────
  console.log('\n🔍 PRE-FLIGHT — Detectando pestaña en el Sheet destino...')
  console.log(`   Sheet ID: ${SHEET_ID}`)

  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID })
  const tabs = (meta.data.sheets ?? []).map(s => s.properties?.title ?? '')
  console.log('   Pestañas encontradas:', tabs)

  let activeTab: string | null = null
  for (const candidate of TABS_TO_TRY) {
    if (tabs.includes(candidate)) { activeTab = candidate; break }
  }

  if (!activeTab) {
    console.error('\n❌ PRE-FLIGHT FALLÓ')
    console.error(`   Ninguna pestaña esperada (${TABS_TO_TRY.join(', ')}) existe.`)
    console.error(`   Pestañas reales: ${tabs.join(', ')}`)
    process.exit(1)
  }
  console.log(`   ✅ Pestaña activa: "${activeTab}"`)

  // ─── BATCH APPEND ─────────────────────────────────────────────────────────
  console.log(`\n📋 Cargando ${LEADS.length} leads (ordenados por fecha desc)...\n`)
  console.log('   #  Nombre                   Prioridad  Rango')
  console.log(`   ${'─'.repeat(55)}`)

  let added = 0
  const errors: string[] = []
  const results: { nombre: string; prioridad: string; esperado: string; match: boolean }[] = []

  // Prioridades esperadas para verificación post-carga
  const EXPECTED: Record<string, string> = {
    'Mary Larson Uhlin': 'Media',
    'Michael Johansen': 'Alta',
    'Heather Meakin': 'Alta',
    'Fabienne Richman': 'Media',
    'Beatrice Lenz': 'Baja',
    'Saqlain Abbas': 'Baja',
    'Andreas Langsch': 'Alta',
  }

  for (let i = 0; i < LEADS.length; i++) {
    const lead = LEADS[i]
    const prioridad = categorizeLead(lead)
    const estado = getSpecialStateNotes(lead) ?? ''

    const row = [
      lead.fecha,
      lead.nombre,
      lead.email,
      lead.telefono,
      lead.tipo_propiedad,
      lead.presupuesto,
      lead.timeline,
      lead.purpose,
      lead.variante,
      prioridad,
      estado,
    ]

    try {
      const res = await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `'${activeTab}'!A:K`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [row] },
      })
      const range = res.data.updates?.updatedRange ?? '(?)'
      const short = lead.nombre.padEnd(24)
      console.log(`   ${String(i + 1).padStart(2)}. ${short} ${prioridad.padEnd(8)}   ${range}`)
      added++

      const esperado = EXPECTED[lead.nombre] ?? '?'
      results.push({ nombre: lead.nombre, prioridad, esperado, match: prioridad === esperado })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`   ${String(i + 1).padStart(2)}. ❌ ${lead.nombre} — ${msg}`)
      errors.push(`${lead.nombre}: ${msg}`)
    }
  }

  // ─── TABLA DE VERIFICACIÓN ────────────────────────────────────────────────
  const elapsed = ((Date.now() - start) / 1000).toFixed(2)
  console.log(`\n${'─'.repeat(60)}`)
  console.log('📊 Verificación de prioridades:\n')
  console.log('   Lead                      Asignada   Esperada   Match')
  console.log(`   ${'─'.repeat(52)}`)
  for (const r of results) {
    const icon = r.match ? '✅' : '❌'
    console.log(`   ${icon} ${r.nombre.padEnd(24)} ${r.prioridad.padEnd(10)} ${r.esperado.padEnd(10)} ${r.match ? '✓' : '✗'}`)
  }

  const allMatch = results.every(r => r.match)
  console.log(`\n${allMatch ? '✅' : '⚠️ '} Prioridades: ${results.filter(r => r.match).length}/${results.length} coinciden con lo esperado`)
  console.log(`✅ Filas agregadas: ${added} / ${LEADS.length}`)
  console.log(`⏱  Tiempo total:   ${elapsed}s`)

  if (errors.length > 0) {
    console.error(`\n⚠️  ${errors.length} error(es):`)
    errors.forEach(e => console.error(`   • ${e}`))
  }

  console.log(`\n👉 Verificar Sheet:`)
  console.log(`   https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`)

  if (errors.length > 0 || !allMatch) process.exit(1)
}

main().catch(err => {
  console.error('\n❌ Error fatal:', err?.message ?? err)
  process.exit(1)
})
