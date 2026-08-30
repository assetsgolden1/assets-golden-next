/**
 * setupLeadsSheet — prepara la hoja de contactos web (30/08/2026)
 *
 * Hace dos cosas, ambas idempotentes:
 *
 * 1. Inserta 4 columnas (M–P) para desglosar datos que antes iban apelmazados
 *    dentro del "Mensaje": tipo de inmueble, ubicación, intención y plazo.
 *    Se insertan ANTES de "Estado" y "Observación", que se rellenan a mano y
 *    quedan desplazadas a Q y R con su contenido intacto.
 *
 * 2. Crea reglas de formato condicional que pintan la fila entera según el
 *    tipo de solicitud (columna G), para distinguirlas de un vistazo.
 *
 * Uso:
 *   npx tsx --env-file=.env.local src/scripts/setupLeadsSheet.ts          → dry-run
 *   npx tsx --env-file=.env.local src/scripts/setupLeadsSheet.ts --apply  → escribe
 */
const APPLY = process.argv.includes('--apply')

const NUEVAS = ['Tipo de inmueble', 'Ubicación', 'Intención', 'Plazo']

/** Pastel suave: se lee bien y no compite con el texto. */
const COLORES: Array<{ tipo: string; color: { red: number; green: number; blue: number } }> = [
  { tipo: 'Demanda',            color: { red: 0.85, green: 0.94, blue: 0.86 } }, // verde claro
  { tipo: 'Tengo un activo',    color: { red: 0.85, green: 0.91, blue: 0.97 } }, // azul claro
  { tipo: 'Colaboración',       color: { red: 0.93, green: 0.89, blue: 0.97 } }, // lila claro
  { tipo: 'Consulta propiedad', color: { red: 0.99, green: 0.95, blue: 0.85 } }, // ámbar claro
  { tipo: 'Contacto',           color: { red: 0.94, green: 0.95, blue: 0.96 } }, // gris claro
]

async function main() {
  const { google } = await import('googleapis')
  const credentials = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS_JSON!)
  const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] })
  const sheets = google.sheets({ version: 'v4', auth })
  const spreadsheetId = process.env.GOOGLE_SHEETS_LEADS_ID!

  const meta = await sheets.spreadsheets.get({ spreadsheetId })
  const hoja = meta.data.sheets?.find((s) => s.properties?.title === 'Hoja 1')
  if (!hoja?.properties) throw new Error('No se encontró la pestaña "Hoja 1"')
  const sheetId = hoja.properties.sheetId!

  const hdrRes = await sheets.spreadsheets.values.get({ spreadsheetId, range: "'Hoja 1'!A1:T1" })
  const cabecera = hdrRes.data.values?.[0] ?? []
  console.log('cabecera actual:', cabecera.join(' | '))

  const yaTiene = NUEVAS.every((n) => cabecera.includes(n))
  const requests: object[] = []

  if (yaTiene) {
    console.log('\n· Las columnas nuevas YA existen — no se insertan de nuevo.')
  } else {
    console.log(`\n· Insertar ${NUEVAS.length} columnas en M–P (Estado/Observación pasan a Q/R).`)
    requests.push({
      insertDimension: {
        range: { sheetId, dimension: 'COLUMNS', startIndex: 12, endIndex: 12 + NUEVAS.length },
        inheritFromBefore: false,
      },
    })
  }

  // Reglas de color: se borran las existentes de este script y se recrean, para
  // que reejecutarlo no acumule duplicados.
  const reglasPrevias = hoja.conditionalFormats?.length ?? 0
  console.log(`· Reglas de formato condicional existentes: ${reglasPrevias} (se reemplazan)`)
  for (let i = reglasPrevias - 1; i >= 0; i--) {
    requests.push({ deleteConditionalFormatRule: { sheetId, index: i } })
  }

  COLORES.forEach(({ tipo, color }, i) => {
    requests.push({
      addConditionalFormatRule: {
        index: i,
        rule: {
          // Fila completa A:R, desde la fila 2 (la 1 es la cabecera).
          ranges: [{ sheetId, startRowIndex: 1, startColumnIndex: 0, endColumnIndex: 18 }],
          booleanRule: {
            // $G evita que la referencia se desplace columna a columna.
            condition: { type: 'CUSTOM_FORMULA', values: [{ userEnteredValue: `=$G2="${tipo}"` }] },
            format: { backgroundColor: color },
          },
        },
      },
    })
    console.log(`  color para "${tipo}"`)
  })

  if (!APPLY) {
    console.log(`\nDRY-RUN — ${requests.length} operaciones preparadas. Reejecutá con --apply.`)
    return
  }

  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } })

  if (!yaTiene) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "'Hoja 1'!M1:P1",
      valueInputOption: 'RAW',
      requestBody: { values: [NUEVAS] },
    })
  }

  const final = await sheets.spreadsheets.values.get({ spreadsheetId, range: "'Hoja 1'!A1:T1" })
  console.log('\nAPLICADO. Cabecera final:')
  ;(final.data.values?.[0] ?? []).forEach((v, i) =>
    console.log(`  ${String.fromCharCode(65 + i)}: ${v}`))
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(1) })

export {}
